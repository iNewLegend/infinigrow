import React from "react";

import { withCommands } from "@infinigrow/commander/with-commands";

import { CommandBase } from "@infinigrow/commander/command-base";

import { Input } from "@nextui-org/input";

import moment from "moment";

import { useComponentCommands } from "@infinigrow/commander/use-commands";

import {
    ChannelBudgetFrequency,
    ChannelBudgetBaseline,
    ChannelBudgetAllocation
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings";

import type {
    ChannelBudgetFrequencyProps,
    BudgetAllocationType
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings";

import type { ChannelItemProps } from "@infinigrow/demo-app/src/components/channels/channel-types";

import type { CommandFunctionComponent, CommandArgs } from "@infinigrow/commander/types";
import type { InputProps } from "@nextui-org/input";

const DEFAULT_INPUT_PROPS: InputProps = {
    classNames: {
        base: "input",
        mainWrapper: "wrapper",
        inputWrapper: "trigger",
        label: "currency",
    },
    type: "string",
    variant: "bordered",
    radius: "none",
    labelPlacement: "outside",
    placeholder: "0",
    startContent: (
        <div className="pointer-events-none flex items-center">
            <span className="text-slate-700 text-sm font-medium leading-[21px]">$</span>
        </div>
    ),
};

function getBreaks( frequency: ChannelBudgetFrequencyProps["frequency"], baseline: string, allocation: BudgetAllocationType ) {
    const breaks: React.JSX.Element[] = [];

    const Break: React.FC<{ label: string; value: string }> = ( props ) => {
        const { label, value } = props;

        const formatted = ( parseFloat( value ) ).toLocaleString(
            undefined,
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        );

        return (
            <div className="break">
                <Input { ... DEFAULT_INPUT_PROPS } label={ label } value={ formatted }></Input>
            </div>
        );
    };

    const baselineParsed = parseFloat( baseline.replace( /,/g, "" ) );

    switch ( frequency ) {
        case "annually":
            const perMonth = baselineParsed / 12;

            for ( let i = 0 ; i < 12 ; i++ ) {
                const month = moment().month( i ).format( "MMM D" );

                breaks.push( (
                    <Break key={ i } label={ month } value={ perMonth.toString() }/> ) );
            }
            break;
    }

    return breaks;
}

export const ChannelBreakdowns: React.FC<{
    frequency: ChannelBudgetFrequencyProps["frequency"];
    baseline: string;
    allocation: BudgetAllocationType;
}> = ( props ) => {
    const { frequency, baseline, allocation } = props;

    const commands = useComponentCommands( "App/ChannelItem" );

    const [ breaks, setBreaks ] = React.useState<React.JSX.Element[]>(
        getBreaks( frequency, baseline, allocation )
    );

    React.useEffect( () => {
        commands.hook( "App/ChannelItem/SetBaseline", ( args ) => {
            setBreaks( getBreaks( frequency, args.value, allocation ) );
        } );
    }, [] );

    return (
        <div className="content">
            { breaks }
        </div>
    );
};

export const ChannelItem: CommandFunctionComponent<ChannelItemProps> = ( props ) => {
    const [ frequency, setFrequency ] =
        React.useState<ChannelBudgetFrequencyProps["frequency"]>( "annually" );

    const [ baseline, setBaseline ] = React.useState<string>( "0" );

    const [ allocation, setAllocation ] = React.useState<BudgetAllocationType>( "equal" );

    return (
        <div className="channel-item">
            <div className="channel-budget-settings">
                <ChannelBudgetFrequency frequency={ frequency } setFrequency={ setFrequency }/>
                <ChannelBudgetBaseline frequency={ frequency } baseline={ baseline } setBaseline={ setBaseline }/>
                <ChannelBudgetAllocation allocation={ allocation } setAllocation={ setAllocation }/>
            </div>

            <div className="channel-budget-breakdowns">
                <div className="header">
                    <p className="fs-2">Budget Breakdown</p>
                    <p className="description">By default, your budget will be equally divided throughout the year. You
                        can manually change the budget allocation, either now or later.</p>
                    <ChannelBreakdowns frequency={ frequency } baseline={ baseline } allocation={ allocation }/>
                </div>
            </div>
        </div>
    );
};

const $$ = withCommands( "App/ChannelItem", ChannelItem, [
    class SetAllocation extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetAllocation";
        }

        protected apply( args: CommandArgs ) {
            const { value, setAllocation } = args;

            setAllocation( value );

            return value;
        }
    },
    class SetBaseline extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetBaseline";
        }

        protected apply( args: CommandArgs ) {
            let result;

            const { value, setBaseline } = args;

            // If include alphabet, then halt
            if ( /[a-zA-Z]/.test( value ) ) {
                return;
            }
            ;

            // Remove leading zeros.
            result = value.replace( /^0+/, "" );

            // Decimal separator (eg 100 /  1,000 / 10,000).
            const valueWithoutSeparators = value.replace( /,/g, "" );

            if ( valueWithoutSeparators.length > 3 ) {
                const separatorIndex = valueWithoutSeparators.length - 3;

                result = `${ valueWithoutSeparators.slice( 0, separatorIndex ) },${ valueWithoutSeparators.slice( separatorIndex ) }`;
            }

            setBaseline( result );

            return result;
        }
    },
    class SetFrequency extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetFrequency";
        }

        protected apply( args: CommandArgs ) {
            const { value, setFrequency } = args;

            setFrequency( value );

            return value;
        }
    }
] );

export default $$;
