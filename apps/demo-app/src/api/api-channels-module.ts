import core from "@infinigrow/commander/core";

import commandsManager from "@infinigrow/commander/commands-manager";

import { GET_INTERNAL_SYMBOL } from "@infinigrow/commander/constants";

import { CHANNEL_LIST_STATE_DATA } from "@infinigrow/demo-app/src/components/channel/channel-consts";

import { APIModuleBase } from "@infinigrow/demo-app/src/api/api-module-base";

import { pickEnforcedKeys } from "@infinigrow/demo-app/src/utils";

import type { APIComponent } from "@infinigrow/demo-app/src/api/api-component";

import type { ChannelItemComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

import type { CommandFunctionComponent, CommandSingleComponentContext } from "@infinigrow/commander/types";

import type { APICore } from "@infinigrow/demo-app/src/api/api-core";

let channelsListMountOnce = false;

export class APIChannelsModule extends APIModuleBase {
    private state: any = {};

    public static getName(): string {
        return "channels";
    }

    public constructor( api: APICore ) {
        super( api );

        this.register( "GET", "App/ChannelsList", "v1/channels" );
        this.register( "GET", "App/ChannelItem", "v1/channels/:key" );

        this.register( "POST", "App/ChannelItem", "v1/channels/:key" );
    }

    protected async requestHandler( component: APIComponent, element: CommandFunctionComponent, request: any ): Promise<any> {
        return request;
    }

    protected async responseHandler( component: APIComponent, element: CommandFunctionComponent, response: Response ): Promise<any> {
        const result = await response.json();

        switch ( element.getName!() ) {
            case "App/ChannelsList": {
                return {
                    children: result.map( ( i: any ) => {
                        const key = i.key;

                        delete i.key;

                        return {
                            key,
                            props: i,
                            type: component.props.children!.props.type,
                        };
                    } ),
                };
            }

            case "App/ChannelItem": {
                // Actualize/Parse date back to Date object
                if ( result.breaks ) {
                    result.breaks = result.breaks.map( ( i: any ) => ( {
                        ... i,
                        date: new Date( i.date ),
                    } ) );
                }
            }
        }

        return result;
    }

    protected onMount( component: APIComponent, context: CommandSingleComponentContext ) {
        if ( context.componentName === "App/ChannelsList" ) {
            if ( ! channelsListMountOnce ) {
                channelsListMountOnce = true;

                this.onChannelListMountOnce( component, context );
            }

            const timer = setInterval( () => {
                if ( ! context.isMounted() ) {
                    clearInterval( timer );
                    return;
                }

                // this.onAutoSave( component, context );
            }, 5000 );

            return;
        }

        throw new Error( `APIChannelsModule: onMount() - Unknown component: ${ context.componentName }` );
    }

    protected onUpdate( component: APIComponent, context: CommandSingleComponentContext, state: { currentState: any, prevState: any } ) {
        this.state = state;

        const { currentState, prevState } = state;

        // Handle only state changes
        if ( currentState === prevState ) {
            return;
        }

        switch ( context.componentName ) {
            case "App/ChannelsList": {
                // If channels changed
                if ( currentState.channels !== prevState.channels ) {
                    this.onChannelsChanged( prevState.channels, currentState.channels );
                }
            }
        }
    }

    private onChannelListMountOnce( component: APIComponent, context: CommandSingleComponentContext ) {
        const commands = commandsManager.get( "UI/Accordion" );

        const onSelectionAttached = commands[ "UI/Accordion/onSelectionAttached" ],
            onSelectionDetached = commands[ "UI/Accordion/onSelectionDetached" ];

        onSelectionAttached.global().globalHook( () => {
            this.save( component, context );
        } );

        onSelectionDetached.global().globalHook( () => {
            this.save( component, context );
        } );
    }

    private onAutoSave( component: APIComponent, context: CommandSingleComponentContext ) {
        this.save( component, context );
    }

    private onChannelsChanged( prevChannels: ChannelItemComponent[], currentChannels: ChannelItemComponent[] ) {
        // If data changed
        for ( let i = 0 ; i < currentChannels.length ; i++ ) {
            if ( prevChannels[ i ].props.meta !== currentChannels[ i ].props.meta ) {
                this.onChannelsMetaDataChanged( prevChannels[ i ].key!, prevChannels[ i ].props.meta, currentChannels[ i ].props.meta );

                // Assume that only one channel can be changed at a time
                break;
            }
        }
    }

    /**
     * It was a lot of easier & more efficient to implement this on command hook, but that's fine for the demo.
     */
    private onChannelsMetaDataChanged( key: string, prevMeta: any, currentMeta: any ) {
        // If channel data changed
        this.api.fetch( "POST", "v1/channels/:key", { key, meta: currentMeta }, ( r ) => r.json() );
    }

    private save( component: APIComponent, context: CommandSingleComponentContext ) {
        const componentContext = context.getComponentContext();

        console.log( "API: save()", {
            component,
            context,
        } );

        // Helper function to recursively find "App/ChannelItem" contexts
        const findChannelItemContexts = ( currentContext: typeof componentContext ): typeof componentContext[] => {
            let channelItemContexts = [];

            // Check if the current context is an "App/ChannelItem" context
            if ( currentContext.getComponentName() === "App/ChannelItem" ) {
                channelItemContexts.push( currentContext );
            }

            // Call the function recursively for each child context
            for ( const childContext of Object.values( currentContext.children || {} ) ) {
                channelItemContexts = channelItemContexts.concat( findChannelItemContexts( childContext ) );
            }

            return channelItemContexts;
        };

        // Find all "App/ChannelItem" contexts
        const channelItemContexts = findChannelItemContexts( componentContext );

        // Loop through all "App/ChannelItem" contexts
        for ( const channelItemContext of channelItemContexts ) {
            const currentNameUnique = channelItemContext.getNameUnique();

            // If component is not registered/mounted skip it
            if ( ! commandsManager.isContextRegistered( currentNameUnique ) ) {
                continue;
            }

            // Get internal context.
            const internalContext = core[ GET_INTERNAL_SYMBOL ]( currentNameUnique );

            // Get the component state
            const state = internalContext.getState();

            // Find key using parent(`App/ChannelsList`) context
            const key = context.getState<any>().channels.find( ( i ) => i.meta.id === internalContext.props.meta.id ).key;

            // Determine which state keys to save
            const stateToSave = pickEnforcedKeys( state, CHANNEL_LIST_STATE_DATA );

            this.api.fetch( "POST", "v1/channels/:key", { key, ... stateToSave }, ( r ) => r.json() );

            console.log( `API: save() - '${ channelItemContext.getComponentName() }' Saved component state` );
        }
    }
}
