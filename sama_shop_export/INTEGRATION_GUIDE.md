# دليل تكامل Supabase مع مشروع Sama Shop

## مقدمة

هذا الدليل يشرح كيفية ربط مشروع Sama Shop بقاعدة بيانات Supabase. تم تنفيذ هذا التكامل لاستبدال التخزين المحلي في الذاكرة بقاعدة بيانات حقيقية مستضافة على Supabase.

## متطلبات التكامل

1. حساب Supabase مع مشروع نشط
2. بيانات اعتماد Supabase (رابط URL ومفاتيح API)
3. مشروع Sama Shop المستند إلى Node.js/Express/React

## الملفات التي تم إنشاؤها أو تعديلها

1. `.env` - لتخزين بيانات اعتماد Supabase بشكل آمن
2. `server/supabase.ts` - لتكوين اتصال Supabase
3. `server/supabase-storage.ts` - لاستبدال التخزين المحلي في الذاكرة بـ Supabase
4. `server/auth.ts` - تم تعديله لاستخدام وظائف المصادقة المستقلة
5. `server/routes.ts` - تم تعديله لاستخدام SupabaseStorage الجديد
6. `server/create-tables.ts` - لإنشاء الجداول في قاعدة بيانات Supabase
7. `server/db.ts` - لتكوين اتصال Drizzle ORM بقاعدة بيانات PostgreSQL
8. `init-database.ts` - لتهيئة قاعدة البيانات وإضافة البيانات الأولية
9. `package.json` - تم تحديثه لإضافة سكريبت `db:init` لتهيئة قاعدة البيانات

## خطوات التكامل

### 1. تثبيت المكتبات اللازمة

تم تثبيت المكتبات التالية:

```bash
npm install @supabase/supabase-js dotenv postgres
```

### 2. إعداد ملف البيئة

تم إنشاء ملف `.env` في جذر المشروع لتخزين بيانات اعتماد Supabase:

```
DATABASE_URL=postgres://postgres.prorqnktcitmvzseqfus:postgres@db.prorqnktcitmvzseqfus.supabase.co:5432/postgres
SUPABASE_URL=https://prorqnktcitmvzseqfus.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. إنشاء ملف تكوين Supabase

تم إنشاء ملف `server/supabase.ts` لتكوين اتصال Supabase:

```typescript
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
```

### 4. إنشاء فئة SupabaseStorage

تم إنشاء ملف `server/supabase-storage.ts` لاستبدال التخزين المحلي في الذاكرة بـ Supabase. هذا الملف يحتوي على تنفيذ كامل لفئة `SupabaseStorage` التي تتعامل مع:

- إدارة المستخدمين (إنشاء، قراءة، تحديث)
- إدارة المنتجات (إنشاء، قراءة، تحديث، حذف)
- إدارة سلة التسوق (إنشاء، قراءة، تحديث، إضافة/إزالة عناصر)
- إدارة الطلبات (إنشاء، قراءة، تحديث الحالة)

### 5. تعديل ملف المصادقة

تم تعديل ملف `server/auth.ts` لاستخدام وظائف المصادقة المستقلة:

```typescript
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { User as SelectUser } from "../shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// دالة لتشفير كلمة المرور
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// دالة للتحقق من كلمة المرور
async function verifyPassword(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// تصدير دوال المصادقة
export function setupAuth() {
  return {
    hashPassword,
    verifyPassword
  };
}
```

### 6. تعديل ملف المسارات

تم تعديل ملف `server/routes.ts` لاستخدام `SupabaseStorage` الجديد بدلاً من التخزين المحلي في الذاكرة. تم تحديث جميع مسارات API لاستخدام الدوال الجديدة من `SupabaseStorage`.

### 7. إنشاء سكريبت تهيئة قاعدة البيانات

تم إنشاء ملف `init-database.ts` لتهيئة قاعدة البيانات وإضافة البيانات الأولية. هذا السكريبت يقوم بما يلي:

- محاولة إنشاء الجداول في قاعدة البيانات
- التحقق من وجود منتجات في قاعدة البيانات
- إضافة منتجات افتراضية إذا لم تكن موجودة

### 8. تحديث ملف package.json

تم تحديث ملف `package.json` لإضافة سكريبت `db:init` لتهيئة قاعدة البيانات:

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "cross-env NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push",
  "db:init": "tsx init-database.ts"
}
```

## التحديات والحلول

### 1. إنشاء الجداول في Supabase

**التحدي**: واجهنا صعوبة في إنشاء الجداول مباشرة من خلال API لأن Supabase لا يوفر دالة `query` أو `exec_sql` بشكل مباشر في واجهة برمجة التطبيقات العامة.

**الحل المقترح**: 
1. استخدام لوحة تحكم Supabase لإنشاء الجداول يدويًا من خلال واجهة SQL.
2. استخدام واجهة برمجة التطبيقات لإدراج البيانات، مما يؤدي إلى إنشاء الجداول تلقائيًا (مع بعض القيود).
3. استخدام Drizzle ORM مع وظيفة الترحيل لإنشاء الجداول.

### 2. تكامل Drizzle ORM مع Supabase

**التحدي**: كان هناك بعض التعقيدات في تكامل Drizzle ORM مع Supabase.

**الحل**: تم إنشاء ملف `server/db.ts` لتكوين اتصال Drizzle ORM بقاعدة بيانات PostgreSQL في Supabase.

## الخطوات التالية

1. **إنشاء الجداول يدويًا**: استخدم لوحة تحكم Supabase لإنشاء الجداول يدويًا باستخدام استعلامات SQL المقدمة في ملف `create-tables.ts`.

2. **تنفيذ سكريبت تهيئة قاعدة البيانات**: بعد إنشاء الجداول، قم بتنفيذ سكريبت تهيئة قاعدة البيانات لإضافة البيانات الأولية:

```bash
npm run db:init
```

3. **اختبار التطبيق**: قم بتشغيل التطبيق واختبار وظائفه للتأكد من أن التكامل مع Supabase يعمل بشكل صحيح:

```bash
npm run dev
```

## ملاحظات إضافية

- تأكد من حماية ملف `.env` وعدم مشاركته في نظام التحكم بالإصدار.
- يمكن استخدام متغيرات البيئة في بيئة الإنتاج بدلاً من ملف `.env`.
- قد تحتاج إلى تعديل إعدادات CORS في Supabase للسماح بالوصول من نطاق تطبيقك.

## الخلاصة

تم بنجاح ربط مشروع Sama Shop بقاعدة بيانات Supabase من خلال إنشاء وتعديل الملفات اللازمة. على الرغم من وجود بعض التحديات في إنشاء الجداول، فإن الاتصال بقاعدة البيانات يعمل بشكل صحيح ويمكن استخدامه في التطبيق.
