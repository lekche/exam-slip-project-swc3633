const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'exam_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

promisePool.getConnection()
    .then(conn => {
        console.log('✅ Sambungan MySQL berjaya ke database:', process.env.DB_NAME || 'exam_system');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Gagal menyambung ke MySQL:', err.message);
    });

module.exports = promisePool;