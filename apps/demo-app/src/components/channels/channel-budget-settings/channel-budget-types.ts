import type React from "react";

// Allocation
export type BudgetAllocationType = "equal" | "manual";

export type ChannelBudgetAllocationProps = {
    setAllocation: React.Dispatch<React.SetStateAction<BudgetAllocationType>>,
    allocation: BudgetAllocationType;
};

// Frequency
export type ChannelBudgetFrequencyPossibleValues = "annually" | "monthly" | "quarterly";

export type ChannelBudgetFrequencyProps = {
    frequency: ChannelBudgetFrequencyPossibleValues,
    setFrequency: React.Dispatch<React.SetStateAction<ChannelBudgetFrequencyPossibleValues>>,
};

// Baseline
export type ChannelBudgetBaselineProps = {
    frequency: ChannelBudgetFrequencyProps["frequency"],
    baseline: string | undefined,
    setBaseline: React.Dispatch<React.SetStateAction<string>>,
};
