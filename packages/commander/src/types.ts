import type React from "react";

// eslint-disable-next-line no-restricted-imports
import type {
    GET_INTERNAL_SYMBOL,
    UNREGISTER_INTERNAL_SYMBOL,
    REGISTER_INTERNAL_SYMBOL
} from "./_internal/constants";

import type { EventEmitter } from "events";

import type { CommandBase } from "@infinigrow/commander/command-base";

// Sugar, eg `ComponentType.getName` not `ComponentInstance`
export interface CommandFunctionComponent<TProps = any> extends React.FC<TProps>{
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
    emitter: EventEmitter;
}

export interface CommandsContextProps {
    [ REGISTER_INTERNAL_SYMBOL ]: ( args: {
        componentNameUnique: string;
        componentName: string;
        emitter: EventEmitter;
    } ) => void;

    [ UNREGISTER_INTERNAL_SYMBOL ]: ( componentNameUnique: string ) => void;

    [ GET_INTERNAL_SYMBOL ]: ( componentNameUnique: string ) => CommandSingleComponentContext;
}

export interface CommandComponentContextProps {
    getComponentName(): string;
    getNameUnique: () => string;
}

export type CommandArgs = {
    [ key: string | number | symbol ]: any
};

export type CommandNewInstanceWithArgs = ( new ( args: CommandRegisterArgs ) => CommandBase );

