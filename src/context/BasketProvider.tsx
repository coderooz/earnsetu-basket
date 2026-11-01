/** @format */

/**
 * @fileOverview BasketProvider
 * @description Central data provider for the EarnSetu Basket application. It loads
 * all domain records (lists, items, shops, purchases), derives the product
 * catalogue and dashboard stats, and exposes data mutations plus sync controls
 * to the rest of the app via React context.
 *
 * Responsibilities:
 *   - Loads and refreshes local records from `src/db/local-store`.
 *   - Derives the product catalogue (`buildCatalogue`) and dashboard stats
 *     (`computeDashboardStats`) as memoized read models.
 *   - Exposes `refresh`, `syncNow`, `clearLocalData`, and `signOut`.
 *   - Runs an opportunistic silent sync on launch and whenever the app returns
 *     to the foreground (never blocks local use).
 *   - Renders an error/loading fallback while data is unavailable.
 *
 * @module src/context/BasketProvider
 * @author Coderooz
 * @see {@link @/lib/sync/services/sync.service#syncAll}
 * @see {@link @/lib/products/helpers/catalogue.helpers#buildCatalogue}
 * @see {@link @/lib/stats/helpers/stats.helpers#computeDashboardStats}
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, AppState, Text, View } from "react-native";

import { Button } from "@/components/common";
import { clearAllRecords } from "@/db/local-store";
import { authService } from "@/lib/auth/services/auth.service";
import { listService } from "@/lib/lists/services/list.service";
import { itemService } from "@/lib/items/services/item.service";
import { shopService } from "@/lib/shops/services/shop.service";
import { purchaseService } from "@/lib/purchases/services/purchase.service";
import { buildCatalogue } from "@/lib/products/helpers/catalogue.helpers";
import { computeDashboardStats } from "@/lib/stats/helpers/stats.helpers";
import { settingsService } from "@/lib/settings/services/settings.service";
import { syncAll, getSyncSnapshot } from "@/lib/sync/services/sync.service";
import type {
  DashboardStats,
  ListItem,
  ProductSummary,
  Purchase,
  Shop,
  ShoppingList,
} from "@/types/basket.types";
import type { SyncSummary } from "@/types/sync.types";
import { toUserMessage } from "@/lib/common/helpers/validation";

import { useToast } from "./ToastProvider";

/**
 * @interface BasketData
 * @description Raw domain records loaded from the local store.
 * @property {ShoppingList[]} lists - All shopping lists.
 * @property {ListItem[]} items - All list entries.
 * @property {Shop[]} shops - All shop directory entries.
 * @property {Purchase[]} purchases - All recorded purchases.
 */
interface BasketData {
  lists: ShoppingList[];
  items: ListItem[];
  shops: Shop[];
  purchases: Purchase[];
}

/**
 * @interface BasketContextValue
 * @description Value exposed by {@link BasketProvider}. Extends `BasketData`
 * with UI state, derived read models, and action methods.
 * @extends BasketData
 * @property {boolean} ready - Whether the initial load has completed.
 * @property {boolean} refreshing - Whether a manual refresh is in flight.
 * @property {boolean} syncing - Whether a sync run is in flight.
 * @property {number} pending - Number of outbox operations awaiting acknowledgement.
 * @property {string|undefined} lastSyncedAt - ISO timestamp of the last successful sync.
 * @property {SyncSummary|undefined} lastSummary - The most recent sync result summary.
 * @property {ProductSummary[]} catalogue - Derived product catalogue (memoized).
 * @property {DashboardStats} stats - Derived dashboard statistics (memoized).
 * @property {() => Promise<void>} refresh - Reloads all local records.
 * @property {(announce?: boolean) => Promise<SyncSummary|null>} syncNow - Runs the sync cycle.
 * @property {() => Promise<void>} clearLocalData - Wipes all local records (cloud untouched).
 * @property {() => Promise<void>} signOut - Clears the stored auth session.
 */
interface BasketContextValue extends BasketData {
  ready: boolean;
  refreshing: boolean;
  syncing: boolean;
  pending: number;
  lastSyncedAt?: string;
  lastSummary?: SyncSummary;
  catalogue: ProductSummary[];
  stats: DashboardStats;
  refresh: () => Promise<void>;
  syncNow: (announce?: boolean) => Promise<SyncSummary | null>;
  clearLocalData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const EMPTY_DATA: BasketData = {
  lists: [],
  items: [],
  shops: [],
  purchases: [],
};

const BasketContext = createContext<BasketContextValue | null>(null);

/**
 * @function BasketProvider
 * @description React context provider that bootstraps the data layer. On mount it
 * loads all local records; a `loading`/`error` fallback is rendered until the
 * database is ready. An opportunistic sync runs after load and on foreground
 * resume.
 *
 * @param {Object} props - Component props.
 * @param {ReactNode} props.children - Child components.
 * @returns {JSX.Element} A `BasketContext.Provider` element (or a fallback UI while loading/errored).
 *
 * @example
 * <BasketProvider>
 *   <AppNavigator />
 * </BasketProvider>
 */
export function BasketProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [data, setData] = useState<BasketData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>();
  const [lastSummary, setLastSummary] = useState<SyncSummary | undefined>();

  const mounted = useRef(true);
  const syncingRef = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * @function load
   * @description Loads all domain records and sync snapshot in parallel, then
   * updates state. No-op if the component has unmounted.
   * @returns {Promise<void>}
   */
  const load = useCallback(async () => {
    const [lists, items, shops, purchases, snapshot] = await Promise.all([
      listService.getAll(),
      itemService.getAll(),
      shopService.getAll(),
      purchaseService.getAll(),
      getSyncSnapshot(),
    ]);

    if (!mounted.current) return;

    setData({ lists, items, shops, purchases });
    setPending(snapshot.pending);
    setLastSyncedAt(snapshot.lastSyncedAt);
  }, []);

  /**
   * @function refresh
   * @description Reloads all local records and resets the refreshing flag.
   * @returns {Promise<void>}
   */
  const refresh = useCallback(async () => {
    if (!mounted.current) return;
    setRefreshing(true);
    try {
      await load();
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, [load]);

  /**
   * @function syncNow
   * @description Runs the full sync cycle (push outbox, then pull all resources).
   * Guards against concurrent runs via `syncingRef`. Optionally announces the
   * result via a toast.
   * @param {boolean} [announce=true] - Whether to show a toast with the result.
   * @returns {Promise<SyncSummary|null>} The sync summary, or `null` if a sync was already in flight.
   */
  const syncNow = useCallback(
    async (announce = true): Promise<SyncSummary | null> => {
      if (syncingRef.current) return null;
      syncingRef.current = true;
      if (mounted.current) setSyncing(true);

      try {
        const summary = await syncAll();
        await load();
        if (!mounted.current) return summary;

        setLastSummary(summary);
        if (announce) {
          showToast(
            summary.message,
            summary.status === "ok"
              ? "success"
              : summary.status === "offline" || summary.status === "error"
                ? "error"
                : "default",
          );
        }
        return summary;
      } catch (failure) {
        if (announce) {
          showToast(toUserMessage(failure, "Could not sync right now."), "error");
        }
        return null;
      } finally {
        syncingRef.current = false;
        if (mounted.current) setSyncing(false);
      }
    },
    [load, showToast],
  );

  useEffect(() => {
    let active = true;

    load()
      .then(() => {
        if (active) setReady(true);
      })
      .catch((failure) => {
        if (active) setError(toUserMessage(failure, "Unable to read local data."));
      });

    return () => {
      active = false;
    };
  }, [load]);

  // Opportunistic sync: once per launch and whenever the app returns to the
  // foreground. It is silent, and a failure never blocks local use.
  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => void syncNow(false), 0);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncNow(false);
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [ready, syncNow]);

  /**
   * @function clearLocalData
   * @description Deletes every local domain record and queued outbox operation.
   * Cloud data is deliberately untouched. Resets the selected list id.
   * @returns {Promise<void>}
   */
  const clearLocalData = useCallback(async () => {
    await clearAllRecords();
    await settingsService.setSelectedListId(undefined);
    await load();
    showToast("Local data cleared. Cloud data was not touched.", "success");
  }, [load, showToast]);

  /**
   * @function signOut
   * @description Clears the stored auth session. Local data is preserved.
   * @returns {Promise<void>}
   */
  const signOut = useCallback(async () => {
    await authService.signOut();
    showToast("Signed out. Local data is still available.", "success");
  }, [showToast]);

  const catalogue = useMemo(
    () => buildCatalogue(data.items, data.purchases),
    [data.items, data.purchases],
  );

  const stats = useMemo(
    () => computeDashboardStats(data.lists, data.items, data.purchases),
    [data.lists, data.items, data.purchases],
  );

  const value = useMemo<BasketContextValue>(
    () => ({
      ...data,
      ready,
      refreshing,
      syncing,
      pending,
      lastSyncedAt,
      lastSummary,
      catalogue,
      stats,
      refresh,
      syncNow,
      clearLocalData,
      signOut,
    }),
    [
      data,
      ready,
      refreshing,
      syncing,
      pending,
      lastSyncedAt,
      lastSummary,
      catalogue,
      stats,
      refresh,
      syncNow,
      clearLocalData,
      signOut,
    ],
  );

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-stone-50 px-6 dark:bg-neutral-950">
        <Text className="text-center text-base font-semibold text-stone-900 dark:text-white">
          Local storage could not be opened
        </Text>
        <Text className="text-center text-sm text-stone-500 dark:text-neutral-400">
          {error}
        </Text>
        <Button
          label="Try again"
          onPress={() => {
            setError(null);
            load()
              .then(() => setReady(true))
              .catch((failure) =>
                setError(toUserMessage(failure, "Unable to read local data.")),
              );
          }}
        />
      </View>
    );
  }

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-stone-50 dark:bg-neutral-950">
        <ActivityIndicator size="large" color="#15803d" />
        <Text className="text-sm text-stone-500 dark:text-neutral-400">
          Loading your baskets…
        </Text>
      </View>
    );
  }

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

/**
 * @function useBasket
 * @description Consumes the basket context. Throws if used outside a
 * `BasketProvider`.
 *
 * @returns {BasketContextValue} The basket context value.
 * @throws {Error} When used outside `BasketProvider`.
 */
export function useBasket(): BasketContextValue {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used inside BasketProvider.");
  }
  return context;
}
