import type { EnforceKeys } from "@infinigrow/demo-app/src/utils";
import type { ChannelMetaData, ChannelState } from "@infinigrow/demo-app/src/components/channel/channel-types";

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
