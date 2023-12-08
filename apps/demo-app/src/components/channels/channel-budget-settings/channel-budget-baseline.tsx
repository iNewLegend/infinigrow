import React from "react";

import { Input } from "@nextui-org/input";

import { useCommand } from "@infinigrow/commander/use-commands";

import { Info } from "@infinigrow/demo-app/src/ui-theme/symbols";

import {
    getChannelBudgetFrequencyLabel
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings/channel-budget-frequency";

import type { InputProps } from "@nextui-org/input";

import type {
    ChannelBudgetBaselineProps
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings/channel-budget-types.ts";

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

    const command = useCommand( "App/ChannelItem/SetBaseline" );

    const inputProps: InputProps = {
        ... DEFAULT_PROPS,
        disabled: allocation === "manual",
        value: ( baseline || 0 ).toString(),
        onChange: ( e ) => command.run( {
            value: e.target.value,
        } )
    };

    return (
        <div className="channel-budget-baseline" data-disabled={ inputProps.disabled }>
            <Info>Baseline [{ getChannelBudgetFrequencyLabel( frequency ) }] Budget</Info>
            <Input aria-labelledby="baseline" { ... inputProps }></Input>
        </div>
    );
}
