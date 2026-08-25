const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const admin = await db.collection('sellers').findOne({ role: 'admin' });
        console.log('Sample Admin:', admin);

        const allAdmins = await db.collection('sellers').find({ role: 'admin' }).toArray();
        console.log('All Admin Emails:', allAdmins.map(a => a.email));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

test();
