import React from "react";

import { ComponentIdContext } from "@infinigrow/demo-app/src/core/commands-context.ts";

import type { CommandComponentContextProps } from "@infinigrow/demo-app/src/core/types.ts";

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
