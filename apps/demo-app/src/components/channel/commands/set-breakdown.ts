import { formatNumericStringWithCommas } from "@infinigrow/demo-app/src/utils";

import { CommandBudgetBase } from "@infinigrow/demo-app/src/components/channel/commands/command-budget-base";

import type { ChannelState } from "@infinigrow/demo-app/src/components/channel/channel-types";

import type { CommandArgs } from "@infinigrow/commander/types";

export class SetBreakdown extends CommandBudgetBase<Required<ChannelState>> {
    public static getName() {
        return "App/ChannelItem/SetBreakdown";
    }

    protected async apply( args: CommandArgs ) {
        const { index, value, setState = this.setState.bind( this ) } = args;

        const formatted = formatNumericStringWithCommas( value );

        if ( null === formatted ) {
            return; // Halt
        }

        const breaks = this.state.breaks.map( ( breakItem, i ) => {
            if ( i === index ) {
                return {
                    ... breakItem,
                    value: formatted,
                };
            }

            return breakItem;
        } );

        await setState( {
            ... this.state,
            breaks
        } );

        return args.soruce;
    }
}
