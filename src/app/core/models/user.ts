export interface User {
  id: number;
  name: string;
  email: string;
  role:string;
  token: string;
  phone?: string;
  address?: string;
  company?: string;
  workAddress?: string;
}
