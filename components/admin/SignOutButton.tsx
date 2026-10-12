'use client';

import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Button } from './ui';

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        router.replace('/admin/login');
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
