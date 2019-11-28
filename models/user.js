const mongoose = require('mongoose')
const val = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const secret = require('../config/secret').secret
const shortid = require('shortid');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    admin:{
        type: Boolean,
        default:false
    },
    personal_email: {
        type: String,
        required: true,
        trim: true, 
        index: {
            unique: true, 
            dropDups: true
        },
        validate(value) {
            if (!val.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        }

    },
    phone_number:{
        type: String
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    short: {
        type: String
    },
    contacts:[{type:mongoose.Schema.Types.ObjectId}]
}, {
    timestamps: true,
})

// toJSON() method is called when returning user
// This will return the user without returning the hashed password or JWTs
userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    return userObj
}

// Generates a JWT on authentication
// Token contains user ID
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({
        _id: user._id.toString()
    }, secret, { expiresIn: 60 * 60 })
    user.tokens = user.tokens.concat({
        token
    })
    await user.save()
    return token
}

// clearOldTokens() gets called whenever user signs in
// Deletes expired tokens from user's tokens array
userSchema.methods.clearOldTokens = async function(){
    const user = this
    const tokens_new = await user.tokens.filter((token)=>{
        try {
            jwt.verify(token.token, secret)
            return true
        } catch(e){
            if(e.name === 'TokenExpiredError'){
                return false
            }
        }
    })
    user.tokens = tokens_new
    await user.save()
}

// Add Contact to Contacts list
userSchema.methods.addContact = async function(new_contact_id){
    const user = this
    if(user.contacts.includes(new_contact_id)===false){
        console.log('new');
        new_contacts = user.contacts.concat(new_contact_id)
        user.contacts = new_contacts
        await user.save()
        return true
    } else {
        return false
    }
}

// Remove Contact from Contacts list
userSchema.methods.removeContact = async function(contact_id){
    const user = this
    if(user.contacts.includes(new_contact_id)===true){
        let new_contacts = user.contacts.filter(id => !(id.equals(contact_id)))
        user.contacts = new_contacts
        await user.save()
        return true
    } else {
        return false
    }
}

// Used for Sign In and Sign Up
// Finds user if user exists
// If user exists, bcrypt checks if provided user details are correct 
userSchema.statics.findByCredentials = async (personal_email, password) => {
    const user = await User.findOne({
        personal_email
    })
    if (!user) {
        throw 'User Does not exist.'
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw 'Wrong credentials, please enter correct email and password.'
    }
    return user
}

// Hashes password before saving to db
userSchema.pre('save', async function (next) {
    const user = this
    if(user.short === undefined){
        user.short = shortid.generate()
    }
    if (user.isModified('password')) {
        const salt = await bcrypt.genSaltSync(10)
        user.password = await bcrypt.hash(user.password, salt)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User