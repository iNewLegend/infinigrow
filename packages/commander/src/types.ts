import type React from "react";

import type { EventEmitter } from "events";

import type { CommandBase } from "@infinigrow/commander/command-base";

// Sugar, eg `ComponentType.getName` not `ComponentInstance`
export interface CommandFunctionComponent<TProps = any, TState = undefined> extends React.FC<TProps> {
    (props: TProps, state?: TState): React.ReactNode;

    // Those methods always implemented "under the hood"
    getName?(): string;
}

export interface CommandRegisterArgs {
    commands: CommandNewInstanceWithArgs[];
    componentName: string;
}

// TODO: I dont really need all of them.
export interface CommandIdArgs {
    componentNameUnique: string;
    componentName: string;
    commandName: string;
}

export interface CommandSingleComponentContext {
    commands: {
        [ commandName: string ]: CommandBase
    };
    componentNameUnique: string;
    componentName: string;

    key: React.Key;
    props: React.PropsWithChildren<any>;

    isMounted(): boolean;

    getState: <TState>() => React.Component<any, TState>["state"];
    setState<TState, K extends keyof TState = keyof TState>(
        state: ( TState | null ) | ( Pick<TState, K> | TState | null ),
        callback?: ( state: TState ) => void,
    ): void;

    getComponentContext: () => CommandComponentContextProps;

    emitter: EventEmitter;

    lifecycleHandlers: any,
}

export interface CommandComponentContextProps {
    isSet: boolean;

    children?: { [ nameUnique: string ]: CommandComponentContextProps };
    parent?: CommandComponentContextProps;

    getNameUnique: () => string;
    getComponentName(): string;
    getComponentRef(): React.RefObject<any>;
}

export type CommandArgs = {
    [ key: string | number | symbol ]: any
};

export interface CommandOptions<TState> {
    state?: React.ComponentState;
    setState?: <K extends keyof TState>(
        state: ( TState | null ) | ( Pick<TState, K> | TState | null ),
        callback?: ( state: TState ) => void,
    ) => void;
}

export type CommandNewInstanceWithArgs<TState = undefined> = ( new ( args: CommandRegisterArgs ) => CommandBase<TState> );

