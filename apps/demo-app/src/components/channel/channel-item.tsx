import React from "react";

import { withCommands } from "@infinigrow/commander/with-commands";
import { CommandBase } from "@infinigrow/commander/command-base";

import "@infinigrow/demo-app/src/components/channel/_channel-item.scss";

import {
    ChannelBudgetFrequency,
    ChannelBudgetBaseline,
    ChannelBudgetAllocation
} from "@infinigrow/demo-app/src/components/channel/channel-budget-settings";

import { ChannelBreakdowns } from "@infinigrow/demo-app/src/components/channel/channel-breakdowns";

import { formatNumericInput } from "@infinigrow/demo-app/src/components/channel/channel-utils";

import type { ChannelItemProps , ChannelState } from "@infinigrow/demo-app/src/components/channel/channel-types";

import type { CommandFunctionComponent, CommandArgs } from "@infinigrow/commander/types";

const initialState: ChannelState = {
    frequency: "annually",
    baseline: "0",
    allocation: "equal"
};

export const ChannelItem: CommandFunctionComponent<ChannelItemProps, ChannelState> = ( props, state ) => {
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

const $$ = withCommands<ChannelItemProps, ChannelState>( "App/ChannelItem", ChannelItem, initialState, [
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
            const { value } = args;

            const formatted = formatNumericInput( value );

            if ( null === formatted ) {
                return; // Halt
            }

            return this.setState( { baseline: formatted } );
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
    },
    class SetBreakdown extends CommandBase {
        public static getName() {
            return "App/ChannelItem/SetBreakdown";
        }

        protected apply( args: CommandArgs ) {
            const { value, setValue } = args;

            const formatted = formatNumericInput( value );

            if ( null === formatted ) {
                return; // Halt
            }

            setValue( formatted );
        }
    }
] );

export default $$;
