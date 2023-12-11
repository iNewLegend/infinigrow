import React from "react";

import { useCommanderState, useCommanderComponent } from "@infinigrow/commander/use-commands";
import { ChannelListState } from "./channels-types.ts";
import * as util from "util";

export const ChannelsListTable: React.FC<{}> = () => {
    const [ getChannelsListState, setChannelsListState ] = useCommanderState<ChannelListState>( "App/ChannelsList" );

    const channelsCommands = useCommanderComponent( "App/ChannelsList" );

    const channelsListState = getChannelsListState();

    return (
        <>
            {
                channelsListState.channels.map( ( channel, index ) => {
                    return (
                        <tr key={ "channel-" + channel.props.meta.id + "-table-row-" + index.toString() }>
                            <td>{ channel.props.meta.name }</td>
                            <td>{ channel.props.meta.icon }</td>
                            <td>
                                <button onClick={ () => channelsCommands.run(
                                    "App/ChannelsList/EditRequest",
                                    { channel, }
                                ) }>Edit</button>
                                <button onClick={ () => channelsCommands.run(
                                    "App/ChannelsList/RemoveRequest",
                                    { channel, }
                                ) }>Remove</button>
                            </td>
                        </tr>
                    );
                } )
            }
        </>
    );
};
