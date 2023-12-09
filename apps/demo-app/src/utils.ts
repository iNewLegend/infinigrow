export type EnforceKeys<T> = { [P in keyof Required<T>]: boolean };

export function pickEnforcedKeys<T>( source: T, keys: EnforceKeys<T> ) {
    const target: Partial<T> = {};

    if ( !source ) {
        throw new Error( "Source is empty" );
    }

    Object.keys( keys ).forEach( ( key ) => {
        if ( "undefined" === typeof source[ key as keyof T ] ) {
            throw new Error( `Missing key: ${ key }` );
        }
        target[ key as keyof T ] = source[ key as keyof T ];
    } );

    return target as T;
}
