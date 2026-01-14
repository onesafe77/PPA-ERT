import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    employeeId: text('employee_id').notNull().unique(), // Added for NRP/Pegawai ID
    name: text('name').notNull(),
    role: text('role').notNull().default('user'), // 'admin', 'user', 'safety_officer'
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const inspections = pgTable('inspections', {
    id: serial('id').primaryKey(),
    type: text('type').notNull(), // 'P2H' or 'Gear'
    title: text('title').notNull(),
    status: text('status').notNull(), // 'APPROVED', 'NOT READY', 'WAITING'
    date: text('date').notNull(),
    location: text('location'),
    severity: text('severity'), // 'low', 'medium', 'high'
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

export const chatLogs = pgTable('chat_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    message: text('message').notNull(),
    role: text('role').notNull(), // 'user' or 'model'
    timestamp: timestamp('timestamp').defaultNow(),
});

// P2H Inspection table
export const p2hInspections = pgTable('p2h_inspections', {
    id: serial('id').primaryKey(),
    unitNumber: text('unit_number').notNull(),
    vehicleType: text('vehicle_type').notNull(),
    operatorName: text('operator_name'),
    shift: text('shift').notNull(),
    location: text('location'),
    checklistData: text('checklist_data'), // JSON string
    notes: text('notes'),
    status: text('status').default('PENDING'), // PENDING, APPROVED, NOT_READY
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

export const schedules = pgTable('schedules', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    date: timestamp('date').notNull(),
    type: text('type').notNull(), // 'P2H' or 'Gear'
    unit: text('unit').notNull(),
    notes: text('notes'),
    status: text('status').default('Scheduled'), // Scheduled, Completed
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});
