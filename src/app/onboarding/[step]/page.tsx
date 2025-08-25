"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from "../../../components/GlassCard";
import StepIndicator from "../../../components/StepIndicator";


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

const OnboardingStepPage: React.FC<{ params: Promise<{ step: string }> }> = ({ params }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { step } = React.use(params);
  const stepNumber = Number(step);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [components, setComponents] = useState<CustomComponent[]>([]);
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  // Prefill form from profile_data JSON
  useEffect(() => {
    async function prefillForm() {
      if (!userEmail) return;
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
      if (!supabaseUrl || !supabaseKey) return;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (userRow && userRow.id) {
        const { data: profileRow } = await supabase
          .from('user_profiles')
          .select('profile_data')
          .eq('user_id', userRow.id)
          .single();
        if (profileRow && profileRow.profile_data) {
          setForm((prev) => ({ ...prev, ...profileRow.profile_data }));
        }
      }
    }
    prefillForm();
  }, [userEmail]);

  useEffect(() => {
    // Check login status and previous step completion
    async function checkAccess() {
        // Get current user from Supabase (client-side)
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
        if (!supabaseUrl || !supabaseKey) {
          setError('Supabase environment variables are missing');
          setLoading(false);
          return;
        }
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
          router.push('/onboarding/1');
          return;
        }
        setUserEmail(user.email);
        // For step 3, check if step 2 is complete using users table
        if (stepNumber === 3) {
          const { data: userData } = await supabase
            .from('users')
            .select('current_step')
            .eq('email', user.email)
            .single();
          if (!userData || userData.current_step < 2) {
            router.push('/onboarding/2');
            return;
          }
        }
    }
    checkAccess();
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all custom components
        const ccRes = await fetch('/api/admin/custom-components');
        const ccData: CustomComponent[] = await ccRes.json();
        setComponents(ccData);
        // Fetch page config for this step
        const pcRes = await fetch('/api/admin/page-components');
        const pcData: PageConfig[] = await pcRes.json();
  const config = pcData.find(cfg => cfg.page === stepNumber);
        setPageConfig(config || null);
      } catch {
        setError('Failed to load onboarding config');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [step, stepNumber, router]);

  if (loading) return <div>Loading...</div>;
  if (!userEmail) return <div>Checking access...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!pageConfig) return <div>No configuration found for this page.</div>;

  // Handle form change
  function handleChange(name: string, value: string) {
    setForm(f => ({ ...f, [name]: value }));
  }

  // Handle submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Save all form data as JSON (exclude email)
      const formData = { ...form };
      const res = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data: { ...formData, email: userEmail } }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to submit');
        setSubmitting(false);
        return;
      }
      // Show success alert for step 3 completion
      if (stepNumber === 3) {
        alert('Congratulations! Your profile has been successfully saved and onboarding is complete!');
      }
      // Go to next step or finish - don't reset submitting state to prevent flash
      if (stepNumber < 3) {
        router.push(`/onboarding/${stepNumber + 1}`);
      } else {
        router.push('/onboarding/1');
      }
    } catch {
      setError('Failed to submit data');
      setSubmitting(false);
    }
  }

  // Render form fields for assigned components
  return (
    <GlassCard style={{ maxWidth: 520, margin: '48px auto', width: '100%' }}>
      <StepIndicator current={stepNumber} total={3} />
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', padding: 32 }}>
      
      <h1 className="text-center font-bold text-2xl mb-6">Onboarding - Page {stepNumber}</h1>
      <div style={{ marginBottom: 16, color: '#555', fontSize: 15 }}>
          <strong>User:</strong> {userEmail}
        </div>
      {pageConfig.components.map(name => {
        const comp = components.find(c => c.name === name);
        if (!comp) return null;
        switch (comp.type) {
          case 'text':
            return (
              <div key={comp.id} style={{ marginBottom: 16 }}>
                <label className="block font-medium text-[15px] mb-1">{comp.label}</label>
                <input
                  type="text"
                  required={comp.required}
                  placeholder={comp.placeholder}
                  value={form[comp.name] || ''}
                  onChange={e => handleChange(comp.name, e.target.value)}
                  className="w-full p-3 text-base rounded-lg border border-gray-300 bg-white/60 outline-none focus:border-black transition-colors"
                />
              </div>
            );
          case 'textarea':
            return (
              <div key={comp.id} style={{ marginBottom: 16 }}>
                <label className="block font-medium text-[15px] mb-1">{comp.label}</label>
                <textarea
                  required={comp.required}
                  placeholder={comp.placeholder}
                  value={form[comp.name] || ''}
                  onChange={e => handleChange(comp.name, e.target.value)}
                  className="w-full p-3 text-base rounded-lg border border-gray-300 bg-white/60 outline-none focus:border-black transition-colors"
                />
              </div>
            );
          case 'date':
            return (
              <div key={comp.id} style={{ marginBottom: 16 }}>
                <label className="block font-medium text-[15px] mb-1">{comp.label}</label>
                <input
                  type="date"
                  required={comp.required}
                  value={form[comp.name] || ''}
                  onChange={e => handleChange(comp.name, e.target.value)}
                  className="w-full p-3 text-base rounded-lg border border-gray-300 bg-white/60 outline-none focus:border-black transition-colors"
                />
              </div>
            );
          default:
            return null;
        }
      })}
     <button
  type="submit"
  disabled={submitting}
  className="w-full mt-6 p-4 text-lg font-semibold bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
>
  {submitting ? 'Saving...' : (stepNumber < 3 ? 'Next' : 'Finish')}
</button>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </form>
    </GlassCard>
  );
};

export default OnboardingStepPage;
