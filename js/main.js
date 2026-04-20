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

function showFormToast() {
    const toast = document.querySelector(".form-toast");
    if (!toast) return;
    toast.style.display = "block";
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 4000);
}

function updateOptionalDetailsVisibility() {
    const optionalDetails = document.querySelector("#optionalDetails");
    if (!optionalDetails) return;
    const anyVisible = Array.from(
        document.querySelectorAll("[data-optional-section]")
    ).some(el => el.style.display === "block");
    optionalDetails.style.display = anyVisible ? "block" : "none";
}

function activateSection(sectionKey) {
    // Check the corresponding toggle if one exists
    const toggle = document.querySelector(`.toggle-checkbox[data-section="${sectionKey}"]`);
    if (toggle) toggle.checked = true;

    // Show the target element
    if (sectionKey === "email") {
        const el = document.querySelector(".email-workflow-wrapper");
        if (el) el.style.display = "block";
    } else if (sectionKey === "internal") {
        const el = document.querySelector(".internal-notes-wrapper");
        if (el) el.style.display = "block";
    } else {
        const el = document.querySelector(`[data-optional-section="${sectionKey}"]`);
        if (el) el.style.display = "block";
    }

    updateOptionalDetailsVisibility();
    showFormToast();
}

function handleTicketTypeChange(label) {
    // Hide all ticket-type-driven prompts and the "Other" field
    document.querySelectorAll(".ticket-type-prompt").forEach(p => {
        p.style.display = "none";
    });
    const otherRow = document.querySelector(".ticket-type-other-row");
    if (otherRow) otherRow.style.display = "none";

    if (label === "Other") {
        if (otherRow) otherRow.style.display = "grid";
        showFieldAlert("ticketType");
        return;
    }

    const prompt = document.querySelector(`.ticket-type-prompt[data-for-type="${label}"]`);
    if (prompt) {
        prompt.style.display = "flex";
        showFieldAlert("ticketType");
    }
}

function attachFormEvents() {
    // --- Context toggle switches ---
    document.querySelectorAll(".toggle-checkbox").forEach(cb => {
        cb.addEventListener("change", () => {
            const section = cb.dataset.section;

            if (section === "email") {
                const el = document.querySelector(".email-workflow-wrapper");
                if (el) el.style.display = cb.checked ? "block" : "none";
            } else if (section === "internal") {
                const el = document.querySelector(".internal-notes-wrapper");
                if (el) el.style.display = cb.checked ? "block" : "none";
            } else {
                const el = document.querySelector(`[data-optional-section="${section}"]`);
                if (el) el.style.display = cb.checked ? "block" : "none";
            }

            updateOptionalDetailsVisibility();
            if (cb.checked) showFormToast();
        });
    });

    // --- Contextual prompt buttons (ticket-type-triggered) ---
    document.querySelectorAll(".contextual-prompt-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            activateSection(e.currentTarget.dataset.activateSection);
        });
    });

    // --- Ticket type change ---
    const ticketTypeSelect = document.querySelector("#ticketType");
    if (ticketTypeSelect) {
        ticketTypeSelect.addEventListener("change", e => {
            const label = e.target.options[e.target.selectedIndex].text;
            handleTicketTypeChange(label);
        });
    }

    // --- Exam returned "Yes" -> reveal date field ---
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

    // --- Running log: append timestamped entry ---
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
