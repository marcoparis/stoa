const request = require('supertest');
const app = require('../app.js');
const { users } = require('../router/auth_users.js');

let counter = 0;
const newUser = () => ({ username: `user${Date.now()}${counter++}`, password: 'secret123' });

const registerAndLogin = async (agent = request(app)) => {
    const creds = newUser();
    await agent.post('/register').send(creds).expect(201);
    const res = await agent.post('/customer/login').send(creds).expect(200);
    return { ...creds, token: res.body.token };
};

describe('public book endpoints', () => {
    test('GET / returns all books as JSON', async () => {
        const res = await request(app).get('/').expect('Content-Type', /json/).expect(200);
        expect(Object.keys(res.body)).toHaveLength(10);
        expect(res.body['1']).toMatchObject({ author: 'Chinua Achebe', title: 'Things Fall Apart' });
    });

    test('GET /isbn/:isbn returns one book or 404', async () => {
        const res = await request(app).get('/isbn/8').expect(200);
        expect(res.body.title).toBe('Pride and Prejudice');
        await request(app).get('/isbn/999').expect(404);
    });

    test('GET /author/:author is case-insensitive and partial', async () => {
        const res = await request(app).get('/author/austen').expect(200);
        expect(res.body).toEqual([expect.objectContaining({ isbn: '8', author: 'Jane Austen' })]);
        await request(app).get('/author/nobody').expect(404);
    });

    test('GET /title/:title finds books by title', async () => {
        const res = await request(app).get('/title/divine%20comedy').expect(200);
        expect(res.body[0]).toMatchObject({ isbn: '3', author: 'Dante Alighieri' });
    });

    test('unknown routes return a JSON 404', async () => {
        const res = await request(app).get('/does/not/exist').expect(404);
        expect(res.body.message).toMatch(/non trovato/);
    });
});

describe('registration', () => {
    test('stores a bcrypt hash, never the plain password', async () => {
        const creds = newUser();
        await request(app).post('/register').send(creds).expect(201);
        const stored = users.find((u) => u.username === creds.username);
        expect(stored.password).toBeUndefined();
        expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
    });

    test('rejects duplicates, missing fields and invalid input', async () => {
        const creds = newUser();
        await request(app).post('/register').send(creds).expect(201);
        await request(app).post('/register').send(creds).expect(409);
        await request(app).post('/register').send({ username: 'onlyname' }).expect(400);
        await request(app).post('/register').send({ username: 'a', password: 'secret123' }).expect(400);
        await request(app).post('/register').send({ username: 'validname', password: '123' }).expect(400);
    });

    test('rejects malformed JSON with 400', async () => {
        await request(app)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send('{"username":')
            .expect(400);
    });
});

describe('login', () => {
    test('returns a JWT with valid credentials', async () => {
        const { token } = await registerAndLogin();
        expect(token.split('.')).toHaveLength(3);
    });

    test('rejects wrong password and unknown user', async () => {
        const creds = newUser();
        await request(app).post('/register').send(creds).expect(201);
        await request(app).post('/customer/login').send({ ...creds, password: 'wrong-pass' }).expect(401);
        await request(app).post('/customer/login').send({ username: 'ghost', password: 'whatever' }).expect(401);
    });
});

describe('reviews', () => {
    test('protected routes require authentication', async () => {
        await request(app).put('/customer/auth/review/1?review=hi').expect(401);
        await request(app)
            .put('/customer/auth/review/1?review=hi')
            .set('Authorization', 'Bearer not-a-real-token')
            .expect(403);
    });

    test('full flow with a Bearer token: add, update, read, delete', async () => {
        const { username, token } = await registerAndLogin();
        const auth = { Authorization: `Bearer ${token}` };

        await request(app).put('/customer/auth/review/2?review=Bello').set(auth).expect(201);
        const updated = await request(app)
            .put('/customer/auth/review/2')
            .set(auth)
            .send({ review: 'Bellissimo' })
            .expect(200);
        expect(updated.body.reviews[username]).toBe('Bellissimo');

        const reviews = await request(app).get('/review/2').expect(200);
        expect(reviews.body[username]).toBe('Bellissimo');

        await request(app).delete('/customer/auth/review/2').set(auth).expect(200);
        const after = await request(app).get('/review/2').expect(200);
        expect(after.body[username]).toBeUndefined();
        await request(app).delete('/customer/auth/review/2').set(auth).expect(404);
    });

    test('session cookie works and logout ends the session', async () => {
        const agent = request.agent(app);
        await registerAndLogin(agent);

        await agent.put('/customer/auth/review/4?review=Epico').expect(201);
        await agent.post('/customer/logout').expect(200);
        await agent.put('/customer/auth/review/4?review=Ancora').expect(401);
    });

    test('users cannot delete reviews written by others', async () => {
        const alice = await registerAndLogin();
        const bob = await registerAndLogin();

        await request(app)
            .put('/customer/auth/review/5?review=Mia')
            .set('Authorization', `Bearer ${alice.token}`)
            .expect(201);
        await request(app)
            .delete('/customer/auth/review/5')
            .set('Authorization', `Bearer ${bob.token}`)
            .expect(404);

        const reviews = await request(app).get('/review/5').expect(200);
        expect(reviews.body[alice.username]).toBe('Mia');
    });

    test('validates the review text and the book', async () => {
        const { token } = await registerAndLogin();
        const auth = { Authorization: `Bearer ${token}` };

        await request(app).put('/customer/auth/review/1').set(auth).expect(400);
        await request(app).put('/customer/auth/review/1').set(auth).send({ review: 'x'.repeat(1001) }).expect(400);
        await request(app).put('/customer/auth/review/999?review=hi').set(auth).expect(404);
    });
});

describe('API docs', () => {
    test('serves the OpenAPI spec', async () => {
        const res = await request(app).get('/openapi.json').expect(200);
        expect(res.body.openapi).toMatch(/^3\./);
        expect(Object.keys(res.body.paths)).toContain('/customer/auth/review/{isbn}');
    });
});
