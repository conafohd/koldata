import type { UserRole } from "../enums/UserRole";

export interface UserInfos {
  id: string
  first_name: string
  last_name: string
  role: UserRole
  edit_association_id: string
  email: string
  created_at: string
  updated_at: string
}
