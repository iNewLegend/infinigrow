import React from "react";

import { Input } from "@nextui-org/input";

import { useCommanderCommand } from "@infinigrow/commander/use-commands";

import { Info } from "@infinigrow/ui/src/symbols";

import { UpdateSource } from "@infinigrow/demo-app/src/components/channel/channel-types";

import {
    getChannelBudgetFrequencyLabel
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings/channel-budget-frequency";

import type {
    ChannelBudgetBaselineProps
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings/channel-budget-types";

import type { InputProps } from "@nextui-org/input";

const DEFAULT_PROPS: Partial<InputProps> = {
    classNames: {
        base: "input",
        mainWrapper: "wrapper",
        inputWrapper: "trigger",
    },
    type: "string",
    variant: "bordered",
    radius: "none",
};

export function ChannelBudgetBaseline( props: ChannelBudgetBaselineProps ) {
    const { frequency, allocation, baseline } = props;

    const command = useCommanderCommand( "App/ChannelItem/SetBaseline" );

    const inputProps: InputProps = {
        ... DEFAULT_PROPS,
        disabled: allocation === "manual",
        value: ( baseline || 0 ).toString(),
        onChange: ( e ) => command.run( {
            value: e.target.value,
            source: UpdateSource.FROM_BUDGET_SETTINGS
        } )
    };

    const frequencyLabel = inputProps.disabled ? "Manual" :
        getChannelBudgetFrequencyLabel( frequency );

    return (
        <div className="channel-budget-baseline" data-disabled={ inputProps.disabled }>
            <Info>Baseline [{ frequencyLabel }] Budget</Info>
            <Input aria-labelledby="baseline" { ... inputProps }></Input>
        </div>
    );
}
