/**
 * @format
 * @coderooz
 * @author Ranit Saha <coderooz.dev@gmail.com>
 * @filePath src/types/user.types.ts
 * @accessPath @/types/user.types
 * @description Type definitions for user profiles, contact information, preferences, and account management.
 * @created 2026-10-30
 * @lastModified 2026-10-30
 * @version 2.0.0
 */

import type {
  UserContactTypeValue,
  UserGenderValue,
  UserLocaleValue,
  UserRoleValue,
  UserStatusValue,
  UserThemeValue,
} from "@/constants/user.constants";

/**
 * ISO-8601 date/time string.
 */
export type UserDate = string;

/**
 * User's personal name.
 */
export interface IUserName {
  /** First or given name. */
  first_name: string;

  /** Middle name, if available. */
  middle_name?: string;

  /** Last or family name. */
  last_name?: string;

  /** Preferred display name, if different. */
  display_name?: string;
}

/**
 * Individual user contact method.
 */
export interface IUserContactMethod {
  /** Unique contact identifier. */
  contact_id: string;

  /** Contact method type. */
  type: UserContactTypeValue;

  /** Phone number or email address. */
  value: string;

  /** Whether this is the primary contact method. */
  is_primary: boolean;

  /** Whether the contact method has been verified. */
  is_verified: boolean;

  /** Optional contact label. */
  label?: string;

  /** Verification timestamp. */
  verified_at?: UserDate;
}

/**
 * User contact information.
 */
export interface IUserContact {
  /** Primary phone number. */
  phone_number?: string;

  /** Alternate phone number. */
  alternate_phone_number?: string;

  /** Primary email address. */
  email?: string;

  /** Alternate email address. */
  alternate_email?: string;

  /** Additional contact methods. */
  additional_contacts?: IUserContactMethod;
}

/**
 * User profile information.
 */
export interface IUserProfile {
  /** Profile image URI. */
  avatar?: string;

  /** User biography or short description. */
  bio?: string;

  /** Date of birth in YYYY-MM-DD format, if collected. */
  date_of_birth?: string;

  /** Optional gender information. */
  gender?: UserGenderValue;
}

/**
 * User application preferences.
 */
export interface IUserPreferences {
  /** Preferred application theme. */
  theme: UserThemeValue;

  /** Preferred application language. */
  locale: UserLocaleValue;

  /** Preferred currency using ISO 4217 code. */
  currency: string;

  /** Whether notifications are enabled. */
  notifications_enabled: boolean;

  /** Whether promotional notifications are enabled. */
  marketing_notifications_enabled: boolean;
}

/**
 * User account metadata.
 */
export interface IUserMetaData {
  /** Account creation source, if known. */
  registration_source?: string;

  /** Last successful login timestamp, if available. */
  last_login_at?: UserDate;

  /** Optional custom application metadata. */
  custom?: Record<string, unknown>;
}

/**
 * User account.
 *
 * Represents the application-level user profile.
 * Authentication credentials and provider tokens must not be stored here.
 */
export interface IUserData {
  /** Unique application-level user identifier. */
  user_id: string;

  /** User's personal name. */
  name: IUserName;

  /** Contact information. */
  contact: IUserContact;

  /** User profile information. */
  profile?: IUserProfile;

  /** User application preferences. */
  preferences: IUserPreferences;

  /** Application-level account role. */
  role: UserRoleValue;

  /** Account lifecycle status. */
  status: UserStatusValue;

  /** Additional account metadata. */
  meta_data?: IUserMetaData;

  /** Account creation timestamp. */
  created_at: UserDate;

  /** Last modification timestamp. */
  updated_at: UserDate;

  /** Account deletion timestamp, if applicable. */
  deleted_at?: UserDate;
}

/**
 * Input type for creating a user.
 */
export type ICreateUserInput = Omit<
  IUserData,
  "user_id" | "created_at" | "updated_at" | "deleted_at"
>;

/**
 * Input type for updating a user profile.
 */
export type IUpdateUserInput = Partial<
  Omit<IUserData, "user_id" | "created_at">
>;
