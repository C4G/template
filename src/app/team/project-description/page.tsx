import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Description',
  description: 'Description of our project',
};

export default function ProjectDescriptionPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Project Description</h1>
    </div>
  );
}
