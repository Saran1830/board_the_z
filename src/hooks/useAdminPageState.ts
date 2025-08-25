import { useState, useEffect } from 'react';

// Types
interface CustomComponent {
  id: string;
  name: string;
  label: string;
  type: string;
  options: string[] | null;
  required: boolean;
  placeholder: string;
}
interface PageConfig {
  id: string;
  page: number;
  components: string[];
}

export function useAdminPageState() {
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const builtInNames = ['aboutMe', 'birthdate', 'address'];
  const builtInComponents = customComponents.filter(c => builtInNames.includes(c.name));
  const customOnlyComponents = customComponents.filter(c => !builtInNames.includes(c.name));
  const [newComp, setNewComp] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const ccRes = await fetch('/api/admin/custom-components');
        const ccData = await ccRes.json();
        setCustomComponents(ccData);
        const pcRes = await fetch('/api/admin/page-components');
        const pcData = await pcRes.json();
        setPageConfigs(pcData);
      } catch {
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function updatePageConfig(page: number, components: string[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/page-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, components }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setPageConfigs((prev) => prev.map(cfg => cfg.page === page ? updated : cfg));
    } catch {
      setError('Failed to update page config');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateComponent(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/custom-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComp),
      });
      if (!res.ok) throw new Error('Failed to create component');
      const ccRes = await fetch('/api/admin/custom-components');
      const ccData = await ccRes.json();
      setCustomComponents(ccData);
      setNewComp({ name: '', label: '', type: 'text', required: false, placeholder: '' });
    } catch {
      setError('Failed to create component');
    } finally {
      setCreating(false);
    }
  }

  return {
    customComponents,
    setCustomComponents,
    pageConfigs,
    setPageConfigs,
    loading,
    setLoading,
    error,
    setError,
    builtInComponents,
    customOnlyComponents,
    newComp,
    setNewComp,
    creating,
    setCreating,
    updatePageConfig,
    handleCreateComponent
  };
}
