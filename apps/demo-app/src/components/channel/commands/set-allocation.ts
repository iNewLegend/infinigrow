import { CommandBudgetBase } from "@infinigrow/demo-app/src/components/channel/commands/command-budget-base";

import type { CommandArgs } from "@infinigrow/commander/types";

export class SetAllocation extends CommandBudgetBase {
    public static getName() {
        return "App/ChannelItem/SetAllocation";
    }

    protected async apply( args: CommandArgs ) {
        const { value } = args;

        await this.setState( { allocation: value } );

        return args.source;
    }
}
