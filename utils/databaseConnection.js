import mysql from "mysql2";
import * as dotenv from "dotenv";
dotenv.config();

const connectionPool = mysql.createPool({
    connectionLimit:10,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    user: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
});

export default connectionPool;