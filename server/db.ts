import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection pool
const poolConnection = mysql.createPool(process.env.DATABASE_URL!);

export const db = drizzle(poolConnection, { schema, mode: 'default' });
