export interface Role {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}
