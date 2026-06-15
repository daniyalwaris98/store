import { BRAND } from "@/lib/constants/brand"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Introduction</h2>
            <p className="text-muted-foreground">
              {BRAND.name} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our store or make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <p className="text-muted-foreground mb-3">
              When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
            </p>
            <p className="text-muted-foreground mb-3">
              Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
            </p>
            <p className="text-muted-foreground">
              When you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Send you order confirmations and shipping updates</li>
              <li>Respond to your questions and concerns</li>
              <li>Improve our store and marketing efforts</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
            <p className="text-muted-foreground">
              We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at:
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