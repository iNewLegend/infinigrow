import type { ReactNode } from "react";

import type React from "react";

import type { EventEmitter } from "events";

import type { CommandBase } from "@infinigrow/commander/command-base";

// Sugar, eg `ComponentType.getName` not `ComponentInstance`
export interface CommandFunctionComponent<TProps = any, TState = undefined> extends React.FC<TProps> {
    (props: TProps, state?: TState): ReactNode;

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
    props: any;
    extendedInitialState?: boolean
    extendInitialState?: React.ComponentState;
    getState: <TState>() => React.Component<any, TState>["state"];
    setState<TState, K extends keyof TState = keyof TState>(
        state: ((prevState: Readonly<TState>) => Pick<TState, K> | TState | null) | (Pick<TState, K> | TState | null),
        callback?: () => void,
    ): void;
    emitter: EventEmitter;
}

export interface CommandComponentContextProps {
    children?: { [ nameUnique: string ]: CommandComponentContextProps };
    parent?: CommandComponentContextProps;

    getComponentName(): string;
    getNameUnique: () => string;

    internalHandlers: any,
}

export type CommandArgs = {
    [ key: string | number | symbol ]: any
};

export interface CommandOptions<TState> {
    state?: React.ComponentState;
    setState?: React.Component<any, TState>["setState"];
}

export type CommandNewInstanceWithArgs<TState = undefined> = ( new ( args: CommandRegisterArgs ) => CommandBase<TState> );

