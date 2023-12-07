import type React from "react";

import type { ChannelList } from "@infinigrow/demo-app/src/components/channels/channel-list";
import type { ChannelItem } from "@infinigrow/demo-app/src/components/channels/channel-item";

export type ChannelItemComponent = React.ReactComponentElement<typeof ChannelItem>;
export type ChannelListComponent = React.ReactComponentElement<typeof ChannelList>;

export interface ChannelItemProps {
    name: string;
    id: string;
    icon: string;
}

export interface ChannelListProps {
    children: ChannelItemComponent[] | ChannelItemComponent;
}
