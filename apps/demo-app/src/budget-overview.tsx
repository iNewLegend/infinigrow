import { API } from "@infinigrow/api/src";

import ChannelsList from "@infinigrow/demo-app/src/components/channels/channels-list";
import ChannelItemTable from "@infinigrow/demo-app/src/components/channel/channel-item-table";

import { APIChannelsModule } from "@infinigrow/demo-app/src/api/api-channels-module";

export default function BudgetOverview() {
    return (
        <API.Component
            fallback={ <div className="loading">Loading <span className="dots">◌</span></div> }
            module={ APIChannelsModule }
            type={ ChannelsList }
            chainProps={ { view: "table" } }
        >
            <API.Component type={ ChannelItemTable }/>
        </API.Component>
    );
}
