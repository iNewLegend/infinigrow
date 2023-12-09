import { APIModuleBase } from "@infinigrow/demo-app/src/api/api-module-base";

import type { APIComponent } from "@infinigrow/demo-app/src/api/api-component";

import type { CommandFunctionComponent , CommandSingleComponentContext } from "@infinigrow/commander/types";

import type { APICore } from "@infinigrow/demo-app/src/api/api-core";

export class APIChannelsModule extends APIModuleBase {
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
                    children: result.map( ( i: any ) => ( {
                        props: i,
                        type: component.props.children!.props.type,
                    } ) ),
                };
            }
        }

        return result;
    }

    protected onUpdate( component: APIComponent, context: CommandSingleComponentContext, state: {  currentState: any, prevState: any } ) {
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

    private onChannelsChanged( prevChannels: any[], currentChannels: any[] ) {
        // If data changed
        for ( let i = 0; i < currentChannels.length; i++ ) {
            if ( prevChannels[ i ].data !== currentChannels[ i ].data ) {
                this.onChannelsDataChanged( prevChannels[ i ].key, prevChannels[ i ].data, currentChannels[ i ].data );

                // Assume that only one channel can be changed at a time
                break;
            }
        }
    }

    /**
     * It was a lot of easier & more efficient to implement this on command hook, but that's fine for the demo.
     */
    private onChannelsDataChanged( key: string, prevData: any, currentData: any ) {
        // If channel data changed
        this.api.fetch( "POST", "v1/channels/:key", { key, ... currentData }, ( r ) => r.json() );
    }
}
