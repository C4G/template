'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signIn } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn.email({ email, password });

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Invalid email or password.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    await signIn.social({ provider: 'google', callbackURL: '/dashboard' });
  };

  return (
    <div className='flex min-h-[calc(100dvh-8.4rem)] items-center justify-center px-4'>
      <div className='w-full max-w-sm space-y-6 rounded-lg border p-6 shadow-xs'>
        <div className='space-y-1 text-center'>
          <h1 className='text-2xl font-bold'>Sign in</h1>
          <p className='text-muted-foreground text-sm'>
            Sign in to your account to continue
          </p>
        </div>
        <form onSubmit={handleEmailSignIn} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>
        <p className='text-muted-foreground text-center text-sm'>
          Don&apos;t have an account?{' '}
          <Link href='/signup' className='hover:text-primary underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
