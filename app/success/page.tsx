export default function SuccessPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 48, maxWidth: 760, margin: '0 auto' }}>
      <h1>Payment received</h1>
      <p>Your ORACIA Report will be generated and delivered by email. Fulfillment is triggered by Stripe webhook, not this page.</p>
      <section style={{ marginTop: 24, padding: 24, border: '1px solid #ddd', borderRadius: 16 }}>
        <h2>Before reading your report</h2>
        <p>ORACIA is for entertainment and self-reflection only. It is not medical, psychological, legal, financial, relationship, career, or emergency-support advice.</p>
        <p>You remain the decision-maker. Treat the report as journaling prompts, not instructions or predictions.</p>
      </section>
      <footer style={{ marginTop: 48, color: '#666' }}>
        <a href="/">Home</a> · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/help">Help</a>
      </footer>
    </main>
  );
}
