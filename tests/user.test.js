const request = require('supertest')
const app = require('../app')
const User = require('../models/user')

const test_user = {
    name: 'test user',
    email: 'testuser@testemail.com',
    password: 'testuser123'
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(test_user).save()
})

test('Should allow new user to sign up.', async () => {
    await request(app).post('/users').send({
        name: 'John Doe',
        email: 'johndoe@testemail.com',
        password: 'johndoe123'
    }).expect(201)   
})

test('Should not allow new user to sign up if password is less than 7 characters.', async () => {
    await request(app).post('/users').send({
        name: 'John Doe',
        email: 'johndoe@testemail.com',
        password: 'john'
    }).expect(400)   
})

test('Should not allow new user to sign up if password contains word password', async () => {
    await request(app).post('/users').send({
        name: 'John Doe',
        email: 'johndoe@testemail.com',
        password: 'password'
    }).expect(400)   
})

test('Should allow existing user to log in.', async () => {
    await request(app).post('/users/login').send({
        email: 'testuser@testemail.com',
        password: 'testuser123'
    }).expect(200)   
})

test('Should not allow non-existing user to log in.', async () => {
    await request(app).post('/users/login').send({
        email: 'testuser1@testemail.com',
        password: 'testuser123'
    }).expect(400)   
})


