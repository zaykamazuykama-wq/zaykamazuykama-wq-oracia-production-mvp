type StatusPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function StatusPage({ params }: StatusPageProps) {
  const { orderId } = await params;

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 48, maxWidth: 760, margin: '0 auto' }}>
      <h1>ORACIA Report Status</h1>
      <p>Your order is being processed automatically after Stripe confirms payment.</p>
      <section style={{ marginTop: 24, padding: 24, border: '1px solid #ddd', borderRadius: 16 }}>
        <p><strong>Order ID:</strong> {orderId}</p>
        <p>
          Check the machine-readable status endpoint at{' '}
          <code>/api/report-status/{orderId}</code>.
        </p>
      </section>
      <p style={{ marginTop: 24 }}>
        When fulfillment is complete, the report download link is sent by email. The download route only works with the private token from that email.
      </p>
    </main>
  );
}
