import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Demo',
  description: 'Demo of our project',
};

export default function DemoPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Project Demo</h1>
    </div>
  );
}
