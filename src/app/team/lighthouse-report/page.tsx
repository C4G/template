import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lighthouse Report',
  description: 'Lighthouse performance report for our project',
};

export default function LighthouseReportPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Lighthouse Report</h1>
    </div>
  );
}
