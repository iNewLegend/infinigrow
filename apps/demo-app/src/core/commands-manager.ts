import core from "@infinigrow/demo-app/src/core/_internal/core.ts";

import { GET_INTERNAL_SYMBOL } from "@infinigrow/demo-app/src/core/_internal/constants.ts";

import type {
    CommandArgs,
    CommandNewInstanceWithArgs,
    CommandRegisterArgs,
    CommandIdArgs
} from "@infinigrow/demo-app/src/core/types.ts";

import type { CommandBase } from "@infinigrow/demo-app/src/core/command-base.ts";

class CommandsManager {
    private commands: {
        [ componentName: string ]: {
            [ commandName: string ]: CommandBase
        };
    } = {};

    public register( args: CommandRegisterArgs ) {
        const { componentName, commands } = args;

        // Check if the component is registered
        if ( this.commands[ componentName ] ) {
            throw new Error( `Component '${ componentName }' already registered` );
        }

        const createdCommands: CommandBase[] = [];

        if ( ! this.commands[ componentName ] ) {
            this.commands[ componentName ] = {};
        }

        commands.forEach( ( command ) => {
            const commandName = ( command as unknown as typeof CommandBase ).getName();

            if ( this.commands[ componentName ][ commandName ] ) {
                throw new Error( `Command '${ commandName }' already registered for component '${ componentName }'` );
            }

            const commandInstance = new ( command as unknown as CommandNewInstanceWithArgs )( args );

            this.commands[ componentName ][ commandName ] = commandInstance;

            createdCommands.push( commandInstance );
        } );

        return createdCommands;
    }

    public run( id: CommandIdArgs, args: CommandArgs, callback?: ( result: any ) => any ) {
        const { componentNameUnique, componentName, commandName } = id;

        const command = this.commands[ componentName ]?.[ commandName ];

        if ( ! command ) {
            throw new Error( `Command '${ commandName }' not registered for component '${ componentName }'` );
        }

        core.__devDebug( `Commands.run() '${ commandName }' for component '${ componentNameUnique }'`, args );

        const singleComponentContext = core[ GET_INTERNAL_SYMBOL ]( componentNameUnique );

        const executionResult = command.execute( singleComponentContext.emitter, args );

        if ( callback ) {
            callback( executionResult );
        }

        return executionResult;
    }

    public hook( id: CommandIdArgs, callback: ( args: CommandArgs ) => any ) {
        const { componentNameUnique, componentName, commandName } = id;

        if ( ! this.commands[ componentName ] ) {
            throw new Error( `Component '${ componentName }' not registered` );
        }

        const singleComponentContext = core[ GET_INTERNAL_SYMBOL ]( componentNameUnique );

        // Check if id exist within the component context
        if ( ! singleComponentContext.commands[ commandName ] ) {
            throw new Error( `Command '${ commandName }' not registered for component '${ componentNameUnique }'` );
        }

        return singleComponentContext.emitter.on( commandName, callback );
    }

    public unhook( id: CommandIdArgs ) {
        const { componentNameUnique, componentName, commandName } = id;

        if ( ! this.commands[ componentName ] ) {
            throw new Error( `Component '${ componentName }' not registered` );
        }

        const singleComponentContext = core[ GET_INTERNAL_SYMBOL ]( componentNameUnique );

        // Check if id exist within the component context
        if ( ! singleComponentContext.commands[ commandName ] ) {
            throw new Error( `Command '${ commandName }' not registered for component '${ componentNameUnique }'` );
        }

        return singleComponentContext.emitter.removeAllListeners( commandName );
    }

    public get( componentName: string ) {
        if ( ! this.commands[ componentName ] ) {
            throw new Error( `Component '${ componentName }' not registered` );
        }

        return this.commands[ componentName ];
    }

    public isContextRegistered( componentNameUnique: string ) {
        return !! core[ GET_INTERNAL_SYMBOL ]( componentNameUnique, true );
    }
}

export const commands = new CommandsManager();

if ( import.meta.env.DEV ) {
    ( window as any ).$$commands = commands;
}

export default commands;