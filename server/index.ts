import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import { users, inspections, chatLogs, p2hInspections, schedules, aparInspections, hydrantInspections, picaReports } from './schema';
import { eq, desc } from 'drizzle-orm';
import OpenAI from 'openai';

dotenv.config();

// ... imports
import { sql } from 'drizzle-orm';

// Auto-seed Saralim on startup if not exists
async function ensureUserExists() {
    try {
        const existing = await db.select().from(users).where(eq(users.employeeId, '23001138'));
        if (existing.length === 0) {
            await db.insert(users).values({
                employeeId: '23001138',
                name: 'Saralim',
                role: 'user',
                password: '12345678'
            });
            console.log('✅ Auto-seeded user: Saralim');
        }
    } catch (err) {
        console.error('Seeding check failed:', err);
    }
}

ensureUserExists();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Root route for checking server status (only if api is requested, otherwise let static handler work? No, express order matters)
// We will serve static files AFTER API routes, or use a specific route.
// Actually, standard pattern: API first, then Static, then Catch-all.

// ... (API definitions remain the same) ...

// SERVE FRONTEND STATIC FILES
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    // Check if request is for API, if so return 404 instead of html
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// app.get('/', ... ) -> Removed/Overridden by static serve or caught by '*' if index.html exists.
// But we can keep an API health check at /api/health if needed.


// --- Auth Routes ---
app.post('/api/login', async (req, res) => {
    const { employeeId, password } = req.body;

    try {
        const user = await db.select().from(users).where(eq(users.employeeId, employeeId)).limit(1);

        if (user.length === 0) {
            return res.status(401).json({ success: false, message: 'ID Pegawai tidak ditemukan' });
        }

        const foundUser = user[0];

        // In a real app, COMPARE HASHED PASSWORD here.
        if (foundUser.password !== password) {
            return res.status(401).json({ success: false, message: 'Password salah' });
        }

        // Login Success
        res.json({
            success: true,
            user: {
                id: foundUser.id,
                name: foundUser.name,
                role: foundUser.role,
                employeeId: foundUser.employeeId
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// --- P2H Inspection Routes ---
app.post('/api/p2h', async (req, res) => {
    try {
        const { unitNumber, vehicleType, operatorName, shift, location, checklistData, notes, userId } = req.body;
        const newP2H = await db.insert(p2hInspections).values({
            unitNumber,
            vehicleType,
            operatorName,
            shift,
            location,
            checklistData,
            notes,
            userId: userId || null,
            status: 'PENDING'
        }).returning();

        res.json(newP2H[0]);
    } catch (error) {
        console.error('P2H create error:', error);
        res.status(500).json({ error: 'Failed to create P2H inspection' });
    }
});

app.get('/api/p2h', async (req, res) => {
    try {
        const allP2H = await db.select().from(p2hInspections).orderBy(desc(p2hInspections.createdAt));
        res.json(allP2H);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch P2H inspections' });
    }
});

app.get('/api/p2h/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const p2h = await db.select().from(p2hInspections).where(eq(p2hInspections.id, id)).limit(1);
        if (p2h.length === 0) {
            return res.status(404).json({ error: 'P2H not found' });
        }
        res.json(p2h[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch P2H inspection' });
    }
});

// --- Legacy Inspection Routes ---
app.get('/api/inspections', async (req, res) => {
    try {
        const allInspections = await db.select().from(inspections).orderBy(desc(inspections.createdAt));
        res.json(allInspections);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inspections' });
    }
});

app.post('/api/inspections', async (req, res) => {
    try {
        const newInspection = await db.insert(inspections).values(req.body).returning();
        res.json(newInspection[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create inspection' });
    }
});

// --- Chat Routes ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userId } = req.body;

        // 1. Save User Message
        await db.insert(chatLogs).values({ message, userId, role: 'user' });

        // 2. Call OpenAI (if available)
        let reply = "Maaf, sistem sedang offline.";

        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are an expert Safety Officer assistant (P2H & ERT). Respond concisely, friendly, and professional in Indonesian." },
                    { role: "user", content: message }
                ],
                model: "gpt-3.5-turbo",
            });
            reply = completion.choices[0].message.content || reply;
        } else {
            reply = "API Key OpenAI belum dikonfigurasi. Mohon cek .env file.";
        }

        // 3. Save AI Response
        await db.insert(chatLogs).values({ message: reply, userId, role: 'assistant' });

        res.json({ reply });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

// --- Schedule Routes ---
app.post('/api/schedules', async (req, res) => {
    try {
        const { title, date, type, unit, notes, userId } = req.body;
        await db.insert(schedules).values({
            title,
            date: new Date(date),
            type,
            unit,
            notes,
            userId,
            status: 'Scheduled'
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Create Schedule Error:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

app.get('/api/schedules', async (req, res) => {
    try {
        const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
        let query = db.select().from(schedules).orderBy(desc(schedules.date));

        if (userId) {
            // @ts-ignore
            query.where(eq(schedules.userId, userId));
        }

        const data = await query;
        res.json(data);
    } catch (error) {
        console.error('Get Schedules Error:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

// --- APAR Inspection Routes ---
app.post('/api/apar', async (req, res) => {
    try {
        const { date, location, unitNumber, capacity, tagNumber, checklistData, condition, notes, pic, userId } = req.body;
        await db.insert(aparInspections).values({
            date: new Date(date),
            location,
            unitNumber,
            capacity,
            tagNumber,
            checklistData,
            condition,
            notes,
            pic,
            userId
        });

        // Fetch the latest inserted record
        const result = await db.select().from(aparInspections).orderBy(desc(aparInspections.id)).limit(1);
        res.json(result[0] || { id: Date.now(), success: true });
    } catch (error) {
        console.error('APAR Create Error:', error);
        res.status(500).json({ error: 'Failed to create APAR inspection' });
    }
});

app.get('/api/apar', async (req, res) => {
    try {
        const data = await db.select().from(aparInspections).orderBy(desc(aparInspections.id));
        res.json(data);
    } catch (error) {
        console.error('APAR Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch APAR inspections' });
    }
});

// --- Hydrant Inspection Routes ---
app.post('/api/hydrant', async (req, res) => {
    try {
        const { date, location, shift, checklistData, notes, pic, userId } = req.body;
        await db.insert(hydrantInspections).values({
            date: new Date(date),
            location,
            shift,
            checklistData,
            notes,
            pic,
            userId
        });

        const result = await db.select().from(hydrantInspections).orderBy(desc(hydrantInspections.id)).limit(1);
        res.json(result[0] || { id: Date.now(), success: true });
    } catch (error) {
        console.error('Hydrant Create Error:', error);
        res.status(500).json({ error: 'Failed to create Hydrant inspection' });
    }
});

app.get('/api/hydrant', async (req, res) => {
    try {
        const data = await db.select().from(hydrantInspections).orderBy(desc(hydrantInspections.id));
        res.json(data || []);
    } catch (error: any) {
        // Handle Neon driver bug with empty tables
        if (error?.cause?.message?.includes('Cannot read properties of null')) {
            res.json([]);
            return;
        }
        console.error('Hydrant Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch Hydrant inspections' });
    }
});

// --- PICA Routes ---
app.post('/api/pica', async (req, res) => {
    try {
        const { title, description, imageData, deadline, userId } = req.body;
        await db.insert(picaReports).values({
            title,
            description,
            imageData,
            deadline: deadline ? new Date(deadline) : null,
            userId,
            status: 'OPEN'
        });

        const result = await db.select().from(picaReports).orderBy(desc(picaReports.id)).limit(1);
        res.json(result[0] || { id: Date.now(), success: true });
    } catch (error) {
        console.error('PICA Create Error:', error);
        res.status(500).json({ error: 'Failed to create PICA report' });
    }
});

app.get('/api/pica', async (req, res) => {
    try {
        const data = await db.select().from(picaReports).orderBy(desc(picaReports.createdAt));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch PICA reports' });
    }
});

app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
});
