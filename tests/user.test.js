const request = require('supertest')
const app = require('../app')
const User = require('../models/user')

const test_user = {
    name: 'test user',
    personal_email: 'testuser@test.com',
    password: 'testuser123'
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(test_user).save()
})

test('Should allow new user to sign up.', async () => {
    await request(app).post('/users').send({
        name: 'John Doe',
        personal_email: 'johndoe@test.com',
        password: 'johndoe123'
    }).expect(201)   
})



