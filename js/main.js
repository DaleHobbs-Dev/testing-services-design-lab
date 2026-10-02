import { state } from "./state.js";
import { renderApp } from "./router.js";
import { validateScheduleBlocks } from "./utils/calendarDates.js";
import {
    addMonth, addScheduleEntry, addExamEntry, deleteScheduleEntry, deleteExamEntry
} from "./data/calendarStore.js";

const app = document.querySelector("#app");

window.addEventListener("afterprint", () => {
    document.body.classList.remove("is-printing-calendar");
});

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

    // --- Calendar ---
    attachCalendarEvents();
    attachCalendarEditConditionals();
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

    // --- Training form: show objectives for each selected exam ---
    document.querySelectorAll(".training-exam-checkbox").forEach(cb => {
        cb.addEventListener("change", () => {
            const group = document.querySelector(`[data-training-test-type="${cb.value}"]`);
            if (group) group.style.display = cb.checked ? "block" : "none";

            const anySelected = document.querySelector(".training-exam-checkbox:checked");
            const emptyHint = document.querySelector(".training-objectives-empty");
            if (emptyHint) emptyHint.style.display = anySelected ? "none" : "block";
        });
    });

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

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

function showCalendarError(id, message) {
    const el = document.querySelector(`#${id}`);
    if (!el) return;
    el.textContent = message;
    el.style.display = "inline-flex";
}

function clearCalendarError(id) {
    const el = document.querySelector(`#${id}`);
    if (!el) return;
    el.style.display = "none";
}

function printCalendar() {
    const source = document.querySelector("#calendarPrintTarget");
    const printArea = document.querySelector("#calendarPrintArea");
    if (!source || !printArea) return;

    printArea.innerHTML = source.innerHTML;
    document.body.classList.add("is-printing-calendar");
    window.print();
}

function handleCreateMonth() {
    const monthSelect = document.querySelector("#newMonthMonth");
    const yearInput = document.querySelector("#newMonthYear");
    if (!monthSelect || !yearInput) return;

    const month = parseInt(monthSelect.value);
    const year = parseInt(yearInput.value);
    const label = `${monthSelect.options[monthSelect.selectedIndex].text} ${year}`;

    const record = addMonth(state.db, year, month, label);
    if (!record) {
        showCalendarError("addMonthAlert", "That month has already been added.");
        return;
    }

    state.calendar.edit.year = year;
    state.calendar.edit.month = month;
    state.calendar.edit.selectedDate = null;
    state.calendar.edit.addingMonth = false;
    render();
}

function handleAddExam() {
    const testTypeSelect = document.querySelector("#newExamTestType");
    const startInput = document.querySelector("#newExamStart");
    const endInput = document.querySelector("#newExamEnd");
    if (!testTypeSelect || !startInput || !endInput) return;

    clearCalendarError("examFormError");

    if (!startInput.value || !endInput.value || endInput.value <= startInput.value) {
        showCalendarError("examFormError", "End time must be after start time.");
        return;
    }

    addExamEntry(parseInt(testTypeSelect.value), state.calendar.edit.selectedDate, startInput.value, endInput.value);
    render();
}

function handleAddSchedule() {
    const employeeSelect = document.querySelector("#newScheduleEmployee");
    const block1Start = document.querySelector("#newScheduleBlock1Start");
    const block1End = document.querySelector("#newScheduleBlock1End");
    const addBlock2 = document.querySelector("#newScheduleAddBlock2");
    const block2Start = document.querySelector("#newScheduleBlock2Start");
    const block2End = document.querySelector("#newScheduleBlock2End");
    const copyToggle = document.querySelector("#newScheduleCopyToggle");
    if (!employeeSelect || !block1Start || !block1End) return;

    clearCalendarError("scheduleFormError");

    const blocks = [{ start: block1Start.value, end: block1End.value }];
    if (addBlock2?.checked) {
        blocks.push({ start: block2Start.value, end: block2End.value });
    }

    const validation = validateScheduleBlocks(blocks);
    if (!validation.valid) {
        showCalendarError("scheduleFormError", validation.message);
        return;
    }

    const employeeId = parseInt(employeeSelect.value);
    const targetDates = new Set([state.calendar.edit.selectedDate]);

    if (copyToggle?.checked) {
        document.querySelectorAll(".copy-day-checkbox:checked").forEach(cb => {
            targetDates.add(cb.value);
        });
    }

    targetDates.forEach(date => addScheduleEntry(employeeId, date, blocks));
    render();
}

function handleCalendarAction(btn) {
    switch (btn.dataset.calAction) {
        case "print":
            printCalendar();
            break;
        case "show-add-month":
            state.calendar.edit.addingMonth = true;
            render();
            break;
        case "cancel-add-month":
            state.calendar.edit.addingMonth = false;
            render();
            break;
        case "create-month":
            handleCreateMonth();
            break;
        case "add-exam":
            handleAddExam();
            break;
        case "add-schedule":
            handleAddSchedule();
            break;
        case "delete-exam":
            deleteExamEntry(btn.dataset.id);
            render();
            break;
        case "delete-schedule":
            deleteScheduleEntry(btn.dataset.id);
            render();
            break;
    }
}

function attachCalendarEvents() {
    // --- View Calendar: filters ---
    document.querySelectorAll("[data-cal-employee-filter]").forEach(btn => {
        btn.addEventListener("click", e => {
            state.calendar.view.employeeFilter = e.currentTarget.dataset.calEmployeeFilter;
            render();
        });
    });

    document.querySelectorAll("[data-cal-testtype-filter]").forEach(btn => {
        btn.addEventListener("click", e => {
            state.calendar.view.testTypeFilter = e.currentTarget.dataset.calTesttypeFilter;
            render();
        });
    });

    // --- View Calendar: month navigation ---
    document.querySelectorAll("[data-cal-month-nav]").forEach(btn => {
        btn.addEventListener("click", e => {
            const [year, month] = e.currentTarget.dataset.calMonthNav.split("-").map(Number);
            state.calendar.view.year = year;
            state.calendar.view.month = month;
            render();
        });
    });

    // --- Edit Calendar: month selection ---
    document.querySelectorAll("[data-cal-edit-month]").forEach(btn => {
        btn.addEventListener("click", e => {
            const [year, month] = e.currentTarget.dataset.calEditMonth.split("-").map(Number);
            state.calendar.edit.year = year;
            state.calendar.edit.month = month;
            state.calendar.edit.selectedDate = null;
            state.calendar.edit.addingMonth = false;
            render();
        });
    });

    // --- Edit Calendar: day selection ---
    document.querySelectorAll("[data-cal-day]").forEach(btn => {
        btn.addEventListener("click", e => {
            state.calendar.edit.selectedDate = e.currentTarget.dataset.calDay;
            render();
        });
    });

    // --- Calendar actions (print, add month, add/delete exam or schedule) ---
    document.querySelectorAll("[data-cal-action]").forEach(btn => {
        btn.addEventListener("click", e => handleCalendarAction(e.currentTarget));
    });
}

function attachCalendarEditConditionals() {
    const addBlock2 = document.querySelector("#newScheduleAddBlock2");
    if (addBlock2) {
        addBlock2.addEventListener("change", () => {
            const row = document.querySelector(".schedule-block2-row");
            if (row) row.style.display = addBlock2.checked ? "grid" : "none";
        });
    }

    const copyToggle = document.querySelector("#newScheduleCopyToggle");
    if (copyToggle) {
        copyToggle.addEventListener("change", () => {
            const panel = document.querySelector(".schedule-copy-days");
            if (panel) panel.style.display = copyToggle.checked ? "block" : "none";
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
