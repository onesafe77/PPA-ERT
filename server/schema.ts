import { mysqlTable, serial, text, timestamp, int, boolean } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: int('id').primaryKey().autoincrement(),
    employeeId: text('employee_id').notNull().unique(), // Added for NRP/Pegawai ID
    name: text('name').notNull(),
    role: text('role').notNull().default('user'), // 'admin', 'user', 'safety_officer'
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const inspections = mysqlTable('inspections', {
    id: int('id').primaryKey().autoincrement(),
    type: text('type').notNull(), // 'P2H' or 'Gear'
    title: text('title').notNull(),
    status: text('status').notNull(), // 'APPROVED', 'NOT READY', 'WAITING'
    date: text('date').notNull(),
    location: text('location'),
    severity: text('severity'), // 'low', 'medium', 'high'
    userId: int('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

export const chatLogs = mysqlTable('chat_logs', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').references(() => users.id),
    message: text('message').notNull(),
    role: text('role').notNull(), // 'user' or 'model'
    timestamp: timestamp('timestamp').defaultNow(),
});

// P2H Inspection table
export const p2hInspections = mysqlTable('p2h_inspections', {
    id: int('id').primaryKey().autoincrement(),
    unitNumber: text('unit_number').notNull(),
    vehicleType: text('vehicle_type').notNull(),
    operatorName: text('operator_name'),
    shift: text('shift').notNull(),
    location: text('location'),
    checklistData: text('checklist_data'), // JSON string
    notes: text('notes'),
    status: text('status').default('PENDING'), // PENDING, APPROVED, NOT_READY
    userId: int('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

export const schedules = mysqlTable('schedules', {
    id: int('id').primaryKey().autoincrement(),
    title: text('title').notNull(),
    date: timestamp('date').notNull(),
    type: text('type').notNull(), // 'P2H' or 'Gear'
    unit: text('unit').notNull(),
    notes: text('notes'),
    status: text('status').default('Scheduled'), // Scheduled, Completed
    userId: int('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});


// APAR Inspection Table
export const aparInspections = mysqlTable('apar_inspections', {
    id: int('id').primaryKey().autoincrement(),
    date: timestamp('date').notNull(),
    location: text('location').notNull(),

    // Detailed Item Info (Generic for one row)
    unitNumber: text('unit_number'), // e.g. "Dapur KPS"
    capacity: text('capacity'),      // e.g. "6 Kg"
    tagNumber: text('tag_number'),   // e.g. "1"

    // Checklist items as JSON or boolean columns? 
    // Image shows: Handle, Lock Pin, Seal, Tabung, Hose, Braket.
    // Let's store as boolean columns for easier querying or JSON `checklist_data` for flexibility?
    // Given the request "similar to P2H", we use `checklist_data` JSON.
    checklistData: text('checklist_data'), // JSON: { handle: boolean, lock_pin: boolean, ... }

    condition: text('condition_status').notNull(), // 'LAYAK' / 'TIDAK LAYAK'
    notes: text('notes'),
    pic: text('pic'),

    userId: int('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Hydrant Inspection Table
export const hydrantInspections = mysqlTable('hydrant_inspections', {
    id: int('id').primaryKey().autoincrement(),
    date: timestamp('date').notNull(),
    location: text('location').notNull(), // e.g. "Gudang Handak"
    shift: text('shift'),

    // The form is nested. Let's store the entire form structure in JSON similar to P2H.
    // "checklist_data" will contain the Lines -> Components -> Checks status.
    checklistData: text('checklist_data'), // JSON string

    notes: text('notes'),
    pic: text('pic'),

    userId: int('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// PICA Reports Table
export const picaReports = mysqlTable('pica_reports', {
    id: int('id').primaryKey().autoincrement(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    imageData: text('image_data'), // Base64 string or URL
    deadline: timestamp('deadline'),
    status: text('status').default('OPEN'), // OPEN, CLOSED, IN_PROGRESS
    userId: int('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});
