'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { name: 'Team', href: '/team' },
  { name: 'Project Description', href: '/team/project-description' },
  { name: 'Project Goal', href: '/team/project-goal' },
  { name: 'Lighthouse Report', href: '/team/lighthouse-report' },
  { name: 'Presentation Slides', href: '/team/presentation-slides' },
  { name: 'Weekly Updates', href: '/team/weekly-updates' },
  { name: 'Project Peer Evaluations', href: '/team/peer-evaluations' },
  { name: 'Demo', href: '/team/demo' },
];

export function TeamTabs() {
  const pathname = usePathname();

  return (
    <Tabs value={pathname} className='flex w-full justify-center'>
      <TabsList className='bg-muted text-muted-foreground inline-flex h-10 max-w-full items-center justify-center overflow-x-auto rounded-md p-1'>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.href}
            value={tab.href}
            className='ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-xs'
            asChild
          >
            <Link href={tab.href}>{tab.name}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
