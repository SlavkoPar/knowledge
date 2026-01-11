export const kindOptions = [
    { label: "Unknown", value: 0 },
    { label: "Podrška", value: 1 },
    { label: "Opcija", value: 2 },
    { label: "Usluga", value: 3 },
    { label: "Tema", value: 4 }
]

export const roleOptions = [
    { label: "Unknown", value: '' },
    { label: "OWNER", value: 'OWNER' },
    { label: "ADMIN", value: 'ADMIN' },
    { label: "EDITOR", value: 'EDITOR' },
    { label: "VIEWER", value: 'VIEWER' }
]

export const sourceOptions = [ // TODO make string 
    { label: "Unknown", value: 0 },
    { label: "OWNER", value: 1 },
    { label: "ADMIN", value: 2 },
    { label: "EDITOR", value: 3 },
    { label: "VIEWER", value: 4 }
]

export const statusOptions = [
    { label: "Unknown", value: 0 },
    { label: "In progress", value: 1 },
    { label: "Can't reproduce", value: 2 },
    { label: "Blocked", value: 3 },
    { label: "Complete", value: 4 }
]