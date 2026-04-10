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
        ["encrypt"]
    );
}

async function encode() {
    const passphrase = process.argv[2];
    const salt = process.argv[3];
    const inputText = process.argv[4];
    const outputFile = process.argv[5] || 'encoded.dat';

    if (!passphrase || !salt || !inputText) {
        console.error('Usage: node encode-string-buffer-array.mjs <passphrase> <salt> <text> [outputFile]');
        process.exit(1);
    }

    const key = await getKeyFromPhrase(passphrase, salt);

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(inputText);

    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await webcrypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData
    );

    const fileContent = Buffer.concat([Buffer.from(iv), Buffer.from(encryptedBuffer)]);
    fs.writeFileSync(outputFile, fileContent);
    console.log(`Encrypted and saved to ${outputFile}`);
}

encode();
