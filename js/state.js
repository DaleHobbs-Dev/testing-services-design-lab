export const state = {
    currentTopLevel: "gateway", // gateway | slate | website
    currentSlateView: "find-student", // find-student | ticketing-dashboard | ticketing-form | view-calendar | edit-calendar
    openAccordion: "students", // students | ticketing | calendar
    db: null, // populated on load from database.json
    currentSlateUser: null, // populated from localStorage or profile selection
    calendar: {
        view: {
            year: 2026,
            month: 7, // 1-12
            employeeFilter: "all", // "all" or an employee id
            testTypeFilter: "all" // "all" or a test_type id
        },
        edit: {
            year: 2026,
            month: 7,
            selectedDate: null, // "YYYY-MM-DD" or null when no day is open
            addingMonth: false,
            copyToMultipleDays: false,
            copySelectedDates: [] // dateKeys chosen in the "apply to other days" picker
        }
    }
};