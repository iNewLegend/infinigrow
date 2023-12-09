import React from "react";

import moment from "moment";

import { Input } from "@nextui-org/input";

import { useCommanderComponent } from "@infinigrow/commander/use-commands";

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

function getBreaks(
    frequency: ChannelBudgetFrequencyProps["frequency"],
    baseline: string,
    allocation: BudgetAllocationType,
    commands: ReturnType<typeof useCommanderComponent>
) {
    const breaks: React.JSX.Element[] = [];

    const Break: React.FC<{ label: string; value: string }> = ( props ) => {
        const { label } = props,
            parsed = parseFloat( props.value );

        const formatted = ( Number.isNaN( parsed ) ? 0 : parsed ).toLocaleString(
            undefined,
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        );

        const [ value, setValue ] = React.useState<string>( formatted ),
            disabled = allocation === "equal";

        const inputProps: InputProps = {
            ... DEFAULT_BREAK_INPUT_PROPS,

            label,
            value,
            disabled,

            onChange: ( e ) => ! disabled && commands.run( "App/ChannelItem/SetBreakdown", {
                setValue,
                value: e.target.value
            } )
        };

        return (
            <div className="break" data-disabled={ inputProps.disabled }>
                <Input { ... inputProps } />
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
    const commands = useCommanderComponent( "App/ChannelItem" ),
        state = commands.getState<ChannelState>();

    // Those are initial values, they are not "live" values.
    const { frequency, baseline, allocation } = state;

    const [ breaks, setBreaks ] = React.useState<React.JSX.Element[]>( getBreaks(
            frequency,
            baseline,
            allocation,
            commands
        )
    );

    const setCurrentBreaks = async ( stateUpdated: Promise<ChannelState | void> ) => {
        // Ensure that the state is updated before we get the new values.
        await stateUpdated;

        const currentState = commands.getState<ChannelState>();

        setBreaks( getBreaks(
            currentState.frequency,
            currentState.baseline,
            currentState.allocation,
            commands
        ) );
    };

    /**
     * TODO: Should be using state, but im lazy.
     */
    const setBreakdownSum = () => {
        // Get all the values from the inputs.
        const values = Array.from( document.querySelectorAll( ".break input" ) )
            .map( ( input ) => parseFloat( ( input as HTMLInputElement ).value.replace( /,/g, "" ) ) );

        // Sum them up.
        const sum = values.reduce( ( a, b ) => a + b, 0 );

        commands.run( "App/ChannelItem/SetBaseline", { value: sum.toString() } );
    };

    React.useEffect( () => {
        commands.hook( "App/ChannelItem/SetBaseline", async ( stateUpdated: Promise<ChannelState> ) => {
            // Ensure that the state is updated before we get the new values.
            await stateUpdated;

            const currentState = commands.getState<ChannelState>();

            // If the allocation is manual, we don't want to update the breakdowns.
            if ( currentState.allocation === "manual" ) {
                return;
            }

            setCurrentBreaks( Promise.resolve() );
        } );

        commands.hook( "App/ChannelItem/SetFrequency", setCurrentBreaks );
        commands.hook( "App/ChannelItem/SetAllocation", setCurrentBreaks );

        commands.hook( "App/ChannelItem/SetBreakdown", setBreakdownSum );
    }, [] );

    return (
        <div className="content">
            { breaks }
        </div>
    );
};
