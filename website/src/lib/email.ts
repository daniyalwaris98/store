import nodemailer from "nodemailer"
import { BRAND } from "@/lib/constants/brand"
import { formatPrice } from "@/lib/currency"

interface OrderEmailData {
  orderNumber: string
  customerEmail: string
  customerName: string
  items: Array<{
    name: string
    price: number
    quantity: number
    image?: string
  }>
  subtotal: number
  shippingCost: number
  total: number
  currency: string
  shippingAddress: {
    street: string
    city: string
    state?: string
    country: string
    postalCode?: string
  }
}

function createEmailTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function buildOrderEmailHTML(data: OrderEmailData): string {
  const { orderNumber, customerName, items, subtotal, shippingCost, total, currency, shippingAddress } = data

  const itemsRows = items
    .map((item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" width="60" height="60" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; display: block;" />` : `<div style="width: 60px; height: 60px; background: #f1f5f9; border-radius: 4px;"></div>`}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle;">
          <span style="font-size: 14px; color: #0f0f0f;">${item.name}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; vertical-align: middle;">
          <span style="font-size: 14px; color: #0f0f0f;">x${item.quantity}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; vertical-align: middle;">
          <span style="font-size: 14px; color: #0f0f0f; font-weight: 500;">${formatPrice(item.price, currency)}</span>
        </td>
      </tr>
    `)
    .join("")

  const addressLine = [shippingAddress.city, shippingAddress.state, shippingAddress.country].filter(Boolean).join(", ")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; color: #0f0f0f;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">${BRAND.name}</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #94a3b8;">Order Confirmation</p>
            </td>
          </tr>

          <!-- Order Number Badge -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <span style="display: inline-block; background-color: #dbeafe; color: #2563eb; font-size: 12px; font-weight: 600; padding: 6px 16px; border-radius: 9999px; letter-spacing: 0.5px;">ORDER #${orderNumber}</span>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 0; font-size: 16px; color: #0f0f0f;">Hi ${customerName},</p>
              <p style="margin: 12px 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">Thank you for your order. We're getting it ready and will notify you once it's shipped.</p>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th colspan="2" style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Subtotal</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #0f0f0f; text-align: right; font-weight: 500;">${formatPrice(subtotal, currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Shipping</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #0f0f0f; text-align: right; font-weight: 500;">${formatPrice(shippingCost, currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 8px; border-top: 2px solid #e2e8f0; font-size: 16px; font-weight: 700; color: #0f0f0f;">Total</td>
                  <td style="padding: 16px 0 8px; border-top: 2px solid #e2e8f0; font-size: 16px; font-weight: 700; color: #0f0f0f; text-align: right;">${formatPrice(total, currency)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" />
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 24px 40px;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</p>
              <p style="margin: 0; font-size: 14px; color: #0f0f0f; line-height: 1.6;">
                ${shippingAddress.street}<br />
                ${shippingAddress.city}${shippingAddress.state ? `, ${shippingAddress.state}` : ""}<br />
                ${shippingAddress.country}${shippingAddress.postalCode ? ` ${shippingAddress.postalCode}` : ""}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                ${BRAND.name} &mdash; ${BRAND.contact.email}<br />
                <span style="color: #94a3b8;">This is an automated message. Please do not reply directly to this email.</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  const transport = createEmailTransport()

  const html = buildOrderEmailHTML(data)

  await transport.sendMail({
    from: `"${BRAND.name}" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `Order Confirmed - #${data.orderNumber}`,
    html,
  })
}