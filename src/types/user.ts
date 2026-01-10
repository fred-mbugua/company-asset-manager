/**
 * Shape of data required to create a new user.
 * This includes all necessary fields without database-generated properties like `id` or timestamps.
 */
export interface ICreateUser {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password: string;
  role_id: number;
  role: string; // Role name for initial role assignment during registration
  department_id?: number; // Optional department association
  company_id?: number; // Optional company association
}


// Interface for user login credentials
export interface ILoginCredentials {
    email: string;
    password: string;
    role?: string; // Optional role field for additional validation if needed
}


/**
 * Shape of data for updating an existing user.
 * All properties are optional as a user may choose to update only specific fields.
 */
export interface IUpdateUser {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role_id?: number;
  department_id?: number; // Optional department association
  branch_id?: number; // Optional branch association
  company_id?: number; // Optional company association
}