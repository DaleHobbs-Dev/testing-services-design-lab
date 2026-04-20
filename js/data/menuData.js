export const slateMenu = [
    {
        id: "students",
        label: "Find a Student",
        type: "single",
        view: "find-student"
    },
    {
        id: "ticketing",
        label: "Ticketing System",
        type: "accordion",
        children: [
            {
                id: "ticketing-dashboard",
                label: "Ticketing Dashboard",
                view: "ticketing-dashboard"
            },
            {
                id: "ticketing-form",
                label: "Create Ticket",
                view: "ticketing-form"
            }
        ]
    }
];