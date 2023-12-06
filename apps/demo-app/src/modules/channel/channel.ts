import type React from "react";

export interface ChannelPropsPublic {
    id: string;
    name: string;
    icon: string;

    children?: ChannelComponent | ChannelComponent[];
}

export interface ChannelsProps {
    channels: ChannelComponent | ChannelComponent[],
}

export type ChannelComponent = React.ReactComponentElement<typeof Channel>;

export default function Channel( _props: ChannelPropsPublic ): React.ReactElement {
    throw new Error( "Sugar, it should never reach here" );
}
