import React from "react";

import { GET_INTERNAL_SYMBOL, GET_INTERNAL_MATCH_SYMBOL } from "@infinigrow/demo-app/src/core/_internal/constants.ts";

import { ComponentIdContext } from "@infinigrow/demo-app/src/core/commands-context.ts";

import commandsManager from "@infinigrow/demo-app/src/core/commands-manager.ts";

import core from "@infinigrow/demo-app/src/core/_internal/core.ts";

import type { CommandArgs } from "@infinigrow/demo-app/src/core/types.ts";

/**
 * Custom hook to create a command handler for a specific command.
 */
export function useCommand( commandName: string ) {
    const componentContext = React.useContext( ComponentIdContext );

    // Get component context
    const componentNameUnique = componentContext.getNameUnique();

    // Get command context
    const commandSignalContext = core[ GET_INTERNAL_SYMBOL ]( componentNameUnique );

    // Set id, used to identify command
    const id = {
        commandName,
        componentNameUnique,
        componentName: commandSignalContext.componentName,
    };

    return {
        run: ( args: CommandArgs, callback?: ( result: any ) => void ) => commandsManager.run( id, args, callback ),
        hook: ( callback: ( args: CommandArgs ) => void ) => commandsManager.hook( id, callback ),

        getContext: () => commandSignalContext,
    };
}

/**
 * Custom hook to create a command handler for a specific component.
 */
export function useComponentCommands( componentName: string ) {
    function maybeWrongContext( componentName: string, componentNameUnique: string ) {
        if ( componentName === componentNameUnique ) {
            return;
        }
        throw new Error(
                `You are not in: '${ componentName }', you are in '${ componentNameUnique }' which is not your context\n` +
                "If you are trying to reach sub-component context, it has to rendered, before you can use it\n",
        );
    }

    const componentContext = React.useContext( ComponentIdContext );

    const componentNameContext = componentContext.getComponentName();

    maybeWrongContext( componentName, componentNameContext );

    const id = componentContext.getNameUnique();

    return {
        run: ( commandName: string, args: CommandArgs, callback?: ( result: any ) => void ) =>
                commandsManager.run( { commandName, componentName, componentNameUnique: id }, args, callback ),
        hook: ( commandName: string, callback: ( args: CommandArgs ) => void ) =>
                commandsManager.hook( { commandName, componentName, componentNameUnique: id }, callback ),
        unhook: ( commandName: string ) =>
                commandsManager.unhook( { commandName, componentName, componentNameUnique: id } ),

        getId: () => id,
        getKey: () => core[ GET_INTERNAL_SYMBOL ]( id ).key,
        getContext: () => core[ GET_INTERNAL_SYMBOL ]( id ),
        getChildKeys: () => core[ GET_INTERNAL_SYMBOL ]( id ).childKeys,
    };
}

/**
 * Unsafe, this command should be used carefully, since it can be used to run commands from any component.
 * It should be used only in cases where you sure that there no conflicts, and there are no other ways to do it.
 */
export function useAnyComponentCommands( componentName: string ) {
    return core[ GET_INTERNAL_MATCH_SYMBOL ]( componentName + "*" );
}
