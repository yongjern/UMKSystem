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
          <span className="brand-mark" aria-hidden="true">M</span>
          <span className="brand-copy">
            <small>Academic operations</small>
            <strong>{maintenance.brand}</strong>
          </span>
        </a>
        <div className="header-status">
          <span><i aria-hidden="true" />Maintenance active</span>
          <p>Ref. {maintenance.reference}</p>
        </div>
      </header>

      <div className="signal-divider" aria-hidden="true" />

      <section className="maintenance-hero" id="maintenance-status" aria-labelledby="maintenance-title">
        <div className="maintenance-copy" data-enter>
          <p className="status-line">{maintenance.statusLabel}</p>
          <h1 id="maintenance-title">{maintenance.title}</h1>
          <p className="maintenance-message">{maintenance.message}</p>
        </div>

        <div className="maintenance-panel" data-enter>
          <div className="panel-progress" role="img" aria-label={`Maintenance is ${progress}% complete`}>
            <span className="panel-label">System progress</span>
            <strong>{progress}<small>%</small></strong>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p>{maintenance.progressLabel}</p>
          </div>

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

          <a className="contact-link" href={maintenance.link}>
            {maintenance.linkLabel}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className="maintenance-footer">
        <p>MyUMK services are temporarily unavailable.</p>
        <p>Updates are published on this page.</p>
      </footer>
    </main>
  );
}
