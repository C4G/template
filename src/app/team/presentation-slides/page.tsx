import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Presentation Slides',
  description: 'Project presentation slides',
};

export default function PresentationSlidesPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Presentation Slides</h1>
    </div>
  );
}
