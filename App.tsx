/** @format
 * @fileOverview App
 * @description Application root component. Boots the local SQLite database,
 * gates rendering on initialization, and assembles the providers
 * (ToastProvider, ThemeProvider, BasketProvider) around the navigator.
 *
 * Boot flow:
 *   1. `initializeDatabase()` opens SQLite and runs migrations.
 *   2. `settingsService.hasLaunched()` determines onboarding vs. navigator.
 *   3. Renders providers + `AppNavigator` (or `OnboardingScreen` first launch).
 *   4. Shows an `ErrorScreen` with retry if the database fails to open.
 *
 * @module App
 * @author Coderooz
 * @see {@link @/db/index#initializeDatabase}
 * @see {@link @/context/BasketProvider}
 * @see {@link @/context/ThemeProvider}
 * @see {@link @/context/ToastProvider}
 * @see {@link @/navigation/AppNavigation}
 */

// import { useCallback, useEffect, useState } from "react";
// import { ActivityIndicator, Text, View } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { StatusBar } from "expo-status-bar";

// import { initializeDatabase } from "@/db";
// import { BasketProvider } from "@/context/BasketProvider";
// import { ThemeProvider } from "@/context/ThemeProvider";
// import { ToastProvider } from "@/context/ToastProvider";
// import { settingsService } from "@/lib/settings/services/settings.service";
// import ErrorScreen from "@/screens/ErrorScreen";
// import OnboardingScreen from "@/screens/OnboardingScreen";
// import AppNavigator from "@/navigation/AppNavigation";

// type BootState = "loading" | "error" | "ready";

// export default function App() {
//   const [boot, setBoot] = useState<BootState>("loading");
//   const [bootError, setBootError] = useState<string | undefined>();
//   const [hasLaunched, setHasLaunched] = useState<boolean | null>(null);

//   const start = useCallback(async () => {
//     setBoot("loading");
//     setBootError(undefined);

//     try {
//       await initializeDatabase();
//       const launched = await settingsService.hasLaunched();
//       setHasLaunched(launched);
//       setBoot("ready");
//     } catch (failure) {
//       setBootError(
//         failure instanceof Error
//           ? failure.message
//           : "Unable to initialize local storage.",
//       );
//       setBoot("error");
//     }
//   }, []);

//   useEffect(() => {
//     // Defer so setState inside `start` is not called synchronously within
//     // the effect body, which React's hooks lint rule flags.
//     const timer = setTimeout(() => void start(), 0);

//     return () => clearTimeout(timer);
//   }, [start]);

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <SafeAreaProvider>
//         <StatusBar style='auto' />
//         {boot === "loading" ? (
//           <View className='flex-1 items-center justify-center gap-3 bg-stone-50 dark:bg-neutral-950'>
//             <ActivityIndicator size='large' color='#15803d' />
//             <Text className='text-sm text-stone-500 dark:text-neutral-400'>
//               Opening your basket…
//             </Text>
//           </View>
//         ) : boot === "error" ? (
//           <ErrorScreen
//             message={bootError}
//             onRetry={() => {
//               void start();
//             }}
//           />
//         ) : (
//           <ToastProvider>
//             <ThemeProvider>
//               <BasketProvider>
//                 {hasLaunched ? (
//                   <AppNavigator />
//                 ) : (
//                   <OnboardingScreen onDone={() => setHasLaunched(true)} />
//                 )}
//               </BasketProvider>
//             </ThemeProvider>
//           </ToastProvider>
//         )}
//       </SafeAreaProvider>
//     </GestureHandlerRootView>
//   );
// }
