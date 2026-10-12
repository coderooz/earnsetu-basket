/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/navigation/types.ts
 * @accessPath @/navigation/types
 * @description Central navigation param lists and prop types for EarnSetu Basket.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import type { StackNavigationProp } from "@react-navigation/stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

/** Root gate — decides between onboarding and the auth/main flow. */
export type RootStackParamList = {
  Onboarding: undefined;
  AuthContainer: undefined;
};

/** Auth flow (unauthenticated) + the authenticated app container. */
export type AuthStackParamList = {
  Auth: undefined;
  ForgotPassword: undefined;
  AppContainer: undefined;
};

/** Primary bottom tabs (only reachable when authenticated). */
export type MainTabParamList = {
  HomeTab: undefined;
  PurchaseTab: undefined;
  ProfileTab: undefined;
  SettingsTab: undefined;
};

/** Home tab stack. */
export type HomeStackParamList = {
  Home: undefined;
  ProductItem: { itemId?: string } | undefined;
};

/** Purchase tab stack. */
export type PurchaseStackParamList = {
  Purchase: undefined;
  PurchaseDetail: { purchaseId: string };
  RecordPurchase: undefined;
  ProductItem: { itemId?: string } | undefined;
};

/** Profile tab stack. */
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

/** Settings tab stack (includes legal / policy screens). */
export type SettingsStackParamList = {
  Settings: undefined;
  Account: undefined;
  Appearance: undefined;
  NotificationSettings: undefined;
  Help: undefined;
  About: undefined;
  Terms: undefined;
  Privacy: undefined;
  Licenses: undefined;
};

/* -------------------------------------------------------------------------- */
/* Convenience navigation prop types (use with `useNavigation<T>()`).          */
/* -------------------------------------------------------------------------- */

export type MainTabNav = BottomTabNavigationProp<MainTabParamList>;
export type AuthNav = StackNavigationProp<AuthStackParamList>;
export type HomeNav = StackNavigationProp<HomeStackParamList>;
export type PurchaseNav = StackNavigationProp<PurchaseStackParamList>;
export type ProfileNav = StackNavigationProp<ProfileStackParamList>;
export type SettingsNav = StackNavigationProp<SettingsStackParamList>;
