import { APIComponent } from "@infinigrow/api/src/api-component";

import type { APIModuleBaseStatic } from "@infinigrow/api/src/api-types";

import type { APIModuleBase } from "@infinigrow/api/src/api-module-base";

// eslint-disable-next-line no-restricted-imports,import/order
import "@infinigrow/demo-app/src/api/api-fake-data.ts";

export class APICore {
    private modules: Record<string, APIModuleBase> = {};

    public constructor( private baseURL: string ) {
        APIComponent.setAPI( this );
    }

    public getModule( module: APIModuleBaseStatic ) {
        const moduleName = module.getName();

        if ( ! this.modules[ moduleName ] ) {
            throw new Error( `API module ${ moduleName } not registered` );
        }

        return this.modules[ moduleName ];
    }

    public fetch( method: string, route: string, args: any, handler: ( response: Response ) => any ) {
        const url = new URL( `${ this.baseURL }/${ route }` );

        for ( const key in args ) {
            url.pathname = url.pathname.replace( `:${ key }`, args[ key ] );
        }

        const promise = globalThis.fetch( url.toString(), {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: method === "GET" ? undefined : JSON.stringify( args ),
        } );

        return promise.then( handler );
    }

    public register( module: APIModuleBaseStatic ) {

        const moduleName = module.getName();

        if ( this.modules[ moduleName ] ) {
            // TODO: Enable when hot reloading is implemented
            // throw new Error(`API module ${moduleName} already registered`);
        }

        this.modules[ moduleName ] = new module( this );
    }

    public get Component() {
        return APIComponent;
    }
}
