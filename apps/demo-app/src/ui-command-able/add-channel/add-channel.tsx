import React from "react";

import { Button } from "@nextui-org/button";

import { withCommands } from "@infinigrow/commander/with-commands";

import { useCommand } from "@infinigrow/commander/use-commands";

import { CommandBase } from "@infinigrow/commander/command-base";

import { Plus } from "@infinigrow/demo-app/src/ui-theme/symbols";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

const AddChannel: CommandFunctionComponent = () => {
    const command = useCommand( "App/AddChannel" );

    return (
        <div>
            <Button onClick={ () => command.run( {} ) } className="add-channel" variant="bordered"
                    radius={ "none" }>{ Plus } Add Channel</Button>
        </div>
    );
};

const $$ = withCommands( "App/AddChannel", AddChannel, [
    class AddChannel extends CommandBase {
        public static getName() {
            return "App/AddChannel";
        }
    }
] );

export default $$;

