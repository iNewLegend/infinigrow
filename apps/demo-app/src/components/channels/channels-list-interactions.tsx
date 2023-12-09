import React from "react";

import commandsManager from "@infinigrow/commander/commands-manager";

import {
    useCommanderComponent,
    useAnyComponentCommands,
    useCommanderState,
    useCommanderChildrenComponents
} from "@infinigrow/commander/use-commands";

import { ChannelItem } from "@infinigrow/demo-app/src/components/channel/channel-item";

import type { ChannelListState } from "@infinigrow/demo-app/src/components/channels/channels-types";

import type { ChannelItemComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

// On channel list, request edit title name
function onEditRequest(
    channel: ChannelItemComponent,
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
    channel: ChannelItemComponent,
    channelsState: ChannelItemComponent[],
    setChannelsState: ( channels: ChannelItemComponent[] ) => void,
) {
    // Remove the channel from the list
    setChannelsState( channelsState.filter( ( c ) => c.props.meta.id !== channel.props.meta.id ) );
}

function onAddRequest(
    channelsState: ChannelItemComponent[],
    setChannelsState: ( channels: ChannelItemComponent[] ) => void,
) {
    // Add a new channel to the list
    setChannelsState( [ ... channelsState,
        // @ts-ignore
        <ChannelItem key={ Math.random() } id={ Math.random() } name={ "New Channel" + channelsState.length }
                     icon={ channelsState[ 0 ].props.meta.icon }/>
    ] );
}

export function channelsListInteractions() {
    const [ channelsListState, setChannelsListState ] = useCommanderState<ChannelListState>( "App/ChannelsList" );

    const setChannelsState = ( channels: ChannelItemComponent[] ) => setChannelsListState( { channels } );
    const setSelected = ( selected: { [ key: string ]: boolean } ) => setChannelsListState( { selected } );

    const channelsCommands = useCommanderComponent( "App/ChannelsList" ),
        accordionItemCommands = useCommanderChildrenComponents( "UI/AccordionItem" );

    // Once each accordion item is rendered, we can attach selection handlers
    React.useEffect( () => {
        // Only once all accordion items are rendered
        if ( ! accordionItemCommands.length ) {
            return;
        }

        const addChannelCommand = useAnyComponentCommands( "App/AddChannel" );

        channelsCommands.hook( "App/ChannelsList/EditRequest", ( r, args: any ) =>
            onEditRequest( args.channel, setSelected, channelsCommands, accordionItemCommands ) );

        channelsCommands.hook( "App/ChannelsList/RemoveRequest", ( r, args: any ) =>
            onRemoveRequest( args.channel,  channelsListState.channels, setChannelsState ) );

        const AddChannelCommand = {
            commandName: "App/AddChannel",
            componentName: "App/AddChannel",
            componentNameUnique: addChannelCommand[ 0 ].componentNameUnique,
        };

        commandsManager.hook( AddChannelCommand, () =>
            onAddRequest( channelsListState.channels, setChannelsState ) );

        return () => {
            // Since we are using `useAnyComponentCommands` we have to unhook manually
            commandsManager.unhookWithinComponent( "App/AddChannel" );
        };
    }, [ accordionItemCommands ] );
}
