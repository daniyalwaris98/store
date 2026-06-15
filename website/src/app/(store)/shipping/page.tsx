import { BRAND } from "@/lib/constants/brand"

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Shipping Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Shipping Overview</h2>
            <p className="text-muted-foreground">
              {BRAND.name} offers shipping to domestic addresses. Shipping rates and delivery times vary based on your location and the items ordered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Shipping Rates</h2>
            <p className="text-muted-foreground mb-3">
              Shipping costs are calculated at checkout based on:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Destination address</li>
              <li>Total weight of your order</li>
              <li>Selected shipping method</li>
              <li>Order total</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Free shipping may be available on orders over a certain amount. Check your order total at checkout for eligibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Delivery Timeframes</h2>
            <p className="text-muted-foreground mb-3">
              Once your order is shipped, you can expect delivery within:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Standard Shipping:</strong> 5-7 business days</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Business days are Monday through Friday, excluding holidays. Orders are processed within 1-2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Order Tracking</h2>
            <p className="text-muted-foreground mb-3">
              Once your order ships, you will receive a confirmation email with tracking information. You can track your order status using:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>The tracking link in your confirmation email</li>
              <li>Logging into your account and viewing order details</li>
              <li>Contacting our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Shipping Restrictions</h2>
            <p className="text-muted-foreground mb-3">
              Currently, we ship to domestic addresses only. We do not ship to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>PO Boxes</li>
              <li>Military addresses (APO/FPO)</li>
              <li>International destinations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Lost or Damaged Packages</h2>
            <p className="text-muted-foreground mb-3">
              If your package is lost or arrives damaged, please contact us within 48 hours of the expected delivery date. We will work with the shipping carrier to resolve the issue.
            </p>
            <p className="text-muted-foreground">
              For damaged items, please keep all original packaging materials and photographs of the damage for insurance claims.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about shipping, please contact us:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p>Email: {BRAND.contact.email}</p>
              <p>Phone: {BRAND.contact.phone}</p>
              <p>Address: {BRAND.contact.address}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}