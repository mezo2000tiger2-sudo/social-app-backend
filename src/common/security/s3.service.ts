import { randomUUID } from 'node:crypto';
import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_REIGION, AWS_S3_ACCESS_KEY, AWS_S3_BUCKET_NAME, AWS_S3_Secret_ACCESS_KEY } from "../../config/config.service.js";
import { StoreEnum } from '../enum/multer.enum.js';
import { createReadStream } from 'node:fs';


export class S3Service{
    private readonly client:S3Client
    constructor(){
        this.client=new S3Client({
            region:AWS_REIGION,
            credentials:{
                accessKeyId:AWS_S3_ACCESS_KEY,
                secretAccessKey:AWS_S3_Secret_ACCESS_KEY
            }
        })
    }

    async uploadFile({
        ACL=ObjectCannedACL.private,
        path='General',
        file,
        store_type=StoreEnum.memory
    }:{
        ACL?:ObjectCannedACL,
        path?:string,
        file:Express.Multer.File,
        store_type?: StoreEnum;
    }){
        const command =new PutObjectCommand({
            Bucket:AWS_S3_BUCKET_NAME,
            ACL,
            Key:`social_media_app/${path}/${randomUUID()}__${file.originalname}`,
            Body:store_type == StoreEnum.memory? file.buffer:createReadStream(file.path),
            ContentType:file.mimetype
        })
        await this.client.send(command)
        return command.input.Key
    }
}