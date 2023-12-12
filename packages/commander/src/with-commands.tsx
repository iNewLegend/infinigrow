import { EventEmitter } from "events";

import React from "react";

// eslint-disable-next-line no-restricted-imports
import core from "./_internal/core";

// eslint-disable-next-line no-restricted-imports
import {
    REGISTER_INTERNAL_SYMBOL,
    UNREGISTER_INTERNAL_SYMBOL,
    SET_TO_CONTEXT,
    GET_INTERNAL_SYMBOL,
    INTERNAL_ON_LOAD,
    INTERNAL_ON_MOUNT,
    INTERNAL_ON_UNMOUNT,
    INTERNAL_ON_UPDATE,
    INTERNAL_PROPS
} from "./_internal/constants";

import { ComponentIdContext } from "@infinigrow/commander/commands-context";

import commandsManager from "@infinigrow/commander/commands-manager";

import { ComponentIdProvider } from "@infinigrow/commander/commands-provider";

import type {
    CommandFunctionComponent,
    CommandNewInstanceWithArgs,
    CommandComponentContextProps
} from "@infinigrow/commander/types";

export function withCommands<TProps = any, TState = undefined>(
    componentName: string,
    Component: CommandFunctionComponent<TProps, TState>,
    state: TState,
    commands: CommandNewInstanceWithArgs<TState>[]
): CommandFunctionComponent<TProps, TState>;

export function withCommands(
    componentName: string,
    Component: CommandFunctionComponent,
    commands: CommandNewInstanceWithArgs[]
): CommandFunctionComponent;

export function withCommands(
    componentName: string,
    Component: CommandFunctionComponent,
    ... args: any[]
): CommandFunctionComponent {
    let commands: CommandNewInstanceWithArgs[],
        state: React.ComponentState;

    if ( args.length === 1 ) {
        commands = args[ 0 ];
    } else if ( args.length === 2 ) {
        state = args[ 0 ];
        commands = args[ 1 ];
    } else {
        throw new Error( "Invalid arguments" );
    }

    let currentContext: CommandComponentContextProps;

    if ( state ) {
        const originalFunction = Component,
            originalName = Component.displayName || Component.name || "Component";

        // This approach give us ability to inject second argument to the functional component.
        Component = function ( props: any ) {
            const internalContext = core[ GET_INTERNAL_SYMBOL ]( currentContext.getNameUnique() );

            const currentState = internalContext.getState();

            if ( internalContext.extendInitialState ) {
                for ( const key in internalContext.extendInitialState ) {
                    ( currentState as any )[ key ] = internalContext.extendInitialState[ key ];
                }

                delete internalContext.extendInitialState;
            }

            return originalFunction( props, currentState );
        };

        Object.defineProperty( Component, originalName, { value: originalName, writable: false } );

        Component.displayName = `withInjectedState(${ originalName })`;
    }

    const WrappedComponent = class WrappedComponent extends React.PureComponent<any, React.ComponentState> {
        public static displayName = `withCommands(${ componentName })`;

        public static contextType = ComponentIdContext;

        public context: CommandComponentContextProps;

        private $$commander = {
            isMounted: false,
            lifecycleHandlers: {} as any,
        };

        private isMounted()  {
            return this.$$commander.isMounted;
        }

        public constructor( props: any, context: any ) {
            super( props );

            this.context = context;

            this.state = state;

            this.registerInternalContext();
        }

        private registerInternalContext() {
            const id = this.context.getNameUnique();

            if ( this.props[ INTERNAL_PROPS ]?.handlers ) {
                this.$$commander.lifecycleHandlers = this.props[ INTERNAL_PROPS ].handlers;
            }

            if ( commandsManager.isContextRegistered( id ) ) {
                return;
            }

            const self = this;

            core[ REGISTER_INTERNAL_SYMBOL ]( {
                componentName,
                componentNameUnique: id,

                commands: commandsManager.get( componentName ),
                emitter: new EventEmitter(),

                isMounted: () => self.isMounted(),

                key: self.props.$$key,

                getComponentContext: () => self.context,

                getState: () => self.state as Readonly<React.ComponentState>,
                setState: ( state, callback ) => {
                    if ( ! self.isMounted() ) {
                        if ( ! callback ) {
                            console.warn(
                                "Can't call setState on a component that is not yet mounted, instead this call will assign `this.state` directly." +
                                "to ignore this warning, add a callback to setState as a second argument."
                            );
                        }

                        self.state = { ... self.state, ... state };

                        return;
                    }

                    self.setState( state, () => {
                        if ( callback ) {
                            callback( self.state );
                        }
                    } );
                },

                lifecycleHandlers: this.$$commander.lifecycleHandlers,
            } );
        }

        public componentWillUnmount() {
            this.$$commander.isMounted = false;

            if ( this.$$commander.lifecycleHandlers[ INTERNAL_ON_UNMOUNT ] ) {
                this.$$commander.lifecycleHandlers[ INTERNAL_ON_UNMOUNT ]( core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() ) );
            }

            const componentNameUnique = this.context.getNameUnique();

            core[ UNREGISTER_INTERNAL_SYMBOL ]( componentNameUnique );
        }

        public componentDidUpdate( prevProps: any, prevState: any, snapshot?: any ) {
            if ( this.$$commander.lifecycleHandlers[ INTERNAL_ON_UPDATE ] ) {
                const context = core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() );

                this.$$commander.lifecycleHandlers[ INTERNAL_ON_UPDATE ]( context, {
                    currentProps: this.props,
                    currentState: this.state,
                    prevProps,
                    prevState,
                    snapshot,
                } );
            }
        }

        /**
         * Using `componentDidMount` in a strict mode causes component to unmount therefor the context need to be
         * re-registered.
         */
        public componentDidMount() {
            const id = this.context.getNameUnique();

            this.$$commander.isMounted = true;

            this.registerInternalContext();

            core[ SET_TO_CONTEXT ]( id, { props: this.props } );

            if ( this.$$commander.lifecycleHandlers[ INTERNAL_ON_MOUNT ] ) {
                this.$$commander.lifecycleHandlers[ INTERNAL_ON_MOUNT ]( core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() ) );
            }
        }

        public render() {
            if ( this.$$commander.lifecycleHandlers[ INTERNAL_ON_LOAD ] ) {
                this.$$commander.lifecycleHandlers[ INTERNAL_ON_LOAD ]( core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() ) );
            }

            return <Component { ... this.props } />;
        }
    };

    function handleAncestorContexts( context: CommandComponentContextProps ) {
        const parentContext = React.useContext( ComponentIdContext );

        if ( parentContext.isSet ) {
            context.parent = parentContext;
        }

        if ( context.parent ) {
            if ( ! context.parent.children ) {
                context.parent.children = {};
            }
            context.parent.children[ context.getNameUnique() ] = context;
        }

        React.useEffect( () => {
            if ( currentContext.children ) {
                for ( const key in currentContext.children ) {
                    const child = currentContext.children[ key ];

                    const internalContext = core[ GET_INTERNAL_SYMBOL ]( child.getNameUnique(), true );

                    if ( ! internalContext ) {
                        delete currentContext.children[ key ];
                    }
                }
            }
        }, [ currentContext, parentContext ] );
    }

    /**
     * React `useId` behave differently in production and development mode, because of `<React.StrictMode>`
     * https://github.com/facebook/react/issues/27103#issuecomment-1763359077
     */
    const UniqueWrappedComponent = function ( props: any ) {
        const componentNameUnique = `${ componentName }-${ React.useId() }`;

        const context: CommandComponentContextProps = {
            isSet: true,

            getNameUnique: () => componentNameUnique,
            getComponentName: () => componentName,
        };

        handleAncestorContexts( context );

        currentContext = context;

        return (
            <ComponentIdProvider context={ context }>
                <WrappedComponent { ... props } $$key={performance.now()}/>
            </ComponentIdProvider>
        );
    };

    UniqueWrappedComponent.getName = () => componentName;

    commandsManager.register( {
        componentName,
        commands,
    } );

    return UniqueWrappedComponent;
}

