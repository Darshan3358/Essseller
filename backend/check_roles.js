const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const roles = await db.collection('sellers').distinct('role');
        console.log('Distinct Roles:', roles);

        for (const role of roles) {
            const count = await db.collection('sellers').countDocuments({ role });
            console.log(`- ${role}: ${count}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

test();
