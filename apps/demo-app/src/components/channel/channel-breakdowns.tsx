import React from "react";

import moment from "moment";

import { Input } from "@nextui-org/input";

import { useComponentCommands } from "@infinigrow/commander/use-commands";

import type { InputProps } from "@nextui-org/input";

import type { ChannelState } from "components/channel/channel-types";

import type {
    ChannelBudgetFrequencyProps,
    BudgetAllocationType
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings";

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
                    breaks.push( ( <Break key={ i } label={ getMonth( i ) } value={ perQuarter.toString() }/> ) );
                    continue;
                }

                breaks.push( ( <Break key={ i } label={ getMonth( i ) } value="0"/> ) );
            }
            break;
    }

    return breaks;
}

export const ChannelBreakdowns: React.FC = () => {
    const commands = useComponentCommands( "App/ChannelItem" ),
        state = commands.getState<ChannelState>();

    // Those are initial values, they are not "live" values.
    const { frequency, baseline, allocation } = state;

    const [ breaks, setBreaks ] = React.useState<React.JSX.Element[]>(
        getBreaks( frequency, baseline, allocation )
    );

    const setCurrentBreaks = async ( stateUpdated: Promise<ChannelState> ) => {
        // Ensure that the state is updated before we get the new values.
        await stateUpdated;

        const currentState = commands.getState<ChannelState>();

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
