import React from "react";

import moment from "moment";

import { Input } from "@nextui-org/input";

import { useCommanderComponent, useCommanderState } from "@infinigrow/commander/use-commands";

import { formatNumericStringToFraction } from "@infinigrow/demo-app/src/utils";

import { UpdateFromType } from "@infinigrow/demo-app/src/components/channel/channel-types";

import type { ChannelState, ChannelBreakData } from "@infinigrow/demo-app/src/components/channel/channel-types";
import type { InputProps } from "@nextui-org/input";

import type { ChannelBudgetFrequencyProps } from "@infinigrow/demo-app/src/components/channel/channel-budget-settings";

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

function generateBreaks(
    frequency: ChannelBudgetFrequencyProps["frequency"],
    baseline: string,
) {
    const breaks: ChannelBreakData[] = [];

    const baselineParsed = parseFloat( baseline.toString().replace( /,/g, "" ) );

    let fillValue;

    // noinspection FallThroughInSwitchStatementJS
    switch ( frequency ) {
        case "annually":
            // Per month.
            fillValue = baselineParsed / 12;
            break;

        case "monthly":
            // Same each month.
            fillValue = baselineParsed;
            break;

        case "quarterly":
            const perQuarter = baselineParsed / 4;

            for ( let i = 0 ; i < 12 ; i++ ) {
                const date = moment().month( i ).toDate();
                if ( i % 3 === 0 ) {
                    breaks.push( {
                        date,
                        value: perQuarter.toString(),
                    } );
                    continue;
                }

                // No budget
                breaks.push( {
                    date,
                    value: "0",
                } );
            }

            break;

        default:
            throw new Error( `Invalid frequency: ${ frequency }` );
    }

    if ( ! breaks.length ) {
        for ( let i = 0 ; i < 12 ; i++ ) {
            breaks.push( {
                date: moment().month( i ).toDate(),
                value: fillValue!.toString(),
            } );
        }
    }

    return breaks;
}

function getBreakElements(
    breaks: ChannelBreakData[],
    breaksElements: React.JSX.Element[],
    allocation: ChannelState["allocation"],
    onInputChange: ( index: number, value: string ) => void
) {
    if ( ! breaks.length ) {
        throw new Error( "Breaks state is empty" );
    }

    const breakElements: React.JSX.Element[] = [];

    const Break: React.FC<{ label: string; value: string, index: number, allocation: ChannelState["allocation"] }> = ( props ) => {
        const { label, index } = props,
            formatted = formatNumericStringToFraction( props.value );

        const disabled = allocation === "equal";

        const inputProps: InputProps = {
            ... DEFAULT_BREAK_INPUT_PROPS,

            label,
            disabled,

            value: formatted,

            onChange: ( e ) => ! disabled && onInputChange( index, e.target.value )
        };

        return (
            <div className="break" data-disabled={ inputProps.disabled }>
                <Input { ... inputProps } />
            </div>
        );
    };

    function formatDate( date: Date ) {
        return moment( date ).format( "MMM D" );
    };

    let index = 0;

    const isAllocationChanged = breaksElements?.some( ( element ) => element.props.allocation !== allocation );

    for ( const { date, value } of breaks ) {
        if ( ! isAllocationChanged && breaksElements?.[ index ] ) {
            const existBreakElement = breaksElements?.[ index ];

            // Update with pinceta
            if ( existBreakElement.props.value.toString() !== value.toString() ) {
                breakElements.push( React.cloneElement( existBreakElement, {
                    value: value.toString(),
                } ) );

                index++;
                continue;
            }

            breakElements.push( existBreakElement );
            index++;
            continue;
        }

        const props = {
            index,
            allocation,
            label: formatDate( date ),
            value: value.toString(),
        };

        breakElements.push( <Break key={ date.getTime() } { ... props } /> );

        index++;
    }

    return breakElements;
}

export const ChannelBreakdowns: React.FC = () => {
    const commands = useCommanderComponent( "App/ChannelItem" ),
        [ getState, setState, isMounted ] = useCommanderState<ChannelState>( "App/ChannelItem" );

    const onBreakdownInputChange = ( index: number, value: string ) => {
        commands.run( "App/ChannelItem/SetBreakdown", { index, value } );
    };

    const state = getState();

    React.useEffect( () => {
        if ( ! isMounted() ) {
            return;
        }

        let stateChanged = false;
        const newState = { ... getState() };

        if ( ! newState.breaks?.length ) {
            stateChanged = true;
            newState.breaks = generateBreaks( newState.frequency, newState.baseline );
        }

        if ( ! newState.breakElements?.length ) {
            stateChanged = true;
            newState.breakElements = getBreakElements( newState.breaks!, [], newState.allocation, onBreakdownInputChange );
        }

        if ( stateChanged ) {
            setState( newState );
        }
    }, [ isMounted(), state, state.breaks, state.breakElements ]  );

    const setBreakdownElements = ( breaks: ChannelBreakData[] ) => {
        const currentState = commands.getState<ChannelState>();

        const breakdownElements = getBreakElements(
            breaks!,
            currentState.breakElements!,
            currentState.allocation,
            onBreakdownInputChange
        );

        setState( {
            breakElements: breakdownElements
        } );
    };

    const setCurrentBreakdownsCallback = async ( update: Promise<UpdateFromType> ) => {
        // Ensure that the state is updated before we get the new values.
        const prevFrequency = state.frequency,
            prevBaseline = state.baseline,
            prevAllocation = state.allocation;

        const updateFrom = await update;

        if ( updateFrom ) {
            const currentState = commands.getState<ChannelState>();

            let breaks = currentState.breaks!;

            switch ( updateFrom ) {
                case UpdateFromType.FROM_BUDGET_BREAKS:
                    setBreakdownElements( breaks );
                    break;

                case UpdateFromType.FROM_BUDGET_SETTINGS:
                    const isBudgetSettingsChanged = prevFrequency !== currentState.frequency ||
                        prevAllocation !== currentState.allocation ||
                        ( "0" === currentState.baseline || prevBaseline !== currentState.baseline );

                    if ( isBudgetSettingsChanged ) {
                        breaks = generateBreaks( currentState.frequency, currentState.baseline );
                    }

                    if ( ! isMounted() ) {
                        debugger;
                    }

                    setBreakdownElements( breaks );
                    break;

                // Mostly happens while hot-reloading.
                default:
                    return;
            }

            setState( {
                breaks
            } );
        }
    };

    const setBreakdownSum = () => {
        // TODO: Should be using state, but im lazy.
        // Get all the values from the inputs.
        const values = Array.from( document.querySelectorAll( ".break input" ) )
            .map( ( input ) => parseFloat( ( input as HTMLInputElement ).value.replace( /,/g, "" ) ) );

        // Sum them up.
        const sum = formatNumericStringToFraction( values
            .filter( ( value ) => ! isNaN( value ) )
            .reduce( ( a, b ) => a + b, 0 )
            .toString()
        );

        console.log( values );
        // Set the new baseline.
        setState( {
            baseline: sum!
        } );

        // Update the breaks.
        setCurrentBreakdownsCallback(  Promise.resolve( UpdateFromType.FROM_BUDGET_BREAKS ) );
    };

    React.useEffect( () => {
        commands.hook( "App/ChannelItem/SetBaseline", setCurrentBreakdownsCallback );
        commands.hook( "App/ChannelItem/SetFrequency", setCurrentBreakdownsCallback );
        commands.hook( "App/ChannelItem/SetAllocation", setCurrentBreakdownsCallback );

        commands.hook( "App/ChannelItem/SetBreakdown", setBreakdownSum );

        return () => {
            commands.unhook( "App/ChannelItem/SetBaseline" );
            commands.unhook( "App/ChannelItem/SetFrequency" );
            commands.unhook( "App/ChannelItem/SetAllocation" );

            commands.unhook( "App/ChannelItem/SetBreakdown" );
        };
    }, [ commands ] );

    return (
        <div className="content">
            { state.breakElements }
        </div>
    );
};
