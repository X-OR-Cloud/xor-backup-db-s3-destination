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
import dotenv from 'dotenv';
dotenv.config();

const dump_mysql = async (host,port,username,password) => {
    try {
        const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_HOST, S3_BUCKET, S3_REGION } = process.env;

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const file_name = `mysql-all-${get_date_time().date}.sql`;
        const date = get_date_time().date;
        const time = get_date_time().time;

        fs.mkdirSync(`${__dirname}/backups/mysql`, { recursive: true }, (err) => {
            if (err) throw err;
        });

        let auth_username = '';
        let auth_password = '';

        if (username && password) {
            auth_username = `-u ${username}`;
            auth_password = `export MYSQL_PWD="${password}";`
        }

        const command_line = `${auth_password} mysqldump -h ${host} -P ${port} ${auth_username} --all-databases > ${__dirname}/backups/mysql/mysql-all-${date}.sql`;
        const options = { shell: true };
        const { stdout, stderr } = await execPromise(command_line, options);

        if (stderr) {
            throw new Error();
        }

        const state_push = await push_s3(S3_ACCESS_KEY, S3_SECRET_KEY, S3_HOST, S3_BUCKET, S3_REGION, `${__dirname}/backups/mysql/${file_name}`,'mysql');
        
        if (!state_push) {
            throw new Error();
        }

        await fs.unlinkSync(`${__dirname}/backups/mysql/${file_name}`);

        await send_message('Success Backup MySQL');

        return true;
    } catch (error) {
        console.log(error)
        write_log('ERROR', 'Fail to backup MYSQL');
    }
}

export default dump_mysql