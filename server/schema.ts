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

// APAR Inspection Table
export const aparInspections = pgTable('apar_inspections', {
    id: serial('id').primaryKey(),
    date: timestamp('date').notNull(),
    location: text('location').notNull(),
    unitNumber: text('unit_number'), // e.g. "Dapur KPS"
    capacity: text('capacity'),      // e.g. "6 Kg"
    tagNumber: text('tag_number'),   // e.g. "1"
    checklistData: text('checklist_data'), // JSON: { handle: boolean, ... }
    condition: text('condition_status').notNull(), // 'LAYAK' / 'TIDAK LAYAK'
    notes: text('notes'),
    pic: text('pic'),
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Hydrant Inspection Table
export const hydrantInspections = pgTable('hydrant_inspections', {
    id: serial('id').primaryKey(),
    date: timestamp('date').notNull(),
    location: text('location').notNull(), // e.g. "Gudang Handak"
    shift: text('shift'),
    checklistData: text('checklist_data'), // JSON string
    notes: text('notes'),
    pic: text('pic'),
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

export const picaReports = pgTable('pica_reports', {
    id: serial('id').primaryKey(),
    category: text('category').notNull().default('APAR'), // P2H, Gear, APAR, Eye Wash, Hydrant, Smoke Detector
    title: text('title').notNull(),
    description: text('description').notNull(),
    location: text('location'), // Lokasi masalah
    imageData: text('image_data'), // Base64 or URL
    deadline: timestamp('deadline'),
    status: text('status').default('OPEN'), // OPEN, IN_PROGRESS, CLOSED
    priority: text('priority').default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
    photos: text('photos'), // JSON string of array for multiple photos
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Eye Wash Inspection Table
export const eyeWashInspections = pgTable('eyewash_inspections', {
    id: serial('id').primaryKey(),
    date: timestamp('date').notNull(),
    periodeMonth: integer('periode_month').notNull(),
    periodeYear: integer('periode_year').notNull(),
    location: text('location').notNull(),
    regNumber: text('reg_number').notNull(),
    inspector: text('inspector').notNull(),
    checklistData: text('checklist_data'), // JSON: {isi: true/false, karetPenutup: true/false, ...}
    kondisiKeseluruhan: text('kondisi_keseluruhan').notNull(),
    keterangan: text('keterangan'),
    photos: text('photos'), // JSON array of base64
    diketahuiOleh: text('diketahui_oleh'),
    diPeriksaOleh: text('diperiksa_oleh'),
    signatureDiketahui: text('signature_diketahui'),
    signatureDiPeriksa: text('signature_diperiksa'),
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Smoke Detector Inspection Table
export const smokeDetectorInspections = pgTable('smoke_detector_inspections', {
    id: serial('id').primaryKey(),
    date: timestamp('date').notNull(),
    periodeMonth: integer('periode_month').notNull(),
    periodeYear: integer('periode_year').notNull(),
    subLokasi: text('sub_lokasi').notNull(),
    pic: text('pic').notNull(),
    photos: text('photos'),
    diketahuiOleh: text('diketahui_oleh'),
    diPeriksaOleh: text('diperiksa_oleh'),
    signatureDiketahui: text('signature_diketahui'),
    signatureDiPeriksa: text('signature_diperiksa'),
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Smoke Detector Units Table
export const smokeDetectorUnits = pgTable('smoke_detector_units', {
    id: serial('id').primaryKey(),
    inspectionId: integer('inspection_id').references(() => smokeDetectorInspections.id),
    nomorDetector: text('nomor_detector').notNull(),
    fungsiKontrol: text('fungsi_kontrol').notNull(),
    fungsiSensor: text('fungsi_sensor').notNull(),
    fungsiFireAlarm: text('fungsi_fire_alarm').notNull(),
    keterangan: text('keterangan'),
});

// Equipment Inspection Table
export const equipmentInspections = pgTable('equipment_inspections', {
    id: serial('id').primaryKey(),
    date: timestamp('date').notNull(),
    period: text('period').notNull(), // e.g. "JANUARI 2026"
    location: text('location').notNull(), // e.g. "7014"
    category: text('category'), // ALL or specific category
    inspectorName: text('inspector_name').notNull(),
    approverName: text('approver_name'),
    totalItems: integer('total_items').notNull(),
    layakCount: integer('layak_count').notNull(),
    tidakLayakCount: integer('tidak_layak_count').notNull(),
    userId: integer('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Equipment Inspection Items Table
export const equipmentInspectionItems = pgTable('equipment_inspection_items', {
    id: serial('id').primaryKey(),
    inspectionId: integer('inspection_id').references(() => equipmentInspections.id),
    name: text('name').notNull(),
    tagNumber: text('tag_number').notNull(),
    brand: text('brand'),
    category: text('category').notNull(),
    condition: text('condition').notNull(), // 'LAYAK' or 'TIDAK_LAYAK'
    notes: text('notes'),
});
