/** @format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @description Ambient type declarations required for TypeScript 6 compatibility.
 * Metro (via NativeWind) resolves CSS imports at build time; TypeScript needs
 * an explicit module declaration since TS 6 errors on unresolvable side-effect
 * imports (TS2882).
 */

declare module "*.css";
