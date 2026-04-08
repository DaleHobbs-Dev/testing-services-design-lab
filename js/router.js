import { Gateway } from "./components/Gateway.js";
import { SlatePortalPage } from "./pages/SlatePortalPage.js";
import { WebsiteDesignsPage } from "./pages/WebsiteDesignsPage.js";

export function renderApp(state) {
    switch (state.currentTopLevel) {
        case "slate":
            return SlatePortalPage(state);
        case "website":
            return WebsiteDesignsPage();
        case "gateway":
        default:
            return Gateway();
    }
}