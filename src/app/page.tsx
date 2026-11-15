import maintenance from "@/app/maintenance.json";

export default function MaintenancePage() {
  const progress = Math.min(100, Math.max(0, maintenance.progress));

  return (
    <main className="maintenance-page" id="main-content">
      <header className="maintenance-header" data-enter>
        <a className="skip-link" href="#maintenance-status">
          Skip to maintenance status
        </a>
        <a className="brand" href="#main-content" aria-label={`${maintenance.brand} maintenance home`}>
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span>{maintenance.brand}</span>
        </a>
        <p className="header-reference">Ref. {maintenance.reference}</p>
      </header>

      <section className="maintenance-hero" id="maintenance-status" aria-labelledby="maintenance-title">
        <div className="maintenance-copy" data-enter>
          <p className="status-line">
            <span className="status-dot" aria-hidden="true" />
            {maintenance.statusLabel}
          </p>
          <h1 id="maintenance-title">{maintenance.title}</h1>
          <p className="maintenance-message">{maintenance.message}</p>

          <dl className="maintenance-times">
            <div>
              <dt>Maintenance began</dt>
              <dd>{maintenance.startedAt}</dd>
            </div>
            <div>
              <dt>Estimated return</dt>
              <dd>{maintenance.estimatedReturn}</dd>
            </div>
          </dl>

          <a className="contact-link" href={`mailto:${maintenance.contactEmail}`}>
            {maintenance.contactLabel}
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="maintenance-visual" role="img" aria-label={`Maintenance is ${progress}% complete`} data-enter>
          <div className="visual-grid" aria-hidden="true" />
          <div className="orbit orbit-one" aria-hidden="true" />
          <div className="orbit orbit-two" aria-hidden="true" />
          <div className="progress-dial" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}>
            <span>{progress}%</span>
            <small>complete</small>
          </div>
          <div className="progress-copy">
            <span>System status</span>
            <strong>{maintenance.progressLabel}</strong>
          </div>
        </div>
      </section>

      <footer className="maintenance-footer">
        <p>MyUMK services are temporarily unavailable.</p>
        <p>Updates are published on this page.</p>
      </footer>
    </main>
  );
}
