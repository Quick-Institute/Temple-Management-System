// Reference sample data. Replace these exports with API results when available.
export const summary = [
    {
        title: 'Total Temples',
        value: '248',
        change: '12 this month',
        icon: 'landmark-dome',
        tone: 'blue',
        to: '/temples'
    },
    {
        title: 'Total Users',
        value: '12,840',
        change: '256 this month',
        icon: 'users',
        tone: 'green',
        to: '/user-management'
    },
    {title: 'Total Donors', value: '8,420', change: '18% this month', icon: 'heart', tone: 'gold', to: '/donors'},
    {
        title: 'Total Programmes',
        value: '370',
        change: '32 this month',
        icon: 'calendar-check',
        tone: 'purple',
        to: '/programmes'
    },
];

export const workflow = [
    {label: 'Pending', value: 24, icon: 'fa6-solid:hourglass-half', tone: 'amber', status: 'pending'},
    {label: 'Approved', value: 212, icon: 'fa6-solid:circle-check', tone: 'green', status: 'approved'},
    {label: 'Rejected', value: 8, icon: 'fa6-solid:circle-xmark', tone: 'red', status: 'rejected'},
    {label: 'Suspended', value: 4, icon: 'fa6-solid:circle-pause', tone: 'purple', status: 'suspended'},
];

export const quickActions = [
    {title: 'Review Registrations', icon: 'landmark-dome', tone: 'green', to: '/temples', query: '?status=pending'},
    {title: 'Manage Platform Users', icon: 'users', tone: 'purple', to: '/user-management'},
    {title: 'Manage User Roles', icon: 'fa6-solid:key', tone: 'blue', to: '/user-management', query: '?tab=roles'},
    {title: 'System Configuration', icon: 'gear', tone: 'amber', to: '/system-settings'},
];

// Month-by-month registrations; the chart shows the most recent N entries.
export const trends = [
    {month: 'Nov 2025', registered: 9, approved: 8},
    {month: 'Dec 2025', registered: 11, approved: 9},
    {month: 'Jan 2026', registered: 12, approved: 10},
    {month: 'Feb 2026', registered: 14, approved: 12},
    {month: 'Mar 2026', registered: 15, approved: 13},
    {month: 'Apr 2026', registered: 17, approved: 14},
    {month: 'May 2026', registered: 18, approved: 16},
    {month: 'Jun 2026', registered: 22, approved: 20},
    {month: 'Jul 2026', registered: 24, approved: 21},
    {month: 'Aug 2026', registered: 26, approved: 24},
    {month: 'Sep 2026', registered: 30, approved: 27},
    {month: 'Oct 2026', registered: 32, approved: 29},
];
export const trendRanges = [
    {label: 'Last 3 Months', months: 3},
    {label: 'Last 6 Months', months: 6},
    {label: 'Last 12 Months', months: 12},
];

// Percentages are derived from the counts, so they always add up to 100%.
export const roles = [
    {label: 'Family Users', count: 11520, color: '#1f83b5'},
    {label: 'Temple Admins', count: 720, color: '#1583F2'},
    {label: 'Co-Admins', count: 460, color: '#1cbbf5'},
    {label: 'Other Roles', count: 140, color: '#9B5CF0'},
];

export const registrations = [
    {id: 'R001', date: '15 Oct 2026', temple: 'Nelligala Temple', location: 'Kandy', status: 'Pending'},
    {id: 'R002', date: '12 Oct 2026', temple: 'Thalpitiya Temple', location: 'Gampaha', status: 'Approved'},
    {id: 'R003', date: '10 Oct 2026', temple: 'Dikwella Temple', location: 'Matara', status: 'Pending'},
    {id: 'R004', date: '05 Oct 2026', temple: 'Lankaramaya Temple', location: 'Kurunegala', status: 'Approved'},
    {id: 'R005', date: '28 Sep 2026', temple: 'Aluthnuwara Temple', location: 'Kandy', status: 'Approved'},
];

export const activities = [
    {
        id: 'A001',
        title: 'New temple registration request received.',
        detail: 'Nelligala Temple · 15 Oct 2026',
        time: '10:15 AM',
        icon: 'landmark-dome',
        tone: 'amber'
    },
    {
        id: 'A002',
        title: 'New donor registered.',
        detail: 'Kamal Perera',
        time: '09:42 AM',
        icon: 'fa6-solid:user-check',
        tone: 'green'
    },
    {
        id: 'A003',
        title: 'Programme updated.',
        detail: 'Katargama Temple · Morning Dana',
        time: '08:30 AM',
        icon: 'calendar-check',
        tone: 'purple'
    },
    {
        id: 'A004',
        title: 'New user added.',
        detail: 'Amila Fernando (Staff)',
        time: '07:15 AM',
        icon: 'fa6-solid:user',
        tone: 'blue'
    },
    {
        id: 'A005',
        title: 'System maintenance.',
        detail: 'Scheduled for 26 Oct 2026',
        time: 'Yesterday',
        icon: 'gear',
        tone: 'amber'
    },
];