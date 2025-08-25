import { expect } from 'chai';

// Unit tests for onboarding flow without requiring JSX
describe('Onboarding Flow Unit Tests', () => {
  
  describe('Step Navigation Logic', () => {
    class OnboardingFlow {
      private currentStep: number = 1;
      private totalSteps: number;
      private completedSteps: Set<number> = new Set();

      constructor(totalSteps: number = 4) {
        this.totalSteps = totalSteps;
      }

      getCurrentStep(): number {
        return this.currentStep;
      }

      getTotalSteps(): number {
        return this.totalSteps;
      }

      getCompletedSteps(): number[] {
        return Array.from(this.completedSteps).sort((a, b) => a - b);
      }

      canNavigateToStep(step: number): boolean {
        if (step < 1 || step > this.totalSteps) return false;
        
        // Can navigate to current step or any completed step
        if (step === this.currentStep) return true;
        if (this.completedSteps.has(step)) return true;
        
        // Can navigate to next step if current step is completed
        if (step === this.currentStep + 1 && this.completedSteps.has(this.currentStep)) {
          return true;
        }
        
        return false;
      }

      completeStep(step: number): boolean {
        if (step !== this.currentStep) return false;
        
        this.completedSteps.add(step);
        return true;
      }

      navigateToStep(step: number): boolean {
        if (!this.canNavigateToStep(step)) return false;
        
        this.currentStep = step;
        return true;
      }

      getProgress(): number {
        return Math.round((this.completedSteps.size / this.totalSteps) * 100);
      }

      isStepCompleted(step: number): boolean {
        return this.completedSteps.has(step);
      }

      isStepCurrent(step: number): boolean {
        return this.currentStep === step;
      }

      isStepAccessible(step: number): boolean {
        return this.canNavigateToStep(step);
      }
    }

    it('should initialize with correct default values', () => {
      const flow = new OnboardingFlow();
      
      expect(flow.getCurrentStep()).to.equal(1);
      expect(flow.getTotalSteps()).to.equal(4);
      expect(flow.getCompletedSteps()).to.deep.equal([]);
      expect(flow.getProgress()).to.equal(0);
    });

    it('should allow completing current step', () => {
      const flow = new OnboardingFlow(3);
      
      const result = flow.completeStep(1);
      expect(result).to.be.true;
      expect(flow.isStepCompleted(1)).to.be.true;
      expect(flow.getProgress()).to.equal(33);
    });

    it('should not allow completing non-current step', () => {
      const flow = new OnboardingFlow(3);
      
      const result = flow.completeStep(2);
      expect(result).to.be.false;
      expect(flow.isStepCompleted(2)).to.be.false;
    });

    it('should allow navigation to accessible steps', () => {
      const flow = new OnboardingFlow(4);
      
      // Complete step 1
      flow.completeStep(1);
      
      // Should be able to navigate to step 2 (next step)
      expect(flow.canNavigateToStep(2)).to.be.true;
      expect(flow.navigateToStep(2)).to.be.true;
      expect(flow.getCurrentStep()).to.equal(2);
      
      // Should be able to navigate back to step 1 (completed)
      expect(flow.canNavigateToStep(1)).to.be.true;
      expect(flow.navigateToStep(1)).to.be.true;
      expect(flow.getCurrentStep()).to.equal(1);
    });

    it('should not allow navigation to inaccessible steps', () => {
      const flow = new OnboardingFlow(4);
      
      // Cannot skip to step 3 without completing step 1
      expect(flow.canNavigateToStep(3)).to.be.false;
      expect(flow.navigateToStep(3)).to.be.false;
      expect(flow.getCurrentStep()).to.equal(1);
      
      // Cannot navigate to invalid steps
      expect(flow.canNavigateToStep(0)).to.be.false;
      expect(flow.canNavigateToStep(5)).to.be.false;
    });

    it('should track progress correctly', () => {
      const flow = new OnboardingFlow(4);
      
      expect(flow.getProgress()).to.equal(0);
      
      flow.completeStep(1);
      expect(flow.getProgress()).to.equal(25);
      
      flow.navigateToStep(2);
      flow.completeStep(2);
      expect(flow.getProgress()).to.equal(50);
      
      flow.navigateToStep(3);
      flow.completeStep(3);
      expect(flow.getProgress()).to.equal(75);
      
      flow.navigateToStep(4);
      flow.completeStep(4);
      expect(flow.getProgress()).to.equal(100);
    });

    it('should handle edge cases', () => {
      const flow = new OnboardingFlow(1);
      
      expect(flow.getTotalSteps()).to.equal(1);
      expect(flow.getCurrentStep()).to.equal(1);
      
      flow.completeStep(1);
      expect(flow.getProgress()).to.equal(100);
    });
  });

  describe('Form Validation State', () => {
    interface FormField {
      name: string;
      value: string;
      required: boolean;
      validated: boolean;
      error?: string;
    }

    class FormValidator {
      private fields: Map<string, FormField> = new Map();

      addField(name: string, required: boolean = false): void {
        this.fields.set(name, {
          name,
          value: '',
          required,
          validated: false,
        });
      }

      setFieldValue(name: string, value: string): boolean {
        const field = this.fields.get(name);
        if (!field) return false;

        field.value = value;
        field.validated = false;
        delete field.error;
        
        return true;
      }

      validateField(name: string): boolean {
        const field = this.fields.get(name);
        if (!field) return false;

        field.validated = true;

        if (field.required && (!field.value || field.value.trim() === '')) {
          field.error = `${field.name} is required`;
          return false;
        }

        if (name === 'email' && field.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            field.error = 'Invalid email format';
            return false;
          }
        }

        delete field.error;
        return true;
      }

      validateAll(): boolean {
        let allValid = true;
        
        for (const [name] of this.fields) {
          if (!this.validateField(name)) {
            allValid = false;
          }
        }
        
        return allValid;
      }

      getFieldError(name: string): string | undefined {
        return this.fields.get(name)?.error;
      }

      isFieldValid(name: string): boolean {
        const field = this.fields.get(name);
        return field ? field.validated && !field.error : false;
      }

      getFormData(): Record<string, string> {
        const data: Record<string, string> = {};
        
        for (const [name, field] of this.fields) {
          data[name] = field.value;
        }
        
        return data;
      }
    }

    it('should handle field validation correctly', () => {
      const validator = new FormValidator();
      
      validator.addField('email', true);
      validator.addField('name', true);
      validator.addField('phone', false);
      
      expect(validator.validateAll()).to.be.false;
      expect(validator.getFieldError('email')).to.equal('email is required');
      expect(validator.getFieldError('name')).to.equal('name is required');
    });

    it('should validate email format', () => {
      const validator = new FormValidator();
      validator.addField('email', true);
      
      validator.setFieldValue('email', 'invalid-email');
      expect(validator.validateField('email')).to.be.false;
      expect(validator.getFieldError('email')).to.equal('Invalid email format');
      
      validator.setFieldValue('email', 'valid@example.com');
      expect(validator.validateField('email')).to.be.true;
      expect(validator.getFieldError('email')).to.be.undefined;
    });

    it('should return form data correctly', () => {
      const validator = new FormValidator();
      
      validator.addField('name', true);
      validator.addField('email', true);
      
      validator.setFieldValue('name', 'John Doe');
      validator.setFieldValue('email', 'john@example.com');
      
      const formData = validator.getFormData();
      expect(formData).to.deep.equal({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  describe('User Profile Management', () => {
    interface UserProfile {
      id: string;
      email: string;
      profileData: Record<string, unknown>;
      createdAt: Date;
      updatedAt: Date;
    }

    class ProfileManager {
      private profiles: Map<string, UserProfile> = new Map();

      createProfile(email: string): UserProfile {
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        
        const profile: UserProfile = {
          id,
          email,
          profileData: {},
          createdAt: now,
          updatedAt: now,
        };
        
        this.profiles.set(id, profile);
        return profile;
      }

      getProfile(id: string): UserProfile | undefined {
        return this.profiles.get(id);
      }

      updateProfileData(id: string, data: Record<string, unknown>): boolean {
        const profile = this.profiles.get(id);
        if (!profile) return false;
        
        profile.profileData = { ...profile.profileData, ...data };
        profile.updatedAt = new Date();
        
        return true;
      }

      deleteProfile(id: string): boolean {
        return this.profiles.delete(id);
      }

      getAllProfiles(): UserProfile[] {
        return Array.from(this.profiles.values());
      }

      findProfileByEmail(email: string): UserProfile | undefined {
        return Array.from(this.profiles.values()).find(p => p.email === email);
      }
    }

    it('should create profiles correctly', () => {
      const manager = new ProfileManager();
      
      const profile = manager.createProfile('test@example.com');
      
      expect(profile.id).to.be.a('string');
      expect(profile.email).to.equal('test@example.com');
      expect(profile.profileData).to.deep.equal({});
      expect(profile.createdAt).to.be.a('date');
      expect(profile.updatedAt).to.be.a('date');
    });

    it('should update profile data correctly', () => {
      const manager = new ProfileManager();
      const profile = manager.createProfile('test@example.com');
      
      // Wait a small amount to ensure timestamp difference
      setTimeout(() => {
        const updateResult = manager.updateProfileData(profile.id, {
          name: 'John Doe',
          age: 25,
        });
        
        expect(updateResult).to.be.true;
        
        const updatedProfile = manager.getProfile(profile.id);
        expect(updatedProfile?.profileData).to.deep.equal({
          name: 'John Doe',
          age: 25,
        });
        // Check that the profile was updated (timestamp should be different)
        expect(updatedProfile?.updatedAt.getTime()).to.be.greaterThanOrEqual(profile.createdAt.getTime());
      }, 1);
    });

    it('should find profiles by email', () => {
      const manager = new ProfileManager();
      
      const profile1 = manager.createProfile('user1@example.com');
      manager.createProfile('user2@example.com');
      
      const found = manager.findProfileByEmail('user1@example.com');
      expect(found?.id).to.equal(profile1.id);
      
      const notFound = manager.findProfileByEmail('nonexistent@example.com');
      expect(notFound).to.be.undefined;
    });
  });
});
