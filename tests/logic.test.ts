import { expect } from 'chai';

// Logic tests for onboarding flow validation
describe('Onboarding Logic Tests', () => {
  describe('Step Validation', () => {
    const validateStep = (step: number, totalSteps: number): boolean => {
      return step >= 1 && step <= totalSteps && Number.isInteger(step);
    };

    it('should validate correct step numbers', () => {
      expect(validateStep(1, 5)).to.be.true;
      expect(validateStep(3, 5)).to.be.true;
      expect(validateStep(5, 5)).to.be.true;
    });

    it('should reject invalid step numbers', () => {
      expect(validateStep(0, 5)).to.be.false;
      expect(validateStep(6, 5)).to.be.false;
      expect(validateStep(-1, 5)).to.be.false;
      expect(validateStep(1.5, 5)).to.be.false;
    });

    it('should handle edge cases', () => {
      expect(validateStep(1, 1)).to.be.true;
      expect(validateStep(1, 0)).to.be.false;
      expect(validateStep(0, 0)).to.be.false;
    });
  });

  describe('Email Validation', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).to.be.true;
      expect(validateEmail('test.user+tag@domain.co.uk')).to.be.true;
      expect(validateEmail('user123@test-domain.org')).to.be.true;
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).to.be.false;
      expect(validateEmail('user@')).to.be.false;
      expect(validateEmail('@domain.com')).to.be.false;
      expect(validateEmail('user@domain')).to.be.false;
      expect(validateEmail('')).to.be.false;
    });
  });

  describe('Password Validation', () => {
    const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }

      return { valid: errors.length === 0, errors };
    };

    it('should validate strong passwords', () => {
      const result = validatePassword('SecurePass123!');
      expect(result.valid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.valid).to.be.false;
      expect(result.errors.length).to.be.greaterThan(0);
    });

    it('should provide specific error messages', () => {
      const result = validatePassword('short');
      expect(result.errors).to.include('Password must be at least 8 characters long');
      expect(result.errors).to.include('Password must contain at least one uppercase letter');
    });
  });

  describe('Form Data Validation', () => {
    interface FormData {
      email?: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
    }

    const validateFormData = (data: FormData): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!data.email || data.email.trim() === '') {
        errors.push('Email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
      }

      if (!data.password || data.password.trim() === '') {
        errors.push('Password is required');
      }

      if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
      }

      if (!data.name || data.name.trim() === '') {
        errors.push('Name is required');
      }

      return { valid: errors.length === 0, errors };
    };

    it('should validate complete form data', () => {
      const formData = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        name: 'John Doe'
      };
      
      const result = validateFormData(formData);
      expect(result.valid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
    });

    it('should catch missing required fields', () => {
      const formData = {};
      const result = validateFormData(formData);
      
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('Email is required');
      expect(result.errors).to.include('Password is required');
      expect(result.errors).to.include('Name is required');
    });

    it('should catch password mismatch', () => {
      const formData = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password456',
        name: 'John Doe'
      };
      
      const result = validateFormData(formData);
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('Passwords do not match');
    });
  });

  describe('Onboarding Progress Calculation', () => {
    const calculateProgress = (currentStep: number, totalSteps: number): number => {
      if (totalSteps <= 0) return 0;
      if (currentStep <= 0) return 0;
      if (currentStep > totalSteps) return 100;
      
      return Math.round((currentStep / totalSteps) * 100);
    };

    it('should calculate progress correctly', () => {
      expect(calculateProgress(1, 4)).to.equal(25);
      expect(calculateProgress(2, 4)).to.equal(50);
      expect(calculateProgress(3, 4)).to.equal(75);
      expect(calculateProgress(4, 4)).to.equal(100);
    });

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 4)).to.equal(0);
      expect(calculateProgress(5, 4)).to.equal(100);
      expect(calculateProgress(1, 0)).to.equal(0);
      expect(calculateProgress(-1, 4)).to.equal(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateProgress(1, 3)).to.equal(33);
      expect(calculateProgress(2, 3)).to.equal(67);
    });
  });

  describe('Profile Data Validation', () => {
    interface ProfileData {
      personalInfo?: {
        firstName?: string;
        lastName?: string;
        age?: number;
      };
      preferences?: {
        theme?: string;
        notifications?: boolean;
      };
    }

    const validateProfileData = (data: ProfileData): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!data.personalInfo) {
        errors.push('Personal information is required');
        return { valid: false, errors };
      }

      if (!data.personalInfo.firstName || data.personalInfo.firstName.trim() === '') {
        errors.push('First name is required');
      }

      if (!data.personalInfo.lastName || data.personalInfo.lastName.trim() === '') {
        errors.push('Last name is required');
      }

      if (data.personalInfo.age !== undefined) {
        if (data.personalInfo.age < 13 || data.personalInfo.age > 120) {
          errors.push('Age must be between 13 and 120');
        }
      }

      return { valid: errors.length === 0, errors };
    };

    it('should validate complete profile data', () => {
      const profileData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          age: 25
        },
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      const result = validateProfileData(profileData);
      expect(result.valid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
    });

    it('should catch missing personal info', () => {
      const profileData = {};
      const result = validateProfileData(profileData);
      
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('Personal information is required');
    });

    it('should validate age constraints', () => {
      const profileData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          age: 5
        }
      };

      const result = validateProfileData(profileData);
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('Age must be between 13 and 120');
    });
  });
});
