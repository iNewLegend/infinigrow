import type { CommandFunctionComponent } from "@infinigrow/commander/types";

import type React from "react";

import type { APICore } from "api-core.tsx";

import type { APIModuleBase } from "api-module-base.ts";

export interface APIModuleBaseStatic {
    new( api: APICore ): APIModuleBase;

    getName(): string;
}

export interface APIComponentProps {
    children?: React.ReactElement;
    module?: APIModuleBaseStatic;
    fallback?: React.ReactElement;
    type: CommandFunctionComponent;
    chainProps?: any;
}
