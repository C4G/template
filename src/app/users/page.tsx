import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { UsersGrid } from './users-grid';

export const metadata: Metadata = {
  title: 'Users',
  description: 'User Management Page',
};

export default async function UsersPage() {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  return <UsersGrid />;
}
