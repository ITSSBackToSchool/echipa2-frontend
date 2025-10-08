export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  token: string;
  phone?: string;
  address?: string;
  company?: string;
  workAddress?: string;
}
