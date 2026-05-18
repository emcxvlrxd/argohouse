import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

const [rows] = await conn.execute(
    'SHOW INDEX FROM wp_player_pins'
);

console.log(JSON.stringify(rows, null, 2));

await conn.end();