export default function HelpPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 48, maxWidth: 880, margin: '0 auto' }}>
      <h1>Help & crisis resources</h1>
      <p>
        ORACIA is not crisis support, therapy, diagnosis, or professional advice. If you feel at risk of harming
        yourself or someone else, pause immediately and contact local emergency services.
      </p>

      <section style={{ marginTop: 24, padding: 24, border: '1px solid #ddd', borderRadius: 16 }}>
        <h2>Immediate danger</h2>
        <p>Call your local emergency number now if there is immediate danger.</p>
        <ul>
          <li>United States / Canada: 988 Suicide & Crisis Lifeline</li>
          <li>United Kingdom & Republic of Ireland: Samaritans 116 123</li>
          <li>European Union: 112 for emergency services</li>
          <li>Australia: Lifeline 13 11 14</li>
          <li>Other countries: contact local emergency services or a trusted local crisis hotline.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Safe-use guidance</h2>
        <p>
          Use ORACIA only as a journaling or entertainment prompt. Do not use a report to make decisions about
          health, safety, money, relationships, immigration, legal matters, work, or whether to continue living.
        </p>
        <p>
          If the report makes you feel pressured, fearful, dependent, or compulsive, stop using it and talk with a
          trusted person or qualified professional.
        </p>
      </section>

      <footer style={{ marginTop: 48, color: '#666' }}>
        <a href="/">Home</a> · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a>
      </footer>
    </main>
  );
}
