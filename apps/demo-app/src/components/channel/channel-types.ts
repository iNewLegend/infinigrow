import type React from "react";

import type { ChannelItem } from "components/channel/channel-item";

import type {
    ChannelBudgetFrequencyProps,
    BudgetAllocationType
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings";

export type ChannelItemComponent = React.ReactComponentElement<typeof ChannelItem>;

export enum UpdateFromType {
    FROM_UNKNOWN,
    FROM_BUDGET_SETTINGS ,
    FROM_BUDGET_BREAKS,
}

export interface ChannelState extends React.ComponentState {
    frequency: ChannelBudgetFrequencyProps["frequency"];
    baseline: string;
    allocation: BudgetAllocationType;

    meta?: ChannelMetaData;
    breaks?: ChannelBreakData[];

    breakElements?: any[];
}

export interface ChannelMetaData {
    id: string;
    icon: string;
    name: string;
}

export interface ChannelBreakData {
    date: Date,
    value: string,
}

export interface ChannelItemProps {
    meta: ChannelMetaData;
}
