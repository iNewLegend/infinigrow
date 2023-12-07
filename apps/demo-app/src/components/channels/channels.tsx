import React from "react";

import commandsManager from "@infinigrow/commander/commands-manager";

import { CommandBase } from "@infinigrow/commander/command-base";

import { withCommands } from "@infinigrow/commander/with-commands";

import { useComponentCommands, useAnyComponentCommands } from "@infinigrow/commander/use-commands";

import Channel from "@infinigrow/demo-app/src/components/channel/channel";
import ChannelInternal from "@infinigrow/demo-app/src/components/channel/channel-internal";

import Accordion from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion";

import AccordionItem from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";

import type { AccordionItemProps } from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";
import type { ChannelsProps, ChannelComponent } from "@infinigrow/demo-app/src/components/channel/channel";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

export function toAccordionItem(
    channel: ChannelComponent,
    channelsCommands: ReturnType<typeof useComponentCommands>,
    index: number,
): React.ReactComponentElement<typeof AccordionItem> {
    const channelInternalProps = {
        name: channel.props.name,
    };

    // Omit `collapsedState` and `setCollapsedState` those are extended by `renderExtendAccordionItem`
    const accordionProps: Omit<AccordionItemProps, "collapsedState" | "setCollapsedState"> = {
        itemKey: channel.props.id,

        children: <ChannelInternal { ... channelInternalProps } key={ channel.props.id }/>,
        heading: {
            title: channel.props.name,
            icon: channel.props.icon,
        },
        menu: {
            edit: {
                label: "Edit",
                action: () => channelsCommands.run(
                    "App/Channels/EditRequest",
                    { channel, }
                ),
            },
            remove: {
                label: "Remove",
                color: "danger",
                action: () => channelsCommands.run(
                    "App/Channels/Remove",
                    { channel, }
                ),
            },
        },
    };

    const { children, ... withoutChildren } = accordionProps;

    return <AccordionItem children={ children } { ... withoutChildren }
                          key={ "channel-" + channel.props.id + "-accordion-item-" + index.toString() }/>;
}

function bindAccordionInteractions(
    channels: any,
    setSelected: React.Dispatch<React.SetStateAction<{ [ key: string ]: boolean; }>>,
    setChannelsState: React.Dispatch<React.SetStateAction<ChannelComponent[]>>,
) {
    const channelsCommands = useComponentCommands( "App/Channels" ),
        addChannelCommand = useAnyComponentCommands( "App/AddChannel" );

    // Once each accordion item is rendered, we can attach selection handlers
    React.useEffect( () => {
        // Hook local actions
        channelsCommands.hook( "App/Channels/EditRequest", ( args: any ) => {
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

        channelsCommands.hook( "App/Channels/Remove", ( args: any ) => {
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
                <Channel key={ Math.random() } id={ Math.random() } name={"New Channel" + channels.length } icon={channels[0].props.icon} />
            ] );
        } );

        return () => {
            // Since we are using `useAnyComponentCommands` we have to unhook manually
            commandsManager.unhook( AddChannelCommand );
        };
    }, [] );
}

const Channels: CommandFunctionComponent<ChannelsProps> = ( props ) => {
    let channels: ChannelComponent[] = Array.isArray( props.channels ) ? props.channels : [ props.channels ];

    // If `ReactFragment` is used as children, then pop it out.
    if ( channels.length === 1 && channels[ 0 ].type === React.Fragment ) {
        channels = channels[ 0 ].props.children! as ChannelComponent[];
    }

    // Helps to detect development errors.
    if ( channels.some( ( child ) => child.type !== Channel ) ) {
        throw new Error( `<${ Channels.name }> can accept only <${ Channel.name }> as children` );
    }

    const [ selected, setSelected ] = React.useState<{ [ key: string ]: boolean }>( {} );

    const [ channelsState, setChannelsState ] = React.useState<ChannelComponent[]>( channels );

    const channelsCommands = useComponentCommands( "App/Channels" );

    function renderAccordionItem( channel: ChannelComponent, index: number ) {
        return toAccordionItem( channel, channelsCommands, index );
    }

    bindAccordionInteractions(
        channels,
        setSelected,
        setChannelsState,
    );

    const children = channelsState.map( renderAccordionItem );

    return (
        <Accordion selected={ selected } setSelected={ setSelected }>
            { children }
        </Accordion>
    );
};

const $$ = withCommands( "App/Channels", Channels, [
    class EditRequest extends CommandBase {
        public static getName() {
            return "App/Channels/EditRequest";
        }
    },
    class Remove extends CommandBase {
        public static getName() {
            return "App/Channels/Remove";
        }
    }
] );

export default $$;

