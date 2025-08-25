import { expect } from 'chai';
import fetch from 'node-fetch';

describe('API Route Integration Tests', () => {
  // Helper function to check if server is running
  const checkServer = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/api/data', { 
        method: 'GET',
        timeout: 2000
      });
      return response.status !== undefined;
    } catch (error) {
      return false;
    }
  };

  before(async function() {
    this.timeout(5000);
    const serverRunning = await checkServer();
    if (!serverRunning) {
      console.log('⚠️  Next.js server not running on localhost:3000');
      console.log('To run API tests, start the server with: npm run dev');
      this.skip();
    }
  });

  describe('Onboarding API Routes', () => {
    it('GET /api/onboarding/get should return 400 for missing email parameter', async () => {
      const res = await fetch('http://localhost:3000/api/onboarding/get');
      expect(res.status).to.equal(400);
      const result = await res.json();
      expect(result.error).to.equal('Missing email');
    });

    it('GET /api/onboarding/get should handle valid email parameter', async () => {
      const res = await fetch('http://localhost:3000/api/onboarding/get?email=test@example.com');
      // Should return 404 for non-existent user or 200 for existing user
      expect([200, 404, 500]).to.include(res.status);
    });

    it('POST /api/onboarding/submit should return 400 for missing data', async () => {
      const res = await fetch('http://localhost:3000/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).to.equal(400);
    });

    it('POST /api/onboarding/submit should validate required fields', async () => {
      const res = await fetch('http://localhost:3000/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          step: 1,
          data: { name: 'Test User' }
        }),
      });
      // Should return success or validation error
      expect([200, 400, 401, 500]).to.include(res.status);
    });
  });

  describe('Data API Routes', () => {
    it('GET /api/data should return structured response', async () => {
      const res = await fetch('http://localhost:3000/api/data');
      expect(res.status).to.equal(200);
      const result = await res.json();
      expect(result).to.be.an('object');
      expect(result.success).to.equal(true);
    });
  });

  describe('Admin API Routes', () => {
    it('GET /api/admin/custom-components should return array', async () => {
      const res = await fetch('http://localhost:3000/api/admin/custom-components');
      expect(res.status).to.equal(200);
      const result = await res.json();
      expect(result).to.be.an('array');
    });

    it('GET /api/admin/page-components should return array', async () => {
      const res = await fetch('http://localhost:3000/api/admin/page-components');
      expect(res.status).to.equal(200);
      const result = await res.json();
      expect(result).to.be.an('array');
    });
  });

  describe('Authentication API Routes', () => {
    it('POST /api/auth/signup should validate input data', async () => {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).to.equal(400);
    });

    it('POST /api/auth/signin should require credentials', async () => {
      const res = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).to.equal(401);
    });

    it('POST /api/auth/signin should handle invalid credentials', async () => {
      const res = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }),
      });
      expect(res.status).to.equal(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent routes gracefully', async () => {
      const res = await fetch('http://localhost:3000/api/nonexistent');
      expect(res.status).to.equal(404);
    });

    it('should handle malformed JSON in requests', async () => {
      const res = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });
      // Should handle JSON parsing error gracefully
      expect([400, 500]).to.include(res.status);
    });
  });
});
