
import { createClient } from '../../../server/utils/supabase/client';
import GlassCard from "../../components/GlassCard";

export default async function DataPage() {
  const supabase = createClient();
  // Join user_profiles with users to get email and current_step
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*, users(email, current_step)');

  if (error) {
    return <div>Error loading profiles: {error.message}</div>;
  }

  // Collect all unique profile keys
  const allKeys = Array.from(
    new Set(
      profiles?.flatMap((profile: Record<string, unknown>) => Object.keys((profile.profile_data as Record<string, unknown>) || {})) || []
    )
  );

  return (
    <GlassCard style={{ width: "90%", margin: "auto" }}>
      <h2 className="text-2xl font-bold mb-6">User Profiles</h2>
      <p className="text-gray-500 mb-6">All user submissions from the onboarding flow</p>
        <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
            <thead>
            <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">User ID</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Current Step</th>
            {allKeys.map((key) => (
              <th key={key} className="px-4 py-3 text-left font-semibold text-gray-700">{key}</th>
            ))}
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Created At</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Updated At</th>
          </tr>
        </thead>
        <tbody>
          {profiles?.map((profile: Record<string, unknown>) => (
            <tr key={profile.id as string} className="border-b last:border-none">
              <td className="px-4 py-2 font-mono text-gray-700">{profile.id as string}</td>
              <td className="px-4 py-2 font-mono text-gray-700">{profile.user_id as string}</td>
              <td className="px-4 py-2 font-mono text-gray-700">{typeof profile.users === 'object' && profile.users !== null ? String((profile.users as Record<string, unknown>).email ?? '') : ''}</td>
              <td className="px-4 py-2 font-mono text-gray-700">{typeof profile.users === 'object' && profile.users !== null ? String((profile.users as Record<string, unknown>).current_step ?? '') : ''}</td>
              {allKeys.map((key) => {
                const value = (profile.profile_data as Record<string, unknown>)?.[key];
                // Render JSON values as strings
                let displayValue = '';
                if (value !== undefined && value !== null) {
                  if (typeof value === 'object') {
                    displayValue = JSON.stringify(value);
                  } else {
                    displayValue = String(value);
                  }
                }
                return <td key={key} className="px-4 py-2">{displayValue}</td>;
              })}
              <td className="px-4 py-2">{profile.created_at as string}</td>
              <td className="px-4 py-2">{profile.updated_at as string}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </GlassCard>
  );
}
