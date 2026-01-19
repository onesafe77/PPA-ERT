import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    schema: './server/schema.ts',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
