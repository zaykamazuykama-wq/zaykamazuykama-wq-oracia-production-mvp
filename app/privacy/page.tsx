export default function PrivacyPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 48, maxWidth: 880, margin: '0 auto' }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: 2026-05-15</p>

      <h2>Data we collect</h2>
      <p>
        ORACIA collects the information needed to create and deliver your symbolic report: email address, optional
        name, birth date, optional birth time, optional birth place, payment status, report delivery status, and
        technical fulfillment records.
      </p>

      <h2>How we use data</h2>
      <p>
        We use this data to process payment, generate your report, send your download link, prevent duplicate
        fulfillment, apply purchase limits, handle refunds, and respond to support requests.
      </p>

      <h2>Payments and email</h2>
      <p>
        Payments are handled by Stripe. Email delivery may be handled by Resend. Do not send highly sensitive
        personal, medical, legal, or emergency information through ORACIA forms or support email.
      </p>

      <h2>Deletion requests</h2>
      <p>
        You may request deletion of customer data by contacting support@example.com. Some payment records may need
        to be retained where required for accounting, fraud prevention, dispute handling, or legal compliance.
      </p>

      <h2>Contact</h2>
      <p>Support: support@example.com</p>

      <footer style={{ marginTop: 48, color: '#666' }}>
        <a href="/">Home</a> · <a href="/terms">Terms</a> · <a href="/help">Help</a>
      </footer>
    </main>
  );
}
