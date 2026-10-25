process.env.JWT_SECRET = 'test-secret'; process.env.NODE_ENV = 'test';
const request = require('supertest'), jwt = require('jsonwebtoken'), app = require('../src/app');
const tok = (role) => jwt.sign({ id: '64b000000000000000000001', role }, 'test-secret');
describe('security rules (no database needed)', () => {
  test('orders require authentication', async () => { expect((await request(app).get('/api/orders/mine')).status).toBe(401); });
  test('invalid token is rejected', async () => { expect((await request(app).get('/api/orders/mine').set('Authorization', 'Bearer nope')).status).toBe(401); });
  test.each([['post', '/api/products'], ['get', '/api/orders'], ['get', '/api/inventory/summary'], ['patch', '/api/inventory/64b000000000000000000001/stock']])(
    'retailer cannot %s %s', async (m, url) => { expect((await request(app)[m](url).set('Authorization', `Bearer ${tok('retailer')}`).send({})).status).toBe(403); });
  test('admin cannot place retailer orders', async () => { expect((await request(app).post('/api/orders').set('Authorization', `Bearer ${tok('admin')}`).send({})).status).toBe(403); });
  test('register validates input before touching the database', async () => {
    const r = await request(app).post('/api/auth/register').send({ email: 'bad', password: '1', role: 'admin' });
    expect(r.status).toBe(400); expect(r.body.errors.email).toBeDefined();
  });
  test('unknown routes return JSON 404', async () => { expect((await request(app).get('/api/nope')).status).toBe(404); });
});
