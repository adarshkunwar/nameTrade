export type TBaseUsername = {
  domain: string
  expires_at: string
  is_primary: boolean
  manager_address: string
  network_id: string
  owner_address: string
  primary_address: string
  token_id: string
}

export type TBaseUsernamesResponse = {
  data: TBaseUsername[]
  has_more: boolean
  next_page: string
  total_count: number
}
