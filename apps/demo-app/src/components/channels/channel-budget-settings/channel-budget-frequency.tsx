import React from "react";

import { Select, SelectItem } from "@nextui-org/select";

import { Info } from "@infinigrow/demo-app/src/ui-theme/symbols";

import type {
    ChannelBudgetFrequencyPossibleValues,
    ChannelBudgetFrequencyProps
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings/channel-budget-types";

import type { SelectProps } from "@nextui-org/select";

const DEFAULT_FREQUENCIES: Record<ChannelBudgetFrequencyPossibleValues, string> = {
    annually: "Annually",
    monthly: "Monthly",
    quarterly: "Quarterly",
};

const DEFAULT_PROPS: Partial<SelectProps> = {
    classNames: {
        base: "select",
        trigger: "trigger",
        mainWrapper: "wrapper",
        innerWrapper: "inner"
    },
    size: "sm",
    variant: "bordered",
    radius: "none",
};

export function getChannelBudgetFrequencyLabel( frequency: ChannelBudgetFrequencyPossibleValues ) {
    return DEFAULT_FREQUENCIES[ frequency! ];
}

export function ChannelBudgetFrequency( props: ChannelBudgetFrequencyProps ) {
    const { frequency, setFrequency } = props;

    const selectProps: Partial<SelectProps> = {
        ... DEFAULT_PROPS,

        selectedKeys: [ frequency ] as any,

        onChange: ( e ) => {
            setFrequency( e.target.value as any );
        },
    };

    return (
        <div className="channel-budget-frequency">
            <Info>Budget Frequency</Info>
            <Select { ... selectProps }>
                { Object.keys( DEFAULT_FREQUENCIES ).map( key => (
                    <SelectItem key={ key } value={ key }>{ getChannelBudgetFrequencyLabel( key as any ) }</SelectItem>
                ) ) }
            </Select>
        </div>
    );
}
