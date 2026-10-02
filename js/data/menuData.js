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
    },
    {
        id: "training",
        label: "Employee Training",
        type: "accordion",
        children: [
            {
                id: "training-form",
                label: "Training Form",
                view: "training-form"
            }
        ]
    },
    {
        id: "calendar",
        label: "Testing Calendar",
        type: "accordion",
        adminOnly: true,
        children: [
            {
                id: "view-calendar",
                label: "View Calendar",
                view: "view-calendar"
            },
            {
                id: "edit-calendar",
                label: "Edit Calendar",
                view: "edit-calendar"
            }
        ]
    }
];