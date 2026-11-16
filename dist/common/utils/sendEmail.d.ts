import type { SendMailOptions } from "nodemailer";
export declare const sendEmail: ({ to, subject, html, attachments, text }?: Partial<Pick<SendMailOptions, 'to' | 'subject' | 'html' | 'attachments' | 'text'>>) => Promise<boolean>;
export declare const generat_otp: () => string;
//# sourceMappingURL=sendEmail.d.ts.map