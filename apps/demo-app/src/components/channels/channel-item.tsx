import React from "react";

import { withCommands } from "@infinigrow/commander/with-commands";

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
import { CommandBase } from "@infinigrow/commander/command-base";

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
            };

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
