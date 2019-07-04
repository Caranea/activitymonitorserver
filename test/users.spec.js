const expect = require('chai').expect
const request = require('request')
const mock = require('../test/mock.js')

describe('Register', () => {
    it('Registers new user with correct data', () => {
        request.post('http://localhost:5000/users/register', { form: mock.newUser }, (error, response, body) => {
            expect(response.statusCode).to.equal(200)
            expect(JSON.parse(body).message).to.contain('You can now log in')
        })
    })
    it('Sends aproppriate message when email is not unique', () => {
        request.post('http://localhost:5000/users/register', { form: mock.alreadyRegisteredUser }, (error, response, body) => {
            expect(response.statusCode).to.equal(422)
            expect(JSON.parse(body)[0].error).to.contain('Email already registered')
        })
    })
    it('Sends aproppriate user exceeds request limit', () => {
        for (let i = 0; i < 4; i++) {
            request.post('http://localhost:5000/users/register', { form: mock.newUser }, (error, response, body) => {
                i !== 3 ? expect(response.statusCode).to.equal(200) : expect(response.statusCode).to.equal(429)
            })
        }
    })
})