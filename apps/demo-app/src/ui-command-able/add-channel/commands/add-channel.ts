import { CommandBase } from "@infinigrow/demo-app/src/core/command-base";

export class AddChannelCommand extends CommandBase {
    public static getName(): string {
        return "AddChannel";
    }

    protected apply() {
        return "AddChannel was applied";
    }
}
