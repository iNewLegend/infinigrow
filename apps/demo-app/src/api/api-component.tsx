import React from "react";

import { wrapPromiseSuspendable } from "@infinigrow/demo-app/src/api/api-utils.ts";

import type { APICore } from "@infinigrow/demo-app/src/api/api-core.tsx";

import type { APIModuleBase } from "@infinigrow/demo-app/src/api/api-module-base.ts";
import type { APIComponentProps } from "@infinigrow/demo-app/src/api/api-types.ts";

export class APIComponent extends React.PureComponent<APIComponentProps> {
    private static api: APICore;

    private readonly api: APICore;

    private readonly apiModule: APIModuleBase;
    private readonly element;

    public static setAPI( api: APICore ) {
        this.api = api;
    }

    public constructor( props: APIComponentProps ) {
        super( props );

        this.api = ( this.constructor as typeof APIComponent).api;

        if ( !this.props.module ) {
            throw new Error( "Parent <API.Component> should have 'module' prop" );
        }

        this.apiModule = this.api.getModule( this.props.module );

        this.element = async () => {
            const props = await this.apiModule.getProps( this.props.type.getName!() );

            return React.createElement( this.props.type, props );
        };
    }

    public render() {
        if ( Array.isArray( this.props.children ) ) {
            throw new Error( "API.Component should have only one child" );
        }

        const getComponentPromise = async () => {
            const childrenType = this.props.children!.props.type;

            const parent = await this.element();

            // TODO: This kinda of logic should be in `api-channels-module` as `requestHandler` the other handler should be `responseHandler`
            const children = await Promise.all( parent.props.children.map( async ( key: React.Key, index: number ) => {
                const childProps = await this.apiModule.getProps( childrenType.getName(), { key } );

                if ( !childProps.key ) {
                    childProps.key = index;
                }

                return React.createElement( childrenType, childProps );
            } ) );

            return {
                element: parent,
                children,
            };
        };

        const resource = wrapPromiseSuspendable( getComponentPromise() );

        const Component = () => {
            const data = resource.read();

            return (
                <data.element.type>
                    { data.children }
                </data.element.type>
            );
        };

        return (
            <React.Suspense fallback={ this.props.fallback || <p>Loading</p> }>
                <Component />
            </React.Suspense>
        );
    }
};
