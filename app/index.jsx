import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";

import Bootstrap from "bootstrap";

/*
 * Uses React to render the main application component. React is used for mturk-surveygen because
 * it makes it easier to make a single page application, which is especially useful to make the electron
 * desktop application look and work smoothly.
 */
ReactDOM.render(<App />, document.getElementById("root"));
