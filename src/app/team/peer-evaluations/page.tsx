import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Peer Evaluations',
  description: 'Peer evaluations for the project',
};

export default function PeerEvaluationsPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Project Peer Evaluations</h1>
    </div>
  );
}
