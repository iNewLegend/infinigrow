import { EventEmitter } from "events";

import React from "react";

import { BehaviorSubject } from "rxjs";

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

    function stringifyToLevel( obj: any, level: number ): string {
        let cache = new Map();
        let str = JSON.stringify( obj, ( key, value ) => {
            if ( typeof value === "object" && value !== null ) {
                if ( cache.size > level ) return; // Limit depth
                if ( cache.has( value ) ) return; // Duplicate reference
                cache.set( value, true );
            }
            return value;
        } );
        cache.clear(); // Enable garbage collection
        return str;
    }

    function compareObjects( obj1: any, obj2: any, level: number ): boolean {
        // Add a unique flag property to the objects
        const flag = Symbol( "compared" );

        // Check if the objects have already been compared
        if ( obj1[ flag ] && obj2[ flag ] ) {
            return true;
        }

        const strObj1 = stringifyToLevel( obj1, level );
        const strObj2 = stringifyToLevel( obj2, level );

        const isEqual = strObj1 === strObj2;

        // If the objects are equal, flag them as compared
        if ( isEqual ) {
            obj1[ flag ] = true;
            obj2[ flag ] = true;
        }

        return isEqual;
    }

    class Store {
        private silentState: any;
        private currentState: BehaviorSubject<any>;
        private prevState: any;
        private subscription: any;

        public constructor( initialState: any ) {
            this.currentState = new BehaviorSubject( initialState );

            this.prevState = initialState;
        }

        public getState() {
            return this.silentState || this.currentState.getValue();
        }

        public getPrevState() {
            return this.prevState;
        }

        public setState( newState: any, silent = false ) {
            this.prevState = this.currentState.getValue();

            if ( silent ) {
                this.silentState = newState;

                return;
            }

            this.silentState = null;

            this.currentState.next( newState );
        }

        public hasChanged( level = 2 ) {
            if ( this.prevState === this.currentState ) {
                return false;
            }

            return ! compareObjects( this.prevState, this.currentState.getValue(), level );
        }

        public subscribe( callback: ( state: any ) => void ) {
            if ( this.subscription ) {
                this.subscription.unsubscribe();
            }

            this.subscription = this.currentState.subscribe( callback );

            callback( this.getState() );

            return this.subscription;
        }
    }

    if ( state ) {
        const originalFunction = Component,
            originalName = Component.displayName || Component.name || "Component";

        // This approach give us ability to inject second argument to the functional component.
        Component = function ( props: any ) {
            return originalFunction( props, state );
        };

        Object.defineProperty( Component, originalName, { value: originalName, writable: false } );

        Component.displayName = `withInjectedState(${ originalName })`;
    }

    const WrappedComponent = class WrappedComponent extends React.PureComponent<any, React.ComponentState> {
        public static displayName = `withCommands(${ componentName })`;

        public static contextType = ComponentIdContext;

        public context: CommandComponentContextProps;

        private store: Store;

        private $$commander = {
            isMounted: false,
            lifecycleHandlers: {} as any,
        };

        private isMounted() {
            return this.$$commander.isMounted;
        }

        public constructor( props: any, context: any ) {
            super( props );

            this.context = context;

            this.state = {};
            this.store = new Store( state );

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

                key: self.props.$$key,

                isMounted: () => self.isMounted(),

                getComponentContext: () => self.context,

                getState: () => this.store ? this.store.getState() : this.state,
                setState: ( state, callback ) => {
                    this.store.setState(
                        {
                            ... this.store.getState(),
                            ... state
                        },
                        ! this.isMounted(),
                    );

                    if ( callback ) {
                        callback( this.store.getState() );
                    }
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

        /**
         * Using `componentDidMount` in a strict mode causes component to unmount therefor the context need to be
         * re-registered.
         */
        public componentDidMount() {
            const id = this.context.getNameUnique();

            this.$$commander.isMounted = true;

            this.registerInternalContext();

            this.store?.subscribe( ( state ) => {
                if ( ! this.context.getComponentRef()?.current ) {
                    return;
                }

                this.forceUpdate();
            } );

            core[ SET_TO_CONTEXT ]( id, { props: this.props } );

            if ( this.$$commander.lifecycleHandlers[ INTERNAL_ON_MOUNT ] ) {
                this.$$commander.lifecycleHandlers[ INTERNAL_ON_MOUNT ]( core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() ) );
            }
        }

        public componentDidUpdate( prevProps: any, prevState: any, snapshot?: any ) {
            if ( this.$$commander.lifecycleHandlers[ INTERNAL_ON_UPDATE ] ) {
                const context = core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() );

                this.$$commander.lifecycleHandlers[ INTERNAL_ON_UPDATE ]( context, {
                    currentProps: this.props,
                    currentState: this.store.getState(),
                    prevProps,
                    prevState: this.store.getPrevState(),
                    snapshot,
                } );
            }
        }

        public render() {
            if ( this.$$commander.lifecycleHandlers[ INTERNAL_ON_LOAD ] ) {
                this.$$commander.lifecycleHandlers[ INTERNAL_ON_LOAD ]( core[ GET_INTERNAL_SYMBOL ]( this.context.getNameUnique() ) );
            }

            return <Component { ... this.props } />;
        }
    };

    function handleAncestorContexts( context: CommandComponentContextProps, parentContext: CommandComponentContextProps ) {

        if ( parentContext.isSet ) {
            context.parent = parentContext;
        }

        if ( context.parent ) {
            if ( ! context.parent.children ) {
                context.parent.children = {};
            }
            context.parent.children[ context.getNameUnique() ] = context;
        }

        if ( context.children ) {
            for ( const key in context.children ) {
                const child = context.children[ key ];

                const internalContext = core[ GET_INTERNAL_SYMBOL ]( child.getNameUnique(), true );

                if ( ! internalContext ) {
                    delete context.children[ key ];
                }
            }
        }
    }

    /**
     * React `useId` behave differently in production and development mode, because of `<React.StrictMode>`
     * https://github.com/facebook/react/issues/27103#issuecomment-1763359077
     */
    const UniqueWrappedComponent = React.forwardRef( ( props: any, _ref ) => {
        const parentContext = React.useContext( ComponentIdContext );

        const componentNameUnique = `${ componentName }-${ React.useId() }`;
        const componentRef = React.useRef( null );

        const context: CommandComponentContextProps = {
            isSet: true,

            getNameUnique: () => componentNameUnique,
            getComponentName: () => componentName,
            getComponentRef: () => componentRef,
        };

        React.useLayoutEffect( () => {
            handleAncestorContexts( context, parentContext );
        }, [ context ] );

        return (
            <ComponentIdProvider context={ context }>
                <WrappedComponent { ... props } ref={ componentRef } $$key={ performance.now() }/>
            </ComponentIdProvider>
        );
    } ) as CommandFunctionComponent;

    UniqueWrappedComponent.getName = () => componentName;

    commandsManager.register( {
        componentName,
        commands,
    } );

    return UniqueWrappedComponent;
}

