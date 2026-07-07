// Data layer for the Testing Services Calendar.
//
// Every read function merges the static seed data (state.db, loaded from
// database.json) with anything an admin has added during this session
// (stored in localStorage, since this prototype has no real backend).
// Every write function only ever touches localStorage -- the seed file
// itself can't be modified from the browser.

const STORAGE_KEY = "calendarOverrides";

function loadOverrides() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return { months: [], schedules: [], exams: [], nextId: 1 };
    }
    try {
        const parsed = JSON.parse(raw);
        return {
            months: parsed.months || [],
            schedules: parsed.schedules || [],
            exams: parsed.exams || [],
            nextId: parsed.nextId || 1
        };
    } catch {
        return { months: [], schedules: [], exams: [], nextId: 1 };
    }
}

function saveOverrides(overrides) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

function nextLocalId(overrides) {
    const id = `local-${overrides.nextId}`;
    overrides.nextId += 1;
    return id;
}

function monthPrefix(year, month) {
    return `${year}-${String(month).padStart(2, "0")}`;
}

// --- Months -----------------------------------------------------------

export function getMonths(db) {
    const overrides = loadOverrides();
    const seedMonths = (db.calendar_months || []).map(m => ({ ...m, origin: "seed" }));
    const localMonths = overrides.months.map(m => ({ ...m, origin: "local" }));
    return [...seedMonths, ...localMonths].sort((a, b) =>
        a.year - b.year || a.month - b.month
    );
}

export function monthExists(db, year, month) {
    return getMonths(db).some(m => m.year === year && m.month === month);
}

export function addMonth(db, year, month, label) {
    if (monthExists(db, year, month)) {
        return null;
    }
    const overrides = loadOverrides();
    const record = { id: nextLocalId(overrides), year, month, label, origin: "local" };
    overrides.months.push(record);
    saveOverrides(overrides);
    return record;
}

// --- Employee schedules -------------------------------------------------

export function getSchedulesForMonth(db, year, month) {
    const overrides = loadOverrides();
    const prefix = monthPrefix(year, month);
    const seed = (db.employee_schedules || [])
        .filter(s => s.date.startsWith(prefix))
        .map(s => ({ ...s, origin: "seed" }));
    const local = overrides.schedules
        .filter(s => s.date.startsWith(prefix))
        .map(s => ({ ...s, origin: "local" }));
    return [...seed, ...local];
}

export function getSchedulesForDate(db, dateKey) {
    const overrides = loadOverrides();
    const seed = (db.employee_schedules || [])
        .filter(s => s.date === dateKey)
        .map(s => ({ ...s, origin: "seed" }));
    const local = overrides.schedules
        .filter(s => s.date === dateKey)
        .map(s => ({ ...s, origin: "local" }));
    return [...seed, ...local];
}

export function addScheduleEntry(employee_id, date, blocks) {
    const overrides = loadOverrides();
    const record = { id: nextLocalId(overrides), employee_id, date, blocks, origin: "local" };
    overrides.schedules.push(record);
    saveOverrides(overrides);
    return record;
}

export function deleteScheduleEntry(id) {
    const overrides = loadOverrides();
    const before = overrides.schedules.length;
    overrides.schedules = overrides.schedules.filter(s => s.id !== id);
    saveOverrides(overrides);
    return overrides.schedules.length < before;
}

// --- Exams --------------------------------------------------------------

export function getExamsForMonth(db, year, month) {
    const overrides = loadOverrides();
    const prefix = monthPrefix(year, month);
    const seed = (db.calendar_exams || [])
        .filter(e => e.date.startsWith(prefix))
        .map(e => ({ ...e, origin: "seed" }));
    const local = overrides.exams
        .filter(e => e.date.startsWith(prefix))
        .map(e => ({ ...e, origin: "local" }));
    return [...seed, ...local];
}

export function getExamsForDate(db, dateKey) {
    const overrides = loadOverrides();
    const seed = (db.calendar_exams || [])
        .filter(e => e.date === dateKey)
        .map(e => ({ ...e, origin: "seed" }));
    const local = overrides.exams
        .filter(e => e.date === dateKey)
        .map(e => ({ ...e, origin: "local" }));
    return [...seed, ...local];
}

export function addExamEntry(test_type_id, date, start, end) {
    const overrides = loadOverrides();
    const record = { id: nextLocalId(overrides), test_type_id, date, start, end, origin: "local" };
    overrides.exams.push(record);
    saveOverrides(overrides);
    return record;
}

export function deleteExamEntry(id) {
    const overrides = loadOverrides();
    const before = overrides.exams.length;
    overrides.exams = overrides.exams.filter(e => e.id !== id);
    saveOverrides(overrides);
    return overrides.exams.length < before;
}
