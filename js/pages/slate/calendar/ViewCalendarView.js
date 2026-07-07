import {
    getMonthGrid, weekdayLabels, monthLabel, addMonths,
    formatTimeRange, blocksTotalMinutes, hoursLabel
} from "../../../utils/calendarDates.js";
import { getSchedulesForMonth, getExamsForMonth } from "../../../data/calendarStore.js";

export function ViewCalendarView(state) {
    const db = state.db || {};
    const { year, month, employeeFilter, testTypeFilter } = state.calendar.view;

    const employees = (db.employees || []).filter(e => !e.is_tech);
    const testTypes = db.test_types || [];

    const allSchedules = getSchedulesForMonth(db, year, month);
    const allExams = getExamsForMonth(db, year, month);

    const schedules = employeeFilter === "all"
        ? allSchedules
        : allSchedules.filter(s => s.employee_id === Number(employeeFilter));

    const exams = testTypeFilter === "all"
        ? allExams
        : allExams.filter(e => e.test_type_id === Number(testTypeFilter));

    return `
    <section class="content-panel content-panel--wide">
      <h2>View Calendar</h2>
      <p>Browse employee work schedules and scheduled exams. Use the filters below to focus on one person or test type, or leave on "View All" to see everything at once.</p>

      ${renderFilters(employees, testTypes, employeeFilter, testTypeFilter)}

      <div class="calendar-layout">
        <div class="calendar-print-target" id="calendarPrintTarget">
          <h3 class="calendar-month-title">${monthLabel(year, month)}</h3>
          ${renderGrid(year, month, schedules, exams, employees, testTypes)}
        </div>

        ${renderMonthSelector(year, month)}
      </div>

      <div class="calendar-actions">
        <button type="button" class="portal-button" data-cal-action="print">Print Calendar</button>
      </div>
    </section>
  `;
}

function renderFilters(employees, testTypes, employeeFilter, testTypeFilter) {
    const employeeButtons = [
        `<button type="button" class="filter-chip ${employeeFilter === "all" ? "is-active" : ""}" data-cal-employee-filter="all">View All</button>`,
        ...employees.map(e => `
      <button type="button" class="filter-chip ${String(employeeFilter) === String(e.id) ? "is-active" : ""}" data-cal-employee-filter="${e.id}">${e.name}</button>
    `)
    ].join("");

    const testTypeButtons = [
        `<button type="button" class="filter-chip ${testTypeFilter === "all" ? "is-active" : ""}" data-cal-testtype-filter="all">View All</button>`,
        ...testTypes.map(t => `
      <button type="button" class="filter-chip filter-chip--swatch ${String(testTypeFilter) === String(t.id) ? "is-active" : ""}" data-cal-testtype-filter="${t.id}" style="--chip-color: ${t.color}">${t.label}</button>
    `)
    ].join("");

    return `
    <div class="calendar-filters">
      <div class="calendar-filter-group">
        <span class="calendar-filter-group__label">Employee schedule</span>
        <div class="filter-chip-row">${employeeButtons}</div>
      </div>
      <div class="calendar-filter-group">
        <span class="calendar-filter-group__label">Test type</span>
        <div class="filter-chip-row">${testTypeButtons}</div>
      </div>
    </div>
  `;
}

function renderMonthSelector(year, month) {
    const buttons = [-2, -1, 0, 1, 2].map(delta => {
        const { year: y, month: m } = addMonths(year, month, delta);
        const isActive = y === year && m === month;
        return `
      <button type="button" class="month-picker__option ${isActive ? "is-active" : ""}" data-cal-month-nav="${y}-${m}">
        ${monthLabel(y, m)}
      </button>
    `;
    }).join("");

    return `
    <aside class="month-picker">
      <h4 class="month-picker__title">Jump to month</h4>
      ${buttons}
    </aside>
  `;
}

function renderGrid(year, month, schedules, exams, employees, testTypes) {
    const weeks = getMonthGrid(year, month);
    const testTypeById = Object.fromEntries(testTypes.map(t => [t.id, t]));
    const employeeById = Object.fromEntries(employees.map(e => [e.id, e]));

    const headerCells = weekdayLabels().map(d => `<th>${d}</th>`).join("");

    const rows = weeks.map(week => {
        const dayCells = week.map(cell => renderDayCell(cell, schedules, exams, employeeById, testTypeById)).join("");
        const totalCell = renderWeekTotalCell(week, schedules, employeeById);
        return `<tr>${dayCells}${totalCell}</tr>`;
    }).join("");

    return `
    <table class="calendar-grid">
      <thead>
        <tr>${headerCells}<th class="calendar-grid__total-header">Total Hours</th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function renderDayCell(cell, schedules, exams, employeeById, testTypeById) {
    if (!cell.inMonth) {
        return `<td class="calendar-cell calendar-cell--empty"></td>`;
    }

    const daySchedules = schedules.filter(s => s.date === cell.dateKey);
    const dayExams = exams.filter(e => e.date === cell.dateKey);

    const scheduleBadges = daySchedules.map(s => {
        const employee = employeeById[s.employee_id];
        if (!employee) return "";
        const minutes = blocksTotalMinutes(s.blocks);
        return `<span class="schedule-badge">${employee.name} <em>(${hoursLabel(minutes)})</em></span>`;
    }).join("");

    const examBadges = dayExams.map(e => {
        const testType = testTypeById[e.test_type_id];
        if (!testType) return "";
        return `<span class="exam-badge" style="--badge-color: ${testType.color}">${testType.label} ${formatTimeRange(e.start, e.end)}</span>`;
    }).join("");

    return `
    <td class="calendar-cell">
      <div class="calendar-cell__date">${cell.day}</div>
      <div class="calendar-cell__badges">
        ${scheduleBadges}
        ${examBadges}
      </div>
    </td>
  `;
}

function renderWeekTotalCell(week, schedules, employeeById) {
    const weekDateKeys = week.filter(c => c.inMonth).map(c => c.dateKey);
    if (weekDateKeys.length === 0) {
        return `<td class="calendar-cell calendar-cell--empty"></td>`;
    }

    const minutesByEmployee = {};
    schedules
        .filter(s => weekDateKeys.includes(s.date))
        .forEach(s => {
            minutesByEmployee[s.employee_id] = (minutesByEmployee[s.employee_id] || 0) + blocksTotalMinutes(s.blocks);
        });

    const badges = Object.entries(minutesByEmployee).map(([employeeId, minutes]) => {
        const employee = employeeById[employeeId];
        if (!employee) return "";
        return `<span class="week-total-badge">${employee.name} <em>(${hoursLabel(minutes)})</em></span>`;
    }).join("");

    return `
    <td class="calendar-cell calendar-cell--total">
      ${badges}
    </td>
  `;
}
