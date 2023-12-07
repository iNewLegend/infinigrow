import type { EventEmitter } from "events";

import type {
    CommandArgs,
    CommandRegisterArgs
} from "@infinigrow/commander/types";

/**
 * Each created command is registered within the commands manager, and the instance created only once per command.
 */
export abstract class CommandBase {
    public readonly commandName: string;

    public static getName(): string {
        throw new Error( "You have should implement `static getName()` method, since the commands run by name ;)" );
    }

    public constructor( private args: CommandRegisterArgs ) {
        this.commandName = ( new.target as typeof CommandBase ).getName();
    }

    public execute( emitter: EventEmitter, args: CommandArgs ) {
        const result = this.apply?.( args );

        emitter.emit( this.commandName, args );

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected apply?( args: CommandArgs ) {
    }
}

