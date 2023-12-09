import React from "react";

import commandsManager from "@infinigrow/commander/commands-manager";

import { useComponentCommands, useAnyComponentCommands } from "@infinigrow/commander/use-commands";

import { ChannelItem } from "@infinigrow/demo-app/src/components/channel/channel-item";

import type { ChannelItemComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

// On channel list, request edit title name
function onEditRequest(
    channel: ChannelItemComponent,
    setSelected: React.Dispatch<React.SetStateAction<{ [ key: string ]: boolean; }>>,
    channelsCommands: ReturnType<typeof useComponentCommands>,
    accordionItemCommands: ReturnType<typeof useAnyComponentCommands>,
) {
    // Select the channel (trigger accordion item selection)
    setSelected( { [ channel.props.id ]: true } );

    accordionItemCommands.some( ( command ) => {
        if ( command.props.itemKey === channel.props.id ) {
            const editAbleId = {
                commandName: "UI/AccordionItem/EditableTitle",
                componentName: "UI/AccordionItem",
                componentNameUnique: command.componentNameUnique,
            };

            const onTitleChangedId = {
                commandName: "UI/AccordionItem/OnTitleChanged",
                componentName: "UI/AccordionItem",
                componentNameUnique: command.componentNameUnique,
            };

            // Tell accordion to enter edit mode
            commandsManager.run( editAbleId, { state: true } );

            // Hook on title changed, run command within the channel list, to inform about the change
            commandsManager.hook( onTitleChangedId, ( result, args ) => {
                channelsCommands.run( "App/ChannelsList/OnEditName", {
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
    setChannelsState: React.Dispatch<React.SetStateAction<ChannelItemComponent[]>>,
) {
    // Remove the channel from the list
    setChannelsState( ( channels ) => channels.filter( ( i ) => i.props.id !== channel.props.id ) );
}

function onAddRequest(
    setChannelsState: React.Dispatch<React.SetStateAction<ChannelItemComponent[]>>,
) {
    // Add a new channel to the list
    setChannelsState( ( channels ) => [ ... channels,
        // @ts-ignore
        <ChannelItem key={ Math.random() } id={ Math.random() } name={"New Channel" + channels.length } icon={channels[0].props.icon} />
    ] );
}

export function channelsListInteractions( args: {
    setSelected: React.Dispatch<React.SetStateAction<{ [ key: string ]: boolean; }>>,
    setChannelsState: React.Dispatch<React.SetStateAction<ChannelItemComponent[]>>,
}) {
    const { setSelected, setChannelsState } = args;

    const channelsCommands = useComponentCommands( "App/ChannelsList" );

    // Once each accordion item is rendered, we can attach selection handlers
    React.useEffect( () => {
        const accordionItemCommands = useAnyComponentCommands( "UI/AccordionItem" ),
            addChannelCommand = useAnyComponentCommands( "App/AddChannel" );

        channelsCommands.hook( "App/ChannelsList/EditRequest", ( r, args: any ) =>
            onEditRequest( args.channel, setSelected, channelsCommands, accordionItemCommands ) );

        channelsCommands.hook( "App/ChannelsList/RemoveRequest", ( r, args: any ) =>
            onRemoveRequest( args.channel, setChannelsState ) );

        const AddChannelCommand = {
            commandName: "App/AddChannel",
            componentName: "App/AddChannel",
            componentNameUnique: addChannelCommand[ 0 ].componentNameUnique,
        };

        commandsManager.hook( AddChannelCommand, () => onAddRequest( setChannelsState ) );

        return () => {
            // Since we are using `useAnyComponentCommands` we have to unhook manually
            commandsManager.unhookWithinComponent( "App/AddChannel" );
            commandsManager.unhookWithinComponent( "UI/AccordionItem" );
        };
    }, [] );
}
