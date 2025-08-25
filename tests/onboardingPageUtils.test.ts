import { describe, it } from 'mocha';
import { expect } from 'chai';

// Mock data for custom components and page config
const mockComponents = [
  { id: '1', name: 'aboutMe', label: 'About Me', type: 'textarea', required: true, placeholder: '', options: null },
  { id: '2', name: 'birthdate', label: 'Birthdate', type: 'date', required: false, placeholder: '', options: null },
  { id: '3', name: 'company', label: 'Company', type: 'text', required: false, placeholder: '', options: null },
  { id: '4', name: 'address', label: 'Address', type: 'text', required: false, placeholder: '', options: null },
];
const mockPageConfig = {
  page: 2,
  components: ['aboutMe', 'birthdate'],
};

// Utility to get components for a page
interface Component {
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder: string;
    options: string[] | null;
}

interface PageConfig {
    page: number;
    components: string[];
}

function getComponentsForPage(
    pageConfig: PageConfig,
    allComponents: Component[]
): Component[] {
    return pageConfig.components
        .map(name => allComponents.find(c => c.name === name))
        .filter(Boolean) as Component[];
}

describe('Onboarding Page Utilities', () => {
  it('should return correct components for page 2', () => {
    const comps = getComponentsForPage(mockPageConfig, mockComponents);
    expect(comps).to.have.length(2);
    expect(comps[0]?.name).to.equal('aboutMe');
    expect(comps[1]?.name).to.equal('birthdate');
  });

  it('should handle missing component gracefully', () => {
    const config = { page: 2, components: ['aboutMe', 'missing'] };
    const comps = getComponentsForPage(config, mockComponents);
    expect(comps).to.have.length(1);
    expect(comps[0]?.name).to.equal('aboutMe');
  });

  it('should return empty array if no components assigned', () => {
    const config = { page: 2, components: [] };
    const comps = getComponentsForPage(config, mockComponents);
    expect(comps).to.have.length(0);
  });
});
