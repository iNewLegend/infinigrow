import React from "react";

import { CommandBase } from "@infinigrow/commander/command-base";

import { withCommands } from "@infinigrow/commander/with-commands";
import { useCommanderState } from "@infinigrow/commander/use-commands";

import "@infinigrow/demo-app/src/components/channel/_channel-item-accordion.scss";

import {
    ChannelBudgetFrequency,
    ChannelBudgetBaseline,
    ChannelBudgetAllocation
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings";

import { ChannelBreakdowns } from "@infinigrow/demo-app/src/components/channel/channel-breakdowns";

import { formatNumericStringWithCommas, pickEnforcedKeys } from "@infinigrow/demo-app/src/utils";

import { UpdateFromType } from "@infinigrow/demo-app/src/components/channel/channel-types";

import { CHANNEL_LIST_STATE_DATA } from "@infinigrow/demo-app/src/components/channel/channel-constants";

import type { ChannelItemProps, ChannelState } from "@infinigrow/demo-app/src/components/channel/channel-types";

import type { CommandFunctionComponent, CommandArgs } from "@infinigrow/commander/types";

export const ChannelItemAccordion: CommandFunctionComponent<ChannelItemProps, ChannelState> = ( props, initialState ) => {
    // If data props are set, assign them to state
    if ( ! initialState.breaks &&  ( props as any ).breaks ) {
        Object.assign( initialState, pickEnforcedKeys( ( props as any ), CHANNEL_LIST_STATE_DATA ) );
    }

    const [ getState ] = useCommanderState<ChannelState>( "App/ChannelItem", initialState );

    const { frequency, baseline, allocation } = getState();

    return (
        <div className="channel-item-accordion">
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

const $$ = withCommands<ChannelItemProps, ChannelState>( "App/ChannelItem", ChannelItemAccordion, {
    frequency: "annually",
    baseline: "0",
    allocation: "equal",
}, [
    class SetAllocation extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetAllocation";
        }

        protected  async apply( args: CommandArgs ) {
            const { value } = args;

            await this.setState( { allocation: value } );

            return UpdateFromType.FROM_BUDGET_SETTINGS;
        }
    },
    class SetBaseline extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetBaseline";
        }

        protected async apply( args: CommandArgs ) {
            const { value } = args;

            const formatted = formatNumericStringWithCommas( value );

            if ( null === formatted ) {
                return; // Halt
            }

            await this.setState( { baseline: formatted } );

            return UpdateFromType.FROM_BUDGET_SETTINGS;
        }
    },
    class SetFrequency extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetFrequency";
        }

        protected async apply( args: CommandArgs ) {
            const { value } = args;

            await this.setState( { frequency: value } );

            return UpdateFromType.FROM_BUDGET_SETTINGS;
        }
    },
    class SetBreakdown extends CommandBase<Required<ChannelState>> {
        public static getName() {
            return "App/ChannelItem/SetBreakdown";
        }

        protected async apply( args: CommandArgs ) {
            const { index, value } = args;

            const formatted = formatNumericStringWithCommas( value );

            if ( null === formatted ) {
                return; // Halt
            }

            // Create a copy of the current state
            const newState = { ... this.state };

            // Update the specific break in the breaks array
            newState.breaks[ index ].value = formatted;

            await this.setState( newState );

            return UpdateFromType.FROM_BUDGET_SETTINGS;
        }
    }
] );

export default $$;
