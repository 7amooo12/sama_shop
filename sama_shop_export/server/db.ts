import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// التأكد من وجود متغير البيئة DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('متغير البيئة DATABASE_URL مطلوب');
}

// إنشاء اتصال بقاعدة البيانات
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client);

// دالة لتنفيذ الترحيلات
export async function runMigrations() {
  try {
    console.log('بدء تنفيذ ترحيلات قاعدة البيانات...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('تم تنفيذ ترحيلات قاعدة البيانات بنجاح');
  } catch (error) {
    console.error('فشل في تنفيذ ترحيلات قاعدة البيانات:', error);
    throw error;
  }
}
