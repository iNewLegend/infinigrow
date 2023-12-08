import React from "react";

import { Input } from "@nextui-org/input";

import { useCommand } from "@infinigrow/commander/use-commands";

import { Info } from "@infinigrow/demo-app/src/ui-theme/symbols";

import {
    getChannelBudgetFrequencyLabel
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings/channel-budget-frequency";

import type {
    ChannelBudgetBaselineProps
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings/channel-budget-types.ts";

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
    const { frequency } = props;

    const [ baseline, setBaseline ] = React.useState<string>( "0" );

    const command = useCommand( "App/ChannelItem/SetBaseline" );

    const inputProps: InputProps = {
        ... DEFAULT_PROPS,
        value: baseline.toString(),
        onChange: ( e ) => command.run( {
            value: e.target.value,
            setBaseline,
        } )
    };

    return (
        <div className="channel-budget-baseline">
            <Info>Baseline [{ getChannelBudgetFrequencyLabel( frequency ) }] Budget</Info>
            <Input aria-labelledby="baseline" { ... inputProps }></Input>
        </div>
    );
}
