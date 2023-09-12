import nodemailer from 'nodemailer';
import { logger } from '../logger.js';

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

try {
    transporter.verify()
    logger.info("Ready to send emails")
} catch (error) {
    logger.error(error)
}
