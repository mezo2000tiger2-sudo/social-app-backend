import { App, cert, initializeApp } from "firebase-admin";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { getMessaging } from "firebase-admin/messaging";

class NotificationService {
    private client: App;
    constructor() {
        this.client = initializeApp({
            credential: cert(
                readFileSync(
                    JSON.parse(
                        join(
                            __dirname,
                            "../../config/social-app-f8db4-firebase-adminsdk-fbsvc-2c16d02af1.json",
                        ),
                    ),
                ) as unknown as string,
            ),
        });
    }
    async sendNotification({
        token,
        data,
    }: {
        token: string;
        data: { title: string; body: string };
    }) {
        return await getMessaging(this.client).send({
            token,
            data,
        });
    }
}
export default new NotificationService();
