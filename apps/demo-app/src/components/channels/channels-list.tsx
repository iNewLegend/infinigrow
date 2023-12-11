import React from "react";

import { CommandBase } from "@infinigrow/commander/command-base";

import { withCommands } from "@infinigrow/commander/with-commands";
import { useCommanderState } from "@infinigrow/commander/use-commands";

import { META_DATA_KEYS } from "@infinigrow/demo-app/src/components/channel/channel-constants";

import ChannelItem from "@infinigrow/demo-app/src/components//channel/channel-item-accordion.tsx";

import { pickEnforcedKeys } from "@infinigrow/demo-app/src/utils";

import { ChannelsListAccordion } from "@infinigrow/demo-app/src/components//channels/channels-list-accordion.tsx";

import { ChannelsListTable } from "@infinigrow/demo-app/src/components/channels/channels-list-table";

import type { ChannelItemAccordionComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

import type { ChannelListProps, ChannelListState } from "@infinigrow/demo-app/src/components/channels/channels-types";

export const ChannelsList: CommandFunctionComponent<ChannelListProps, ChannelListState> = ( props ) => {
    let channels: ChannelItemAccordionComponent[] = Array.isArray( props.children ) ? props.children : [ props.children ];

    // Helps to detect development errors.
    if ( channels.some( ( child ) => child.type !== ChannelItem ) ) {
        throw new Error( `<${ ChannelsList.name }> can accept only <${ ChannelItem.name }> as children` );
    }

    useCommanderState<ChannelListState>( "App/ChannelsList", {
        channels: channels.map( ( channel ) => {
            return {
                ... channel,

                // Exposing meta, for commands to use
                meta: pickEnforcedKeys( channel.props.meta, META_DATA_KEYS )
            };
        } ),
    } );

    switch ( props.view ) {
        case "accordion":
            return ( <ChannelsListAccordion/> );

        case "table":
            return ( <ChannelsListTable/> );

        default:
            throw new Error( `Unknown view: ${ props.view }` );
    }
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

            const channelIndex = channels.findIndex( ( c ) => c.props.meta.id === args.id );

            if ( channelIndex !== -1 ) {
                // Create a new channel object with the updated data & replace it in the channels array
                channels[ channelIndex ] = {
                    ... channels[ channelIndex ],
                    props: {
                        meta: {
                            ... channels[ channelIndex ].props.meta,
                            name: args.name,
                        }
                    },
                };

                return this.setState( { channels } );
            }
        }
    }
] );

export default $$;

