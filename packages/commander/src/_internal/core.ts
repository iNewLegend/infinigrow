// eslint-disable-next-line no-restricted-imports
import {
    REGISTER_INTERNAL_SYMBOL,
    UNREGISTER_INTERNAL_SYMBOL,
    GET_INTERNAL_SYMBOL,
    SET_TO_CONTEXT,
    GET_INTERNAL_MATCH_SYMBOL
} from "./constants.ts";

import type React from "react";

import type { CommandSingleComponentContext } from "@infinigrow/commander/types";

import type { EventEmitter } from "events";

const context: {
    [ componentNameUnique: string ]: CommandSingleComponentContext
} = {};

/**
 * Core class is responsible for managing the command context for each component.
 * It provides methods to register, unregister, get and link components.
 */
class Core {
    /**
     * Registers the context for a React component.
     */
    [ REGISTER_INTERNAL_SYMBOL ]( args: { // eslint-disable-line @typescript-eslint/explicit-member-accessibility
        componentNameUnique: string;
        componentName: string;
        commands: CommandSingleComponentContext[ "commands" ],
        emitter: EventEmitter;
        isMounted(): boolean;
        key: React.Key;
        getComponentContext: CommandSingleComponentContext["getComponentContext"];
        getState: CommandSingleComponentContext[ "getState" ];
        setState: CommandSingleComponentContext[ "setState" ];
        lifecycleHandlers: any,
    } ): void {
        const {
            componentNameUnique,
            componentName,
            commands,
            emitter,
            getComponentContext,
            getState,
            setState,
            isMounted,
            key,
            lifecycleHandlers
        } = args;

        this.__devDebug( `Registering component '${ componentNameUnique }'` );

        // Check if the component is registered
        if ( context[ componentNameUnique ] ) {
            throw new Error( `Component '${ componentNameUnique }' already registered` );
        }

        context[ componentNameUnique ] = {
            commands,
            componentName,
            componentNameUnique,
            emitter,
            getComponentContext,
            getState,
            setState,
            isMounted,
            key,
            props: undefined,
            lifecycleHandlers,
        };
    }

    /**
     * Unregisters the context.
     */
    [ UNREGISTER_INTERNAL_SYMBOL ]( // eslint-disable-line @typescript-eslint/explicit-member-accessibility
        componentNameUnique: string
    ): void {
        this.__devDebug( `Unregistering component '${ componentNameUnique }' from the context ` );

        // Check if the component is registered
        if ( ! context[ componentNameUnique ] ) {
            throw new Error( `Component '${ componentNameUnique }' not registered` );
        }

        // Clean up emitter
        context[ componentNameUnique ].emitter.removeAllListeners();

        // Clean up context
        delete context[ componentNameUnique ];
    }

    /**
     * Gets the context for a React component.
     */
    [ GET_INTERNAL_SYMBOL ]( // eslint-disable-line @typescript-eslint/explicit-member-accessibility
        componentNameUnique: string,
        silent?: boolean,
    ): CommandSingleComponentContext {
        // Check if the component is registered
        if ( ! silent && ! context[ componentNameUnique ] ) {
            throw new Error( `Component '${ componentNameUnique }' not registered` );
        }

        return context[ componentNameUnique ];
    }

    [ GET_INTERNAL_MATCH_SYMBOL ]( // eslint-disable-line @typescript-eslint/explicit-member-accessibility
        componentName: string,
    ): CommandSingleComponentContext[] {
        if ( componentName.includes( "*" ) ) {
            const result: CommandSingleComponentContext[] = [];

            const anyMatchComponent = componentName.substring( 0, componentName.length - 1 );

            Object.entries( context ).forEach( ( [ componentNameUnique, context ] ) => {
                if ( componentNameUnique.includes( anyMatchComponent ) ) {
                    result.push( context );
                }
            } );

            return result;
        }

        throw new Error( `Component '${ componentName }' is not valid regex` );
    }

    [ SET_TO_CONTEXT ]( // eslint-disable-line @typescript-eslint/explicit-member-accessibility
        componentNameUnique: string,
        data: { [ key: string ]: any },
    ): void {
        // Check if the component is registered
        if ( ! context[ componentNameUnique ] ) {
            throw new Error( `Component '${ componentNameUnique }' not registered` );
        }

        Object.entries( data ).forEach( ( [ key, value ] ) => {
            // @ts-ignore
            context[ componentNameUnique ][ key ] = value;
        } );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public __devDebug( ... args: any[] ): void {
    }

    declare public __devGetContextLength: () => number;
    declare public __devGetContextKeys: () => string[];
    declare public __devGetContextValues: () => CommandSingleComponentContext[];
}

const core = new Core();

if ( import.meta.env.DEV ) {
    if ( ( window as any ).__DEBUG__ ) {
        core.__devDebug = ( ... args: any[] ) => {
            console.log( ... args );
        };
    }

    core.__devGetContextLength = () => {
        return Object.keys( context ).length;
    };

    core.__devGetContextKeys = () => {
        return Object.keys( context );
    };

    core.__devGetContextValues = () => {
        return Object.values( context ).map( ( context ) => context );
    };

    ( window as any ).$$core = core;
}

export default core;
