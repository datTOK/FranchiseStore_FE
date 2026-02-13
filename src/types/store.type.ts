export type Store = {
  id: number
  type: "FR" | "SC" | "CK"
  name: string
  address: string
  created_at?: string
  updated_at?: string
}
