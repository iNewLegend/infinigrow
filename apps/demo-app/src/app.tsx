import React from "react";

import { Tab, Tabs } from "@nextui-org/tabs";
import { Card, CardBody } from "@nextui-org/card";

import { NextUIProvider } from "@nextui-org/system";

import { APIChannelsModule } from "@infinigrow/demo-app/src/api/api-channels-module";

import { API } from "@infinigrow/demo-app/src/api";

import AddChannel from "@infinigrow/demo-app/src/components/add-channel/add-channel";
import Channels from "@infinigrow/demo-app/src/components/channels/channels-list";
import Channel from "@infinigrow/demo-app/src/components/channel/channel-item";

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
        >
            <API.Component type={ Channel }/>
        </API.Component>
    );
}

function BudgetOverview() {
    return (
        <Card>
            <CardBody>
                <p>Tab 2 content</p>
            </CardBody>
        </Card>
    );
}

function App() {
    const layoutProps: LayoutProps = {
        header: {
            end: <AddChannel/>,
        }
    };

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
    };

    return (
        <NextUIProvider>
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

