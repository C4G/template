'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
  const router = useRouter();

  // Fall back to the index tab so an unrecognised path never leaves the
  // dropdown showing a section the user is not actually on.
  const activeHref =
    tabs.find((tab) => tab.href === pathname)?.href ?? tabs[0].href;

  return (
    <>
      <div className='md:hidden'>
        <Select value={activeHref} onValueChange={(href) => router.push(href)}>
          <SelectTrigger id='team-section' aria-label='Team section'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.href} value={tab.href}>
                {tab.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={activeHref}
        orientation='vertical'
        className='hidden md:block'
      >
        <TabsList className='bg-muted text-muted-foreground flex h-auto w-56 shrink-0 flex-col items-stretch justify-start gap-1 rounded-lg p-2'>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.href}
              value={tab.href}
              className='hover:text-foreground w-full justify-start rounded-md px-3 py-2 text-left text-sm'
              asChild
            >
              <Link href={tab.href}>{tab.name}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
