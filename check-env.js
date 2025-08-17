// Check environment variables
// Run with: node check-env.js

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log("Environment Variables Check:");
console.log("==========================");

const requiredVars = [
    'DATABASE_URL',
    'GEMINI_API_KEY',
    'UPLOADTHING_SECRET',
    'UPLOADTHING_APP_ID',
    'RESEND_API_KEY'
];

const optionalVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
];

console.log("\nRequired Variables:");
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
    }
});

console.log("\nOptional Variables:");
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
        console.log(`⚠️  ${varName}: NOT SET`);
    }
});

console.log("\nDatabase URL format check:");
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    if (dbUrl.includes('neon.tech')) {
        console.log("✅ Database URL appears to be a valid Neon URL");
    } else {
        console.log("⚠️  Database URL doesn't appear to be a Neon URL");
    }
} else {
    console.log("❌ No database URL found");
}

console.log("\nGemini API Key check:");
const geminiKey = process.env.GEMINI_API_KEY;
if (geminiKey) {
    if (geminiKey.startsWith('AIza')) {
        console.log("✅ Gemini API key appears to be valid");
    } else {
        console.log("⚠️  Gemini API key format doesn't match expected pattern");
    }
} else {
    console.log("❌ No Gemini API key found");
}

console.log("\nResend API Key check:");
const resendKey = process.env.RESEND_API_KEY;
if (resendKey) {
    if (resendKey.startsWith('re_')) {
        console.log("✅ Resend API key appears to be valid");
    } else {
        console.log("⚠️  Resend API key format doesn't match expected pattern");
    }
} else {
    console.log("❌ No Resend API key found");
    console.log("💡 To enable email sharing, get a Resend API key from: https://resend.com");
} 