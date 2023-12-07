import React from "react";

export default function ChannelInternal( props: {
    name: string,
} ) {

    return (
            <h1>Tab 1 content my name is { props.name }</h1>
    );
}
