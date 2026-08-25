const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const testTargetEmail = async () => {
    const target = 'sahilcoder.dev@gmail.com';
    console.log(`--- Testing Email to ${target} ---`);
    console.log('Using Sender:', process.env.SMTP_EMAIL);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    try {
        console.log('Sending...');
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: target,
            subject: 'SmartSeller Test Email 2',
            text: 'This is a test email to verify delivery to ' + target
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Email Failed:', error.message);
    }
};

testTargetEmail();
