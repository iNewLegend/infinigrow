import React from "react";

import { withCommands } from "@infinigrow/commander/with-commands";

import {
    ChannelBudgetFrequency,
    ChannelBudgetBaseline,
    ChannelBudgetAllocation
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings";

import type {
    ChannelBudgetFrequencyProps,
    BudgetAllocationType
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings";

import type { ChannelItemProps } from "@infinigrow/demo-app/src/components/channels/channel-types";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

export const ChannelItem: CommandFunctionComponent<ChannelItemProps> = ( props ) => {
    const [ frequency, setFrequency ] =
        React.useState<ChannelBudgetFrequencyProps["frequency"]>( "annually" );

    const [ baseline, setBaseline ] = React.useState<string>( "0" );

    const [ allocation, setAllocation ] = React.useState<BudgetAllocationType>( "equal" );

    return (
        <div className="channel-item">
            <div className="channel-budget-settings">
                <ChannelBudgetFrequency frequency={ frequency } setFrequency={ setFrequency }/>
                <ChannelBudgetBaseline frequency={ frequency } baseline={ baseline } setBaseline={ setBaseline }/>
                <ChannelBudgetAllocation allocation={ allocation } setAllocation={ setAllocation }/>
            </div>
        </div>
    );
};

const $$ = withCommands( "App/ChannelItem", ChannelItem, [] );

export default $$;
