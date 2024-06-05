import botTelegram from "node-telegram-bot-api";
import dotenv from 'dotenv';
dotenv.config();

const send_message = async (message) => {
    try {
        const { TELEGRAM_BOT_TOKEN, TELEGRAM_ROOM_ID } = process.env;
        
        if (!TELEGRAM_BOT_TOKEN && !TELEGRAM_ROOM_ID) {
            return false;
        }

        const bot = new botTelegram(TELEGRAM_BOT_TOKEN, { polling: false });

        await bot.sendMessage(TELEGRAM_ROOM_ID, message).catch(() => {
            throw new Error("Error")
        });

        bot.close;
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

export default send_message;