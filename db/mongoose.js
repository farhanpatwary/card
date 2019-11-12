const mongoose = require('mongoose')

const db = require('../config/db')

mongoose.connect(db.url, {
    useNewUrlParser: true,
    useFindAndModify:false,
    useCreateIndex: true,
    useUnifiedTopology: true
})