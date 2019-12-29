import React from "react";
import ReactDOM from "react-dom";

function HelloMessage({name}) {
    return <div>Hello {name}!</div>;
}

var mountNode = document.getElementById("app");
ReactDOM.render(<HelloMessage name="World" />, mountNode);