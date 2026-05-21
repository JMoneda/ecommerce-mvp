export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  age: number;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  phone: string;
  address: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}
