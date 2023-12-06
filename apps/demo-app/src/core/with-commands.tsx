import { EventEmitter } from "events";

import React from "react";

import {
    REGISTER_INTERNAL_SYMBOL,
    UNREGISTER_INTERNAL_SYMBOL,
    LINK_COMPONENTS,
    GET_INTERNAL_SYMBOL,
    SET_TO_CONTEXT
} from "@infinigrow/demo-app/src/core/_internal/constants.ts";

import core from "@infinigrow/demo-app/src/core/_internal/core.ts";

import commandsManager from "@infinigrow/demo-app/src/core/commands-manager.ts";

import { ComponentIdProvider } from "@infinigrow/demo-app/src/core/commands-provider";

import type {
    CommandFunctionComponent,
    CommandNewInstanceWithArgs
} from "@infinigrow/demo-app/src/core/types.ts";

export function withCommands(
    componentName: string,
    Component: CommandFunctionComponent,
    commands: CommandNewInstanceWithArgs[]
): CommandFunctionComponent {
    const WrappedComponent = class WrappedComponent extends React.PureComponent<any, {
        componentNameUnique: string
    }> {
        public static displayName = `withCommands(${ componentName })`;

        public constructor( props: any ) {
            super( props );

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

            core[ GET_INTERNAL_SYMBOL ]( id ).emitter.emit( "component-did-mount" );

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

