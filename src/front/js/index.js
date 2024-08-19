//import react into the bundle
import React from "react";
//import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import Layout from './layout';

const container = document.getElementById('app');
const root = createRoot(container); // createRoot instead of ReactDOM.render
root.render(<Layout />);


//include your index.scss file into the bundle
import "../styles/index.css";

//import your own components
//import Layout from "./layout";

//render your react application
//ReactDOM.render(<Layout />, document.querySelector("#app"));
