import React from "react";

import commandsManager from "@infinigrow/commander/commands-manager";

import {
    useCommanderComponent,
    useAnyComponentCommands,
    useCommanderState,
    useCommanderChildrenComponents
} from "@infinigrow/commander/use-commands";

import { ChannelItemAccordion } from "@infinigrow/demo-app/src/components//channel/channel-item-accordion.tsx";

import type { ChannelListState } from "@infinigrow/demo-app/src/components/channels/channels-types";

import type { ChannelItemAccordionComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

// On channel list, request edit title name
function onEditRequest(
    channel: ChannelItemAccordionComponent,
    setSelected: ( selected: { [ key: string ]: boolean } ) => void,
    channelsCommands: ReturnType<typeof useCommanderComponent>,
    accordionItemCommands: ReturnType<typeof useCommanderChildrenComponents>,
) {
    // Select the channel (trigger accordion item selection)
    setSelected( { [ channel.props.meta.id ]: true } );

    accordionItemCommands.forEach( ( command ) => {
        if ( command.getInternalContext().props.itemKey === channel.props.meta.id ) {
            // Tell accordion to enter edit mode
            command.run( "UI/AccordionItem/EditableTitle", { state: true } );

            // Hook on title changed, run command within the channel list, to inform about the change
            command.hook( "UI/AccordionItem/OnTitleChanged", ( result, args ) => {
                channelsCommands.run( "App/ChannelsList/SetName", {
                    id: args!.itemKey,
                    name: args!.title,
                } );
            } );

            return true;
        }
    } );
}

function onRemoveRequest(
    channel: ChannelItemAccordionComponent,
    getChannelsListState: ReturnType<typeof useCommanderState<ChannelListState>>[ 0 ],
    setChannelsListState: ReturnType<typeof useCommanderState<ChannelListState>>[ 1 ]
) {
    const newList = getChannelsListState().channels.filter( ( c ) => c.props.meta.id !== channel.props.meta.id );

    // Remove the channel from the list
    setChannelsListState( prevChannelsState => {
        return {
            ... prevChannelsState,
            channels: newList,
        };
    } );
}

function onAddRequest(
    getChannelsListState: ReturnType<typeof useCommanderState<ChannelListState>>[ 0 ],
    setChannelsListState: ReturnType<typeof useCommanderState<ChannelListState>>[ 1 ]
) {
    // Create a new channel object
    const newChannelProps = {
        meta: {
            id: Math.random().toString(),
            name: "New Channel #" + ( getChannelsListState().channels.length + 1 ),
            icon: `https://api.dicebear.com/7.x/icons/svg?seed=${ performance.now() }`
        }
    };

    // Create a new ChannelItem component with the new channel object as props
    const newChannelComponent = <ChannelItemAccordion { ... newChannelProps }
                                                      key={ getChannelsListState().channels.length }/>;

    // Add the new ChannelItem component to the channelsState array
    setChannelsListState( prevChannelsState => {
        return { ... prevChannelsState, channels: [ ... prevChannelsState.channels, newChannelComponent ] };
    } );
}

export function channelsListAccordionInteractions() {
    const [ getChannelsListState, setChannelsListState, isMounted ] = useCommanderState<ChannelListState>( "App/ChannelsList" );

    const setSelected = ( selected: { [ key: string ]: boolean } ) => setChannelsListState( { selected } );

    const channelsCommands = useCommanderComponent( "App/ChannelsList" ),
        accordionItemCommands = useCommanderChildrenComponents( "UI/AccordionItem" );

    // Once each accordion item is rendered, we can attach selection handlers
    React.useEffect( () => {
        // Only once all accordion items are rendered
        if ( ! accordionItemCommands.length ) {
            return;
        }

        channelsCommands.hook( "App/ChannelsList/EditRequest", ( r, args: any ) =>
            onEditRequest( args.channel, setSelected, channelsCommands, accordionItemCommands ) );

        channelsCommands.hook( "App/ChannelsList/RemoveRequest", ( r, args: any ) =>
            onRemoveRequest( args.channel, getChannelsListState, setChannelsListState ) );

        return () => {
            accordionItemCommands.forEach( ( command ) => {
                command.unhook( "UI/AccordionItem/OnTitleChanged" );
            } );

            commandsManager.unhookWithinComponent( channelsCommands.getId() );

        };
    }, [ accordionItemCommands ] );

    React.useEffect( () => {
        const addChannelCommands = useAnyComponentCommands( "App/AddChannel" );
        const addChannelCommandId = {
            commandName: "App/AddChannel",
            componentName: "App/AddChannel",
            componentNameUnique: addChannelCommands[ 0 ].componentNameUnique,
        };

        commandsManager.hook( addChannelCommandId, () =>
            onAddRequest( getChannelsListState, setChannelsListState ) );

        return () => {
            commandsManager.unhookWithinComponent( addChannelCommandId.componentNameUnique );
        };
    }, [ isMounted() ] );
}
