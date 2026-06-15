"use client"

import { LucideIcon, Truck, Shield, CreditCard, Star } from "lucide-react"

export interface Feature {
  icon: LucideIcon
  label: string
  desc: string
}

interface FeaturesSectionProps {
  features?: Feature[]
  className?: string
}

const defaultFeatures: Feature[] = [
  {
    icon: Truck,
    label: "Fast & Reliable Delivery",
    desc: "Across Pakistan",
  },
  {
    icon: Shield,
    label: "Fast Support",
    desc: "We Actually Respond",
  },
  {
    icon: Star,
    label: "Quality Guarantee",
    desc: "Premium products only",
  },
  {
    icon: CreditCard,
    label: "Trusted by Customers",
    desc: "Quality That Speaks for Itself",
  },
]

export function FeaturesSection({
  features = defaultFeatures,
  className = "",
}: FeaturesSectionProps) {
  return (
    <section
      className={`py-5 lg:py-6 bg-primary ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.label}
                className={`
                  relative bg-primary px-5 py-4 lg:px-8 lg:py-5
                  transition-all duration-200 ease-out
                `}
              >
                <div className="flex flex-col lg:flex-row items-center gap-2 sm:gap-4 lg:gap-5 text-center lg:text-left">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-background" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-background mb-0.5 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                      {feature.label}
                    </h3>
                    <p className="text-xs text-background/70">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
