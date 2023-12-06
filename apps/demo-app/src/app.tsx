import React from "react";

import { Tab, Tabs } from "@nextui-org/tabs";
import { Card, CardBody } from "@nextui-org/card";

import { NextUIProvider } from "@nextui-org/system";

import AddChannel from "@infinigrow/demo-app/src/ui-command-able/add-channel/add-channel";

import AffiliateProgramPNG from "@infinigrow/demo-app/src/ui-theme/images/affiliate-program.png";

import Layout from "@infinigrow/demo-app/src/ui-layout/layout";

import Channels from "@infinigrow/demo-app/src/modules/channels/channels";
import Channel from "@infinigrow/demo-app/src/modules/channel/channel";

import "@infinigrow/demo-app/src/app.scss";

import type { LayoutProps } from "@infinigrow/demo-app/src/ui-layout/layout";

function Main() {
    return (
        <Tabs classNames={ {
            base: "tabs",
            tabList: "list",
            tab: "tab",
            cursor: "cursor",
        } }>
            <Tab title="Tab 1">
                <Channels channels={
                    <>
                        <Channel
                            id="paid-reviews"
                            name="Paid reviews"
                            icon={ AffiliateProgramPNG }
                        />
                        <Channel
                            id="paid-reviews2"
                            name="Paid reviews 2"
                            icon={ AffiliateProgramPNG }
                        />
                    </>
                }/>
            </Tab>
            <Tab title="Tab 2">
                <Card>
                    <CardBody>
                        <p>Tab 2 content</p>
                    </CardBody>
                </Card>
            </Tab>
        </Tabs>
    );
}

function App() {
    const layoutProps: LayoutProps = {
        header: {
            end: <AddChannel/>,
        }
    };

    return (
        <NextUIProvider>
                <Layout { ... layoutProps }>
                    <Main/>
                </Layout>
        </NextUIProvider>
    );
}

export default App;

