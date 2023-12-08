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

import type { InputProps } from "@nextui-org/input";

import type { ChannelItemProps } from "@infinigrow/demo-app/src/components/channels/channel-types";

import type { CommandFunctionComponent, CommandArgs } from "@infinigrow/commander/types";

const DEFAULT_BREAK_INPUT_PROPS: InputProps = {
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

export interface State extends React.ComponentState {
    frequency: ChannelBudgetFrequencyProps["frequency"];
    baseline: string;
    allocation: BudgetAllocationType;
}

const initialState: State = {
    frequency: "annually",
    baseline: "0",
    allocation: "equal"
};

function getBreaks( frequency: ChannelBudgetFrequencyProps["frequency"], baseline: string, allocation: BudgetAllocationType ) {
    const breaks: React.JSX.Element[] = [];

    const Break: React.FC<{ label: string; value: string }> = ( props ) => {
        const { label, value } = props,
            parsed = parseFloat( value );

        const formatted = ( Number.isNaN( parsed ) ? 0 : parsed ).toLocaleString(
            undefined,
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        );

        const shouldDisable = allocation === "equal";

        return (
            <div className="break" data-disabled={ shouldDisable }>
                <Input disabled={shouldDisable} { ... DEFAULT_BREAK_INPUT_PROPS } label={ label } value={ formatted }></Input>
            </div>
        );
    };

    function getMonth( index: number ) {
        return moment().month( index ).format( "MMM D" );
    };

    const baselineParsed = parseFloat( baseline.replace( /,/g, "" ) );

    switch ( frequency ) {
        case "annually":
            const perMonth = baselineParsed / 12;

            for ( let i = 0 ; i < 12 ; i++ ) {
                breaks.push( (
                    <Break key={ i } label={ getMonth( i ) } value={ perMonth.toString() }/> ) );
            }
            break;

        case "monthly":
            for ( let i = 0 ; i < 12 ; i++ ) {
                breaks.push( (
                    <Break key={ i } label={ getMonth( i ) } value={ baselineParsed.toString() }/> ) );
            }
            break;

        case "quarterly":
            const perQuarter = baselineParsed / 4;

            for ( let i = 0 ; i < 12 ; i++ ) {
                if ( i % 3 === 0 ) {
                    breaks.push( (
                        <Break key={ i } label={ getMonth( i ) } value={ perQuarter.toString() }/> ) );
                } else {
                    breaks.push( (
                        <Break key={ i } label={ getMonth( i ) } value="0"/> ) );
                }
            }
            break;
    }

    return breaks;
}

export const ChannelBreakdowns: React.FC = () => {
    const commands = useComponentCommands( "App/ChannelItem" ),
        state = commands.getState<State>();

    // Those are initial values, they are not "live" values.
    const { frequency, baseline, allocation } = state;

    const [ breaks, setBreaks ] = React.useState<React.JSX.Element[]>(
        getBreaks( frequency, baseline, allocation )
    );

    const setCurrentBreaks = async ( stateUpdated: Promise<State> ) => {
        // Ensure that the state is updated before we get the new values.
        await stateUpdated;

        const currentState = commands.getState<State>();

        setBreaks( getBreaks( currentState.frequency, currentState.baseline, currentState.allocation ) );
    };

    React.useEffect( () => {
        commands.hook( "App/ChannelItem/SetBaseline", setCurrentBreaks );
        commands.hook( "App/ChannelItem/SetFrequency", setCurrentBreaks );
        commands.hook( "App/ChannelItem/SetAllocation", setCurrentBreaks );
    }, [] );

    return (
        <div className="content">
            { breaks }
        </div>
    );
};

export const ChannelItem: CommandFunctionComponent<ChannelItemProps> = ( props, state ) => {
    const { frequency, baseline, allocation } = state;

    return (
        <div className="channel-item">
            <div className="channel-budget-settings">
                <ChannelBudgetFrequency frequency={ frequency }/>
                <ChannelBudgetBaseline frequency={ frequency } baseline={ baseline } allocation={ allocation }/>
                <ChannelBudgetAllocation allocation={ allocation }/>
            </div>

            <div className="channel-budget-breakdowns">
                <div className="header">
                    <p className="fs-2">Budget Breakdown</p>
                    <p className="description">By default, your budget will be equally divided throughout the year. You
                        can manually change the budget allocation, either now or later.</p>
                    <ChannelBreakdowns/>
                </div>
            </div>
        </div>
    );
};

const $$ = withCommands<State>( "App/ChannelItem", ChannelItem, initialState, [
    class SetAllocation extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetAllocation";
        }

        protected apply( args: CommandArgs ) {
            const { value } = args;

            return this.setState( { allocation: value } );
        }
    },
    class SetBaseline extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetBaseline";
        }

        protected apply( args: CommandArgs ) {
            let result;

            const { value } = args;

            // If include alphabet, then halt
            if ( /[a-zA-Z]/.test( value ) ) {
                return;
            }

            // Remove leading zeros.
            result = value.replace( /^0+/, "" );

            // Decimal separator (eg 100 /  1,000 / 10,000).
            const valueWithoutSeparators = value.replace( /,/g, "" );

            if ( valueWithoutSeparators.length > 3 ) {
                const separatorIndex = valueWithoutSeparators.length - 3;

                result = `${ valueWithoutSeparators.slice( 0, separatorIndex ) },${ valueWithoutSeparators.slice( separatorIndex ) }`;
            }

            return this.setState( { baseline: result } );
        }
    },
    class SetFrequency extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetFrequency";
        }

        protected apply( args: CommandArgs ) {
            const { value } = args;

            return this.setState( { frequency: value } );
        }
    }
] );

export default $$;
