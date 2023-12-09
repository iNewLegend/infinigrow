import type React from "react";

import type { APIComponent } from "@infinigrow/demo-app/src/api/api-component";

import type { APICore } from "@infinigrow/demo-app/src/api/api-core";

import type { CommandSingleComponentContext } from "@infinigrow/commander/types";

export abstract class APIModuleBase {
    private routes: Map<string, Map<string, {
        handler: ( ... args: any[] ) => Promise<any>;
        path: string;
    }>> = new Map();

    public static getName(): string {
        throw new Error( "Please extend APIModuleBase and implement static getName()" );
    }

    public constructor( protected api: APICore ) {

    }

    public async getProps( element: React.ReactElement | string, args?: any ) {
        let componentName: string;

        if ( typeof element === "string" ) {
            componentName = element;
        } else {
            componentName = element.props?.type.getName();
        }

        const route = this.routes.get( "GET" )?.get( componentName );

        if ( ! route ) {
            throw new Error( `Cannot find route for ${ componentName }` );
        }

        return this.api.fetch( "GET", route.path, args, route.handler );
    }

    protected register( method: string, name: string, path: string, handler: ( ... args: any[] ) => Promise<any> ): void {
        if ( ! this.routes.has( method ) ) {
            this.routes.set( method, new Map() );
        }

        this.routes.get( method )!.set( name, {
            handler,
            path
        } );
    }

    public mountInternal( component: APIComponent, context: CommandSingleComponentContext ) {
        this.mount?.( component, context );
    }

    protected mount?( component: APIComponent, context: CommandSingleComponentContext ): void;
}

