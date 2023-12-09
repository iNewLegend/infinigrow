import React from "react";

import { CommandBase } from "@infinigrow/commander/command-base";

import { withCommands } from "@infinigrow/commander/with-commands";
import { useCommanderComponent } from "@infinigrow/commander/use-commands";

import "@infinigrow/demo-app/src/ui-command-able/accordion/_accordion.scss";

import { UIThemeAccordion } from "@infinigrow/demo-app/src/ui-theme/accordion/ui-theme-accordion";

import AccordionItem from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";

import type { UIThemeAccordionCollapseStates } from "@infinigrow/demo-app/src/ui-theme/accordion/ui-theme-accordion-types";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

type AccordionItemComponent = React.ReactComponentElement<typeof AccordionItem>;
type AccordionUIComponent = React.ReactComponentElement<typeof UIThemeAccordion>;

export interface AccordionProps {
    children: AccordionItemComponent | AccordionItemComponent[],

    selected?: {
        [ key: number ]: boolean
    },

    setSelected?: React.Dispatch<React.SetStateAction<{
        [ key: string ]: boolean
    }>>,
}

/**
 * The main difference between UIThemeAccordion and Accordion is that Accordion is command-able (having commands).
 */
const Accordion: CommandFunctionComponent<AccordionProps> = ( props ) => {
    let children = Array.isArray( props.children ) ? props.children : [ props.children ];

    // If `ReactFragment` is used as children, then pop it out.
    if ( children.length === 1 && children[ 0 ].type === React.Fragment ) {
        children = children[ 0 ].props.children!;
    }

    const commands = useCommanderComponent( "UI/Accordion" );

    let [ selected, setSelected ] = React.useState<{
        [ key: string ]: boolean
    }> ( {} );

    if ( props.selected ) {
        selected = props.selected;
    }

    if ( props.setSelected ) {
        setSelected = props.setSelected;
    }

    const [ previousSelected, setPreviousSelected ] = React.useState<{
        [ key: string ]: boolean
    }>( {} );

    const [ isLoaded, setIsLoaded ] = React.useState<boolean>( false );

    const accordionUIProps: Omit<AccordionUIComponent["props"], "children"> = {
        setSelected,
        selected,

        onClick: ( event: React.MouseEvent<HTMLButtonElement>, key: string, state: UIThemeAccordionCollapseStates, signal?: AbortController ) => {
            // Disable multiple selections, by default accordion allows multiple selections.

            // If current selected is not the new selected, dissect the old and select the new.
            if ( Object.keys( selected ).length > 0 ) {

                if ( ! Object.keys( selected ).find( i => i == key ) ) {
                    signal?.abort();

                    // Dissect all
                    setSelected( { [ key ]: true } );
                }
            }
        },

        onSelectionChanged: () => {
            if ( false === isLoaded ) {
                setIsLoaded( true );
            } else if ( JSON.stringify( previousSelected ) !== JSON.stringify( selected ) ) {
                // Find who detached
                const detached = Object.keys( previousSelected ).find( ( key ) => ! selected[ key ] );

                // Find who attached
                const attached = Object.keys( selected ).find( ( key ) => ! previousSelected[ key ] );

                // Run the commands so later someone can hook them.
                if ( detached ) {
                    commands.run( "UI/Accordion/onSelectionDetached", { key: detached } );
                }

                if ( attached ) {
                    commands.run( "UI/Accordion/onSelectionAttached", { key: attached } );
                }
            }

            setPreviousSelected( selected );
        }
    };

    return (
        <div className={ `loader ${ isLoaded ? "loaded" : "" }` }>
            <UIThemeAccordion { ... accordionUIProps }>
                { children.map( ( child, index ) =>
                    <AccordionItem { ... child.props } key={index}>
                        { child.props.children }
                    </AccordionItem>
                ) }
            </UIThemeAccordion>
        </div>
    );
};

const $$ = withCommands( "UI/Accordion", Accordion, [
    class onSelectionAttached extends CommandBase {
        public static getName() {
            return "UI/Accordion/onSelectionAttached";
        }
    },
    class onSelectionDetached extends CommandBase {
        public static getName() {
            return "UI/Accordion/onSelectionDetached";
        }
    },
] );

export default $$;

