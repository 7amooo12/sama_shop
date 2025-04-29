import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// التأكد من وجود متغيرات البيئة المطلوبة
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('متغيرات البيئة SUPABASE_URL و SUPABASE_ANON_KEY مطلوبة');
}

// إنشاء عميل Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// إنشاء عميل Supabase بصلاحيات الخدمة (للعمليات الإدارية)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);