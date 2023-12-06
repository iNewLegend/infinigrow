import React from "react";
import ReactDOM from "react-dom/client";

import App from "@infinigrow/demo-app/src/app";

import "@infinigrow/demo-app/src/index.scss";

ReactDOM.createRoot( document.getElementById( "root" )! ).render(
        <React.StrictMode>
            <App/>
        </React.StrictMode>,
);

/*

ReactDOM.createRoot( document.getElementById( "root" )! ).render(
        <React.StrictMode>
                <App/>
        </React.StrictMode>,
);

 */
