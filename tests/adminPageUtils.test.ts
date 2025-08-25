import { describe, it } from 'mocha';
import { expect } from 'chai';

// Mock data for page configs
const mockPageConfigs = [
  { id: 'a', page: 2, components: ['aboutMe', 'birthdate'] },
  { id: 'b', page: 3, components: ['company', 'address'] },
];

// Utility to validate page configs
interface PageConfig {
    id: string;
    page: number;
    components?: string[];
}

function validatePageConfigs(pageConfigs: PageConfig[]): boolean {
    // Each page must have at least one component
    return pageConfigs.every(cfg => Array.isArray(cfg.components) && cfg.components.length > 0);
}

describe('Admin Page Utilities', () => {
  it('should validate that each page has at least one component', () => {
    expect(validatePageConfigs(mockPageConfigs)).to.be.true;
  });

  it('should fail validation if a page has no components', () => {
    const invalidConfigs = [
      { id: 'a', page: 2, components: [] },
      { id: 'b', page: 3, components: ['company'] },
    ];
  // eslint-disable-next-line no-unused-expressions
  expect(validatePageConfigs(invalidConfigs)).to.be.false;
  });

  it('should handle missing components array gracefully', () => {
    const invalidConfigs = [
      { id: 'a', page: 2 },
      { id: 'b', page: 3, components: ['company'] },
    ];
  // eslint-disable-next-line no-unused-expressions
  expect(validatePageConfigs(invalidConfigs)).to.be.false;
  });
});
