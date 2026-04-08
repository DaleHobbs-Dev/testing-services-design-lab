import { state } from "./state.js";
import { renderApp } from "./router.js";

const app = document.querySelector("#app");

function render() {
    app.innerHTML = renderApp(state);
    attachEvents();
}

function attachEvents() {
    document.querySelectorAll("[data-nav]").forEach(button => {
        button.addEventListener("click", event => {
            const destination = event.currentTarget.dataset.nav;
            state.currentTopLevel = destination;
            render();
        });
    });

    document.querySelectorAll("[data-view]").forEach(button => {
        button.addEventListener("click", event => {
            state.currentSlateView = event.currentTarget.dataset.view;
            render();
        });
    });

    document.querySelectorAll("[data-accordion]").forEach(button => {
        button.addEventListener("click", event => {
            const accordionId = event.currentTarget.dataset.accordion;
            state.openAccordion =
                state.openAccordion === accordionId ? "" : accordionId;
            render();
        });
    });
}

render();