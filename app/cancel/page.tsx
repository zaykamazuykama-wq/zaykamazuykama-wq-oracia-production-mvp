export default function CancelPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 48, maxWidth: 760, margin: '0 auto' }}>
      <h1>Checkout cancelled</h1>
      <p>You were not charged.</p>
      <p>If you cancelled because the purchase felt urgent, distressing, or compulsive, that was a good reason to pause. You can use the Help page for grounding resources.</p>
      <footer style={{ marginTop: 48, color: '#666' }}>
        <a href="/">Home</a> · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/help">Help</a>
      </footer>
    </main>
  );
}
