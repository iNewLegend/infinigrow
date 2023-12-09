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

    public onLoadInternal( component: APIComponent, context: CommandSingleComponentContext ) {
        this.load?.( component, context );
    }

    public onUnmountInternal( component: APIComponent, context: CommandSingleComponentContext ) {
        this.unmount?.( component, context );
    }

    public onMountInternal( component: APIComponent, context: CommandSingleComponentContext ) {
        this.mount?.( component, context );
    }

    public onUpdateInternal( component: APIComponent, context: CommandSingleComponentContext, state: any ) {
        this.onUpdate?.( component, context, state );
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

    protected load?( component: APIComponent, context: CommandSingleComponentContext ): void;

    protected mount?( component: APIComponent, context: CommandSingleComponentContext ): void;

    protected unmount?( component: APIComponent, context: CommandSingleComponentContext ): void;

    protected onUpdate?( component: APIComponent, context: CommandSingleComponentContext, state: {
        currentProps: any,
        currentState: any,
        prevProps: any,
        prevState: any,
        snapshot: any,
    } ): void;

    // protected onStateUpdateExternal?( component: APIComponent, context: CommandSingleComponentContext, prevState: any, currentState: any ): void;
}

