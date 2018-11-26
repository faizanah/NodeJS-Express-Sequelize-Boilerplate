require('dotenv').config();
module.exports = {
    "development": {
      "secret":  process.env.SECRET,
      "username": process.env.DATABSE_USERNAME,
      "password": process.env.DATABASE_PASSWORD,
      "database": process.env.DATABASE_NAME,
      "host": process.env.DATABASE_HOST,
      "port": 5432,
      "dialect": "postgres"
    },
    "test": {
        "secret":  process.env.SECRET,
        "username": process.env.DATABSE_USERNAME,
        "password": process.env.DATABASE_PASSWORD,
        "database": process.env.DATABASE_NAME,
        "host": process.env.DATABASE_HOST,
        "port": 5432,
        "dialect": "postgres"
    },
    "production": {
        "secret":   process.env.SECRET,
        "username": process.env.DATABSE_USERNAME,
        "password": process.env.DATABASE_PASSWORD,
        "database": process.env.DATABASE_NAME,
        "host": process.env.DATABASE_HOST,
        "port": 5432,
        "dialect": "postgres",
        "dialectOptions": {
            "bigNumberStrings": true
        }
    }
};
