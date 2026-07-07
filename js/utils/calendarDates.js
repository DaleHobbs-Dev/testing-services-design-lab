const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function pad2(n) {
    return String(n).padStart(2, "0");
}

// month is 1-12 throughout this module (not JS Date's 0-11)
export function toDateKey(year, month, day) {
    return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

export function monthName(month) {
    return MONTH_LABELS[month - 1];
}

export function monthLabel(year, month) {
    return `${monthName(month)} ${year}`;
}

export function addMonths(year, month, delta) {
    const zeroBased = month - 1 + delta;
    const newYear = year + Math.floor(zeroBased / 12);
    const newMonth = ((zeroBased % 12) + 12) % 12 + 1;
    return { year: newYear, month: newMonth };
}

// Builds a Sun-Sat grid of weeks for the given month.
// Each cell is either { dateKey, day, inMonth: true } or { inMonth: false } for padding.
export function getMonthGrid(year, month) {
    const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
    const totalDays = daysInMonth(year, month);

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
        cells.push({ inMonth: false });
    }
    for (let day = 1; day <= totalDays; day++) {
        cells.push({ inMonth: true, day, dateKey: toDateKey(year, month, day) });
    }
    while (cells.length % 7 !== 0) {
        cells.push({ inMonth: false });
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

export function weekdayLabels() {
    return WEEKDAY_LABELS;
}

export function weekdayShort(year, month, day) {
    return WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
}

export function formatFullDate(year, month, day) {
    return `${MONTH_LABELS[month - 1]} ${day}, ${year}`;
}

function timeToMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

// "08:00" -> "8am", "16:00" -> "4pm", "10:30" -> "10:30am"
export function formatTimeShort(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "pm" : "am";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${hour12}${period}` : `${hour12}:${pad2(m)}${period}`;
}

export function formatTimeRange(start, end) {
    return `${formatTimeShort(start)}-${formatTimeShort(end)}`;
}

export function blockMinutes(block) {
    return timeToMinutes(block.end) - timeToMinutes(block.start);
}

export function blocksTotalMinutes(blocks) {
    return blocks.reduce((sum, b) => sum + blockMinutes(b), 0);
}

// Formats minutes as a compact hours label, e.g. 420 -> "7 hrs", 90 -> "1.5 hrs"
export function hoursLabel(minutes) {
    const hours = minutes / 60;
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded} hr${rounded === 1 ? "" : "s"}`;
}

// Checks the "no more than 5 consecutive hours without a 1 hour break" rule.
// Blocks less than 60 minutes apart are treated as one continuous stretch.
export function validateScheduleBlocks(blocks) {
    for (const b of blocks) {
        if (timeToMinutes(b.end) <= timeToMinutes(b.start)) {
            return { valid: false, message: "Each block's end time must be after its start time." };
        }
    }

    const sorted = [...blocks].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    for (let i = 1; i < sorted.length; i++) {
        const gap = timeToMinutes(sorted[i].start) - timeToMinutes(sorted[i - 1].end);
        if (gap < 0) {
            return { valid: false, message: "Schedule blocks cannot overlap." };
        }
    }

    let stretchStart = sorted.length ? timeToMinutes(sorted[0].start) : 0;
    let stretchEnd = stretchStart;

    for (const b of sorted) {
        const start = timeToMinutes(b.start);
        const end = timeToMinutes(b.end);
        const gapFromStretch = start - stretchEnd;

        if (gapFromStretch >= 60) {
            stretchStart = start;
        }
        stretchEnd = end;

        if (stretchEnd - stretchStart > 5 * 60) {
            return {
                valid: false,
                message: "This schedule has more than 5 consecutive hours without a 1 hour break."
            };
        }
    }

    return { valid: true, message: "" };
}
