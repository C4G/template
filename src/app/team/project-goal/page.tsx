import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Goal',
  description: 'Goals of our project',
};

export default function ProjectGoalPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Project Goal</h1>
    </div>
  );
}
