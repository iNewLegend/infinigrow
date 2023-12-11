import React from "react";

import { useCommanderState, useCommanderComponent } from "@infinigrow/commander/use-commands";

import ChannelItemTable from "@infinigrow/demo-app/src/components/channel/channel-item-table.tsx";

import "@infinigrow/demo-app/src/components/channels/_channels-list-table.scss";

import type { ChannelListState } from "@infinigrow/demo-app/src/components/channels/channels-types.ts";

export const ChannelsListTable: React.FC<{}> = () => {
    const [ getChannelsListState, setChannelsListState ] = useCommanderState<ChannelListState>( "App/ChannelsList" );

    const channelsCommands = useCommanderComponent( "App/ChannelsList" );

    const channelsListState = getChannelsListState();

    return (
        <div className="channel-list-table pt-[45px]">
            {
                channelsListState.channels.map( ( channel, index ) => {
                    return (
                        <div key={index} className="channel-list-table-row">
                            <div className="channel-list-table-heading">
                                <div className="channel-list-table-heading-text">
                                    Channel #{ index + 1 }
                                </div>

                                <div className="channel-list-table-heading-title">
                                    <img src={ channel.props.meta.icon } alt={ channel.props.meta.name }/>
                                    <span>{ channel.props.meta.name }</span>
                                </div>
                            </div>
                            <div className="channel-list-table-separator"/>

                            <ChannelItemTable { ... channel.props } key={ channel.props.meta.id }/>
                        </div>
                    );
                } )
            }
        </div>
    );
};
