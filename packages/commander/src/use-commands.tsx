import React from "react";

// eslint-disable-next-line no-restricted-imports
import core from "./_internal/core";

// eslint-disable-next-line no-restricted-imports
import { GET_INTERNAL_SYMBOL, GET_INTERNAL_MATCH_SYMBOL } from "./_internal/constants.ts";

import { ComponentIdContext } from "@infinigrow/commander/commands-context";

import commandsManager from "@infinigrow/commander/commands-manager";

import type { CommandArgs, CommandComponentContextProps } from "@infinigrow/commander/types";

function getSafeContext( componentName: string, context?: CommandComponentContextProps ) {
    function maybeWrongContext( componentName: string, componentNameUnique: string ) {
        if ( componentName === componentNameUnique ) {
            return;
        }
        throw new Error(
            `You are not in: '${ componentName }', you are in '${ componentNameUnique }' which is not your context\n` +
            "If you are trying to reach sub-component context, it has to rendered, before you can use it\n",
        );
    }

    const componentContext = context || React.useContext( ComponentIdContext );

    const componentNameContext = componentContext.getComponentName();

    maybeWrongContext( componentName, componentNameContext );

    return componentContext;
}

/**
 * Custom hook to create a command handler for a specific command.
 */
export function useCommanderCommand( commandName: string ) {
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
        hook: ( callback: ( result: any, args?: CommandArgs ) => void ) => commandsManager.hook( id, callback ),

        // TODO: Remove.
        getContext: () => commandSignalContext,
    };
}

/**
 * Custom hook to create a command handler for a specific component.
 */
export function useCommanderComponent( componentName: string, context?: CommandComponentContextProps  ) {
    const componentContext = getSafeContext( componentName, context );

    const id = componentContext.getNameUnique();

    return {
        run: ( commandName: string, args: CommandArgs, callback?: ( result: any ) => void ) =>
            commandsManager.run( { commandName, componentName, componentNameUnique: id }, args, callback ),
        hook: ( commandName: string, callback: ( result?: any, args?: CommandArgs ) => void ) =>
            commandsManager.hook( { commandName, componentName, componentNameUnique: id }, callback ),
        unhook: ( commandName: string ) =>
            commandsManager.unhook( { commandName, componentName, componentNameUnique: id } ),

        // TODO: Remove.
        getId: () => id,
        getKey: () => core[ GET_INTERNAL_SYMBOL ]( id ).key,
        getContext: () => core[ GET_INTERNAL_SYMBOL ]( id ),
        getState: <TState extends React.ComponentState>() => core[ GET_INTERNAL_SYMBOL ]( id ).getState() as TState,
    };
}

export function useCommanderState<TState>( componentName: string, extendInitialState?: Partial<TState> ) {
    const componentContext = getSafeContext( componentName );

    const id = componentContext.getNameUnique();

    const internalContext = core[ GET_INTERNAL_SYMBOL ]( id );

    const initialStateExtendedRef = React.useRef( false );

    if ( extendInitialState && ! initialStateExtendedRef.current ) {
        internalContext.extendInitialState = extendInitialState;

        initialStateExtendedRef.current = true;
    }

    const stateRef = {};

    Object.defineProperty( stateRef, "getState", {
        value: () => internalContext.getState(),
        writable: false,
    } );

    return [
        internalContext.getState() as TState,
        ( state: Partial<TState>, callback?: () => void ) => {
            const internalContext = core[ GET_INTERNAL_SYMBOL ]( id );

            return internalContext.setState<Partial<TState>>( state, callback );
        }
    ] as const;
}

/**
 * Unsafe, this command should be used carefully, since it can be used to run commands from any component.
 * It should be used only in cases where you sure that there no conflicts, and there are no other ways to do it.
 */
export function useAnyComponentCommands( componentName: string ) {
    return core[ GET_INTERNAL_MATCH_SYMBOL ]( componentName + "*" );
}

