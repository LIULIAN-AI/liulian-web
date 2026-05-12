/**
 * /studio shell — 4-tab IA: Data / Train / Inference / Insight.
 * Matches the canonical LIULIAN mental model from feat/gui-demo.
 *
 * Per PLATFORM_DESIGN §5: 56px sidebar (icons collapsed), running
 * scientific header at the top, Cmd+K palette as primary nav.
 */

import Link from 'next/link';
import { Fraunces, JetBrains_Mono, Inter as Switzer } from 'next/font/google';
import './studio.css';

const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', axes: ['opsz', 'SOFT', 'WONK'] });
const jbMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap' });
const switzer = Switzer({ subsets: ['latin'], display: 'swap' });

const TABS = [
  { id: 'data', href: '/studio/data', label: 'Data', shortcut: '1' },
  { id: 'train', href: '/studio/train', label: 'Train', shortcut: '2' },
  { id: 'inference', href: '/studio/inference', label: 'Inference', shortcut: '3' },
  { id: 'insight', href: '/studio/insight', label: 'Insight', shortcut: '4' },
] as const;

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`liulian-studio ${switzer.className}`}>
      <header className="studio-header">
        <span className={`studio-mark ${fraunces.className}`}>LIULIAN</span>
        <span className={`studio-running ${jbMono.className}`}>
          Studio · <span className="dim">awaiting first run</span>
        </span>
        <span className={`studio-shortcut ${jbMono.className}`}>⌘K palette · b agent</span>
      </header>
      <aside className="studio-sidebar" aria-label="Studio navigation">
        {TABS.map(t => (
          <Link key={t.id} href={t.href} className="studio-tab" data-tab={t.id}>
            <span className="studio-tab-dot" aria-hidden />
            <span className="studio-tab-label">{t.label}</span>
            <span className={`studio-tab-shortcut ${jbMono.className}`}>{t.shortcut}</span>
          </Link>
        ))}
      </aside>
      <main className="studio-main">{children}</main>
    </div>
  );
}

export const metadata = {
  title: 'LIULIAN · Studio',
  description: 'Research workspace: data manifests, training runs, inference, insight reports.',
};
