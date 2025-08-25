/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Test utilities and helpers for the test suite

import { expect } from 'chai';

// Utility functions for testing
export class TestUtils {
  /**
   * Mock API response creator
   */
  static createMockResponse(data: any, status: number = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
    };
  }

  /**
   * Mock user data generator
   */
  static createMockUser(overrides: Partial<any> = {}) {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date().toISOString(),
      ...overrides,
    };
  }

  /**
   * Mock profile data generator
   */
  static createMockProfile(overrides: Partial<any> = {}) {
    return {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
      },
      preferences: {
        theme: 'light',
        notifications: true,
      },
      ...overrides,
    };
  }

  /**
   * Validate test environment
   */
  static validateTestEnvironment() {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
      console.warn('Some tests may fail due to missing configuration');
    }
  }

  /**
   * Wait for a condition to be true (useful for async testing)
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const result = await condition();
      if (result) return;
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Deep equality check for objects
   */
  static deepEqual(actual: any, expected: any, path: string = ''): void {
    if (actual === expected) return;

    if (actual === null || expected === null) {
      throw new Error(`Expected ${expected} but got ${actual} at ${path}`);
    }

    if (typeof actual !== typeof expected) {
      throw new Error(`Type mismatch at ${path}: expected ${typeof expected} but got ${typeof actual}`);
    }

    if (typeof actual === 'object') {
      const actualKeys = Object.keys(actual);
      const expectedKeys = Object.keys(expected);

      if (actualKeys.length !== expectedKeys.length) {
        throw new Error(`Key count mismatch at ${path}: expected ${expectedKeys.length} but got ${actualKeys.length}`);
      }

      for (const key of expectedKeys) {
        const newPath = path ? `${path}.${key}` : key;
        this.deepEqual(actual[key], expected[key], newPath);
      }
    } else if (actual !== expected) {
      throw new Error(`Value mismatch at ${path}: expected ${expected} but got ${actual}`);
    }
  }

  /**
   * Generate test data for onboarding steps
   */
  static generateOnboardingData(step: number) {
    const stepData = {
      1: {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
      2: {
        contactInfo: {
          email: 'john.doe@example.com',
          phone: '+1234567890',
        },
      },
      3: {
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en',
        },
      },
      4: {
        summary: {
          termsAccepted: true,
          marketingOptIn: false,
        },
      },
    };

    return stepData[step as keyof typeof stepData] || {};
  }
}

// Test validation helpers
export class TestValidators {
  /**
   * Validate API response structure
   */
  static validateApiResponse(response: any, expectedStructure: any) {
    expect(response).to.be.an('object');
    
    for (const [key, expectedType] of Object.entries(expectedStructure)) {
      expect(response).to.have.property(key);
      
      if (expectedType === 'array') {
        expect(response[key]).to.be.an('array');
      } else if (expectedType === 'object') {
        expect(response[key]).to.be.an('object');
      } else {
        expect(response[key]).to.be.a(expectedType as string);
      }
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate UUID format
   */
  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate ISO date string
   */
  static validateISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
  }
}

// Test setup and teardown helpers
export class TestSetup {
  /**
   * Setup test environment
   */
  static setup() {
    // Validate environment
    TestUtils.validateTestEnvironment();
    
    // Ensure test-specific environment variables (do not reassign read-only NODE_ENV)
    // If you need to check, use: if (process.env.NODE_ENV !== 'test') { ... }
    // If mocking is needed, use a library like 'mock-env' or set NODE_ENV before running tests.
  }

  /**
   * Cleanup after tests
   */
  static cleanup() {
    // Reset any global state changes
    // This could be expanded to clean up test data in the database
  }

  /**
   * Mock global objects for testing
   */
  static mockGlobals() {
    // Mock fetch if not available
    if (typeof global.fetch === 'undefined') {
      (global as any).fetch = require('node-fetch');
    }

    // Mock console methods for cleaner test output
    const originalConsole = { ...console };
    
    return {
      restore: () => {
        Object.assign(console, originalConsole);
      },
      silence: () => {
        console.log = () => {};
        console.warn = () => {};
        console.error = () => {};
      },
    };
  }
}

export default { TestUtils, TestValidators, TestSetup };
