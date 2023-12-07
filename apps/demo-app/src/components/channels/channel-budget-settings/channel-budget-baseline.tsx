import React from "react";

import { Input } from "@nextui-org/input";

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

function formatValue( value: string ): string {
    // If include alphabet, then 0
    if ( /[a-zA-Z]/.test( value ) ) {
        return "0";
    }

    // Remove leading zeros.
    value = value.replace( /^0+/, "" );

    // Decimal separator (eg 100 /  1,000 / 10,000).
    const valueWithoutSeparators = value.replace( /,/g, "" );

    if ( valueWithoutSeparators.length > 3 ) {
        const separatorIndex = valueWithoutSeparators.length - 3;

        value = `${ valueWithoutSeparators.slice( 0, separatorIndex ) },${ valueWithoutSeparators.slice( separatorIndex ) }`;
    }

    return value;
}

export function ChannelBudgetBaseline( props: ChannelBudgetBaselineProps ) {
    const { frequency } = props;

    const [ baseline, setBaseline ] = React.useState<string>( "0" );

    const inputProps: InputProps = {
        ... DEFAULT_PROPS,
        value: baseline.toString(),
        onChange: ( e ) => {
            setBaseline( formatValue( e.target.value ) );
        },
    };

    return (
        <div className="channel-budget-baseline">
            <Info>Baseline [{ getChannelBudgetFrequencyLabel( frequency ) }] Budget</Info>
            <Input aria-labelledby="baseline" { ... inputProps }></Input>
        </div>
    );
}
