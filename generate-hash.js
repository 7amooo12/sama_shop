const crypto = require('crypto');
const util = require('util');

const scryptAsync = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

hashPassword('admin123').then(hash => {
  console.log('Generated hash for admin123:');
  console.log(hash);
}).catch(err => {
  console.error('Error generating hash:', err);
});