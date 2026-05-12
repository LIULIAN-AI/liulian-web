/**
 * LIULIAN marketing landing — editorial-magazine register.
 *
 * Spec: liulian-python/docs/strategy/PLATFORM_DESIGN.md §6
 * Visual canon: liulian-python/.worktrees/gui-demo (iteration 2)
 * Standalone HTML preview: liulian-web/standalone-landing.html
 *
 * The page is deliberately card-free, hero-metric-free, and gradient-free
 * (per UI_AUDIT_CHECKLIST §F). Spot color: UniBe red `#E20613`, used only
 * on (a) the accent `U`, (b) chart predicted-line, (c) CI fan fill.
 */

import { Fraunces, JetBrains_Mono } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
});

// Live counters — values rendered server-side; client SSE upgrade happens
// in a small client component (next iteration).
async function getCounters() {
  return {
    sensors: 2143,
    models: 30,
    agents: 3,
    datasets: 17,
  };
}

export default async function MarketingLanding() {
  const counters = await getCounters();
  return (
    <main className="liulian-landing">
      <header className="eyebrow">
        <span className="mark">University of Bern · Spatio-Temporal Research Platform</span>
        <span className="env">v0.6.0 · Bern · Hydrology Lab</span>
      </header>

      <section className="hero">
        <p className="pretitle">Liquid Intelligence · Unified Logic · Interactive Adaptive Networks</p>
        <h1 className={fraunces.className}>
          LI<span className="accent">U</span>LIAN
        </h1>
        <p className="tagline">
          Open-source production stack for spatio-temporal AI: a{' '}
          <em>research-grade model zoo</em> wrapped in{' '}
          <em>production-grade BI</em>.
        </p>

        <div className={`counter ${jbMono.className}`}>
          <span className="stat"><strong>{counters.sensors.toLocaleString()}</strong> sensors live</span>
          <span className="stat"><strong>{counters.models}+</strong> models in benchmark</span>
          <span className="stat"><strong>{counters.agents}</strong> agents ready</span>
          <span className="stat"><strong>{counters.datasets}</strong> datasets indexed</span>
        </div>
      </section>

      <section className="bands">
        <Band title="Manifest" anchor='"Every dataset starts with a contract."'>
          <p>Every dataset starts with a contract. Schema, topology, integrity hash. Reproducible by design.</p>
        </Band>
        <Rule />
        <Band title="Train" anchor='"Thirty models, one runtime."'>
          <p>Thirty models, one runtime. PatchTST, TimesNet, Chronos zero-shot, TSL graphs. Single-command benchmarks.</p>
        </Band>
        <Rule />
        <Band title="Forecast" anchor='"To a hydrologist’s risk brief, in twenty seconds."'>
          <p>From prediction to a hydrologist&rsquo;s risk brief, in twenty seconds. Probabilistic intervals, alert thresholds, exportable.</p>
        </Band>
      </section>

      <div className="cta">
        <a href="/forecast">
          Open SwissRiver demo{' '}
          <span className="arrow" aria-hidden>
            &rarr;
          </span>
        </a>
      </div>

      <footer>
        <span>&copy; 2026 LIULIAN &middot; MIT License</span>
        <span>Designed in Bern &middot; Built with University of Bern PRG</span>
      </footer>
    </main>
  );
}

function Band({ title, children, anchor }: { title: string; children: React.ReactNode; anchor: string }) {
  return (
    <article className="band">
      <h2 className={fraunces.className}>{title}</h2>
      {children}
      <p className="anchor">{anchor}</p>
    </article>
  );
}

function Rule() {
  return <div className="rule" aria-hidden />;
}

export const metadata = {
  title: 'LIULIAN — Liquid Intelligence for Time',
  description:
    'Open-source production stack for spatio-temporal AI: a research-grade model zoo wrapped in production-grade BI.',
};
