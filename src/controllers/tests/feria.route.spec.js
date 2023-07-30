import routerAuth from "../../routes/auth.route.js";
import routerFerias from "../../routes/feria.route.js";
import request from "supertest";

describe ('GET /', () => {
    test('deberia responder con status code 200', async () => {
        const loginResponse = await request(routerAuth).post('/login').send({ cuil: '20431877007', password: 'A1234567' }); //rol admin
        const {token} = loginResponse.body.token;
        const response = await request(routerFerias).get('/').set('Authorization', `Bearer ${token}`);;
        expect(response.statusCode).toBe(200);
    })
})