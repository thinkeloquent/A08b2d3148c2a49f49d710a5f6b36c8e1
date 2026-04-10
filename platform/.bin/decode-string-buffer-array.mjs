import { webcrypto } from 'node:crypto';
import fs from 'node:fs';

// --- Turn a phrase + salt into a secure AES-256 key ---
async function getKeyFromPhrase(passphrase, saltString) {
    const encoder = new TextEncoder();

    const keyMaterial = await webcrypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return await webcrypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(saltString),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );
}

async function decode() {
    const passphrase = process.argv[2];
    const salt = process.argv[3];
    const inputFile = process.argv[4] || 'encoded.dat';

    if (!passphrase || !salt) {
        console.error('Usage: node decode-string-buffer-array.mjs <passphrase> <salt> [inputFile]');
        process.exit(1);
    }

    const readData = fs.readFileSync(inputFile);
    const iv = readData.subarray(0, 12);
    const encryptedContent = readData.subarray(12);

    const key = await getKeyFromPhrase(passphrase, salt);

    try {
        const decryptedBuffer = await webcrypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            encryptedContent
        );

        const decoder = new TextDecoder();
        const originalString = decoder.decode(decryptedBuffer);
        console.log(originalString);
    } catch (error) {
        console.error('Decryption failed! Incorrect passphrase or salt.');
        process.exit(1);
    }
}

decode();
