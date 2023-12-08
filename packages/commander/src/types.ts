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
    childrenIds: string[];
    childKeys: React.Key[];
    key: React.Key;
    props: any;
    getState: () => React.ComponentState;
    setState: React.Component<any, React.ComponentState>["setState"];
    emitter: EventEmitter;
}

export interface CommandComponentContextProps {
    getComponentName(): string;
    getNameUnique: () => string;
}

export type CommandArgs = {
    [ key: string | number | symbol ]: any
};

export interface CommandOptions<TState> {
    state?: React.ComponentState;
    setState?: React.Component<any, TState>["setState"];
}

export type CommandNewInstanceWithArgs<TState = undefined> = ( new ( args: CommandRegisterArgs ) => CommandBase<TState> );

