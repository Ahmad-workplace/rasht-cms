
export interface CategoryTranslation {
  name: string;
  language_code: string;
}

export interface Category {
  id: string;
  translations: CategoryTranslation[];
  logo: string | null;
}

export interface Notification {
  id: string;
  category: "agent" | "license";
  obj_id: string;
  read: boolean;
  detail: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  type: "png" | "jpeg" | "mp4";
  file: string;
  created_at: string;
  thumbnail: string;
  title?: string | null;
  duration?: number | null;
}

export interface Specification {
  [key: string]: string;
}

export interface Translation {
  name?: string;
  description?: string;
  language_code: string;
  specification?: Specification;
}

export interface Product {
  id: number;
  readonly: true;
  company: string;
  category: string;
  is_available: boolean;
  warranty?: string | null;
  get_price: string;
  translations: Translation[];
  attachment: Attachment[];
}

export interface CreateProduct {
  company: string;
  category: string;
  is_available: boolean;
  warranty?: string;
  translations: Record<string, Translation>;
}

export interface Company {
  id: string;
  logo: string | null;
  attachment: string[];
  tags: string[];
  name: string;
  description: string;
  info: Record<string, any>;
  specliaities: string | null;
}

export interface CompanyContact {
  id: string;
  company: string;
  full_name?: string;
  email?: string;
  phone?: string;
  fax?: string;
  address: string;
  qrcode?: string;
  social_media: Record<string, any>;
}

export interface CompanyLicense {
  id: string;
  translations: string;
  attachment: string[];
  date_certified?: string;
}

export interface CompanyRequest {
  id: string;
  full_name?: string;
  email?: string;
  description: string;
  status: "pending" | "rejected" | "approved";
  type: "register" | "co-op" | "get_price";
}

export interface WeekSchedule {
  id: number;
  playlist: string;
  attachment: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
}

export interface Playlist {
  id: string;
  title: string;
  is_active: boolean;
  schedules: WeekSchedule[];
}

export interface AgentLogin {
  username: string;
}

export interface ChangePassword {
  old_password: string;
  new_password: string;
  repeat_new_password: string;
}

export interface ResendOTP {
  username: string;
}

export interface Login {
  username: string;
  password: string;
}

export interface LogOut {
  refresh: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
}

export interface TokenRefresh {
  refresh: string;
  access?: string;
}

export interface Register {
  username: string;
  password: string;
}

export interface ForgetPassword {
  username: string;
  code: string;
  new_password: string;
  repeat_new_password: string;
}

export interface OTP {
  username: string;
  code: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}