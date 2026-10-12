import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="font-heading text-2xl text-white">
          implenix <span className="text-white/50 text-base">team</span>
        </p>
        <h1 className="mt-6 font-body text-lg font-semibold text-white">Sign in to the dashboard</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
