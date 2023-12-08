import React from "react";

import { CommandBase } from "@infinigrow/commander/command-base";

import { withCommands } from "@infinigrow/commander/with-commands";
import { useComponentCommands } from "@infinigrow/commander/use-commands";

import { channelsInteractions } from "@infinigrow/demo-app/src/components/channels/channels-interactions";

import ChannelItem from "@infinigrow/demo-app/src/components/channel/channel-item";

import Accordion from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion";
import AccordionItem from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

import type { AccordionItemProps } from "@infinigrow/demo-app/src/ui-command-able/accordion/accordion-item";

import type { ChannelListProps } from "@infinigrow/demo-app/src/components/channels/channels-types";
import type { ChannelItemComponent } from "@infinigrow/demo-app/src/components/channel/channel-types";

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
                    "App/ChannelsList/EditRequest",
                    { channel, }
                ),
            },
            remove: {
                label: "Remove",
                color: "danger",
                action: () => channelsCommands.run(
                    "App/ChannelsList/Remove",
                    { channel, }
                ),
            },
        },
    };

    const { children, ... withoutChildren } = accordionProps;

    return <AccordionItem children={ children } { ... withoutChildren }
                          key={ "channel-" + channel.props.id + "-accordion-item-" + index.toString() }/>;
}

export const ChannelsList: CommandFunctionComponent<ChannelListProps> = ( props ) => {
    let channels: ChannelItemComponent[] = Array.isArray( props.children ) ? props.children : [ props.children ];

    // Helps to detect development errors.
    if ( channels.some( ( child ) => child.type !== ChannelItem ) ) {
        throw new Error( `<${ ChannelsList.name }> can accept only <${ ChannelItem.name }> as children` );
    }

    const [ selected, setSelected ] = React.useState<{ [ key: string ]: boolean }>( {} );

    const [ channelsState, setChannelsState ] = React.useState<ChannelItemComponent[]>( channels );

    const channelsCommands = useComponentCommands( "App/ChannelsList" );

    channelsInteractions( {
        setSelected,
        setChannelsState
    } );

    return (
        <Accordion selected={ selected } setSelected={ setSelected }>
            { channelsState.map( ( i, index ) => toAccordionItem( i, channelsCommands, index ) ) }
        </Accordion>
    );
};

const $$ = withCommands( "App/ChannelsList", ChannelsList, [
    class EditRequest extends CommandBase {
        public static getName() {
            return "App/ChannelsList/EditRequest";
        }
    },
    class Remove extends CommandBase {
        public static getName() {
            return "App/ChannelsList/Remove";
        }
    }
] );

export default $$;

