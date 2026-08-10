import { TeamTabs } from './team-tabs';

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex flex-col gap-6 md:flex-row md:gap-8'>
        <TeamTabs />
        {/* min-w-0 keeps wide content (tables, code blocks) from stretching
            the flex row instead of scrolling within it. */}
        <div className='min-w-0 flex-1'>{children}</div>
      </div>
    </div>
  );
}
