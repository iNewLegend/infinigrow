import type { CommandFunctionComponent } from "@infinigrow/commander/types";

import type React from "react";

import type { APICore } from "@infinigrow/demo-app/src/api/api-core";

import type { APIModuleBase } from "@infinigrow/demo-app/src/api/api-module-base";

export interface APIModuleBaseStatic {
    new( api: APICore ): APIModuleBase;

    getName(): string;
}

export interface APIComponentProps {
    children?: React.ReactElement;
    module?: APIModuleBaseStatic;
    fallback?: React.ReactElement;
    type: CommandFunctionComponent;
}
