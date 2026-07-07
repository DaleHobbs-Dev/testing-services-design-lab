import {
    daysInMonth, monthName, toDateKey, weekdayShort, formatFullDate,
    formatTimeRange, blocksTotalMinutes, hoursLabel
} from "../../../utils/calendarDates.js";
import {
    getMonths, getSchedulesForDate, getExamsForDate
} from "../../../data/calendarStore.js";

export function EditCalendarView(state) {
    const db = state.db || {};
    const currentUser = state.currentSlateUser;
    const edit = state.calendar.edit;
    const months = getMonths(db);

    return `
    <section class="content-panel content-panel--wide">
      <h2>Edit Calendar</h2>
      <p>Select a month to manage its exam windows and employee schedules, or add a new month. Changes you make here are saved to your browser's local storage and layered on top of the seeded demo data.</p>

      ${renderMonthPicker(months, edit)}

      ${months.some(m => m.year === edit.year && m.month === edit.month)
            ? renderMonthEditor(db, edit, currentUser)
            : ""}
    </section>
  `;
}

// ---------------------------------------------------------------------------
// Month picker / add month
// ---------------------------------------------------------------------------

function renderMonthPicker(months, edit) {
    const monthButtons = months.map(m => {
        const isActive = m.year === edit.year && m.month === edit.month;
        return `
      <button type="button" class="month-picker__option ${isActive ? "is-active" : ""}" data-cal-edit-month="${m.year}-${m.month}">
        ${m.label}
      </button>
    `;
    }).join("");

    return `
    <div class="edit-calendar__month-picker">
      <div class="filter-chip-row">
        ${monthButtons}
        <button type="button" class="form-toggle-btn" data-cal-action="show-add-month">+ Add new month</button>
      </div>
      ${edit.addingMonth ? renderAddMonthForm() : ""}
    </div>
  `;
}

function renderAddMonthForm() {
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
        .map(m => `<option value="${m}">${monthName(m)}</option>`)
        .join("");

    return `
    <div class="add-month-form">
      <div class="form-row">
        <label for="newMonthMonth">Month</label>
        <select id="newMonthMonth">${monthOptions}</select>
      </div>
      <div class="form-row">
        <label for="newMonthYear">Year</label>
        <input id="newMonthYear" type="number" value="2026" min="2000" max="2100" />
      </div>
      <div class="field-wrap">
        <div class="filter-chip-row">
          <button type="button" class="portal-button portal-button--small" data-cal-action="create-month">Create Month</button>
          <button type="button" class="form-toggle-btn" data-cal-action="cancel-add-month">Cancel</button>
        </div>
        <span class="field-alert" id="addMonthAlert" style="display: none;">That month has already been added.</span>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Day list + day detail
// ---------------------------------------------------------------------------

function renderMonthEditor(db, edit, currentUser) {
    return `
    <div class="edit-calendar__body">
      ${renderDayList(db, edit)}
      ${edit.selectedDate ? renderDayDetail(db, edit, currentUser) : ""}
    </div>
  `;
}

function renderDayList(db, edit) {
    const total = daysInMonth(edit.year, edit.month);

    const rows = Array.from({ length: total }, (_, i) => i + 1).map(day => {
        const dateKey = toDateKey(edit.year, edit.month, day);
        const scheduleCount = getSchedulesForDate(db, dateKey).length;
        const examCount = getExamsForDate(db, dateKey).length;
        const isActive = edit.selectedDate === dateKey;

        return `
      <button type="button" class="day-list__row ${isActive ? "is-active" : ""}" data-cal-day="${dateKey}">
        <span class="day-list__date">${weekdayShort(edit.year, edit.month, day)}, ${monthName(edit.month)} ${day}</span>
        <span class="day-list__counts">${scheduleCount} schedule${scheduleCount === 1 ? "" : "s"} &middot; ${examCount} exam${examCount === 1 ? "" : "s"}</span>
      </button>
    `;
    }).join("");

    return `
    <div class="day-list">
      ${rows}
    </div>
  `;
}

function renderDayDetail(db, edit, currentUser) {
    const [year, month, day] = edit.selectedDate.split("-").map(Number);

    return `
    <div class="day-detail">
      <h3 class="day-detail__title">${formatFullDate(year, month, day)}</h3>

      ${renderExamsSection(db, edit)}
      ${renderSchedulesSection(db, edit, currentUser)}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------

function renderExamsSection(db, edit) {
    const testTypes = db.test_types || [];
    const testTypeById = Object.fromEntries(testTypes.map(t => [t.id, t]));
    const exams = getExamsForDate(db, edit.selectedDate);

    const rows = exams.map(e => {
        const testType = testTypeById[e.test_type_id];
        const canDelete = e.origin === "local";
        return `
      <li class="editable-row">
        <span class="exam-badge" style="--badge-color: ${testType?.color || "#666"}">${testType?.label || "Unknown"} ${formatTimeRange(e.start, e.end)}</span>
        <button type="button" class="editable-row__delete" data-cal-action="delete-exam" data-id="${e.id}" ${canDelete ? "" : "disabled title=\"Seeded data can't be removed in this demo\""}>Delete</button>
      </li>
    `;
    }).join("");

    const testTypeOptions = testTypes.map(t => `<option value="${t.id}">${t.label}</option>`).join("");

    return `
    <div class="day-detail__section">
      <h4 class="optional-subsection__title">Exams</h4>
      <ul class="editable-list">${rows || "<li class=\"editable-list__empty\">No exams scheduled this day.</li>"}</ul>

      <div class="inline-form">
        <div class="form-row">
          <label for="newExamTestType">Test type</label>
          <select id="newExamTestType">${testTypeOptions}</select>
        </div>
        <div class="form-row">
          <label for="newExamStart">Start time</label>
          <input id="newExamStart" type="time" value="09:00" />
        </div>
        <div class="form-row">
          <label for="newExamEnd">End time</label>
          <input id="newExamEnd" type="time" value="10:00" />
        </div>
        <div class="field-wrap">
          <button type="button" class="form-toggle-btn" data-cal-action="add-exam">+ Add Exam</button>
          <span class="field-alert" id="examFormError" style="display: none;"></span>
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Employee schedules
// ---------------------------------------------------------------------------

function renderSchedulesSection(db, edit, currentUser) {
    const employees = db.employees || [];
    const employeeById = Object.fromEntries(employees.map(e => [e.id, e]));
    const schedules = getSchedulesForDate(db, edit.selectedDate);

    const rows = schedules.map(s => {
        const employee = employeeById[s.employee_id];
        const canDelete = s.origin === "local";
        const blockText = s.blocks.map(b => formatTimeRange(b.start, b.end)).join(", ");
        const minutes = blocksTotalMinutes(s.blocks);
        return `
      <li class="editable-row">
        <span class="schedule-badge">${employee?.name || "Unknown"} <em>(${hoursLabel(minutes)})</em></span>
        <span class="editable-row__detail">${blockText}</span>
        <button type="button" class="editable-row__delete" data-cal-action="delete-schedule" data-id="${s.id}" ${canDelete ? "" : "disabled title=\"Seeded data can't be removed in this demo\""}>Delete</button>
      </li>
    `;
    }).join("");

    const employeeOptions = employees
        .map(e => `<option value="${e.id}" ${e.id === currentUser?.id ? "selected" : ""}>${e.name}</option>`)
        .join("");

    const dayCheckboxes = Array.from({ length: daysInMonth(edit.year, edit.month) }, (_, i) => i + 1)
        .map(day => {
            const dateKey = toDateKey(edit.year, edit.month, day);
            const isSelectedDay = dateKey === edit.selectedDate;
            return `
        <label class="copy-day-checkbox-label">
          <input type="checkbox" class="copy-day-checkbox" value="${dateKey}" ${isSelectedDay ? "checked disabled" : ""} />
          ${day}
        </label>
      `;
        }).join("");

    return `
    <div class="day-detail__section">
      <h4 class="optional-subsection__title">Employee Schedules</h4>
      <ul class="editable-list">${rows || "<li class=\"editable-list__empty\">No one is scheduled this day.</li>"}</ul>

      <div class="inline-form">
        <div class="form-row">
          <label for="newScheduleEmployee">Employee</label>
          <select id="newScheduleEmployee">${employeeOptions}</select>
        </div>
        <div class="form-row">
          <label for="newScheduleBlock1Start">Block 1</label>
          <div class="time-range-inputs">
            <input id="newScheduleBlock1Start" type="time" value="08:00" />
            <span>to</span>
            <input id="newScheduleBlock1End" type="time" value="11:00" />
          </div>
        </div>

        <label class="checkbox-label">
          <input type="checkbox" id="newScheduleAddBlock2" />
          <span>Add a second block</span>
        </label>

        <div class="form-row schedule-block2-row" style="display: none;">
          <label for="newScheduleBlock2Start">Block 2</label>
          <div class="time-range-inputs">
            <input id="newScheduleBlock2Start" type="time" value="12:00" />
            <span>to</span>
            <input id="newScheduleBlock2End" type="time" value="16:00" />
          </div>
        </div>

        <label class="checkbox-label">
          <input type="checkbox" id="newScheduleCopyToggle" />
          <span>Add this same schedule to multiple days of this month?</span>
        </label>

        <div class="schedule-copy-days" style="display: none;">
          <p class="form-hint">Choose the other days this schedule should also apply to.</p>
          <div class="copy-day-grid">${dayCheckboxes}</div>
        </div>

        <div class="field-wrap">
          <button type="button" class="form-toggle-btn" data-cal-action="add-schedule">+ Add Schedule</button>
          <span class="field-alert" id="scheduleFormError" style="display: none;"></span>
        </div>
      </div>
    </div>
  `;
}
