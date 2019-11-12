const dotenv = require('dotenv')
dotenv.config();
const secret = process.env.SECRET;
module.exports = { secret }