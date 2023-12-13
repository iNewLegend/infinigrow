import { API } from "@infinigrow/api/src";

import ChannelsList from "@infinigrow/demo-app/src/components/channels/channels-list";
import ChannelItemAccordion from "@infinigrow/demo-app/src/components/channel/channel-item-accordion";

import { APIChannelsModule } from "@infinigrow/demo-app/src/api/api-channels-module";

export default function BudgetAllocation() {
    return (
        <API.Component
            fallback={ <div className="loading">Loading <span className="dots">◌</span></div> }
            module={ APIChannelsModule }
            type={ ChannelsList }
            chainProps={ { view: "accordion" } }
        >
            <API.Component type={ ChannelItemAccordion }/>
        </API.Component>
    );
}
