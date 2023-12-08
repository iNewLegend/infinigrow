import type { CommandOptions , CommandArgs, CommandRegisterArgs } from "@infinigrow/commander/types";

import type React from "react";

import type { EventEmitter } from "events";

/**
 * Each created command is registered within the commands manager, and the instance created only once per command.
 */
export abstract class CommandBase<TState = React.ComponentState> {
    public readonly commandName: string;

    private options: CommandOptions<TState> = {};

    public static getName(): string {
        throw new Error( "You have should implement `static getName()` method, since the commands run by name ;)" );
    }

    public constructor( private args: CommandRegisterArgs ) {
        this.commandName = ( new.target as typeof CommandBase ).getName();
    }

    public execute( emitter: EventEmitter, args: CommandArgs, options?: CommandOptions<TState> ): any {
        if ( options ) {
            this.options = options;
        }

        const result = this.apply?.( args );

        emitter.emit( this.commandName, result, args );

        this.options = {};

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected apply?( args: CommandArgs ) {
    }

    protected get state(): TState {
        this.validateState();

        return this.options.state;
    }

    protected setState<K extends keyof TState>(
        state: ( ( prevState: Readonly<TState> ) => Pick<TState, K> | TState | null ) | ( Pick<TState, K> | TState | null ),
        callback?: () => void,
    ) {
        this.validateState();

        return new Promise( ( resolve ) => {
            this.options.setState!( state, () => {
                callback?.();

                resolve( state );
            } );
        } );
    }

    private validateState() {
        if (  "undefined" === typeof this.options.state || "function" !== typeof this.options.setState ) {
            throw new Error( "There is no state for the current command, you should use `withCommands( component, class, state, commands )` including the state to enable it" );
        }
    }
}

