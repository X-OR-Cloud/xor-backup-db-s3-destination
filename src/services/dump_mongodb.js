import fs from 'fs';
import write_log from './log.js';
import get_date_time from './time.js';
import push_s3 from './push_s3.js';
import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import send_message from './send_message.js';
import adm_zip from 'adm-zip';
import dotenv from 'dotenv';
dotenv.config();

const dump_mongodb = async (host,port,username,password) => {
    try {
        const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_HOST, S3_BUCKET, S3_REGION } = process.env;
        const zip = new adm_zip();
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const file_name = `mongodb-all-${get_date_time().date}.zip`;
        const folder_name = `mongodb-all-${get_date_time().date}`;
        const date = get_date_time().date;
        const time = get_date_time().time;

        fs.mkdirSync(`${__dirname}/backups/mongodb`, { recursive: true }, (err) => {
            if (err) throw err;
        });

        let auth_username = '';
        let auth_password = '';

        if (username && password) {
            auth_username = `--username ${username}`;
            auth_password = `--password ${password}`;
        }

        const command_line = `mongodump --host ${host} --port ${port} ${auth_username} ${auth_password} --out ${__dirname}/backups/mongodb/${folder_name}`;
        const options = { shell: true };
        const { stdout, stderr } = await execPromise(command_line, options);
      
        if (stdout) {
            return false;
        }

        await zip.addLocalFolder(`${__dirname}/backups/mongodb/${folder_name}`);
        await zip.writeZip(`${__dirname}/backups/mongodb/${folder_name}/${file_name}`);

        const state_push = await push_s3(S3_ACCESS_KEY, S3_SECRET_KEY, S3_HOST, S3_BUCKET, S3_REGION, `${__dirname}/backups/mongodb/${folder_name}/${file_name}`,'mongodb');
        
        if (!state_push) {
            throw new Error();
        }

        await fs.rmSync(`${__dirname}/backups/mongodb/${folder_name}`, { recursive: true }, (err) => {
            if (err) {
                console.error('err del folder mongodb backup:', err);
                return;
            }
        });


        await send_message('Success Backup MONGODB');

        return true;
    } catch (error) {
        console.log(error)
        write_log('ERROR', 'Fail to backup MONGODB');
        return false;
    }
}

export default dump_mongodb;