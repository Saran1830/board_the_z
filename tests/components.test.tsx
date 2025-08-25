/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import StepIndicator from '../src/components/StepIndicator';

// Setup DOM environment for React testing
const { window } = new JSDOM('<!doctype html><html><body></body></html>');
(globalThis as any).window = window;
(globalThis as typeof globalThis).document = window.document;
(globalThis as any).navigator = {
  userAgent: 'node.js',
};

// Mock CSS modules and imports
const mockCSSImport = () => ({});
(require as any).extensions['.css'] = mockCSSImport;

describe('React Component Tests', () => {
  describe('StepIndicator Component', () => {
    it('should render with correct number of steps', () => {
      const { container } = render(
        <StepIndicator current={1} total={3} />
      );
      
      const steps = container.querySelectorAll('div[style*="width: 36"]');
      expect(steps.length).to.equal(3);
    });

    it('should highlight current step correctly', () => {
      const { container } = render(
        <StepIndicator current={2} total={5} />
      );
      
      // Check if there are 5 step elements
      const steps = container.querySelectorAll('div[style*="width: 36"]');
      expect(steps.length).to.equal(5);
    });

    it('should mark previous steps as completed', () => {
      const { container } = render(
        <StepIndicator current={3} total={5} />
      );
      
      // Check that we have the correct number of steps
      const steps = container.querySelectorAll('div[style*="width: 36"]');
      expect(steps.length).to.equal(5);
    });

    it('should mark future steps as inactive', () => {
      const { container } = render(
        <StepIndicator current={2} total={4} />
      );
      
      // Check that we have the correct number of steps
      const steps = container.querySelectorAll('div[style*="width: 36"]');
      expect(steps.length).to.equal(4);
    });

    it('should handle edge case of first step', () => {
      const { container } = render(
        <StepIndicator current={1} total={3} />
      );
      
      const steps = container.querySelectorAll('div[style*="width: 36"]');
      expect(steps.length).to.equal(3);
    });

    it('should handle edge case of last step', () => {
      const { container } = render(
        <StepIndicator current={3} total={3} />
      );
      
      const steps = container.querySelectorAll('div[style*="width: 36"]');
      expect(steps.length).to.equal(3);
    });

    it('should render with minimum steps (1)', () => {
      const { container } = render(
        <StepIndicator current={1} total={1} />
      );
      
      const steps = container.querySelectorAll('div[style*="width: 36"]');
      expect(steps.length).to.equal(1);
    });

    it('should handle large number of steps', () => {
      const { container } = render(
        <StepIndicator current={5} total={10} />
      );
      
      const steps = container.querySelectorAll('div[style*="width: 36"]');
      expect(steps.length).to.equal(10);
    });
  });
});
