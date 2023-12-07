import React from "react";

import { AnimatePresence, motion } from "framer-motion";

import "@infinigrow/demo-app/src/ui-theme/accordion/_ui-theme-accordion.scss";

import { ArrowDown } from "@infinigrow/demo-app/src/ui-theme/symbols";

import {
    accordionHandleSelection,
    accordionHandleExternalSelection
} from "@infinigrow/demo-app/src/ui-theme/accordion/ui-theme-accordion-handle-selection";

import type {
    UIThemeAccordionItemProps,
    UIThemeAccordionProps,
    UIThemeAccordionCollapseStates
} from "@infinigrow/demo-app/src/ui-theme/accordion/ui-theme-accordion-types.ts";

/**
 * Function UIThemeAccordionHeading()
 */
const UIThemeAccordionHeading = ( props: Omit<UIThemeAccordionItemProps, "children"> & {
    children: UIThemeAccordionItemProps["heading"]["title"]
} ) => {
    const { children } = props,
        { icon, iconAlt } = props.heading;

    const Icon = () => ( icon &&
        <span className="accordion-icon">
            <img className="icon" src={ icon } alt={ iconAlt }/>
        </span>
    );

    /* Avoid flickering on re-render */
    const MemorizedHeading = React.useMemo( () => (
        <>
            <span className="accordion-indicator">
                { <ArrowDown/> }
            </span>

            { Icon() }

            <div className="accordion-title">
                { children }
            </div>
        </> ), [ children, icon, iconAlt ] );

    return ( <>{ MemorizedHeading }</> );
};

/**
 * Function UIThemeAccordionItemCollapse() : The AccordionItemCollapse component follows a common pattern for accordion components
 * in React: maintaining a state determines the collapsed/expanded status of the accordion item.
 * The component uses the useState and useEffect React hooks to handle state and side effects respectively.
 *
 * The component uses the framer-motion library to animate the accordion's opening and closing.
 * With AnimatePresence from framer-motion, elements can be animated in and out of the React component tree.
 */
const UIThemeAccordionItemCollapse = ( props: {
    children: any,
    height: number,
    collapsedState: UIThemeAccordionCollapseStates
    collapsedStateRef: React.MutableRefObject<HTMLDivElement | null>,
    setCollapsedState: React.Dispatch<React.SetStateAction<UIThemeAccordionCollapseStates>>,
} ): React.JSX.Element => {
    const { children, height, collapsedState, collapsedStateRef, setCollapsedState } = props;

    const [ shouldRenderCollapse, setShouldRenderCollapse ] = React.useState<null | boolean>( null );

    const memoCollapsedStateChanged = React.useMemo( () => {
        return collapsedState;
    }, [ collapsedState ] );

    React.useEffect( () => {
        switch ( collapsedState ) {
            case "initial":
                setShouldRenderCollapse( true );
                setCollapsedState( "re-render" );
                break;

            case "re-render":
                setShouldRenderCollapse( false );
                setCollapsedState( "detached" );
                break;

            case "attached":
                setShouldRenderCollapse( true );
                break;

            default:
                setShouldRenderCollapse( false );
        }

    }, [ collapsedState ] );

    const Component = () => {
        const renderCollapse = () => {
            // Initial render rendering collapse for getting the height
            const isInitialRender = memoCollapsedStateChanged === "initial" && shouldRenderCollapse === null;

            if ( ! isInitialRender && ! shouldRenderCollapse ) {
                return null;
            }

            return (
                <motion.div
                    className="accordion-collapse"
                    initial={ { maxHeight: 0 } }
                    animate={ { maxHeight: height, display: "block" } }
                    exit={ { maxHeight: 0 } }
                    transition={ { duration: 0.3 } }
                >
                    <div className="accordion-content px-5 py-4" ref={ collapsedStateRef }>
                        { children }
                    </div>
                </motion.div>
            );
        };

        return (
            <AnimatePresence>
                { renderCollapse() }
            </AnimatePresence>
        );
    };

    return Component();
};

const UIThemeAccordionItemContent = ( props: UIThemeAccordionItemProps ) => {
    const { children, collapsedState, setCollapsedState } = props;

    const [ height, setHeight ] = React.useState( 0 );
    const collapsedStateRef = React.useRef<null | HTMLDivElement>( null );

    React.useEffect( () => {
        if ( collapsedStateRef.current && collapsedState === "initial" ) {
            const contentHeight = collapsedStateRef.current.clientHeight;

            if ( contentHeight > 0 ) {
                // Set the height for the animation
                setHeight( contentHeight );

                // Hide the content
                collapsedStateRef.current.style.height = "0px";
                collapsedStateRef.current.style.display = "none";
            }
        }
    }, [] );

    const args = {
        height,
        collapsedState,
        collapsedStateRef,
        setCollapsedState,
    };

    return ( <UIThemeAccordionItemCollapse { ... args } >
        { children }
    </UIThemeAccordionItemCollapse> );
};

export const UIThemeAccordionItem = ( props: UIThemeAccordionItemProps ) => {
    const { children, ... propsWithoutChildren } = props;

    return (
        <>
            <h2 className="accordion-heading">
                <button className="accordion-button" onClick={ () => {
                    return props.onClick?.( event as any, props.itemKey.toString(), props.collapsedState );
                } }>
                    <UIThemeAccordionHeading { ... propsWithoutChildren }>
                        { props.heading.title }
                    </UIThemeAccordionHeading>
                </button>
                { props.heading.extra || null }
            </h2>

            <div className="accardion-content-container">
                <UIThemeAccordionItemContent { ... propsWithoutChildren }>
                    { children }
                </UIThemeAccordionItemContent>
            </div>
        </>
    );
};

const NormalizeAccordionItem = ( props: any ) => {
    const { item, selected, setSelected, setIsInternalChange, sharedProps } = props;

    const ref = React.createRef<HTMLDivElement>();

    let [ collapsedState, setCollapsedState ] = React.useState<UIThemeAccordionCollapseStates>( "initial" );

    collapsedState = item.props.collapsedState || collapsedState;
    setCollapsedState = item.props.setCollapsedState || setCollapsedState;

    const itemProps: Required<UIThemeAccordionItemProps> = {
        ... item.props,

        collapsedState,
        setCollapsedState,

        key: item.props.itemKey,
    };

    itemProps.onClick = ( e ) => accordionHandleSelection( e, ref, {
        key: itemProps.itemKey.toString(),

        collapsedState,
        setCollapsedState,

        selected,
        setSelected,

        // Passing `api` onClick handler, `accordionHandleSelection` will handle the call to it.
        onClick: props.onClick,

        setIsInternalChange
    }, );

    sharedProps[ itemProps.itemKey.toString() ] = itemProps;

    return (
        <div className="group accordion-item" data-collapsed={ "initial" } ref={ ref }>
            { <item.type { ... itemProps }/> }
        </div>
    );
};

export const UIThemeAccordion = React.memo( ( props: UIThemeAccordionProps ) => {
    let { children } = props;

    let [ selectedInternal, setSelectedInternal ] = React.useState<{ [ key: string ]: boolean }>( {} );

    const selected = props.selected || selectedInternal,
        setSelected = props.setSelected || setSelectedInternal;

    const [ prevSelected, setPrevSelected ] = React.useState<typeof selected>( {} );

    const [ isInternalChange, setIsInternalChange ] = React.useState<{ [ key: string ]: boolean }>( {} );

    const sharedProps = React.useMemo<{ [ key: string ]: any }>( () => ( {} ), [] );

    accordionHandleExternalSelection( {
        selected,
        setSelected,

        prevSelected,
        setPrevSelected,

        isInternalChange,
        setIsInternalChange,

        onSelectionChanged: props.onSelectionChanged!,

        sharedProps,
    } );

    return (
        <div className="accordion">
            { children.map( ( item ) =>
                <NormalizeAccordionItem
                    key={ item.props.itemKey }
                    item={ item }
                    selected={ selected }
                    setSelected={ setSelected }
                    sharedProps={ sharedProps }
                    setIsInternalChange={ setIsInternalChange }
                    onClick={ props.onClick }/>
            ) }
        </div>
    );
} );
