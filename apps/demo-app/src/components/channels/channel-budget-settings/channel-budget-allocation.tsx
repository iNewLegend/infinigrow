import React from "react";

import { ButtonGroup, Button } from "@nextui-org/button";

import { useCommand } from "@infinigrow/commander/use-commands";

import { Info } from "@infinigrow/demo-app/src/ui-theme/symbols";

import type { ButtonProps } from "@nextui-org/button";

import type {
    BudgetAllocationType,
    ChannelBudgetAllocationProps
} from "@infinigrow/demo-app/src/components/channels/channel-budget-settings/channel-budget-types";

const DEFAULT_BUDGET_ALLOCATIONS: Record<BudgetAllocationType, string> = {
    "equal": "Equal",
    "manual": "Manual"
};

export function getChannelBudgetAllocationLabel( budgetAllocation: BudgetAllocationType ) {
    return DEFAULT_BUDGET_ALLOCATIONS[ budgetAllocation ];
}

const DEFAULT_PROPS: ButtonProps = {
    className: "button",
    variant: "ghost",
    radius: "none"
};

export function ChannelBudgetAllocationButton( props: ButtonProps & {
    current: BudgetAllocationType,
    allocation: BudgetAllocationType;
} ) {
    const { current, allocation, ... buttonProps } = props;

    const command = useCommand( "App/ChannelItem/SetAllocation" );

    return (
        <Button
            { ... DEFAULT_PROPS }
            { ... buttonProps }
            data-active={ allocation === current }
            disabled={ allocation === current }
            onClick={ () => command.run( { value: current } ) }
        >
            { getChannelBudgetAllocationLabel( current ) }
        </Button>
    );
}

export function ChannelBudgetAllocation( props: ChannelBudgetAllocationProps ) {
    return (
        <div className="channel-budget-allocation">
            <Info>Budget Allocation</Info>
            <ButtonGroup className="button-group">
                { Object.keys( DEFAULT_BUDGET_ALLOCATIONS ).map( ( key ) => (
                    <ChannelBudgetAllocationButton
                        key={ key }
                        current={ key as BudgetAllocationType }
                        { ... props }
                    />
                ) ) }
            </ButtonGroup>
        </div>
    );
}
