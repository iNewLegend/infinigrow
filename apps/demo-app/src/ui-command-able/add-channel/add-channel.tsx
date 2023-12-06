import React from "react";

import { Button } from "@nextui-org/button";

import { Plus } from "@infinigrow/demo-app/src/ui-theme/symbols";

import { withCommands } from "@infinigrow/demo-app/src/core/with-commands";

import { useCommand } from "@infinigrow/demo-app/src/core/use-commands";

import * as commands from "@infinigrow/demo-app/src/ui-command-able/add-channel/commands";

import type { CommandFunctionComponent } from "@infinigrow/demo-app/src/core/types.ts";

const AddChannel: CommandFunctionComponent = () => {
    const command = useCommand( "AddChannel" );

    return (
            <div>
                <Button onClick={() => command.run( {} ) } className="add-channel" variant="bordered" radius={ "none" }>{ Plus } Add Channel</Button>
            </div>
    );
};

const $$ = withCommands( "AddChannel", AddChannel, [
    commands.AddChannelCommand
] );

export default $$;

