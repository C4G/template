'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useSession } from '@/lib/auth-client';
import { UserMenu } from './user-menu';

export function Header() {
  const { data } = useSession();
  const isMounted = useIsMounted();

  return (
    <header className='bg-background fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b px-6 py-4'>
      <div className='flex items-center justify-center gap-4'>
        <Link href='/' className='flex items-center gap-2'>
          <Image
            src='/c4g-logo.png'
            alt='Computing for good'
            width='32'
            height='32'
          />
        </Link>
        {isMounted && data ? (
          <Link
            href='/dashboard'
            className='hover:text-primary text-sm font-medium'
          >
            Dashboard
          </Link>
        ) : null}
        {isMounted && data?.user.role === 'ADMIN' ? (
          <Link
            href='/users'
            className='hover:text-primary text-sm font-medium'
          >
            Users
          </Link>
        ) : null}
      </div>
      <UserMenu />
    </header>
  );
}
