"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encrypt = Encrypt;
exports.Decrypt = Decrypt;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_service_js_1 = require("../../config/config.service.js");
// 🔑 Use 32 bytes (256 bits) for AES-256
const ENCRYPTION_KEY = Buffer.from(config_service_js_1.ENCRYPT_KEY, 'hex');
function Encrypt(plainText) {
    const iv = node_crypto_1.default.randomBytes(config_service_js_1.IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}
// Decrypt function
function Decrypt(text) {
    const [ivHex, encryptedText] = text.split(':');
    if (!ivHex || !encryptedText) {
        throw new Error('Invalid encrypted text');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = node_crypto_1.default.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
//# sourceMappingURL=encrypt.js.map