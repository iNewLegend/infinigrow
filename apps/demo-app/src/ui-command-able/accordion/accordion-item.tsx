import React from "react";

import { withCommands } from "@infinigrow/commander/with-commands";

import { CommandBase } from "@infinigrow/commander/command-base";

import { useCommanderCommand } from "@infinigrow/commander/use-commands";

import { AccordionItemMenu } from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item-menu";

import { UIThemeAccordionItem } from "@infinigrow/demo-app/src/ui-theme/accordion/ui-theme-accordion";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

import type { UIThemeAccordionItemProps } from "@infinigrow/demo-app/src/ui-theme/accordion/ui-theme-accordion-types";

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
    const [ isEditing, setIsEditing ] = React.useState( false ),
        [ isFocusCaptured, setIsFocusCaptured ] = React.useState( false );

    const ref = React.useRef<HTMLSpanElement>( null );

    const editableCommand = useCommanderCommand( "UI/AccordionItem/EditableTitle" ),
        onTitleChangedCommand = useCommanderCommand( "UI/AccordionItem/OnTitleChanged" );

    const isCollapsed = React.useMemo( () => {
        return props.collapsedState === "detached";
    }, [ props.collapsedState ] );

    const runOnTitleChangedCommand = ( newTitle: string ) => {
        onTitleChangedCommand.run( { title: newTitle, itemKey: props.itemKey } );
    };

    // If selection detached from the element, stop editing
    React.useEffect( () => {
        if ( ! isEditing || ! ref.current || ! isCollapsed ) {
            return;
        }

        ref.current.contentEditable = "false";
    }, [ isCollapsed ] );

    // On accordion enable editing, set editing mode is on
    React.useEffect( () => {
        editableCommand.hook( ( result, args ) => {
            setIsEditing( args!.state );

            setTimeout( () => {
                if ( ref.current ) {
                    ref.current.focus();

                    // Without this, the cursor will be at the start of the text
                    let sel = window.getSelection();

                    if ( ! sel ) {
                        return;
                    }

                    sel.selectAllChildren(ref.current);
                    sel.collapseToEnd();
                }
            }, 1000 );
        } );

        return () => {
            editableCommand.unhook();
        };
    }, [ setIsEditing ] );

    // On enter, stop editing
    function onKeyPress( e: React.KeyboardEvent<HTMLSpanElement> ) {
        if ( ! isEditing ) {
            return;
        }

        if ( e.key === "Enter" ) {
            e.preventDefault();
            e.stopPropagation();

            setIsEditing( false );

            runOnTitleChangedCommand( e.currentTarget.innerText );
        }
    }

    // Start editing on click
    function onClick( e: React.MouseEvent<HTMLSpanElement, MouseEvent> ) {
        if ( ! isEditing ) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        e.currentTarget.focus();
    }

    // On focus capture, set flag to await for release/blur.
    function onFocusCapture() {
        if ( ! isEditing ) {
            return;
        }

        setIsFocusCaptured( true );
    }

    // If focus was captured, and blur happened, stop editing
    function onBlur( e: React.FocusEvent<HTMLSpanElement> ) {
        if ( ! isEditing ) {
            return;
        }

        if ( isFocusCaptured ) {
            setIsFocusCaptured( false );
            setIsEditing( false );

            runOnTitleChangedCommand( e.currentTarget.innerText );
        }
    }

    return <span
        className="accordion-item-title"
        ref={ ref }
        contentEditable={ isEditing }
        suppressContentEditableWarning={ true }
        onKeyPress={ onKeyPress }
        onClick={ onClick }
        onFocusCapture={ onFocusCapture }
        onBlur={ onBlur }
    >
        { props.heading?.title }
    </span>;
};

const AccordionItem: CommandFunctionComponent<AccordionItemProps> = ( props ) => {
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
