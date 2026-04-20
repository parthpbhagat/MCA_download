// Shared types between frontend and NestJS backend
// Mirror these in your NestJS DTOs

export type CompanyStatus =
  | "Active"
  | "Strike Off"
  | "Under Liquidation"
  | "Dormant"
  | "Amalgamated"
  | "Dissolved";

export type CompanyCategory = "Public" | "Private" | "OPC";

export interface Company {
  cin: string;
  name: string;
  status: CompanyStatus;
  category: CompanyCategory;
  roc: string;
  state: string;
  incorporationDate: string; // ISO
  authorizedCapital: number;
  paidUpCapital: number;
  email?: string;
  registeredAddress: string;
  industry: string;
  lastAgmDate?: string;
  lastFilingDate?: string;
}

export interface Director {
  din: string;
  name: string;
  designation: string;
  appointmentDate: string;
  dateOfBirth?: string;
  nationality: string;
  companies: { cin: string; name: string; designation: string }[];
}

export interface Charge {
  chargeId: string;
  cin: string;
  holderName: string;
  amount: number;
  creationDate: string;
  status: "Open" | "Satisfied";
}

export interface Filing {
  id: string;
  cin: string;
  formType: string;
  description: string;
  filingDate: string;
  status: "Approved" | "Pending" | "Rejected";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "blocked";
  plan: "free" | "starter" | "pro" | "enterprise";
  createdAt: string;
  searches: number;
}

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "cancelled" | "past_due";
  amount: number;
  startDate: string;
  renewsOn: string;
}

export interface SearchParams {
  q?: string;
  cin?: string;
  status?: CompanyStatus;
  state?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
