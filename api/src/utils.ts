import { createCipheriv, scrypt } from 'crypto';
import { promisify } from 'util';

export default class Utils {
    static hashToSha256(text: string): string {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    static async encryptToAES(text: string): Promise<string> {
        const algorithm = 'aes-256-cbc';
        const key = (await promisify(scrypt)('thisisthesecretkey', 'pepper', 32)) as Buffer;
        const iv = Buffer.alloc(16, 0);

        const cipher = createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    static isValidPassword(password: string): boolean {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
        return regex.test(password)
    }

    static isValidUsername(username: string): boolean {
        const regex = /^[^\s]{1,12}$/;
        return regex.test(username)
    }
}