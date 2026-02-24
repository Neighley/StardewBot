const { Pool } = require('pg');

const pool = new Pool({
    user: 'stardewbot_bot',
    host: 'localhost',
    database: 'stardewbot',
    password: 'v5zyhBao!',
    port: 5432,
});

module.exports = pool;