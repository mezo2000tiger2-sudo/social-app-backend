"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generat_otp = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const node_crypto_1 = require("node:crypto");
const config_service_js_1 = require("../../config/config.service.js");
const sendEmail = async ({ to, subject, html = '', attachments, text = '' } = {}) => {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: config_service_js_1.EMAIL,
            pass: config_service_js_1.PASSWORD
        },
    });
    const info = await transporter.sendMail({
        from: '"mustafa ibrahim" <mezo2000tiger2@gmail.com>', // sender address
        to, // list of recipients
        subject, // subject line
        html, // HTML body
        text,
        attachments: attachments || []
    });
    return info.accepted.length > 0;
};
exports.sendEmail = sendEmail;
const generat_otp = () => {
    return (0, node_crypto_1.randomInt)(100000, 1000000).toString();
};
exports.generat_otp = generat_otp;
//# sourceMappingURL=sendEmail.js.map