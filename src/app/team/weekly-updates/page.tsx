import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weekly Updates',
  description: 'Weekly project updates',
};

export default function WeeklyUpdatesPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Weekly Updates</h1>
    </div>
  );
}
