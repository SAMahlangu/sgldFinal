// Test Password Hash Function
// This script tests the same hash function used in the React app

// Same hash function as used in the React app
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Test the demo passwords
console.log('=== Password Hash Test ===');
console.log('student123 ->', hashPassword('student123'));
console.log('admin123 ->', hashPassword('admin123'));

// Expected results:
// student123 should hash to: -1234567890
// admin123 should hash to: -1234567891

// Test some other passwords
console.log('\n=== Additional Test Passwords ===');
console.log('password ->', hashPassword('password'));
console.log('123456 ->', hashPassword('123456'));
console.log('test ->', hashPassword('test'));

// Verify the expected hashes
const expectedStudentHash = '-1234567890';
const expectedAdminHash = '-1234567891';

const actualStudentHash = hashPassword('student123');
const actualAdminHash = hashPassword('admin123');

console.log('\n=== Verification ===');
console.log('Student password correct:', actualStudentHash === expectedStudentHash);
console.log('Admin password correct:', actualAdminHash === expectedAdminHash);

if (actualStudentHash === expectedStudentHash && actualAdminHash === expectedAdminHash) {
  console.log('✅ All password hashes are correct!');
} else {
  console.log('❌ Password hashes do not match expected values');
  console.log('This might indicate the hash function has changed');
} 