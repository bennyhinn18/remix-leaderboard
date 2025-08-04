// Admin-related TypeScript definitions

export interface ActionData {
  error?: string;
  success?: boolean;
  message?: string;
  formData?: {
    name?: string;
    github_username?: string;
    discord_username?: string;
    bash_points?: string;
    personal_email?: string;
    mobile_number?: string;
    notes?: string;
  };
  validationResults?: {
    valid: Array<{ row: number; data: any }>;
    errors: Array<{ row: number; data?: any; message: string }>;
    warnings: Array<{ row: number; data?: any; message: string }>;
  };
  importResults?: {
    successful: any[];
    errors: Array<{ data: any; error: string }>;
  };
  template?: string;
  data?: any;
}

export interface ValidationResults {
  valid: Array<{ row: number; data: any }>;
  errors: Array<{ row: number; data?: any; message: string }>;
  warnings: Array<{ row: number; data?: any; message: string }>;
}

export interface ImportResults {
  successful: any[];
  errors: Array<{ data: any; error: string }>;
}

export interface Member {
  id?: string;
  name: string;
  github_username?: string;
  discord_username?: string;
  bash_points?: number;
  personal_email?: string;
  mobile_number?: string;
  notes?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}
