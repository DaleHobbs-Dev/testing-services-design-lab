import { Header } from "../components/Header.js";
import { Sidebar } from "../components/Sidebar.js";
import { FindStudentView } from "./slate/FindStudentView.js";
import { TicketingDashboardView } from "./slate/TicketingDashboardView.js";
import { TicketingFormView } from "./slate/TicketingFormView.js";
import { TrainingFormView } from "./slate/TrainingFormView.js";
import { ViewCalendarView } from "./slate/calendar/ViewCalendarView.js";
import { EditCalendarView } from "./slate/calendar/EditCalendarView.js";

function renderSlateView(state) {
    switch (state.currentSlateView) {
        case "ticketing-dashboard":
            return TicketingDashboardView();
        case "ticketing-form":
            return TicketingFormView(state);
        case "training-form":
            return TrainingFormView(state);
        case "view-calendar":
            return ViewCalendarView(state);
        case "edit-calendar":
            return EditCalendarView(state);
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