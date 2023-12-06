import React from "react";

import { AnimatePresence, motion } from "framer-motion";

import { ArrowDown } from "@infinigrow/demo-app/src/ui-theme/symbols";

import "@infinigrow/demo-app/src/ui-theme/accordion/_ui-theme-accordion.scss";

/**
 * Type for the possible states of the Accordion collapse
 */
export type UIThemeAccordionCollapseStates = "initial" | "detached" | "attached" | "re-render";

/**
 * Type for the properties of the `ui/accordion` component
 */
export type UIThemeAccordionItemProps = {
    itemKey: React.Key,

    children: React.ReactNode,

    heading: {
        title: string,
        icon?: HTMLImageElement["src"],
        iconAlt?: string,
        extra?: React.ReactNode,
    }

    onClick?: ( event: React.MouseEvent<HTMLButtonElement>, key: string, state: UIThemeAccordionCollapseStates, signal?: AbortController ) => void,

    // Per item state
    collapsedState: UIThemeAccordionCollapseStates,
    setCollapsedState: React.Dispatch<React.SetStateAction<UIThemeAccordionCollapseStates>>,

    // Global state
    // `selected` is a map of the selected items, that sets the selected items, controlled (to way binding) `selected` is read/write
    // using `setSelected` and `selected` props.
    selected?: {
        [ key: string ]: boolean
    },

    setSelected?: React.Dispatch<React.SetStateAction<{
        [ key: string ]: boolean
    }>>,
};

type UIThemeAccordionItemPropsWithoutChildren = Omit<UIThemeAccordionItemProps, "children">;

type UIThemeAccordionProps = {
    children: React.ReactComponentElement<typeof UIThemeAccordionItem>[]

    selected?: UIThemeAccordionItemProps["selected"],
    setSelected?: UIThemeAccordionItemProps["setSelected"],

    // `onClick` api can only abort the click event, not trigger it.
    onClick?: ( event: React.MouseEvent<HTMLButtonElement>, key: string, state: UIThemeAccordionCollapseStates, signal?: AbortController ) => void,

    onSelectionChanged?: () => void,
}

/**
 * Function UIThemeAccordionHeading()
 */
const UIThemeAccordionHeading = ( props: UIThemeAccordionItemPropsWithoutChildren & {
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
 * in React: maintaining a state that determines the collapsed/expanded status of the accordion item.
 * The component uses the useState and useEffect React hooks to handle state and side effects respectively.
 *
 * The component uses the framer-motion library to animate the accordion's opening and closing.
 * With AnimatePresence from framer-motion, elements can be animated in and out of the React component tree.
 */
const UIThemeAccordionItemCollapse = ( props: {
    children: any,
    height: number,
    selected: UIThemeAccordionItemProps["selected"],
    setSelected: UIThemeAccordionItemProps["setSelected"],
    collapsedState: UIThemeAccordionCollapseStates
    collapsedStateRef: React.MutableRefObject<HTMLDivElement | null>,
    setCollapsedState: React.Dispatch<React.SetStateAction<UIThemeAccordionCollapseStates>>,
} ): React.JSX.Element => {
    const { children, height, collapsedState, collapsedStateRef, setCollapsedState } = props;

    const [ shouldRerender, _setShouldRerender ] = React.useState( "__INITIAL__" );
    const [ shouldRenderCollapse, setShouldRenderCollapse ] = React.useState<null | boolean>( null );

    const setShouldRerender = ( shouldRender: boolean ) => {
        if ( ! shouldRender ) {
            return;
        }
        _setShouldRerender( Math.random() );
    };

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

        _setShouldRerender( "__INITIAL__" );
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
        selected: props.selected,
        setSelected: props.setSelected,
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
                    return props.onClick?.( event, props.itemKey, props.collapsedState );
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

/**
 * Function accordionHandleSelection() Handles the selection of an accordion item.
 */
const accordionHandleSelection = (
    event: React.MouseEvent<HTMLButtonElement>,
    ref: React.RefObject<HTMLDivElement>,
    args: {
        key: string,
        collapsedState: UIThemeAccordionCollapseStates,
        setCollapsedState: React.Dispatch<React.SetStateAction<UIThemeAccordionCollapseStates>>,
        selected: UIThemeAccordionItemProps["selected"],
        setSelected: NonNullable<UIThemeAccordionItemProps["setSelected"]>,
        onClick: UIThemeAccordionItemProps["onClick"],
        setIsInternalChange: NonNullable<UIThemeAccordionItemProps["setSelected"]>,
    }
) => {
    if ( ! ref.current ) {
        return;
    }

    const target = ref.current;

    const { onClick, collapsedState, setCollapsedState, selected, setSelected, setIsInternalChange } = args;

    let state = collapsedState === "detached" ? "attached" : "detached" as UIThemeAccordionCollapseStates;

    const controller = new AbortController();

    if ( ! args.key ) {
        throw new Error( "Accordion item key is not defined" );
    }

    onClick?.( event, args.key, state, controller );

    if ( controller.signal.aborted ) {
        return;
    }

    /**
     * Trigger accordion item selection
     */
    setCollapsedState( state );

    setIsInternalChange( { [ args.key ]: true } );

    // Update for external
    setSelected( {
        ... selected,
        [ args.key ]: state === "attached"
    } );

    target.setAttribute( "data-collapsed", state );
};

/**
 * Function accordionHandleExternalSelection() Since state can be created outside of the component, it is necessary to implement a some sort of
 * solution.
 */
const accordionHandleExternalSelection = ( args: {
    selected: NonNullable<UIThemeAccordionItemProps["selected"]>,
    setSelected: NonNullable<UIThemeAccordionItemProps["setSelected"]>,

    prevSelected: NonNullable<UIThemeAccordionItemProps["selected"]>,
    setPrevSelected: NonNullable<UIThemeAccordionItemProps["setSelected"]>,

    isInternalChange: NonNullable<UIThemeAccordionItemProps["selected"]>,
    setIsInternalChange: NonNullable<UIThemeAccordionItemProps["setSelected"]>,

    onSelectionChanged: NonNullable<UIThemeAccordionProps["onSelectionChanged"]>,

    sharedProps: { [ key: string ]: UIThemeAccordionItemProps },
} ) => {
    const isSelectionChanged = React.useMemo( () => {
        // Convert to array and compare
        return JSON.stringify( Object.keys( args.prevSelected ) ) !== JSON.stringify( Object.keys( args.selected ) );
    }, [ args.selected ] );

    React.useEffect( () => {
        if ( args.onSelectionChanged ) {
            setTimeout( () => {
                args.onSelectionChanged!();
            } );
        }

        if ( isSelectionChanged ) {
            // If all cleared, then clear all
            if ( Object.keys( args.selected ).length === 0 ) {
                Object.values( args.sharedProps ).forEach( ( props ) => {
                    // If attached, then detach
                    props.setCollapsedState( props.collapsedState === "attached" ? "detached" : "attached" );
                } );
            }

            // Update all items according to their selection state
            Object.values( args.sharedProps ).forEach( ( props ) => {
                const key = props.itemKey as string;

                // If internal key, then ignore
                if ( args.isInternalChange[ key ] ) {
                    const clone = { ... args.isInternalChange };

                    delete clone[ key ];

                    args.setIsInternalChange( clone );

                    return;
                }

                // If attached, then detach
                props.setCollapsedState( args.selected[ key ] ? "attached" : "detached" );
            } );
        }

        args.setPrevSelected( args.selected );
    }, [ args.selected ] );
};

export const UIThemeAccordion = ( props: UIThemeAccordionProps ) => {
    let { children } = props;

    let [ selected, setSelected ] = React.useState<{ [ key: string ]: boolean }>( {} );

    const [ prevSelected, setPrevSelected ] = React.useState<typeof selected>( {} );

    selected = props.selected || selected;
    setSelected = props.setSelected || setSelected;

    const [ isInternalChange, setIsInternalChange ] = React.useState<{ [ key: string ]: boolean }>( {} );

    const sharedProps = React.useMemo<{[ key: string ]: any }>( () => ( {} ), [] );

    const NormalizeAccordionItem = ( props: any ) => {
        const { item } = props;

        const ref = React.createRef<HTMLDivElement>();

        let [ collapsedState, setCollapsedState ] = React.useState<UIThemeAccordionCollapseStates>( "initial" );

        collapsedState = item.props.collapsedState || collapsedState;
        setCollapsedState = item.props.setCollapsedState || setCollapsedState;

        const itemProps: Required<UIThemeAccordionItemProps> = {
            ... item.props,

            collapsedState,
            setCollapsedState,

            selected,
            setSelected,

            key: item.props.itemKey,
        };

        itemProps.onClick = ( e ) => accordionHandleSelection( e, ref, {
            key: itemProps.key,

            collapsedState,
            setCollapsedState,

            selected,
            setSelected,

            // Passing `api` onClick handler, `accordionHandleSelection` will handle the call to it.
            onClick: props.onClick,

            setIsInternalChange
        }, );

        sharedProps[ itemProps.key ] = itemProps;

        return (
            <div className="group accordion-item" data-collapsed={ "initial" } ref={ ref }>
                { <item.type { ... itemProps }/> }
            </div>
        );
    };

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

    const MemorizedAccordion = React.useMemo( () => (
        <div className="accordion">
            { children.map( ( item, index ) => <NormalizeAccordionItem key={ index } item={ item }
                                                                       onClick={ props.onClick }/> ) }
        </div>
    ), [ children.length ] );

    return (
        MemorizedAccordion
    );
};
