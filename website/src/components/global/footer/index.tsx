import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { BRAND } from "@/lib/constants/brand"
import type { CollectionTree } from "@/lib/utils/collections"

interface FooterProps {
  collectionTree: CollectionTree[]
}

export function Footer({ collectionTree }: FooterProps) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{BRAND.name}</h3>
            <p className="text-sm text-muted-foreground">{BRAND.footer.about}</p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase">Shop</h4>
            <ul className="space-y-2">
              {collectionTree.map((item) => {
                if (item.children.length > 0) {
                  return (
                    <li key={item.collection._id}>
                      <div className="space-y-1">
                        <Link
                          href={`/collections/${item.collection.slug}`}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          All {item.collection.name}
                        </Link>
                      </div>
                    </li>
                  )
                }
                return (
                  <li key={item.collection._id}>
                    <Link
                      href={`/collections/${item.collection.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {item.collection.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/orders" className="text-sm text-muted-foreground hover:text-primary">
                  Track Your Order
                </Link>
              </li>
              {BRAND.footer.policies.map((policy) => (
                <li key={policy}>
                  <Link
                    href={policy}
                    className="text-sm text-muted-foreground hover:text-primary capitalize"
                  >
                    {policy.replace("/", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase">Contact</h4>
            {BRAND.footer.showContact && (
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{BRAND.contact.email}</li>
                <li>{BRAND.contact.phone}</li>
                <li>{BRAND.contact.address}</li>
              </ul>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Social & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>

          {BRAND.footer.showSocial && (
            <div className="flex items-center gap-4">
              {BRAND.social.instagram && (
                <Link
                  href={BRAND.social.instagram}
                  className="text-muted-foreground hover:text-(--primary) transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path></svg>
                </Link>
              )}
              {BRAND.social.tiktok && (
                <Link
                  href={BRAND.social.tiktok}
                  className="text-muted-foreground hover:text-(--primary) transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,72a48.05,48.05,0,0,1-48-48,8,8,0,0,0-8-8H128a8,8,0,0,0-8,8V156a20,20,0,1,1-28.57-18.08A8,8,0,0,0,96,130.69V88a8,8,0,0,0-9.4-7.88C50.91,86.48,24,119.1,24,156a76,76,0,0,0,152,0V116.29A103.25,103.25,0,0,0,224,128a8,8,0,0,0,8-8V80A8,8,0,0,0,224,72Zm-8,39.64a87.19,87.19,0,0,1-43.33-16.15A8,8,0,0,0,160,102v54a60,60,0,0,1-120,0c0-25.9,16.64-49.13,40-57.6v27.67A36,36,0,1,0,136,156V32h24.5A64.14,64.14,0,0,0,216,87.5Z"></path></svg>
                </Link>
              )}
              {BRAND.social.facebook && (
                <Link
                  href={BRAND.social.facebook}
                  className="text-muted-foreground hover:text-(--primary) transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path></svg>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
