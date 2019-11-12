// Authentication Middleware
// Verifies that the token provided is a valid token

const jwt = require('jsonwebtoken')
const User = require('../models/user')
const secretfile = require('../config/secret')
const secret = secretfile.secret

// Authentication Middleware
// Checks for Authorization header in HTTP request
// Authorization Header will be as such:
// ```Bearer TOKEN``` where TOKEN is the JWT
// ```Bearer TOKEN``` becomes ```TOKEN``` and is then verified by jwt library
// If the verification succeeds middleware will attach token and user to request body
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, secret)
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token
        })
        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        if(e.name === 'TokenExpiredError'){
            return res.status(401).send({
                error: 'Token Expired. Please Sign In again. '
            })
        }
        res.status(401).send({
            error: 'Please Authenticate. '
        })
    }
}

module.exports = auth