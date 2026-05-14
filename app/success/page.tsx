export default function SuccessPage() {
  return (
    <main style={{ padding: 48 }}>
      <h1>Payment received</h1>
      <p>Your ORACIA Report will be generated and delivered by email. Fulfillment is triggered by Stripe webhook, not this page.</p>
    </main>
  );
}
