import { EventEmitter } from "events";

import React from "react";

// eslint-disable-next-line no-restricted-imports
import core from "./_internal/core";

// eslint-disable-next-line no-restricted-imports
import {
    REGISTER_INTERNAL_SYMBOL,
    UNREGISTER_INTERNAL_SYMBOL,
    LINK_COMPONENTS,
    SET_TO_CONTEXT, GET_INTERNAL_SYMBOL
} from "./_internal/constants.ts";

import commandsManager from "@infinigrow/commander/commands-manager";

import { ComponentIdProvider } from "@infinigrow/commander/commands-provider";

import type { CommandFunctionComponent, CommandNewInstanceWithArgs } from "@infinigrow/commander/types";

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

    if ( state ) {
        const originalFunction = Component,
            originalName = Component.displayName || Component.name || "Component";

        // This approach give us ability to inject second argument to the functional component.
        Component = function ( props: any ) {
            const currentState = core[ GET_INTERNAL_SYMBOL ]( props.componentNameUnique ).getState();

            return originalFunction( props, currentState );
        };

        Object.defineProperty( Component, originalName, { value: originalName, writable: false } );

        Component.displayName = `withInjectedState(${ originalName })`;
    }

    const WrappedComponent = class WrappedComponent extends React.PureComponent<any, {
        componentNameUnique: string
    }> {
        public static displayName = `withCommands(${ componentName })`;

        public constructor( props: any ) {
            super( props );

            this.state = state;

            this.registerContext();
        }

        private registerContext() {
            const id = this.props.componentNameUnique;

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
            const componentNameUnique = this.props.componentNameUnique;

            core[ UNREGISTER_INTERNAL_SYMBOL ]( componentNameUnique );
        }

        /**
         * Using `componentDidMount` in a strict mode causes component to unmount therefor the context need to be
         * re-registered.
         */
        public componentDidMount() {
            const id = this.props.componentNameUnique;

            this.registerContext();

            if ( this.props.children?.length ) {
                const childKeys = React.Children.map( this.props.children, ( child ) => child.key );

                core[ SET_TO_CONTEXT ]( id, { childKeys, props: this.props } );
            } else {
                core[ SET_TO_CONTEXT ]( id, { props: this.props } );
            }
        }

        public render() {
            // Used to link children to parent
            if ( this.props.parentRef ) {
                const childKeys = React.Children.map( this.props.children, ( child ) => child.key );

                core[ LINK_COMPONENTS ]( this.props.parentRef.current, [ this.props.componentNameUnique ], childKeys );
            }

            return <Component { ... this.props } $$commands={ commandsManager }/>;
        }
    };

    /**
     * React `useId` behave differently in production and development mode, because of `<React.StrictMode>`
     * https://github.com/facebook/react/issues/27103#issuecomment-1763359077
     */
    const UniqueWrappedComponent = function ( props: any ) {
        const componentNameUnique = `${ componentName }-${ React.useId() }`;

        const context = {
            getNameUnique: () => componentNameUnique,
            getComponentName: () => componentName,
        };

        return (
            <ComponentIdProvider context={ context }>
                <WrappedComponent { ... props } componentNameUnique={ componentNameUnique }/>
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

