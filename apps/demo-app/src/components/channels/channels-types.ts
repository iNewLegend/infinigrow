import type { ChannelsListAccordion } from "@infinigrow/demo-app/src/components/channels/channels-list-accordion";

import type React from "react";

import type { ChannelItemAccordionComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

export type ChannelsListViewAccordionComponent = React.ReactComponentElement<typeof ChannelsListAccordion>;

export interface ChannelListProps {
    children: ChannelItemAccordionComponent[] | ChannelItemAccordionComponent;
    view: "accordion" | "table";
}

export interface ChannelListState extends React.ComponentState {
    channels: ChannelItemAccordionComponent[];
    selected: { [ key: string ]: boolean };
}
