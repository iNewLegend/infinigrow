import type React from "react";

import type { ChannelItem } from "components/channel/channel-item";

import type {
    ChannelBudgetFrequencyProps,
    BudgetAllocationType
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings";

export type ChannelItemComponent = React.ReactComponentElement<typeof ChannelItem>;

export interface ChannelState extends React.ComponentState {
    frequency: ChannelBudgetFrequencyProps["frequency"];
    baseline: string;
    allocation: BudgetAllocationType;
}

export interface ChannelItemProps {
    name: string;
    id: string;
    icon: string;
}
