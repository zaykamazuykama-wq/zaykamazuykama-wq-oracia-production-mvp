export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 48, maxWidth: 960, margin: '0 auto' }}>
      <h1>ORACIA</h1>
      <p>Your hidden pattern, translated for symbolic self-reflection.</p>
      <p>Private reports delivered automatically after payment.</p>

      <section style={{ marginTop: 32, padding: 24, border: '1px solid #ddd', borderRadius: 16 }}>
        <h2>Important safety note</h2>
        <p>
          ORACIA is for entertainment and self-reflection only. It is not medical, psychological, legal,
          financial, relationship, career, or crisis advice. Do not use it as the basis for major life decisions.
        </p>
        <p>
          You remain the decision-maker. Treat every section as a journaling prompt, not an instruction,
          prediction, diagnosis, or command.
        </p>
        <p>
          If you feel at risk of harming yourself or someone else, pause this purchase and visit{' '}
          <a href="/help">Help & crisis resources</a>.
        </p>
      </section>

      <form method="post" action="/api/create-checkout-session" style={{ marginTop: 32, display: 'grid', gap: 16 }}>
        <label>
          Email<br />
          <input name="email" type="email" required style={{ width: '100%', padding: 12 }} />
        </label>
        <label>
          Name<br />
          <input name="name" type="text" maxLength={120} style={{ width: '100%', padding: 12 }} />
        </label>
        <label>
          Birth date<br />
          <input name="birthDate" type="date" required style={{ width: '100%', padding: 12 }} />
        </label>
        <label>
          Birth time optional<br />
          <input name="birthTime" type="time" style={{ width: '100%', padding: 12 }} />
        </label>
        <label>
          Birth place optional<br />
          <input name="birthPlace" type="text" maxLength={160} style={{ width: '100%', padding: 12 }} />
        </label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <input name="ageAffirmed" type="checkbox" value="true" required />
          <span>I confirm I am 18 or older and understand this report is for entertainment and self-reflection only.</span>
        </label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <input name="agencyAffirmed" type="checkbox" value="true" required />
          <span>I understand ORACIA is not advice and should not be used for major life, health, safety, financial, or relationship decisions.</span>
        </label>
        <button type="submit" style={{ padding: 14, borderRadius: 999, border: 0, background: '#191714', color: 'white' }}>
          Continue to secure checkout
        </button>
      </form>

      <footer style={{ marginTop: 48, color: '#666' }}>
        <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/help">Help</a>
      </footer>
    </main>
  );
}
