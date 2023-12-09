import type React from "react";

import type { ChannelsList } from "@infinigrow/demo-app/src/components/channels/channels-list";

import type { ChannelItemComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

export type ChannelsListComponent = React.ReactComponentElement<typeof ChannelsList>;

export interface ChannelListProps {
    children: ChannelItemComponent[] | ChannelItemComponent;
}

export interface ChannelListState extends React.ComponentState {
    channels: ChannelItemComponent[];
    selected: { [ key: string ]: boolean };
}
