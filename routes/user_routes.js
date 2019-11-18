const express = require('express');
const User = require('../models/user')
const auth = require('../middleware/auth')

const user_router = express.Router();

// GET User data
user_router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Sign Up
// Saves User to DB and then generates JWT using user.generateAuthToken()
// Users must use unique email addresses 
// Passwords must be longer than 7 characters
user_router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
    } catch (e) {
        if(e.code === 11000 ){
            console.log(e)
            return res.status(400).send('User already exists.')
        }
        if(e.name === "ValidationError" ){
            console.log(e)
            return res.status(400).send('Password needs to be at least 7 characters.')
        }
        res.status(400).send(e)
    }
})

user_router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.send({user})
    } catch (e) {
        res.status(404).send()
    }
})

user_router.post('/addcontact', auth, async (req, res) => {
    const user = req.user
    try {
        await user.addContact(req.body.id)
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

user_router.get('/contacts', auth, async (req,res) => {
    const contact_ids = req.user.contacts 
    const contacts = await User.find({_id:{$in : contact_ids}})
})

// Login
// Successful Login will return the corresponding user data and the token
user_router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        await user.clearOldTokens()
        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

user_router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

user_router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Update user data
user_router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const valid_updates = ['name', 'age', 'email', 'password']
    const is_valid_op = updates.every((update) => valid_updates.includes(update))
    if (!is_valid_op) {
        res.status(400).send('Error: Invalid Update.')
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})
user_router.get('/users/me/short', auth, async (req, res) => {
    try {
        res.send(req.user.short)
    } catch (e) {
        res.status(500).send()
    }
})
user_router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = user_router
