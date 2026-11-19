"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_S3_ENDPOINT = exports.AWS_S3_Secret_ACCESS_KEY = exports.AWS_S3_ACCESS_KEY = exports.AWS_S3_BUCKET_NAME = exports.AWS_REIGION = exports.CLIENT_ID = exports.CLIENT_SECRET = exports.PASSWORD = exports.EMAIL = exports.IV_LENGTH = exports.ENCRYPT_KEY = exports.REDIS_URI = exports.DB_URI = exports.PORT = void 0;
const dotenv_1 = require("dotenv");
const node_path_1 = require("node:path");
const NODE_ENV = (process.env.NODE_ENV ?? 'development');
const envPath = {
    development: '.env.development',
    production: '.env.production',
};
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)(`${envPath[NODE_ENV]}`) });
exports.PORT = +process.env.PORT;
exports.DB_URI = process.env.DB_URI;
exports.REDIS_URI = process.env.REDIS_URI;
exports.ENCRYPT_KEY = process.env.ENCRYPT_KEY;
exports.IV_LENGTH = +process.env.IV_LENGTH;
exports.EMAIL = process.env.EMAIL;
exports.PASSWORD = process.env.PASSWORD;
exports.CLIENT_SECRET = process.env.CLIENT_SECRET;
exports.CLIENT_ID = process.env.CLIENT_ID;
exports.AWS_REIGION = process.env.AWS_REIGION;
exports.AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
exports.AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY;
exports.AWS_S3_Secret_ACCESS_KEY = process.env.AWS_S3_Secret_ACCESS_KEY;
exports.AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT;
//# sourceMappingURL=config.service.js.map