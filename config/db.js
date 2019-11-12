const dotenv = require('dotenv')
dotenv.config();
let url = process.env.DB_URL

if(process.env.NODE_ENV==='test'){
    url = process.env.DB_URL_TEST
}

module.exports = { url }