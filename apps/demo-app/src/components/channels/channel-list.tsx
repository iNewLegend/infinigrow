import React from "react";

import { CommandBase } from "@infinigrow/commander/command-base";

import { withCommands } from "@infinigrow/commander/with-commands";
import { useComponentCommands } from "@infinigrow/commander/use-commands";

import { channelInteractions } from "@infinigrow/demo-app/src/components/channels/channel-interactions";

import ChannelItem from "@infinigrow/demo-app/src/components/channels/channel-item.tsx";

import Accordion from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion";
import AccordionItem from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";

import type { ChannelListProps, ChannelItemComponent } from "@infinigrow/demo-app/src/components/channels/channel-types";

import type { AccordionItemProps } from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";

export function toAccordionItem(
    channel: ChannelItemComponent,
    channelsCommands: ReturnType<typeof useComponentCommands>,
    index: number,
): React.ReactComponentElement<typeof AccordionItem> {
    const channelInternalProps = {
        name: channel.props.name,
    };

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
                    "App/ChannelList/EditRequest",
                    { channel, }
                ),
            },
            remove: {
                label: "Remove",
                color: "danger",
                action: () => channelsCommands.run(
                    "App/ChannelList/Remove",
                    { channel, }
                ),
            },
        },
    };

    const { children, ... withoutChildren } = accordionProps;

    return <AccordionItem children={ children } { ... withoutChildren }
                          key={ "channel-" + channel.props.id + "-accordion-item-" + index.toString() }/>;
}

export const ChannelList: React.FC<ChannelListProps> = ( props ) => {
    let channels: ChannelItemComponent[] = Array.isArray( props.children ) ? props.children : [ props.children ];

    // Helps to detect development errors.
    if ( channels.some( ( child ) => child.type !== ChannelItem ) ) {
        throw new Error( `<${ ChannelList.name }> can accept only <${ ChannelItem.name }> as children` );
    }

    const [ selected, setSelected ] = React.useState<{ [ key: string ]: boolean }>( {} );

    const [ channelsState, setChannelsState ] = React.useState<ChannelItemComponent[]>( channels );

    const channelsCommands = useComponentCommands( "App/ChannelList" );

    channelInteractions( {
        setSelected,
        setChannelsState
    } );

    return (
        <Accordion selected={ selected } setSelected={ setSelected }>
            { channelsState.map( ( i, index ) => toAccordionItem( i, channelsCommands, index ) ) }
        </Accordion>
    );
};

const $$ = withCommands( "App/ChannelList", ChannelList, [
    class EditRequest extends CommandBase {
        public static getName() {
            return "App/ChannelList/EditRequest";
        }
    },
    class Remove extends CommandBase {
        public static getName() {
            return "App/ChannelList/Remove";
        }
    }
] );

export default $$;

