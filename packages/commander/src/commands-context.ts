import React from "react";

import type { CommandComponentContextProps } from "@infinigrow/commander/types";

// An internal context used by `use-commands`
export const ComponentIdContext = React.createContext<CommandComponentContextProps>( {
    getNameUnique: () => {
        throw new Error( "ComponentCommandContext.Provider is not set. Using default getUniqueName function." );
    },
    getComponentName: () => {
        throw new Error( "ComponentCommandContext.Provider is not set. Using default getUniqueName function." );
    },
} );
