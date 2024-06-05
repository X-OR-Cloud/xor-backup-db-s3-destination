import fs from 'fs';
import get_date_time from './time.js';

const write_log = async (type, message) => {
    if (!fs.existsSync('logs.txt')) {
        fs.writeFileSync('logs.txt', '{}');
    }
    let data = {
        type: type,
        message: message,
        date: get_date_time().date,
        time: get_date_time().time,
    }
    fs.appendFileSync('logs.txt', `\n,${JSON.stringify(data)}`, 'utf8');
}

export default write_log