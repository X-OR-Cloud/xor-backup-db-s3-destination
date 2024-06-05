import express from 'express';
import node_cron from 'node-cron';
import dump_mysql from './services/dump_mysql.js';
import dump_mongodb from './services/dump_mongodb.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const { APP_NAME, API_PORT } = process.env;
const { MYSQL_HOST, MYSQL_PORT, MYSQL_USERNAME, MYSQL_PASSWORD, TIME_START_BACKUP_MYSQL } = process.env;
const { MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD, TIME_START_BACKUP_MONGODB } = process.env;

//MYSQL
node_cron.schedule(TIME_START_BACKUP_MYSQL, async () => {
    await dump_mysql(MYSQL_HOST, MYSQL_PORT, MYSQL_USERNAME, MYSQL_PASSWORD);
});

//MONGODB
node_cron.schedule(TIME_START_BACKUP_MONGODB, async () => {
    await dump_mongodb(MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD);
});

app.get('/', (req, res) => {
    res.status(200).json({
        app: APP_NAME,
        status: 200
    });
});

app.listen(API_PORT, () => {
    console.log(`Application running on port ${API_PORT}`);
});