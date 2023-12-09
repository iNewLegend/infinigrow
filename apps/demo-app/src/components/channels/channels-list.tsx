import React from "react";

import { CommandBase } from "@infinigrow/commander/command-base";

import { withCommands } from "@infinigrow/commander/with-commands";
import { useCommanderComponent, useCommanderState } from "@infinigrow/commander/use-commands";

import { channelsListInteractions } from "@infinigrow/demo-app/src/components/channels/channels-list-interactions";

import ChannelItem from "@infinigrow/demo-app/src/components/channel/channel-item";

import Accordion from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion";

import AccordionItem from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";

import type { AccordionItemProps } from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

import type { ChannelListProps, ChannelListState } from "@infinigrow/demo-app/src/components/channels/channels-types";
import type { ChannelItemComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

export function toAccordionItem(
    channel: ChannelItemComponent,
    channelsCommands: ReturnType<typeof useCommanderComponent>,
    index: number,
): React.ReactComponentElement<typeof AccordionItem> {
    const channelInternalProps = {};

    // Omit `collapsedState` and `setCollapsedState` those are extended by `renderExtendAccordionItem`
    const accordionProps: Omit<AccordionItemProps, "collapsedState" | "setCollapsedState"> = {
        itemKey: channel.props.id,

        children: <ChannelItem { ... channelInternalProps } key={ channel.props.id }/>,
        heading: {
            title: channel.props.name,
            icon: channel.props.icon,
        },
        menu: {
            edit: {
                label: "Edit",
                action: () => channelsCommands.run(
                    "App/ChannelsList/EditRequest",
                    { channel, }
                ),
            },
            remove: {
                label: "Remove",
                color: "danger",
                action: () => channelsCommands.run(
                    "App/ChannelsList/RemoveRequest",
                    { channel, }
                ),
            },
        },
    };

    const { children, ... withoutChildren } = accordionProps;

    return <AccordionItem children={ children } { ... withoutChildren }
                          key={ "channel-" + channel.props.id + "-accordion-item-" + index.toString() }/>;
}

export const ChannelsList: CommandFunctionComponent<ChannelListProps, ChannelListState> = ( props ) => {
    let channels: ChannelItemComponent[] = Array.isArray( props.children ) ? props.children : [ props.children ];

    // Helps to detect development errors.
    if ( channels.some( ( child ) => child.type !== ChannelItem ) ) {
        throw new Error( `<${ ChannelsList.name }> can accept only <${ ChannelItem.name }> as children` );
    }

    const [ channelsListState, setChannelsListState ] = useCommanderState<ChannelListState>( "App/ChannelsList", {
        channels: channels.map( ( channel ) => {
            return {
                ... channel,

                data: {
                    name: channel.props.name,
                },
            };
        } ),
    } );

    const setSelected = ( selected: { key: boolean } ) => {
        setChannelsListState( { selected } );
    };

    const channelsCommands = useCommanderComponent( "App/ChannelsList" );

    channelsListInteractions();

    return (
        <Accordion selected={ channelsListState.selected } setSelected={ setSelected }>
            { channelsListState.channels.map( ( i, index ) => toAccordionItem( i, channelsCommands, index ) ) }
        </Accordion>
    );
};

const $$ = withCommands<ChannelListProps, ChannelListState>( "App/ChannelsList", ChannelsList, {
    channels: [],
    selected: {},
}, [
    class EditRequest extends CommandBase {
        public static getName() {
            return "App/ChannelsList/EditRequest";
        }
    },
    class Remove extends CommandBase {
        public static getName() {
            return "App/ChannelsList/RemoveRequest";
        }
    },
    class SetName extends CommandBase<ChannelListState> {
        public static getName() {
            return "App/ChannelsList/SetName";
        }

        public apply( args: { id: string, name: string } ) {
            const channels = [ ... this.state.channels ]; // Create a copy of the channels array

            const channelIndex = channels.findIndex( ( c ) => c.props.id === args.id );

            if ( channelIndex !== -1 ) {
                // Create a new channel object with the updated data & replace it in the channels array
                channels[ channelIndex ] = {
                    ... channels[ channelIndex ],
                    data: {
                        ... channels[ channelIndex ].data,
                        name: args.name,
                    },
                };

                return this.setState( { channels } );
            }

        }
    }
] );

export default $$;

