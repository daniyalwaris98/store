export interface ShippingRate {
  name: string
  price: number
  perKg: number
  freeShipping: boolean
  freeAbove?: number
  weightAbove?: number
}

export interface ShippingZone {
  _id: string
  name: string
  countries: string[]
  rates: ShippingRate[]
  handlingFee: number
  status: "active" | "inactive"
}

export interface ShippingRateResponse {
  rate: ShippingRate
  totalPrice: number
}

export interface CalculateShippingInput {
  country: string
  weight?: number
  subtotal?: number
}

export interface CreateShippingZoneInput {
  name: string
  countries: string[]
  rates: ShippingRate[]
  handlingFee?: number
}