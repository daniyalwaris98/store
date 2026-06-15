export interface CustomerAddress {
  label?: string
  street: string
  city: string
  state?: string
  country: string
  postalCode?: string
}

export interface Customer {
  _id: string
  email: string
  name?: string
  phone?: string
  addresses: CustomerAddress[]
  orderCount?: number
  createdAt: string
  lastLoginAt: string
}

export interface CustomerListResponse {
  customers: Customer[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UpdateCustomerInput {
  name?: string
  phone?: string
  addresses?: CustomerAddress[]
}