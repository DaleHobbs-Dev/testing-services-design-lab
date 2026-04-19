import { state } from "./state.js";
import { renderApp } from "./router.js";

const app = document.querySelector("#app");

function render() {
    app.innerHTML = renderApp(state);
    attachEvents();
}

function attachEvents() {
    // --- Navigation ---
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

    // --- Profile selection ---
    document.querySelectorAll("[data-profile]").forEach(card => {
        card.addEventListener("click", e => {
            const userId = parseInt(e.currentTarget.dataset.profile);
            const user = (state.db?.employees || []).find(emp => emp.id === userId);
            if (user) {
                state.currentSlateUser = user;
                localStorage.setItem("slateUser", JSON.stringify(user));
                render();
            }
        });
    });

    // --- Change user (clears localStorage and returns to profile selection) ---
    const changeUserBtn = document.querySelector("[data-action='change-user']");
    if (changeUserBtn) {
        changeUserBtn.addEventListener("click", () => {
            state.currentSlateUser = null;
            localStorage.removeItem("slateUser");
            render();
        });
    }

    // --- Form conditionals (direct DOM manipulation, no re-render) ---
    attachFormEvents();
}

function showFieldAlert(selectId) {
    const select = document.querySelector(`#${selectId}`);
    if (!select) return;
    const alert = select.closest(".field-wrap")?.querySelector(".field-alert");
    if (!alert) return;
    alert.style.display = "inline-flex";
    clearTimeout(alert._hideTimer);
    alert._hideTimer = setTimeout(() => {
        alert.style.display = "none";
    }, 4000);
}

function hideFieldAlert(selectId) {
    const select = document.querySelector(`#${selectId}`);
    if (!select) return;
    const alert = select.closest(".field-wrap")?.querySelector(".field-alert");
    if (!alert) return;
    clearTimeout(alert._hideTimer);
    alert.style.display = "none";
}

function attachFormEvents() {
    // Ticket type "Other" -> reveal description field
    const ticketTypeSelect = document.querySelector("#ticketType");
    if (ticketTypeSelect) {
        ticketTypeSelect.addEventListener("change", e => {
            const otherRow = document.querySelector(".ticket-type-other-row");
            if (otherRow) {
                const label = e.target.options[e.target.selectedIndex].text;
                const isOther = label === "Other";
                otherRow.style.display = isOther ? "grid" : "none";
                isOther ? showFieldAlert("ticketType") : hideFieldAlert("ticketType");
            }
        });
    }

    // Status "On Hold" -> reveal reason for delay
    const statusSelect = document.querySelector("#ticketStatus");
    if (statusSelect) {
        statusSelect.addEventListener("change", e => {
            const delayRow = document.querySelector(".reason-delay-row");
            if (delayRow) {
                const label = e.target.options[e.target.selectedIndex].text;
                const isOnHold = label === "On Hold";
                delayRow.style.display = isOnHold ? "grid" : "none";
                isOnHold ? showFieldAlert("ticketStatus") : hideFieldAlert("ticketStatus");
            }
        });
    }

    // Origin source "Created from Irregularity" -> reveal irregularity section
    const originSelect = document.querySelector("#originSource");
    if (originSelect) {
        originSelect.addEventListener("change", e => {
            const irregSection = document.querySelector(".irregularity-section");
            if (irregSection) {
                const label = e.target.options[e.target.selectedIndex].text;
                const isIrreg = label.includes("Irregularity");
                irregSection.style.display = isIrreg ? "block" : "none";
                isIrreg ? showFieldAlert("originSource") : hideFieldAlert("originSource");
            }
        });
    }

    // Requires email -> reveal email workflow section
    const requiresEmailSelect = document.querySelector("#requiresEmail");
    if (requiresEmailSelect) {
        requiresEmailSelect.addEventListener("change", e => {
            const emailSection = document.querySelector(".email-workflow-section");
            if (emailSection) {
                const needsEmail = e.target.value === "yes";
                emailSection.style.display = needsEmail ? "block" : "none";
                needsEmail ? showFieldAlert("requiresEmail") : hideFieldAlert("requiresEmail");
            }
        });
    }

    // Exam returned "Yes" -> reveal date returned field
    const examReturnedSelect = document.querySelector("#examReturned");
    if (examReturnedSelect) {
        examReturnedSelect.addEventListener("change", e => {
            const dateRow = document.querySelector(".exam-returned-date-row");
            if (dateRow) {
                const wasReturned = e.target.value === "yes";
                dateRow.style.display = wasReturned ? "grid" : "none";
                wasReturned ? showFieldAlert("examReturned") : hideFieldAlert("examReturned");
            }
        });
    }

    // External contact toggle
    const addContactBtn = document.querySelector("[data-action='add-external-contact']");
    if (addContactBtn) {
        addContactBtn.addEventListener("click", () => {
            const fields = document.querySelector(".external-contact-fields");
            if (fields) {
                const isHidden = fields.style.display === "none" || fields.style.display === "";
                fields.style.display = isHidden ? "block" : "none";
                addContactBtn.textContent = isHidden
                    ? "- Remove external contact"
                    : "+ Add external contact";
            }
        });
    }

    // Running log: append timestamped entry to bottom of textarea
    const addLogBtn = document.querySelector("[data-action='add-log-entry']");
    if (addLogBtn) {
        addLogBtn.addEventListener("click", () => {
            const textarea = document.querySelector("#logNotes");
            if (textarea) {
                const today = new Date();
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const day = String(today.getDate()).padStart(2, "0");
                const year = today.getFullYear();
                const timestamp = `${month}/${day}/${year} \u2013 `;
                const current = textarea.value.trimEnd();
                textarea.value = current ? current + "\n" + timestamp : timestamp;
                textarea.focus();
                textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }
        });
    }
}

async function loadData() {
    const response = await fetch("./database.json");
    state.db = await response.json();
}

async function init() {
    await loadData();

    const savedUser = localStorage.getItem("slateUser");
    if (savedUser) {
        try {
            state.currentSlateUser = JSON.parse(savedUser);
        } catch {
            localStorage.removeItem("slateUser");
        }
    }

    render();
}

init();
