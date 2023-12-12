import { CommandBudgetBase } from "@infinigrow/demo-app/src/components/channel/commands/command-budget-base";

import type { CommandArgs } from "@infinigrow/commander/types";

export class SetFrequency extends CommandBudgetBase {
    public static getName() {
        return "App/ChannelItem/SetFrequency";
    }

    protected async apply( args: CommandArgs ) {
        const { value } = args;

        await this.setState( { frequency: value } );

        return args.source;
    }
}
