import type { APIComponent } from "@infinigrow/demo-app/src/api/api-component";

import type { APICore } from "@infinigrow/demo-app/src/api/api-core";

import type { CommandSingleComponentContext, CommandFunctionComponent } from "@infinigrow/commander/types";

interface Route {
    path: string;

    handlers: {
        requestHandler?: ( ... args: any[] ) => Promise<any>;
        responseHandler?: ( ... args: any[] ) => Promise<any>;
    }
}

export abstract class APIModuleBase {
    protected api: APICore;

    private routes: Map<RequestInit["method"], Map<Route["path"], Route>> = new Map();

    public static getName(): string {
        throw new Error( "Please extend APIModuleBase and implement static getName()" );
    }

    public constructor( api: APICore ) {
        this.api = api;
    }

    public mountInternal( component: APIComponent, context: CommandSingleComponentContext ) {
        this.mount?.( component, context );
    }

    public async getProps( element: CommandFunctionComponent, component: APIComponent, args?: any ) {
        let componentName: string;

        componentName = element.getName!();

        const route = this.routes.get( "GET" )?.get( componentName );

        if ( ! route ) {
            throw new Error( `Cannot find route for ${ componentName }` );
        }

        const request = await route.handlers.requestHandler!( component, element, args );

        return this.api.fetch( "GET", route.path, request, ( response ) => {
            return route.handlers.responseHandler!( component, element, response );
        } );
    }

    protected register( method: string, name: string, route: Route | string ): void {
        if ( ! this.routes.has( method ) ) {
            this.routes.set( method, new Map() );
        }

        if ( typeof route === "string" ) {
            route = { path: route, handlers: {} };
        }

        if ( ! route.handlers.requestHandler ) {
            route.handlers.requestHandler = this.requestHandler.bind( this );
        }

        if ( ! route.handlers.responseHandler ) {
            route.handlers.responseHandler = this.responseHandler.bind( this );
        }

        this.routes.get( method )!.set( name, route );
    }

    protected abstract responseHandler( component: APIComponent, element: CommandFunctionComponent, response: Response ): Promise<any>;

    protected abstract requestHandler( component: APIComponent, element: CommandFunctionComponent, request: any ): Promise<any>;

    protected mount?( component: APIComponent, context: CommandSingleComponentContext ): void;
}

