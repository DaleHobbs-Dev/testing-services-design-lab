import { Gateway } from "./components/Gateway.js";
import { SlatePortalPage } from "./pages/SlatePortalPage.js";
import { ProfileSelectionPage } from "./pages/ProfileSelectionPage.js";
import { WebsiteDesignsPage } from "./pages/WebsiteDesignsPage.js";

export function renderApp(state) {
    switch (state.currentTopLevel) {
        case "slate":
            if (!state.currentSlateUser) {
                return ProfileSelectionPage(state);
            }
            return SlatePortalPage(state);
        case "website":
            return WebsiteDesignsPage();
        case "gateway":
        default:
            return Gateway();
    }
}
