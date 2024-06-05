import { S3Client, CreateBucketCommand, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import write_log from './log.js';
import get_date_time from './time.js';
import fs from 'fs';

const push_s3 = async (access_key, secret_key, host, bucket, region, file_path, name) => {
    try {
        const s3Client = new S3Client({
            region: region,
            credentials: {
              accessKeyId: access_key,
              secretAccessKey: secret_key,
            },
            endpoint: host,
        });
    
        const exist = await check_and_create_bucket(s3Client, bucket);

        if (!exist) {
            return false;
        }
        const s3_path = `${name}-${get_date_time().date}-${get_date_time().time}`
        const object_key = `${s3_path}/${name}-${get_date_time().date}`;
        const acl = "private"; // "private", "public-read", "public-read-write", "authenticated-read", "aws-exec-read", và "bucket-owner-read"

        const file_stream = fs.createReadStream('logs.txt');

        const uploadParams = {
            Bucket: bucket, // Required
            Key: object_key, // Required
            Body: file_stream, // Required
            ACL: acl, // Not required
        };

        const response = await s3Client
        .send(new PutObjectCommand(uploadParams))
        .then(() => {
            write_log('SUCCESS', `File: ${file_path} Updated`);
            return true;
        })
        .catch((err) => {
            console.log(err)
            return false;
        });

        if (!response) {
            throw new Error();
        }
        
        return true;
    } catch (error) {
        write_log('ERROR', `Error Push: ${file_path} To Bucket: ${bucket}`);
        return false;
    }
}

const check_and_create_bucket = async (s3_client, bucket_name) => {
    try {
        const buckets = await s3_client.send(new ListBucketsCommand())
        .then((res) => {
                return res.Buckets;
        })
        .catch((err) => {
                throw new Error(err);
        });

        const bucket_exist = buckets.some(x => x.Name == bucket_name);

        if (!bucket_exist) {
            const acl = "private"; // "private", "public-read", "public-read-write", "authenticated-read", "aws-exec-read", và "bucket-owner-read"
            const createBucketParams = {
                Bucket: bucket_name,
                ACL: acl 
            };

            const create = await s3_client.send(new CreateBucketCommand(createBucketParams))
            .then(() => {
                write_log('SUCCESS', `Created Bucket: ${bucket_name}`);
                return true;
            })
            .catch((err) => {
                write_log('ERROR', `Error Bucket: ${bucket_name}`);
                return false;
            });

            if (!create) {
                return false;
            }
        }

        return true;
    } catch (error) {
        write_log('ERROR', error.message);

        return false;
    }
}

export default push_s3;