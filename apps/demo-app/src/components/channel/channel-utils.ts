export function formatNumericInput( value: string ) {
    // If include alphabet, then halt
    if ( /[a-zA-Z]/.test( value ) ) {
        return null;
    }

    // Remove leading zeros.
    value = value.replace( /^0+/, "" );

    // Decimal separator (eg 100 /  1,000 / 10,000).
    const valueWithoutSeparators = value.replace( /,/g, "" );

    if ( valueWithoutSeparators.length > 3 ) {
        const separatorIndex = valueWithoutSeparators.length - 3;

        value = `${ valueWithoutSeparators.slice( 0, separatorIndex ) },${ valueWithoutSeparators.slice( separatorIndex ) }`;
    }

    return value;
}
