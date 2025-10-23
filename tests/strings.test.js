const request = require('supertest');
const app = require('../index');

describe('String Analyzer API', () => {
  let created;

  // ---------- POST /strings ----------
  test('POST /strings - create new string', async () => {
    const res = await request(app)
      .post('/strings')
      .send({ value: 'Race car' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('value', 'Race car');
    expect(res.body).toHaveProperty('properties');
    expect(res.body.properties).toHaveProperty('length');
    expect(res.body.properties).toHaveProperty('is_palindrome');
    expect(res.body.properties).toHaveProperty('sha256_hash');
    created = res.body;
  });

  test('POST /strings - handle duplicate', async () => {
    const res = await request(app)
      .post('/strings')
      .send({ value: 'Race car' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /strings - missing value returns 400/422', async () => {
    const res = await request(app)
      .post('/strings')
      .send({})
      .set('Content-Type', 'application/json');

    expect([400, 422]).toContain(res.statusCode);
  });

  test('POST /strings - invalid data type returns 400/422', async () => {
    const res = await request(app)
      .post('/strings')
      .send({ value: 12345 })
      .set('Content-Type', 'application/json');

    expect([400, 422]).toContain(res.statusCode);
  });

  // ---------- GET /strings/:value ----------
  test('GET /strings/:value - retrieve existing string', async () => {
    const res = await request(app).get('/strings/Race%20car');
    expect(res.statusCode).toBe(200);
    expect(res.body.value).toBe('Race car');
    expect(res.body.properties).toHaveProperty('is_palindrome');
  });

  test('GET /strings/:value - 404 for non-existent string', async () => {
    const res = await request(app).get('/strings/NonExistentString');
    expect(res.statusCode).toBe(404);
  });

  // ---------- GET /strings (filters) ----------
  test('GET /strings - no filters returns data array and count', async () => {
    const res = await request(app).get('/strings');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('count');
  });

  test('GET /strings - filter by is_palindrome', async () => {
    const res = await request(app).get('/strings').query({ is_palindrome: 'true' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /strings - filter by min_length and max_length', async () => {
    const res = await request(app)
      .get('/strings')
      .query({ min_length: 3, max_length: 20 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /strings - filter by word_count', async () => {
    const res = await request(app).get('/strings').query({ word_count: 2 });
    expect(res.statusCode).toBe(200);
  });

  test('GET /strings - filter by contains_character', async () => {
    const res = await request(app).get('/strings').query({ contains_character: 'R' });
    expect(res.statusCode).toBe(200);
  });

  // ---------- GET /strings/filter-by-natural-language ----------
  test('GET /strings/filter-by-natural-language - palindromic strings', async () => {
    const res = await request(app)
      .get('/strings/filter-by-natural-language')
      .query({ query: 'palindromic strings' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('interpreted_query');
  });

  test('GET /strings/filter-by-natural-language - strings longer than 10 characters', async () => {
    const res = await request(app)
      .get('/strings/filter-by-natural-language')
      .query({ query: 'strings longer than 10 characters' });
    expect(res.statusCode).toBe(200);
  });

  // ---------- DELETE /strings/:value ----------
  test('DELETE /strings/:value - delete existing string', async () => {
    const res = await request(app).delete('/strings/Race%20car');
    expect(res.statusCode).toBe(204);
  });

  test('DELETE /strings/:value - deleting non-existent string returns 404', async () => {
    const res = await request(app).delete('/strings/NonExistentString');
    expect(res.statusCode).toBe(404);
  });
});
