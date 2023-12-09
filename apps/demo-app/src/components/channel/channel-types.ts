import type React from "react";

import type { ChannelItem } from "components/channel/channel-item";

import type {
    ChannelBudgetFrequencyProps,
    BudgetAllocationType
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings";

export type ChannelItemComponent = React.ReactComponentElement<typeof ChannelItem> & { data?: ChannelDataState }

export interface ChannelState extends React.ComponentState {
    frequency: ChannelBudgetFrequencyProps["frequency"];
    baseline: string;
    allocation: BudgetAllocationType;
    data?: ChannelDataState
}

export interface ChannelItemProps {
    id: string;
    icon: string;
    name: string;
}

export interface ChannelDataState {
    name?: string;
}
