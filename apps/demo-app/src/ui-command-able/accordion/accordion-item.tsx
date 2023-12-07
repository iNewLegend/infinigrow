import React from "react";

import { withCommands } from "@infinigrow/commander/with-commands";

import { CommandBase } from "@infinigrow/commander/command-base";

import { useCommand } from "@infinigrow/commander/use-commands";

import { AccordionItemMenu } from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item-menu";

import { UIThemeAccordionItem, } from "@infinigrow/demo-app/src/ui-theme/accordion/ui-theme-accordion";

import type { UIThemeAccordionItemProps } from "@infinigrow/demo-app/src/ui-theme/accordion/ui-theme-accordion";

export interface AccordionItemProps extends Omit<UIThemeAccordionItemProps, "heading"> {
    heading: {
        icon?: string,
        iconAlt?: string,
        title?: string | React.ReactElement,
    }
    menu: {
        [ key: string ]: {
            label: string,
            action: () => void,
            color?: "default" | "primary" | "success" | "warning" | "secondary" | "danger",
        },
    },
}

const AccordionItemEditableTitle: React.FC<AccordionItemProps> = ( props: AccordionItemProps ) => {
    const [ isEditing, setIsEditing ] = React.useState( false );

    const ref = React.useRef<HTMLDivElement>( null );

    const editableCommand = useCommand( "UI/AccordionItem/EditableTitle" ),
        onTitleChangedCommand = useCommand( "UI/AccordionItem/OnTitleChanged" );

    const isCollapsed = React.useMemo( () => {
        return props.collapsedState === "detached";
    }, [ props.collapsedState ] );

    // If selection detached from the element, stop editing
    React.useEffect( () => {
        if ( ! isEditing || ! ref.current || ! isCollapsed ) {
            return;
        }

        ref.current.contentEditable = "false";
    }, [ isCollapsed ] );

    function onKeyPress( e: React.KeyboardEvent<HTMLSpanElement> ) {
        if ( ! isEditing ) {
            return;
        }

        if ( e.key === "Enter" ) {
            e.preventDefault();
            e.stopPropagation();

            setIsEditing( false );

            onTitleChangedCommand.run( { title: e.currentTarget.innerText } );
        }
    }

    function onClick( e: React.MouseEvent<HTMLSpanElement, MouseEvent> ) {
        if ( ! isEditing ) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();

        e.currentTarget.focus();
    }

    React.useEffect( () => {
        editableCommand.hook( ( { state } ) => {
            setIsEditing( state );
        } );
    }, [ setIsEditing ] );

    return <span
        className="accordion-item-title"
        ref={ ref }
        contentEditable={ isEditing }
        suppressContentEditableWarning={ true }
        onKeyPress={ onKeyPress }
        onClick={ onClick }
    >
        { props.heading?.title }
    </span>;
};

const AccordionItem: React.FC<AccordionItemProps> = ( props ) => {
    const { itemKey, heading = {}, menu = {} } = props;

    const onAction = ( key: React.Key ) => {
        const action = menu[ key.toString() ]?.action;

        if ( action ) {
            action();
        }
    };

    const propsInternal: any = {
        ... props,

        heading: {
            ... heading,

            title: AccordionItemEditableTitle( props ),

            extra:
                <span className={ "accordion-item-menu" }>
                    <AccordionItemMenu menuItems={ menu } onAction={ onAction }/>
                </span>,
        },
    };

    return <UIThemeAccordionItem { ... propsInternal } key={ itemKey }>
        { props.children }
    </UIThemeAccordionItem>;
};

const $$ = withCommands( "UI/AccordionItem", AccordionItem, [
    class Editable extends CommandBase {
        public static getName() {
            return "UI/AccordionItem/EditableTitle";
        }
    },
    class OnTitleChanged extends CommandBase {
        public static getName() {
            return "UI/AccordionItem/OnTitleChanged";
        }
    }
] );

export default $$;
