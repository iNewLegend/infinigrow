import type React from "react";

import type { ChannelsList } from "@infinigrow/demo-app/src/components/channels/channels-list";

import type { ChannelItemAccordionComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";
import { ChannelsListAccordion } from "./channels-list-accordion.tsx";

export type ChannelsListViewAccordionComponent = React.ReactComponentElement<typeof ChannelsListAccordion>;

export interface ChannelListProps {
    children: ChannelItemAccordionComponent[] | ChannelItemAccordionComponent;
    view: "accordion" | "table";
}

export interface ChannelListState extends React.ComponentState {
    channels: ChannelItemAccordionComponent[];
    selected: { [ key: string ]: boolean };
}
