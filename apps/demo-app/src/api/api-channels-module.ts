import { APIModuleBase } from "@infinigrow/demo-app/src/api/api-module-base";

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
}
