import { BRAND } from "@/lib/constants/brand"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using the {BRAND.name} website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Products and Services</h2>
            <p className="text-muted-foreground mb-3">
              All products and services offered through our store are subject to availability. We reserve the right to discontinue any product or service at any time.
            </p>
            <p className="text-muted-foreground mb-3">
              We have made every effort to display accurate product colors and images. However, we cannot guarantee that your device's display of any color will be accurate.
            </p>
            <p className="text-muted-foreground">
              Prices for our products are subject to change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Orders and Payment</h2>
            <p className="text-muted-foreground mb-3">
              By placing an order, you agree to provide accurate, complete, and current purchase information. We reserve the right to refuse or cancel any order for any reason.
            </p>
            <p className="text-muted-foreground">
              Currently, we only accept Cash on Delivery (COD) as a payment method.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Shipping and Delivery</h2>
            <p className="text-muted-foreground mb-3">
              Shipping rates and delivery times vary based on your location and the shipping method selected at checkout.
            </p>
            <p className="text-muted-foreground">
              Risk of loss and title for items purchased pass to you upon delivery to the carrier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Returns and Refunds</h2>
            <p className="text-muted-foreground mb-3">
              Our return policy allows for returns within 14 days of delivery for most items. Products must be unused and in their original packaging.
            </p>
            <p className="text-muted-foreground">
              Please contact us to initiate a return. Refunds will be processed to your original payment method once we receive and inspect the returned item.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              In no case shall {BRAND.name}, our directors, officers, employees, or agents be liable for any indirect, incidental, special, or consequential damages arising from your use of the site or products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
            <p className="text-muted-foreground">
              Questions about the Terms of Service should be sent to us at:
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