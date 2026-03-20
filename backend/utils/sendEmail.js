const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.NEXT_PUBLIC_APP_NAME || 'SmartSeller'} <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending error:', error);
        // Don't throw if email fails in dev, just log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log('Email sending failed, but continuing for development.');
        } else {
            throw error;
        }
    }
};

module.exports = sendEmail;
