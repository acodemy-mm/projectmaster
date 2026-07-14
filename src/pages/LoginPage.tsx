import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { IconBriefcase } from '../icons';

type LoginMode = 'view' | 'admin';

export function LoginPage() {
  const { signInViewer, signInSuperAdmin } = useAuth();
  const [mode, setMode] = useState<LoginMode>('view');
  const [viewPassword, setViewPassword] = useState('');
  const [username, setUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const err =
      mode === 'view'
        ? signInViewer(viewPassword)
        : signInSuperAdmin(username, adminPassword);

    if (err) setError(err);
    setSubmitting(false);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-card__icon">
          <IconBriefcase size={28} color="var(--mac-accent)" />
        </div>
        <h1 className="login-card__title">Project Portal</h1>
        <p className="login-card__subtitle">Team &amp; Project Assignment</p>

        <div className="login-role-desc">
          {mode === 'view' ? (
            <p>
              <strong>Manager Role</strong> — Read-only access to team overview,
              project listings, and member profiles. No editing or configuration allowed.
            </p>
          ) : (
            <p>
              <strong>Super Admin</strong> — Full access including team and project configuration,
              and all read/write operations across the portal.
            </p>
          )}
        </div>

        <div className="mac-segmented login-segmented" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'view'}
            className={`mac-segmented__btn${mode === 'view' ? ' mac-segmented__btn--active' : ''}`}
            onClick={() => { setMode('view'); setError(''); }}
          >
            Manager (View Only)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'admin'}
            className={`mac-segmented__btn${mode === 'admin' ? ' mac-segmented__btn--active' : ''}`}
            onClick={() => { setMode('admin'); setError(''); }}
          >
            Super Admin
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'view' ? (
            <label className="login-field">
              <span className="login-field__label">View password</span>
              <input
                type="password"
                className="login-input"
                value={viewPassword}
                onChange={(e) => setViewPassword(e.target.value)}
                placeholder="Enter view access password"
                autoComplete="current-password"
                required
              />
              <span className="login-field__hint">
                Shared password for managers to view the portal.
              </span>
            </label>
          ) : (
            <>
              <label className="login-field">
                <span className="login-field__label">Username</span>
                <input
                  type="text"
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Super Admin username"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="login-field">
                <span className="login-field__label">Password</span>
                <input
                  type="password"
                  className="login-input"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Super Admin password"
                  autoComplete="current-password"
                  required
                />
                <span className="login-field__hint">
                  Full administrative access to the portal.
                </span>
              </label>
            </>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="mac-btn mac-btn--primary login-submit"
            disabled={submitting}
          >
            {mode === 'view' ? 'Enter Portal' : 'Sign in as Super Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
