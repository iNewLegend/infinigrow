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

import { ComponentIdContext } from "@infinigrow/commander/commands-context"

import commandsManager from "@infinigrow/commander/commands-manager";

import { ComponentIdProvider } from "@infinigrow/commander/commands-provider";

import type {
    CommandFunctionComponent,
    CommandNewInstanceWithArgs,
    CommandComponentContextProps
} from "@infinigrow/commander/types";

export function withCommands<TState = undefined>(
    componentName: string,
    Component: CommandFunctionComponent,
    state: TState,
    commands: CommandNewInstanceWithArgs<TState>[]
): CommandFunctionComponent;

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
        state: React.ComponentState = {};

    if ( args.length === 1 ) {
        commands = args[ 0 ];
    } else if ( args.length === 2 ) {
        state = args[ 0 ];
        commands = args[ 1 ];
    } else {
        throw new Error( "Invalid arguments" );
    }

    let contextRef: CommandComponentContextProps;

    if ( state ) {
        const originalFunction = Component,
            originalName = Component.displayName || Component.name || "Component";

        // This approach give us ability to inject second argument to the functional component.
        Component = function ( props: any ) {
            const currentState = core[ GET_INTERNAL_SYMBOL ]( contextRef.getNameUnique() ).getState();

            return originalFunction( props, currentState );
        };

        Object.defineProperty( Component, originalName, { value: originalName, writable: false } );

        Component.displayName = `withInjectedState(${ originalName })`;
    }

    const WrappedComponent = class WrappedComponent extends React.PureComponent<any, {
        componentNameUnique: string
    }> {
        public static displayName = `withCommands(${ componentName })`;

        public static contextType = ComponentIdContext;

        public context: CommandComponentContextProps;

        public constructor( props: any, context: any ) {
            super( props );

            this.context = context;

            this.state = state;

            this.registerInternalContext();
        }

        private registerInternalContext() {
            const id = this.context.getNameUnique();

            if ( this.props[ INTERNAL_PROPS ]?.handlers ) {
                this.context.internalHandlers = this.props[ INTERNAL_PROPS ].handlers;
            }

            if ( commandsManager.isContextRegistered( id ) ) {
                return;
            }

            core[ REGISTER_INTERNAL_SYMBOL ]( {
                componentName,
                componentNameUnique: id,
                commands: commandsManager.get( componentName ),
                emitter: new EventEmitter(),
                getState: () => this.state,
                setState: ( ... args ) => {
                    return this.setState( ... args );
                }
            } );
        }

        public componentWillUnmount() {
            if ( this.context.internalHandlers[ INTERNAL_ON_UNMOUNT ] ) {
                this.context.internalHandlers[ INTERNAL_ON_UNMOUNT ]( core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() ) );
            }

            const componentNameUnique = this.context.getNameUnique();

            core[ UNREGISTER_INTERNAL_SYMBOL ]( componentNameUnique );
        }

        public componentDidUpdate( prevProps: any, prevState: any, snapshot?: any ) {
            if ( this.context.internalHandlers[ INTERNAL_ON_UPDATE ] ) {
                const context = core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() );

                this.context.internalHandlers[ INTERNAL_ON_UPDATE ]( context, {
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

            this.registerInternalContext();

            // TODO: Delete this.
            if ( this.props.children?.length ) {
                const childKeys = React.Children.map( this.props.children, ( child ) => child.key );

                core[ SET_TO_CONTEXT ]( id, { childKeys, props: this.props } );
            } else {
                core[ SET_TO_CONTEXT ]( id, { props: this.props } );
            }

            if ( this.context.internalHandlers[ INTERNAL_ON_MOUNT ] ) {
                this.context.internalHandlers[ INTERNAL_ON_MOUNT ]( core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() ) );
            }
        }

        public render() {
            if ( this.context.internalHandlers[ INTERNAL_ON_LOAD ] ) {
                this.context.internalHandlers[ INTERNAL_ON_LOAD ]( core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() ) );
            }

            return <Component { ... this.props } />;
        }
    };

    /**
     * React `useId` behave differently in production and development mode, because of `<React.StrictMode>`
     * https://github.com/facebook/react/issues/27103#issuecomment-1763359077
     */
    const UniqueWrappedComponent = function ( props: any ) {
        const componentNameUnique = `${ componentName }-${ React.useId() }`;

        const context: CommandComponentContextProps = {
            getNameUnique: () => componentNameUnique,
            getComponentName: () => componentName,

            internalHandlers: {},
        };

        contextRef = context;

        return (
            <ComponentIdProvider context={ context }>
                <WrappedComponent { ... props }/>
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

