export interface User {
  userId: number;
  fullName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
}

export interface responseType {
  success: boolean;
  message: string;
  method: string;
  data: User | null;
}
