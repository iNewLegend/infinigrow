import { APIModuleBase } from "@infinigrow/demo-app/src/api/api-module-base";

import type { CommandSingleComponentContext } from "@infinigrow/commander/types";

import type { APIComponent } from "@infinigrow/demo-app/src/api/api-component";

import type { APICore } from "@infinigrow/demo-app/src/api/api-core";

export class APIChannelsModule extends APIModuleBase {
    public static getName(): string {
        return "channels";
    }

    public constructor( api: APICore ) {
        super( api );

        this.register( "GET", "App/ChannelsList", "v1/channels", this.defaultHandler );
        this.register( "GET", "App/ChannelItem", "v1/channels/:key", this.defaultHandler );
    }

    public async defaultHandler( response: Response ): Promise<any> {
        const result = await response.json();

        console.log( result );

        return result;
    }

    public mount( component: APIComponent, context: CommandSingleComponentContext ) {
        // It safe to hook components here, since when the component is unmounted, the hooks will be removed

    }
}
