import React from "react";

import { ComponentIdContext } from "@infinigrow/commander/commands-context";

import type { CommandComponentContextProps } from "@infinigrow/commander/types";

export function ComponentIdProvider( props: {
    children: React.ReactNode;
    context: CommandComponentContextProps,
} ) {
    const { children, context } = props;

    return (
            <ComponentIdContext.Provider value={ context }>
                { children }
            </ComponentIdContext.Provider>
    );
}
