import PartnerForm from "./components/PartnerForm";

function Bolt({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 32" aria-hidden="true">
      <path d="M14.5 0L1 18.5h8.6L7.4 32 23 12.6h-8.9z" fill="currentColor" />
    </svg>
  );
}

function Wordmark() {
  return (
    <a href="#top" className="wordmark" aria-label="EVOLT Life Wellness — home">
      <Bolt className="wm-bolt" />
      <span className="wm-text">
        <span className="wm-main">EVOLT</span>
        <span className="wm-sub">life · wellness</span>
      </span>
    </a>
  );
}

const PILLARS = [
  {
    k: "01",
    t: "Brand alignment with wellness",
    d: "Put your name next to a mission people feel good about — health, longevity, and whole-person wellbeing — in front of business leaders, athletes, and community decision-makers.",
  },
  {
    k: "02",
    t: "Relationships that convert",
    d: "VIP hospitality, executive networking, and curated introductions designed so partners leave with real conversations, not just impressions.",
  },
  {
    k: "03",
    t: "Measurable community impact",
    d: "Fund scholarships for graduating seniors, honor veterans, and send inner-city kids to Camp EVOLT Life — impact your team can stand behind and talk about.",
  },
  {
    k: "04",
    t: "Recognition before, during & after",
    d: "Signage, digital, broadcast and print exposure, followed by a documented post-event recap of participation, reach, and impact.",
  },
];

const PATHWAYS = [
  { t: "Signature Sponsorship", d: "Title, Presenting, Platinum and Gold tiers with premium placement, hospitality packages, and speaking opportunities.", tag: "Corporate" },
  { t: "Wellness Activation", d: "Host a branded experience at the EVOLT Life Wellness Connect & Health Connect Fair — demos, screenings, sampling, lead capture.", tag: "Experiential" },
  { t: "Community & Veterans Impact", d: "Underwrite scholarships, veteran recognition, and Camp EVOLT Life seats with named, reportable outcomes.", tag: "Philanthropy" },
  { t: "Media & Content Partner", d: "Broad pre- and during-event exposure across TV, radio, social, and print, plus co-created wellness content.", tag: "Media" },
];

const WEEKEND = [
  { day: "Fri", date: "Oct 16", t: "Celebrity Bowl-4-Literacy" },
  { day: "Sat", date: "Oct 17", t: "Pre-Homecoming & Comedy Show" },
  { day: "Sun", date: "Oct 18", t: "Wellness Brunch & Health Connect" },
  { day: "Mon", date: "Oct 19", t: "Celebrity Golf Classic & Gala" },
];

export default function Page() {
  return (
    <main id="top">
      {/* ===== NAV ===== */}
      <header className="nav">
        <div className="wrap nav-inner">
          <Wordmark />
          <nav className="nav-links" aria-label="Primary">
            <a href="#why">Why EVOLT</a>
            <a href="#pathways">Pathways</a>
            <a href="#flagship">Flagship</a>
          </nav>
          <a href="#partner" className="btn btn-gold btn-sm">Book a Call</a>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <span className="glow g1" />
          <span className="glow g2" />
          <span className="grid-lines" />
          <Bolt className="hero-bolt" />
        </div>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow reveal">Partnerships · 2026–2027 Season</p>
            <h1 className="reveal d1">
              Partner With <span className="gold-text">EVOLT&nbsp;Life</span>
            </h1>
            <p className="hero-tag reveal d2">
              <em>The Future of Wellness</em> — and the brands bold enough to build it with us.
            </p>
            <p className="hero-sub reveal d3">
              Join a growing coalition of companies, health leaders, and community champions using wellness, hospitality, and philanthropy to build relationships that last.
            </p>
            <div className="hero-ctas reveal d4">
              <a href="#partner" className="btn btn-gold">Book Your Discovery Call</a>
              <a href="#pathways" className="btn btn-ghost">Explore Partnerships</a>
            </div>
            <ul className="hero-proof reveal d5">
              <li><strong>4-day</strong><span>flagship weekend</span></li>
              <li><strong>Dallas</strong><span>Brookhaven Country Club</span></li>
              <li><strong>2027</strong><span>Camp EVOLT Life</span></li>
            </ul>
          </div>

          <aside className="hero-card reveal d3" aria-label="Partner snapshot">
            <div className="hc-top">
              <span className="hc-pill">Now accepting partners</span>
              <Bolt className="hc-bolt" />
            </div>
            <p className="hc-label">Golf · Wellness · Relationships · Impact</p>
            <h2 className="hc-title">A 30-minute call is all it takes to begin.</h2>
            <ol className="hc-steps">
              <li><span>1</span>Share a few details</li>
              <li><span>2</span>Pick a time that works</li>
              <li><span>3</span>Receive a tailored proposal</li>
            </ol>
            <a href="#partner" className="hc-link">Reserve a time <span aria-hidden="true">→</span></a>
          </aside>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              Wellness <Bolt className="mq-bolt" /> Relationships <Bolt className="mq-bolt" /> Impact <Bolt className="mq-bolt" /> Veterans <Bolt className="mq-bolt" /> Community <Bolt className="mq-bolt" /> Scholarships <Bolt className="mq-bolt" /> Celebrity Golf Classic <Bolt className="mq-bolt" />
            </span>
          ))}
        </div>
      </div>

      {/* ===== WHY ===== */}
      <section id="why" className="section">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">The EVOLT Difference</p>
            <h2>More than sponsorship — <em>a wellness movement in motion.</em></h2>
            <p className="sec-lead">
              EVOLT Life Wellness brings together business leaders, wellness advocates, community partners, clients and guests. Partners get visibility, access and outcomes they can measure.
            </p>
          </div>
          <div className="pillars">
            {PILLARS.map((p) => (
              <article key={p.k} className="pillar">
                <span className="pillar-k">{p.k}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PATHWAYS ===== */}
      <section id="pathways" className="section section-dark">
        <div className="wrap">
          <div className="sec-head light">
            <p className="eyebrow">Partnership Pathways</p>
            <h2>Four ways to build with us. <em>One conversation to start.</em></h2>
          </div>
          <div className="paths">
            {PATHWAYS.map((p, i) => (
              <article key={p.t} className="path">
                <div className="path-top">
                  <span className="path-tag">{p.tag}</span>
                  <span className="path-i">0{i + 1}</span>
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <a href="#partner" className="path-link">Discuss this pathway <span aria-hidden="true">→</span></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FLAGSHIP ===== */}
      <section id="flagship" className="section">
        <div className="wrap flagship">
          <div className="flag-copy">
            <p className="eyebrow">Flagship Experience</p>
            <h2>The EVOLT Life <em>Celebrity Golf Classic</em></h2>
            <p>
              A premium golf, wellness, networking and sponsorship weekend honoring wellness, veterans and community — anchoring the SMU &amp; TSCU Pre-Homecoming weekend in Dallas, Texas.
            </p>
            <div className="flag-meta">
              <div><span>When</span><strong>October 16–19, 2026</strong></div>
              <div><span>Where</span><strong>Brookhaven Country Club, Dallas</strong></div>
              <div><span>Format</span><strong>18-hole team scramble</strong></div>
            </div>
          </div>
          <ol className="timeline">
            {WEEKEND.map((w) => (
              <li key={w.date}>
                <div className="tl-date"><span>{w.day}</span>{w.date}</div>
                <div className="tl-t">{w.t}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== FORM ===== */}
      <section id="partner" className="section section-form">
        <div className="form-bg" aria-hidden="true"><span className="glow g3" /></div>
        <div className="wrap form-layout">
          <div className="form-intro">
            <p className="eyebrow">Let&rsquo;s Build Together</p>
            <h2>Start your partnership <em>today.</em></h2>
            <p className="sec-lead light">
              Share your details, choose a time, and our partnerships team will come prepared with ideas tailored to your goals.
            </p>
            <ul className="expect">
              <li><Bolt className="ex-bolt" /><div><strong>A focused 30-minute call</strong><span>Your goals, audience and budget — no pressure, no boilerplate.</span></div></li>
              <li><Bolt className="ex-bolt" /><div><strong>A tailored proposal</strong><span>Recommended tier, activations and impact outcomes for your brand.</span></div></li>
              <li><Bolt className="ex-bolt" /><div><strong>A clear path to activation</strong><span>Timelines, deliverables and post-event reporting spelled out.</span></div></li>
            </ul>
            <figure className="qr-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qr-code.png" alt="QR code linking to the Partner With EVOLT Life signup page" width={132} height={132} />
              <figcaption>
                <strong>Scan to sign up</strong>
                <span>Share this page with a colleague in seconds.</span>
              </figcaption>
            </figure>
          </div>
          <div className="form-card">
            <PartnerForm />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="wrap foot-inner">
          <Wordmark />
          <p>© {new Date().getFullYear()} EVOLT Life Wellness · Honor. Serve. Thrive.</p>
          <a href="#partner" className="foot-link">Become a Partner →</a>
        </div>
      </footer>
    </main>
  );
}
