import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect directly to onboarding step 1
  redirect('/onboarding/1');
}
