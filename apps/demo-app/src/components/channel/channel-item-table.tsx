import React from "react";

import moment from "moment";

import { Input } from "@nextui-org/input";

import { withCommands } from "@infinigrow/commander/with-commands";
import { useCommanderState } from "@infinigrow/commander/use-commands";

import { formatNumericStringToFraction } from "@infinigrow/demo-app/src/utils";

import { DEFAULT_CHANNEL_BREAK_INPUT_PROPS } from "@infinigrow/demo-app/src/components/channel/channel-constants";

import "@infinigrow/demo-app/src/components/channel/_channel-item-table.scss";

import { ArrowSkinnyRight } from "@infinigrow/demo-app/src/ui-theme/symbols";

import type { InputProps } from "@nextui-org/input";

import type { ChannelItemProps, ChannelState } from "@infinigrow/demo-app/src/components/channel/channel-types";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

declare global {
    interface Math {
        easeInOutQuad( t: number, b: number, c: number, d: number ): number;
    }
}

export const ChannelItemTable: CommandFunctionComponent<ChannelItemProps, ChannelState> = ( props, initialState ) => {
    const [ getState ] = useCommanderState<ChannelState>( "App/ChannelItem", initialState );

    const state = getState();

    const tableRef = React.useRef<HTMLDivElement>( null );

    const [ arrowRightOrLeft, setArrowRightOrLeft ] = React.useState<"right" | "left">( "right" );

    // All the code made for "SkinnyRight" is hacky, but that fine for this demo situation.
    function smoothScroll( element: { scrollLeft: number; }, target: number, duration: number ) {
        let start = element.scrollLeft,
            change = target - start,
            startTime = performance.now(),
            val;

        function animateScroll( currentTime: number ) {
            let elapsed = currentTime - startTime;
            val = Math.easeInOutQuad( elapsed, start, change, duration );

            element.scrollLeft = val;

            if ( elapsed < duration ) {
                window.requestAnimationFrame( animateScroll );
            }
        };

        Math.easeInOutQuad = function ( t, b, c, d ) {
            t /= d / 2;
            if ( t < 1 ) return c / 2 * t * t + b;
            t--;
            return -c / 2 * ( t * ( t - 2 ) - 1 ) + b;
        };

        window.requestAnimationFrame( animateScroll );
    }

    function scroll() {
        const table = tableRef.current;

        if ( table ) {
            if ( arrowRightOrLeft === "right" ) {
                smoothScroll( table, table.scrollWidth - table.clientWidth, 500 );
            } else {
                smoothScroll( table, 0, 500 );
            }
        }
    }

    function onArrowClick() {
        if ( arrowRightOrLeft === "right" ) {
            setArrowRightOrLeft( "left" );

            scroll();
        } else {
            setArrowRightOrLeft( "right" );

            scroll();
        }
    }

    return (
        <div className={ `channel-item-table ${ arrowRightOrLeft }` } ref={ tableRef }>
            <ArrowSkinnyRight onClick={ () => onArrowClick() }/>
            <div className="channel-item-table-breaks" ref={ tableRef }>
                { state.breaks!.map( ( budgetBreak, index ) => {
                    return (
                        <div key={ index } className="channel-item-table-date">
                            <>{ moment( budgetBreak.date ).format( "MMM D" ) }</>
                        </div>
                    );
                } ) }
                { state.breaks!.map( ( budgetBreak, index ) => {
                    const inputProps: InputProps = {
                        ... DEFAULT_CHANNEL_BREAK_INPUT_PROPS,

                        variant: "flat",

                        disabled: true,

                        value: formatNumericStringToFraction( budgetBreak.value ),
                    };

                    return (
                        <div key={ index } className="channel-item-table-budget">
                            <Input { ... inputProps } />
                        </div>
                    );
                } ) }
            </div>
        </div>
    );
};

const $$ = withCommands<ChannelItemProps, ChannelState>( "App/ChannelItem", ChannelItemTable, {
        frequency: "annually",
        baseline: "0",
        allocation: "equal",
        breaks: [],
    }, []
);

export default $$;
