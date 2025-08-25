"use client";
import React, { useEffect, useState } from 'react';
import GlassCard from "../../components/GlassCard";

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

// Admin Page
const AdminPage: React.FC = () => {
  const [savingPage, setSavingPage] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<{ [page: number]: boolean }>({});
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>([]);
  // Local state for page assignments
  const [localPageAssignments, setLocalPageAssignments] = useState<{ [page: number]: string[] }>({});

  // Sync local state with fetched configs
  useEffect(() => {
    const assignments: { [page: number]: string[] } = {};
    [2, 3].forEach(pageNum => {
      const config = pageConfigs.find(cfg => cfg.page === pageNum);
      assignments[pageNum] = config ? [...config.components] : [];
    });
    setLocalPageAssignments(assignments);
  }, [pageConfigs, customComponents.length]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComp, setNewComp] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
  });
  const [creating, setCreating] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch custom components
        const ccRes = await fetch('/api/admin/custom-components');
        const ccData = await ccRes.json();
        setCustomComponents(ccData);
        // Fetch page configs
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

  // Update page config
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
      await res.json();
    } catch {
      setError('Failed to update page config');
    } finally {
      setLoading(false);
    }
  }

  // Built-in components
  const builtInNames = ['aboutMe', 'birthdate', 'address'];
  const builtInComponents = customComponents.filter(c => builtInNames.includes(c.name));
  const customOnlyComponents = customComponents.filter(c => !builtInNames.includes(c.name));

  // Helper: get page assignment for a component
  function getComponentPage(name: string): number | null {
    const config = pageConfigs.find(cfg => cfg.components.includes(name));
    return config ? config.page : null;
  }

  // Assign/remove components for a page
  async function handlePageAssignmentChange(page: number, componentName: string, checked: boolean) {
    setLocalPageAssignments(prev => {
      const comps = prev[page] ? [...prev[page]] : [];
      let newComps;
      if (checked) {
        if (!comps.includes(componentName)) newComps = [...comps, componentName];
        else newComps = comps;
      } else {
        newComps = comps.filter(c => c !== componentName);
      }
      return { ...prev, [page]: newComps };
    });
  }

  async function handleSavePageConfig(page: number) {
    setSavingPage(page);
    setError(null);
    try {
      await updatePageConfig(page, localPageAssignments[page] || []);
      setSaveSuccess(prev => ({ ...prev, [page]: true }));
      setTimeout(() => setSaveSuccess(prev => ({ ...prev, [page]: false })), 1500);
    } catch {
      setError('Failed to update page config');
    } finally {
      setSavingPage(null);
    }
  }

  // Render
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

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
      // Refresh components
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

  return (
    <GlassCard style={{ width: "90%", margin: "auto" }}>
  <h2 className="text-2xl font-bold mb-8 text-center">Admin: Onboarding Component Management</h2>

  {/* 1. Component Creation Section */}
  <div className="flex justify-center mb-10">
    <button
      onClick={() => setShowCreateModal(true)}
      className="px-6 py-3 rounded-xl bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 transition"
    >
      Create Component
    </button>
  </div>
  {showCreateModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white/80 rounded-xl shadow-xl p-8 min-w-[380px] max-w-[420px] relative backdrop-blur">
        <button
          onClick={() => { setShowCreateModal(false); setNewComp({ name: '', label: '', type: 'text', required: false, placeholder: '' }); }}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >×</button>
        <h2 className="mb-4 text-lg font-semibold">Create New Component</h2>
        <form
          onSubmit={async e => {
            await handleCreateComponent(e);
            setShowCreateModal(false);
          }}
          className="flex flex-col gap-4"
        >
          <label className="font-medium">
            Component Name
            <input
              type="text"
              placeholder="e.g., company_name"
              value={newComp.name}
              onChange={e => setNewComp(c => ({ ...c, name: e.target.value }))}
              required
              className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50"
            />
          </label>
          <label className="font-medium">
            Display Label
            <input
              type="text"
              placeholder="e.g., Company Name"
              value={newComp.label}
              onChange={e => setNewComp(c => ({ ...c, label: e.target.value }))}
              required
              className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50"
            />
          </label>
          <label className="font-medium">
            Field Type
            <select
              value={newComp.type}
              onChange={e => setNewComp(c => ({ ...c, type: e.target.value }))}
              className="w-full mt-1 p-3 rounded-lg border border-blue-300 bg-gray-50"
            >
              <option value="text">Text Input</option>
              <option value="textarea">Textarea</option>
              <option value="date">Date Picker</option>
            </select>
          </label>
          <label className="font-medium">
            Placeholder (optional)
            <input
              type="text"
              placeholder="e.g., Enter your company name"
              value={newComp.placeholder}
              onChange={e => setNewComp(c => ({ ...c, placeholder: e.target.value }))}
              className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50"
            />
          </label>
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={newComp.required}
              onChange={e => setNewComp(c => ({ ...c, required: e.target.checked }))}
              className="accent-blue-500"
            />
            Required field
          </label>
          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 rounded-xl bg-blue-200 text-blue-900 font-semibold border-none text-base hover:bg-blue-300 transition"
            >
              {creating ? 'Creating...' : 'Create Component'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); setNewComp({ name: '', label: '', type: 'text', required: false, placeholder: '' }); }}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold border-none text-base hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  )}

  {/* 2. Page Assignment with Checkbox List */}
  <div className="mb-10">
    <h2 className="text-lg font-semibold mb-4">Assign Components to Pages</h2>
    <div className="flex flex-col md:flex-row gap-8">
      {[2, 3].map(pageNum => (
        <div key={pageNum} className="flex-1 bg-white/70 rounded-xl shadow p-6 border border-gray-200">
          <h3 className="font-bold text-base mb-4">Page {pageNum}</h3>
          <ul className="mb-4">
            {[...builtInComponents, ...customOnlyComponents].map(comp => (
              <li key={comp.name} className="mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localPageAssignments[pageNum]?.includes(comp.name) || false}
                    onChange={e => handlePageAssignmentChange(pageNum, comp.name, e.target.checked)}
                    className="accent-blue-500"
                  />
                  <span className="font-semibold">{comp.label}</span>
                  {builtInNames.includes(comp.name) && <span className="text-gray-400 text-xs ml-1">(built-in)</span>}
                  <span className="text-gray-400 text-xs ml-2">Type: {comp.type}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSavePageConfig(pageNum)}
            className="mt-2 px-5 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 transition"
            disabled={savingPage === pageNum}
          >
            {savingPage === pageNum ? 'Saving...' : saveSuccess[pageNum] ? 'Saved!' : 'Save Configuration'}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      ))}
    </div>
  </div>

  {/* 3. Component List Overview */}
  <div className="mb-10 border border-gray-100 rounded-xl p-6 bg-white/70 shadow">
    <h2 className="text-lg font-semibold mb-4">All Components</h2>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-50">
          <th className="text-left p-3 font-semibold">Label</th>
          <th className="text-left p-3 font-semibold">Type</th>
          <th className="text-left p-3 font-semibold">Required</th>
        </tr>
      </thead>
      <tbody>
        {[...builtInComponents, ...customOnlyComponents].map(comp => (
          <tr key={comp.name} className="border-b last:border-none">
            <td className="p-3">
              <strong>{comp.label}</strong>
              {builtInNames.includes(comp.name) && <span className="text-gray-400 text-xs ml-1">(built-in)</span>}
            </td>
            <td className="p-3">{comp.type}</td>
            <td className="p-3">{comp.required ? 'Yes' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</GlassCard>
  );
};

export default AdminPage;
