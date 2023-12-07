import React from "react";

import commandsManager from "@infinigrow/commander/commands-manager";

import { useComponentCommands, useAnyComponentCommands } from "@infinigrow/commander/use-commands";

import { ChannelItem } from "@infinigrow/demo-app/src/components/channels/channel-item";

import type { ChannelItemComponent } from "@infinigrow/demo-app/src/components/channels/channel-types";

export function channelInteractions( args: {
    setSelected: React.Dispatch<React.SetStateAction<{ [ key: string ]: boolean; }>>,
    setChannelsState: React.Dispatch<React.SetStateAction<ChannelItemComponent[]>>,
}) {
    const { setSelected, setChannelsState } = args;

    const channelsCommands = useComponentCommands( "App/ChannelList" ),
        addChannelCommand = useAnyComponentCommands( "App/AddChannel" );

    // Once each accordion item is rendered, we can attach selection handlers
    React.useEffect( () => {
        // Hook local actions
        channelsCommands.hook( "App/ChannelList/EditRequest", ( args: any ) => {
            // On edit request, select the channel (trigger accordion item selection)
            setSelected( { [ args.channel.props.id ]: true } );

            const accordionItemCommands = useAnyComponentCommands( "UI/AccordionItem" );

            // Enable edit mode on the accordion item
            accordionItemCommands.some( ( command ) => {
                if ( command.props.itemKey === args.channel.props.id ) {
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

                    // Hook on title changed
                    commandsManager.hook( onTitleChangedId, ( { title } ) => {
                        // TODO: Update some state
                        console.log( `Title changed to: ${ title }` );
                    } );

                    commandsManager.run( editAbleId, { state: true } );

                    return true;
                }
            } );

        } );

        channelsCommands.hook( "App/ChannelList/Remove", ( args: any ) => {
            // Remove the channel from the list
            setChannelsState( ( channels ) => channels.filter( ( channel ) => channel.props.id !== args.channel.props.id ) );
        } );

        const AddChannelCommand = {
            commandName: "App/AddChannel",
            componentName: "App/AddChannel",
            componentNameUnique: addChannelCommand[ 0 ].componentNameUnique,
        };

        commandsManager.hook( AddChannelCommand, () => {
            setChannelsState( ( channels ) => [ ... channels,
                // @ts-ignore
                <ChannelItem key={ Math.random() } id={ Math.random() } name={"New Channel" + channels.length } icon={channels[0].props.icon} />
            ] );
        } );

        return () => {
            // Since we are using `useAnyComponentCommands` we have to unhook manually
            commandsManager.unhook( AddChannelCommand );
        };
    }, [] );
}
