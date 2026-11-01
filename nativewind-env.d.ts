/** @format */

/// <reference types="nativewind/types" />
/// <reference types="jest" />

// Expo's Metro pipeline handles CSS imports; TypeScript only needs the module
// shape so the side-effect import in `index.ts` type-checks.
declare module "*.css";
