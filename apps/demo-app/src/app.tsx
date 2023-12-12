import React, { useEffect } from "react";

import { Tab, Tabs } from "@nextui-org/tabs";

import { NextUIProvider } from "@nextui-org/system";

import { API } from "@infinigrow/api/src";

import { Button } from "@nextui-org/button";

import commandsManager from "@infinigrow/commander/commands-manager";

import { useAnyComponentCommands } from "@infinigrow/commander/use-commands";

import { APIChannelsModule } from "@infinigrow/demo-app/src/api/api-channels-module";

import AddChannel from "@infinigrow/demo-app/src/components/add-channel/add-channel";
import Channels from "@infinigrow/demo-app/src/components/channels/channels-list";
import Channel from "@infinigrow/demo-app/src/components//channel/channel-item-accordion.tsx";

import Layout from "@infinigrow/demo-app/src/ui-layout/layout";

import "@infinigrow/demo-app/src/app.scss";

import type { LayoutProps } from "@infinigrow/demo-app/src/ui-layout/layout";

API.register( APIChannelsModule );

function BudgetAllocation() {
    return (
        <API.Component
            fallback={ <div className="loading">Loading <span className="dots">◌</span></div> }
            module={ APIChannelsModule }
            type={ Channels }
            chainProps={ { view: "accordion" } }
        >
            <API.Component type={ Channel }/>
        </API.Component>
    );
}

function BudgetOverview() {
    return (
        <API.Component
            fallback={ <div className="loading">Loading <span className="dots">◌</span></div> }
            module={ APIChannelsModule }
            type={ Channels }
            chainProps={ { view: "table" } }
        >
            <API.Component type={ Channel }/>
        </API.Component>
    );
}

function App() {
    const layoutProps: LayoutProps = {
        header: {
            end: <AddChannel/>,
        }
    };

    const [ selectedTab, setSelectedTab ] = React.useState( location.hash.replace( "#", "" ) );

    useEffect( () => {
        const addChannel = useAnyComponentCommands( "App/AddChannel" )[ 0 ],
            addChannelId = {
                commandName: "App/AddChannel",
                componentName: "App/AddChannel",
                componentNameUnique: addChannel.componentNameUnique,
            };

        if ( location.hash === "#allocation/add-channel" ) {
            location.hash = "#allocation";
            setSelectedTab( "allocation" );

            setTimeout( () => {
                commandsManager.run(  addChannelId, {} );
            }, 1000 );
        } else if ( location.hash === "#overview" ) {
            commandsManager.hook( addChannelId, () => {
                commandsManager.unhookWithinComponent( addChannelId.componentNameUnique );

                location.hash = "#allocation/add-channel";

                setSelectedTab( "allocation" );
            } );
        } else {
            commandsManager.unhookWithinComponent( addChannelId.componentNameUnique );
        }

    }, [ location.hash ] );

    const tabsProps = {
        classNames: {
            base: "tabs",
            tabList: "list",
            tab: "tab",
            cursor: "cursor",
        },
        items: [
            { id: "allocation", title: "Budget Allocation", content: <BudgetAllocation/> },
            { id: "overview", title: "Budget Overview", content: <BudgetOverview/> },
        ],
        selectedKey: selectedTab,
        onSelectionChange: ( id: React.Key ) => {
            if ( ! location.hash.includes( id.toString() ) ) {
                setSelectedTab( id.toString() );

                location.hash = id.toString();
            }
        }
    };

    return (
        <NextUIProvider>
            <Button onClick={ () => {
                // Do not let the rescue callback to run
                window.onbeforeunload = null;

                localStorage.clear();
                location.reload();
            } } className="absolute top-0 right-0 border-none" variant="bordered" disableAnimation={ true }
                    radius={ "none" }>Reset Demo</Button>

            <Layout { ... layoutProps }>
                <Tabs { ... tabsProps }> {
                    tabsProps.items.map( ( tab ) => (
                        <Tab key={ tab.id } title={ tab.title }>
                            { tab.content }
                        </Tab>
                    ) )
                }
                </Tabs>
            </Layout>
        </NextUIProvider>
    );
}

export default App;

