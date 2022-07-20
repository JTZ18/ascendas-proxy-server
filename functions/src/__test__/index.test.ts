const request = require('supertest');
const app = require('../index');

// example of how test cases are written in jest and supertest
describe('register', () => {
    it('returns status code 201 if firstName is passed', async () => {
        const res = await request(app).post('/register').send({ firstName: 'Jan' });

        expect(res.statusCode).toEqual(201);
    });

    it('returns bad request if firstName is missing', async () => {
        const res = await request(app).post('/register').send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual('you need to pass a firstName')
    })

})
