import { randomUUID } from "node:crypto";
import {
    GetObjectCommand,
    ObjectCannedACL,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import {
    AWS_REIGION,
    AWS_S3_ACCESS_KEY,
    AWS_S3_BUCKET_NAME,
    AWS_S3_Secret_ACCESS_KEY,
    AWS_S3_ENDPOINT,
} from "../../config/config.service.js";
import { StoreEnum } from "../enum/multer.enum.js";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";

export class S3Service {
    private readonly client: S3Client;
    constructor() {
        this.client = new S3Client({
            region: AWS_REIGION,
            credentials: {
                accessKeyId: AWS_S3_ACCESS_KEY,
                secretAccessKey: AWS_S3_Secret_ACCESS_KEY,
            },
            ...(AWS_S3_ENDPOINT
                ? { endpoint: AWS_S3_ENDPOINT, forcePathStyle: true }
                : {}),
        });
    }

    async uploadFile({
        ACL = ObjectCannedACL.private,
        path = "General",
        file,
        store_type = StoreEnum.memory,
    }: {
        ACL?: ObjectCannedACL;
        path?: string;
        file: Express.Multer.File;
        store_type?: StoreEnum;
    }) {
        const command = new PutObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            ACL,
            Key: `social_media_app/${path}/${randomUUID()}__${file.originalname}`,
            Body:
                store_type == StoreEnum.memory
                    ? file.buffer
                    : createReadStream(file.path),
            ContentType: file.mimetype,
        });
        await this.client.send(command);
        return command.input.Key;
    }
    async getFile(Key: string) {
        const command = new GetObjectCommand({
            Key,
            Bucket: AWS_S3_BUCKET_NAME,
        });
        await this.client.send(command);
        return command.input.Key;
    }

    async uploadFiles({
        ACL = ObjectCannedACL.private,
        path = "General",
        files,
        store_type = StoreEnum.disk,
        isLarge = false,
    }: {
        ACL?: ObjectCannedACL;
        path?: string;
        files: Express.Multer.File[];
        store_type?: StoreEnum;
        isLarge?: Boolean;
    }) {
        let keys;
        if (isLarge) {
            keys = await Promise.all(
                files.map((file) => {
                    return this.uploadLargeFile({
                        file,
                        path,
                        store_type,
                        ACL,
                    });
                }),
            );
        } else {
            keys = await Promise.all(
                files.map((file) => {
                    return this.uploadFile({ file, path, store_type, ACL });
                }),
            );
        }
    }
    async uploadLargeFile({
        ACL = ObjectCannedACL.private,
        path = "General",
        file,
        store_type = StoreEnum.disk,
    }: {
        ACL?: ObjectCannedACL;
        path?: string;
        file: Express.Multer.File;
        store_type?: StoreEnum;
    }) {
        const command = new Upload({
            client: this.client,
            params: {
                Bucket: AWS_S3_BUCKET_NAME,
                ACL,
                Key: `social_media_app/${path}/${randomUUID()}__${file.originalname}`,
                Body:
                    store_type == StoreEnum.memory
                        ? file.buffer
                        : createReadStream(file.path),
                ContentType: file.mimetype,
            },
        });
        const result = await command.done();
        return result.Key;
    }
}
