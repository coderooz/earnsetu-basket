/** @format */

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { initializeDatabase } from "./src/db";
import AppNavigator from "@/navigation/AppNavigation";
import ErrorScreen from "@/screens/ErrorScreen";

export default function App() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    initializeDatabase()
      .then(() => {
        if (mounted) {
          setDatabaseReady(true);
        }
      })
      .catch((error) => {
        console.error("Database initialization failed:", error);

        if (mounted) {
          setDatabaseError("Unable to initialize local storage.");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (databaseError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <ActivityIndicator />
        <ErrorScreen />
      </View>
    );
  }

  if (!databaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return <AppNavigator />;
}
