/* @refresh reload */
import { render } from "solid-js/web";
import ConfigPage from "./views/ConfigPage/index.tsx";

const root = document.getElementById("root");

render(() => <ConfigPage />, root!);
