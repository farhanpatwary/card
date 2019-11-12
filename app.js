const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const user_router = require('./routes/user_routes')

// File at ./db/mongoose connects to Mongoose Database
// ./db/mongoose contains required Mongoose Config
require('./db/mongoose')

const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({
	extended: true
}));
app.get('/',(req,res)=>{
	res.send('default')
})
app.use(cors())
app.use(user_router)

module.exports = app 