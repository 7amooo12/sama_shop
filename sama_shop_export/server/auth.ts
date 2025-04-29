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
