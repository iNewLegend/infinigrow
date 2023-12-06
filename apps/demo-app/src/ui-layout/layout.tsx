import React from "react";

import "@infinigrow/demo-app/src/ui-layout/_layout.scss";

import Header from "@infinigrow/demo-app/src/ui-layout/header";

export interface LayoutProps {
    children?: React.JSX.Element;
    header : {
        end: React.JSX.Element;
    }
}

export default function Layout( props: LayoutProps ) {
    return (
        <div className="layout">
            <Header { ... props.header } />

            <div className="content">
                { props.children }
            </div>
        </div>
    );
}

