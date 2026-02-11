import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Our team and project information',
};

export default function TeamPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Team Members</h1>
    </div>
  );
}
