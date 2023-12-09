import AffiliateProgramPNG from "@infinigrow/demo-app/assets/affiliate-program.png";
import TestPNG from "@infinigrow/demo-app/assets/test.png";

import { APIComponent } from "@infinigrow/demo-app/src/api/api-component.tsx";

import type { APIModuleBaseStatic } from "@infinigrow/demo-app/src/api/api-types.ts";

import type { APIModuleBase } from "@infinigrow/demo-app/src/api/api-module-base";

const storage = window.localStorage;

if ( storage.getItem( "__DEFAULT_STORAGE__" ) === null ) {
    storage.setItem( "__DEFAULT_STORAGE__", "true" );

    storage.setItem( "/v1/channels", JSON.stringify( {
        childrenType: "App/ChannelItem",
        children: [ "1", "2" ],
    } ) );

    storage.setItem( "/v1/channels/1", JSON.stringify( {
        key: "1",
        id: "paid-reviews",
        name: "Paid Reviews",
        icon: AffiliateProgramPNG,
    } ) );

    storage.setItem( "/v1/channels/2", JSON.stringify( {
        key: "2",
        id: "free-reviews",
        name: "Free Reviews",
        icon: TestPNG,
    } ) );
}

globalThis.fetch = ( input: RequestInfo | URL, init?: RequestInit ): Promise<Response> => {
    const url = typeof input === "string" ? new URL( input ) : input instanceof URL ? input : new URL( input.url );
    const path = url.pathname;
    const method = init?.method || "GET";

    console.log( `API: ${ method } ${ path }` );

    const baseInit = {};

    const act = async() => {
        if ( method === "GET" ) {
            // For GET requests, return the data from storage
            const data = storage.getItem( path );

            return Promise.resolve( new Response( data || "{}", baseInit ) );

        } else if ( method === "POST" || method === "PUT" ) {
            // For POST and PUT requests, update the data in storage

            const data = init?.body || "";

            storage.setItem( path, data );

            return Promise.resolve( new Response( data, baseInit ) );
        } else if ( method === "DELETE" ) {
            // For DELETE requests, remove the data from storage

            storage.removeItem( path );

            return Promise.resolve( new Response( undefined, baseInit) );
        } else {
            // For other methods, return a not implemented error

            return Promise.reject( new Error( `Method ${ method } not implemented` ) );
        }
    };

    return act();
};

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
        // Transform route to query params
        const url = new URL( `${ this.baseURL }/${ route }` );

        for ( const key in args ) {
            url.pathname = url.pathname.replace( `:${ key }`, args[ key ] );
        }

        const promise = globalThis.fetch( url.toString(), {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        } );

        return promise.then( handler );
    }

    public register( module: APIModuleBaseStatic ) {
        const moduleName = module.getName();

        if ( this.modules[ moduleName ] ) {
            // TODO: Enable when hot reloading is implemented
            // throw new Error( `API module ${ moduleName } already registered` );
        }

        this.modules[ moduleName ] = new module( this );
    }

    public get Component() {
        return APIComponent;
    }
}
