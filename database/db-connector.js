// Import local credentials
import credentials from './credentials.js';

// Get an instance of mysql we can use in the app
import mysql from 'mysql';

// Create a 'connection pool' using the provided credentials
export const db_pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : credentials.username,
    password        : credentials.password,
    database        : credentials.database
});

export default db_pool;