import React from "react";

import { Select, SelectItem } from "@nextui-org/select";

import { useCommand } from "@infinigrow/commander/use-commands";

import { Info } from "@infinigrow/demo-app/src/ui-theme/symbols";

import type { SelectProps } from "@nextui-org/select";

import type {
    ChannelBudgetFrequencyPossibleValues,
    ChannelBudgetFrequencyProps
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings/channel-budget-types";

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
    multiple: false,
    size: "sm",
    variant: "bordered",
    radius: "none",
    disallowEmptySelection: true,
    "aria-labelledby": "channel-budget-frequency-label",
};

export function getChannelBudgetFrequencyLabel( frequency: ChannelBudgetFrequencyPossibleValues ) {
    return DEFAULT_FREQUENCIES[ frequency! ];
}

export function ChannelBudgetFrequency( props: ChannelBudgetFrequencyProps ) {
    const { frequency } = props;

    const command = useCommand( "App/ChannelItem/SetFrequency" );

    const selectProps: Partial<SelectProps> = {
        ... DEFAULT_PROPS,

        selectedKeys: [ frequency ] as any,

        onChange: ( e ) => command.run( { value: e.target.value } )
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
