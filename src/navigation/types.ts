/** @format */

/**
 * @fileOverview navigation.types
 * @description TypeScript navigation type definitions for EarnSetu Basket.
 *
 * Defines:
 *   - `RootTabParamList` - the five bottom-tab routes (no params).
 *   - `RootStackParamList` - the stack routes including `Tabs`,
 *     `ListDetail` (`listId`), `ProductProfile` (`name`), `ShopProfile`
 *     (`shopId`), and `Settings`.
 *   - `RootNavigation` - the stacked navigation prop type.
 *
 * @module src/navigation/types
 * @author Coderooz
 */

import type { NavigatorScreenParams } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

/**
 * @typedef {Object} RootTabParamList
 * @description Bottom tab navigator route params (all screens take no params).
 * @property {undefined} Home
 * @property {undefined} Lists
 * @property {undefined} Items
 * @property {undefined} Shops
 * @property {undefined} Purchases
 */
export type RootTabParamList = {
  Home: undefined;
  Lists: undefined;
  Items: undefined;
  Shops: undefined;
  Purchases: undefined;
};

/**
 * @typedef {Object} RootStackParamList
 * @description Stack navigator route params.
 * @property {NavigatorScreenParams<RootTabParamList>|undefined} Tabs
 * @property {{ listId: string }} ListDetail
 * @property {{ name: string }} ProductProfile
 * @property {{ shopId: string }} ShopProfile
 * @property {undefined} Settings
 */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList> | undefined;
  ListDetail: { listId: string };
  ProductProfile: { name: string };
  ShopProfile: { shopId: string };
  Settings: undefined;
};

/**
 * @typedef {StackNavigationProp<RootStackParamList>} RootNavigation
 * @description Typed stack navigation prop for use across screens.
 */
export type RootNavigation = StackNavigationProp<RootStackParamList>;
