import type { EnforceKeys } from "@infinigrow/demo-app/src/utils";
import type { ChannelMetaData, ChannelState } from "@infinigrow/demo-app/src/components/channel/channel-types";
import { InputProps } from "@nextui-org/input";
import React from "react";

export const META_DATA_KEYS: EnforceKeys<ChannelMetaData> = {
    id: true,
    icon: true,
    name: true,
};

export const CHANNEL_LIST_STATE_DATA: EnforceKeys<ChannelState> = {
    allocation: true,
    baseline: true,
    frequency: true,

    breaks: true,

    // Visual
    breakElements: false,

    // Saved separately
    meta: false
};

export const CHANNEL_LIST_STATE_DATA_WITH_META: EnforceKeys<ChannelState> = {
    allocation: true,
    baseline: true,
    frequency: true,

    breaks: true,

    // Visual
    breakElements: false,

    // Saved separately
    meta: true
};

export const DEFAULT_CHANNEL_BREAK_INPUT_PROPS: InputProps = {
    classNames: {
        base: "input",
        mainWrapper: "wrapper",
        inputWrapper: "trigger",
        label: "currency",
    },
    type: "string",
    variant: "bordered",
    radius: "none",
    labelPlacement: "outside",
    placeholder: "0",
    startContent: (
        <div className="pointer-events-none flex items-center">
        <span className="text-slate-700 text-sm font-medium leading-[21px]">$</span>
            </div>
    ),
};