import { randomUUID } from "node:crypto";
import {
    GetObjectCommand,
    ObjectCannedACL,
    PutObjectCommand,
    S3Client,
    ListObjectsCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand
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
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default class S3Service {
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
    async deleteFile(Key: string) {
        const command = new DeleteObjectCommand({
            Key,
            Bucket: AWS_S3_BUCKET_NAME,
        });
        return await this.client.send(command);
    }
    async deleteFiles(Keys: string[]) {
        const mappedKeys=Keys.map((key)=>{
            return {Key:key}
        })
        const command = new DeleteObjectsCommand({
            Delete:{
                Objects:mappedKeys
            },
            Bucket: AWS_S3_BUCKET_NAME,
        });
        return await this.client.send(command);
    }
    async getFile(Key: string) {
        const command = new GetObjectCommand({
            Key,
            Bucket: AWS_S3_BUCKET_NAME,
        });
        return await this.client.send(command);
    }
    async getFiles(FolderName: string) {
        const command = new ListObjectsCommand({
            Prefix:`social_media_app/${FolderName}`,
            Bucket: AWS_S3_BUCKET_NAME,
        });
        return await this.client.send(command);
    }
    async deleteFolder(FolderName: string) {
        const {Contents}=await this.getFiles(FolderName)
        const mappedData=Contents?.map((k)=>{
            return k.Key
        })
        return this.deleteFiles(mappedData as string[])
    }
    async createPreSignedUrl({
        path = "General",
        ContentType,
        fileName,
        expiresIn,
    }: {
        path?: string;
        ContentType: string;
        fileName: string;
        expiresIn?: number;
    }) {
        const Key = `social_media_app/${path}/${randomUUID()}__${fileName}`;
        const command = new PutObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key,
            ContentType,
        });
        const url = await getSignedUrl(this.client, command, {
            expiresIn: expiresIn ?? 60,
        });
        return { url, Key };
    }
    async getPreSignedUrl({
        Key,
        expiresIn,
        download,
    }: {
        Key: string;
        expiresIn?: number;
        download: Boolean;
    }) {
        const command = new GetObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key,
            ResponseContentDisposition: download
                ? `attachment; filename="${Key.split("/").pop()}"`
                : undefined,
        });
        const url = await getSignedUrl(this.client, command, {
            expiresIn: expiresIn ?? 60,
        });
        return url;
    }
}
