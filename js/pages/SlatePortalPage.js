import { Header } from "../components/Header.js";
import { Sidebar } from "../components/Sidebar.js";
import { FindStudentView } from "./slate/FindStudentView.js";
import { TicketingDashboardView } from "./slate/TicketingDashboardView.js";
import { TicketingFormView } from "./slate/TicketingFormView.js";

function renderSlateView(state) {
    switch (state.currentSlateView) {
        case "ticketing-dashboard":
            return TicketingDashboardView();
        case "ticketing-form":
            return TicketingFormView(state);
        case "find-student":
        default:
            return FindStudentView();
    }
}

export function SlatePortalPage(state) {
    return `
    ${Header(state)}

    <main class="portal-layout">
      ${Sidebar(state)}

      <section class="portal-main">
        ${renderSlateView(state)}
      </section>
    </main>
  `;
}