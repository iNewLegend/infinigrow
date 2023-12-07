import React from "react";

import { withCommands } from "@infinigrow/commander/with-commands";

import type { ChannelItemProps } from "@infinigrow/demo-app/src/components/channels/channel-types";

export const ChannelItem: React.FC<ChannelItemProps> = ( props ) => {
    return (
            <h1>Tab 1 content my name is { props.name }</h1>
    );
};

const $$ = withCommands( "App/ChannelItem", ChannelItem, [
] );

export default $$;