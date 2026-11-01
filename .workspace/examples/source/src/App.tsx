import { useEffect, useMemo, useState } from 'react';
import { auth, api } from '@appdeploy/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Cloud,
  CloudOff,
  CreditCard,
  Download,
  Ellipsis,
  FileText,
  Filter,
  Home,
  ListChecks,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
  Wallet,
  Wifi,
  WifiOff,
  X,
  Pencil,
  Archive,
  CircleDollarSign,
} from 'lucide-react';
import {
  addOutbox,
  allRecords,
  clearAll,
  deleteLocalRecord,
  getOutbox,
  putLocalRecord,
  removeOutbox,
  setMeta,
  getMeta,
  type BasketRecord,
  type BasketResource,
  type LocalOperation,
} from './lib/local-store';

type Tab = 'home' | 'lists' | 'items' | 'purchases' | 'shops' | 'settings';
type User = { userId: string; email?: string; name?: string; picture?: string };
type ListRecord = BasketRecord & {
  name: string;
  color?: string;
  archived?: boolean;
  description?: string;
  plannedFor?: string;
};
type ItemRecord = BasketRecord & {
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  shopId?: string;
  shopName?: string;
  expectedPriceMinor?: number;
  currency?: string;
  checked: boolean;
  position: number;
};
type ShopRecord = BasketRecord & {
  name: string;
  category: string;
  phone?: string;
  address?: string;
  notes?: string;
  favorite?: boolean;
  soldItems?: string[];
};
type PurchaseRecord = BasketRecord & {
  itemName: string;
  quantity: number;
  unit: string;
  unitPriceMinor: number;
  totalMinor: number;
  currency: string;
  shopId?: string;
  shopName?: string;
  paymentMethod: string;
  notes?: string;
  purchasedAt: string;
  sourceItemId?: string;
};
type ModalState = {
  type: 'list' | 'item' | 'shop' | 'purchase' | 'confirm';
  record?: BasketRecord;
  sourceItem?: ItemRecord;
  message?: string;
} | null;

const money = (minor: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format((minor || 0) / 100);
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
const id = () => crypto.randomUUID();
const today = () => new Date().toISOString().slice(0, 10);
const resources: BasketResource[] = ['lists', 'items', 'shops', 'purchases'];
const navItems: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'lists', label: 'Lists', icon: ListChecks },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'purchases', label: 'Purchases', icon: Receipt },
  { id: 'shops', label: 'Shops', icon: Store },
  { id: 'settings', label: 'Settings', icon: Settings },
];

async function readResource<T extends BasketRecord>(
  resource: BasketResource
): Promise<T[]> {
  return allRecords<T>(resource);
}
async function saveRecord(resource: BasketResource, record: BasketRecord) {
  const operation: LocalOperation = {
    id: id(),
    resource,
    action: 'upsert',
    entityId: record.id,
    payload: record,
    createdAt: new Date().toISOString(),
  };
  await putLocalRecord(resource, { ...record, syncStatus: 'pending' });
  await addOutbox(operation);
}
async function removeRecord(resource: BasketResource, recordId: string) {
  const operation: LocalOperation = {
    id: id(),
    resource,
    action: 'delete',
    entityId: recordId,
    payload: {},
    createdAt: new Date().toISOString(),
  };
  await deleteLocalRecord(resource, recordId);
  await addOutbox(operation);
}
async function syncCloud() {
  const queue = await getOutbox();
  for (const operation of queue) {
    await api.post('/api/basket/sync', operation);
    await removeOutbox(operation.id);
    if (operation.action === 'upsert') {
      const record = operation.payload as BasketRecord;
      await putLocalRecord(operation.resource, {
        ...record,
        syncStatus: 'synced',
      });
    }
  }
  for (const resource of resources) {
    const response = await api.get('/api/basket/' + resource);
    const remote = (response.data?.items ?? []) as BasketRecord[];
    const local = await allRecords<BasketRecord>(resource);
    const localById = new Map(local.map(record => [record.id, record]));
    for (const record of remote) {
      const existing = localById.get(record.id);
      if (!existing || existing.syncStatus === 'synced') {
        await putLocalRecord(resource, { ...record, syncStatus: 'synced' });
      }
    }
  }
  await setMeta('lastSyncedAt', new Date().toISOString());
}
function useRecords<T extends BasketRecord>(resource: BasketResource) {
  return useQuery({
    queryKey: [resource],
    queryFn: () => readResource<T>(resource),
  });
}
function App() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('home');
  const [modal, setModal] = useState<ModalState>(null);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [dark, setDark] = useState(
    localStorage.getItem('basket-theme') === 'dark'
  );
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const listsQuery = useRecords<ListRecord>('lists');
  const itemsQuery = useRecords<ItemRecord>('items');
  const shopsQuery = useRecords<ShopRecord>('shops');
  const purchasesQuery = useRecords<PurchaseRecord>('purchases');
  const lists = listsQuery.data ?? [];
  const items = itemsQuery.data ?? [];
  const shops = shopsQuery.data ?? [];
  const purchases = purchasesQuery.data ?? [];
  const loading =
    listsQuery.isLoading ||
    itemsQuery.isLoading ||
    shopsQuery.isLoading ||
    purchasesQuery.isLoading;
  const refresh = () => queryClient.invalidateQueries();
  const mutation = useMutation({
    mutationFn: async (fn: () => Promise<void>) => fn(),
    onSuccess: () => refresh(),
  });

  useEffect(() => {
    let active = true;
    getMeta<string>('selectedListId').then(savedId => {
      if (active && savedId) setSelectedListId(savedId);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('basket-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    let active = true;
    auth
      .getUser()
      .then(restored => {
        if (active) {
          setUser(restored);
          setAuthReady(true);
        }
      })
      .catch(() => {
        if (active) setAuthReady(true);
      });
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      active = false;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    if (!user || !online || syncing) return;
    let cancelled = false;
    setSyncing(true);
    syncCloud()
      .then(() => {
        if (!cancelled) {
          setSyncMessage('All changes are synchronized');
          refresh();
        }
      })
      .catch(() => {
        if (!cancelled) setSyncMessage('Some changes are waiting to sync');
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.userId, online]);

  const activeLists = lists.filter(list => !list.archived);
  const activeItems = items.filter(item =>
    activeLists.some(list => list.id === item.listId)
  );
  const unchecked = activeItems.filter(item => !item.checked).length;
  const estimatedPendingMinor = activeItems
    .filter(item => !item.checked)
    .reduce(
      (sum, item) => sum + (item.expectedPriceMinor ?? 0) * item.quantity,
      0
    );
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthPurchases = purchases.filter(
    purchase => purchase.purchasedAt.slice(0, 7) === monthKey
  );
  const todayPurchases = purchases.filter(
    purchase => purchase.purchasedAt.slice(0, 10) === today()
  );
  const monthSpend = monthPurchases.reduce(
    (sum, purchase) => sum + purchase.totalMinor,
    0
  );
  const todaySpend = todayPurchases.reduce(
    (sum, purchase) => sum + purchase.totalMinor,
    0
  );
  const recentPurchases = [...purchases]
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
    .slice(0, 4);
  const catalogueNames = [...new Set([
    ...items.map(item => item.name.trim()),
    ...purchases.map(purchase => purchase.itemName.trim()),
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const pendingCount = useMemo(() => 0, [syncMessage, syncing]);

  async function persist(resource: BasketResource, record: BasketRecord) {
    await saveRecord(resource, record);
    await refresh();
    if (user && online) {
      try {
        setSyncing(true);
        await syncCloud();
        setSyncMessage('All changes are synchronized');
      } catch {
        setSyncMessage('Saved on this device. Cloud sync will retry.');
      } finally {
        setSyncing(false);
      }
      await refresh();
    }
  }
  async function remove(resource: BasketResource, recordId: string) {
    await removeRecord(resource, recordId);
    await refresh();
    if (user && online) {
      try {
        setSyncing(true);
        await syncCloud();
        setSyncMessage('All changes are synchronized');
      } catch {
        setSyncMessage('Deletion saved locally. Cloud sync will retry.');
      } finally {
        setSyncing(false);
      }
      await refresh();
    }
  }
  async function signIn() {
    try {
      await auth.signInWithRedirect();
    } catch (error) {
      setSyncMessage(
        error instanceof Error
          ? error.message
          : 'Sign-in could not be started. Please retry.'
      );
    }
  }
  async function signOut() {
    await auth.signOut();
    setUser(null);
    setSyncMessage('Signed out. Your local data remains on this device.');
  }
  function openPurchase(sourceItem?: ItemRecord) {
    setModal({ type: 'purchase', sourceItem });
  }
  function renderHome() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-neutral-400">
              {new Intl.DateTimeFormat('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(new Date())}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              Your shopping, in control.
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-neutral-400">
              Plan what you need. Record what you actually buy.
            </p>
          </div>
          <button
            onClick={() => setModal({ type: 'list' })}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            <Plus size={18} /> New list
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Actual this month"
            value={money(monthSpend)}
            detail={monthPurchases.length + ' recorded purchases'}
            icon={Wallet}
          />
          <StatCard
            label="Pending items"
            value={String(unchecked)}
            detail="Across active shopping lists"
            icon={ShoppingCart}
          />
          <StatCard
            label="Active lists"
            value={String(activeLists.length)}
            detail={unchecked + ' items left to check'}
            icon={ListChecks}
          />
          <StatCard
            label="Estimated pending"
            value={money(estimatedPendingMinor)}
            detail="From planned item prices"
            icon={CircleDollarSign}
          />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-stone-900 dark:text-white">
                  Shopping lists
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
                  Your plans, all in one place
                </p>
              </div>
              <button
                onClick={() => setTab('lists')}
                className="text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400"
              >
                View all <ChevronRight className="inline" size={16} />
              </button>
            </div>
            {activeLists.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Ready for your next shop?"
                description="Create a list to organize the things you need."
                action="Create your first list"
                onAction={() => setModal({ type: 'list' })}
              />
            ) : (
              <div className="mt-4 space-y-3">
                {activeLists.slice(0, 4).map(list => {
                  const related = items.filter(item => item.listId === list.id);
                  const checked = related.filter(item => item.checked).length;
                  const progress = related.length
                    ? Math.round((checked / related.length) * 100)
                    : 0;
                  return (
                    <button
                      key={list.id}
                      onClick={() => setTab('lists')}
                      className="w-full rounded-xl border border-stone-100 p-3 text-left transition hover:border-green-200 hover:bg-green-50/40 dark:border-neutral-800 dark:hover:border-green-900 dark:hover:bg-green-950/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-stone-800 dark:text-neutral-100">
                          {list.name}
                        </span>
                        <span className="text-xs text-stone-500 dark:text-neutral-400">
                          {checked}/{related.length} done
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-green-600 transition-all"
                          style={{ width: progress + '%' }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-stone-900 dark:text-white">
                  Recent purchases
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
                  Only purchases you explicitly record
                </p>
              </div>
              <button
                onClick={() => setTab('purchases')}
                className="text-sm font-semibold text-green-700 dark:text-green-400"
              >
                History <ChevronRight className="inline" size={16} />
              </button>
            </div>
            {recentPurchases.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No purchases recorded yet"
                description="Your spending history starts when you record a purchase."
                action="Record a purchase"
                onAction={() => openPurchase()}
              />
            ) : (
              <div className="mt-3 divide-y divide-stone-100 dark:divide-neutral-800">
                {recentPurchases.map(purchase => (
                  <PurchaseRow key={purchase.id} purchase={purchase} />
                ))}
              </div>
            )}
          </section>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 dark:border-green-900/60 dark:bg-green-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-green-700 dark:bg-neutral-900 dark:text-green-400">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="font-semibold text-stone-900 dark:text-white">
                A plan is not a purchase.
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-neutral-300">
                Checking off a list item never creates a transaction. Record
                purchases separately.
              </p>
            </div>
          </div>
          <button
            onClick={() => openPurchase()}
            className="h-10 shrink-0 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white hover:bg-green-800"
          >
            Record purchase
          </button>
        </div>
      </div>
    );
  }
  function renderLists() {
    const selectedList =
      activeLists.find(list => list.id === selectedListId) ?? activeLists[0];
    const visibleItems = selectedList
      ? items
          .filter(item => item.listId === selectedList.id)
          .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
      : [];
    return (
      <div className="space-y-5">
        <PageHeading
          title="Shopping lists"
          subtitle="Keep plans separate from purchases."
          action={
            <button
              onClick={() => setModal({ type: 'list' })}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white"
            >
              <Plus size={17} /> New list
            </button>
          }
        />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <section className="rounded-2xl border border-stone-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-stone-400">
              Your lists
            </p>
            {activeLists.length === 0 ? (
              <p className="p-3 text-sm text-stone-500">No lists yet.</p>
            ) : (
              activeLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => {
                    setSelectedListId(list.id);
                    void setMeta('selectedListId', list.id);
                  }}
                  className={
                    'mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left ' +
                    (selectedList?.id === list.id
                      ? 'bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200'
                      : 'text-stone-700 hover:bg-stone-50 dark:text-neutral-300 dark:hover:bg-neutral-800')
                  }
                >
                  <span className="truncate font-medium">{list.name}</span>
                  <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 dark:bg-neutral-800">
                    {items.filter(item => item.listId === list.id).length}
                  </span>
                </button>
              ))
            )}
            <button
              onClick={() => setModal({ type: 'list' })}
              className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-stone-300 px-3 py-3 text-sm font-semibold text-green-700 dark:border-neutral-700 dark:text-green-400"
            >
              <Plus size={16} /> Create another list
            </button>
          </section>
          <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
            {!selectedList ? (
              <EmptyState
                icon={ListChecks}
                title="Create your first list"
                description="Start with groceries, household items or anything you need."
                action="Create list"
                onAction={() => setModal({ type: 'list' })}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                      {selectedList.name}
                    </h2>
                    <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
                      {visibleItems.filter(item => item.checked).length} of{' '}
                      {visibleItems.length} items checked
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setModal({ type: 'list', record: selectedList })
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 dark:border-neutral-700"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setModal({
                          type: 'confirm',
                          record: selectedList,
                          message: 'Archive this list?',
                        })
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 dark:border-neutral-700"
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-3 text-stone-400"
                      size={17}
                    />
                    <input
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                      placeholder="Find an item"
                      className="field pl-10"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setModal({
                        type: 'item',
                        record: { listId: selectedList.id } as BasketRecord,
                      })
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white"
                  >
                    <Plus size={17} /> Add item
                  </button>
                </div>
                <div className="mt-4 divide-y divide-stone-100 dark:divide-neutral-800">
                  {visibleItems.length === 0 ? (
                    <EmptyState
                      icon={ShoppingCart}
                      title="This list is empty"
                      description="Add the first item you need."
                      action="Add item"
                      onAction={() =>
                        setModal({
                          type: 'item',
                          record: { listId: selectedList.id } as BasketRecord,
                        })
                      }
                    />
                  ) : (
                    visibleItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <button
                          onClick={() =>
                            void persist('items', {
                              ...item,
                              checked: !item.checked,
                              updatedAt: new Date().toISOString(),
                            })
                          }
                          aria-label={
                            item.checked
                              ? 'Uncheck ' + item.name
                              : 'Check ' + item.name
                          }
                          className={
                            'grid h-6 w-6 shrink-0 place-items-center rounded-full border ' +
                            (item.checked
                              ? 'border-green-600 bg-green-600 text-white'
                              : 'border-stone-300 dark:border-neutral-600')
                          }
                        >
                          {item.checked && <Check size={14} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={
                              'truncate text-sm font-semibold ' +
                              (item.checked
                                ? 'text-stone-400 line-through dark:text-neutral-500'
                                : 'text-stone-800 dark:text-neutral-100')
                            }
                          >
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
                            {item.quantity} {item.unit}
                            {item.expectedPriceMinor && item.expectedPriceMinor > 0
                              ? ' · Est. ' + money(item.expectedPriceMinor, item.currency)
                              : ' · Price not set'}
                            {item.notes ? ' · ' + item.notes : ''}
                          </p>
                        </div>
                        {!item.checked && (
                          <button
                            onClick={() => openPurchase(item)}
                            className="rounded-lg px-2 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/40"
                          >
                            Record
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setModal({ type: 'item', record: item })
                          }
                          className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-800"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() =>
                            setModal({
                              type: 'confirm',
                              record: item,
                              message: 'Delete this item?',
                            })
                          }
                          className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <p className="mt-4 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-500 dark:bg-neutral-800/70 dark:text-neutral-400">
                  Checking an item only updates your plan. Use Record to create
                  a separate purchase record after buying it.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    );
  }
  function renderItems() {
    const filteredNames = catalogueNames.filter(name =>
      name.toLowerCase().includes(search.toLowerCase())
    );
    const selectedName = catalogueNames.find(name => name.toLowerCase() === selectedItemName.toLowerCase());
    if (selectedName) {
      const matchingItems = items.filter(item => item.name.toLowerCase() === selectedName.toLowerCase());
      const matchingPurchases = [...purchases].filter(purchase => purchase.itemName.toLowerCase() === selectedName.toLowerCase()).sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
      const relatedShops = shops.filter(shop =>
        (shop.soldItems ?? []).some(value => value.toLowerCase() === selectedName.toLowerCase()) ||
        matchingPurchases.some(purchase => purchase.shopId === shop.id || (!purchase.shopId && purchase.shopName?.toLowerCase() === shop.name.toLowerCase()))
      );
      return (
        <div className='space-y-5'>
          <button onClick={() => setSelectedItemName('')} className='inline-flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400'><ChevronLeft size={17} /> All items</button>
          <PageHeading title={selectedName} subtitle='Item profile · aggregated from your lists, shop catalogue and recorded purchases' action={<button onClick={() => setModal({ type: 'item', record: { listId: activeLists[0]?.id ?? '' } as BasketRecord })} className='inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white'><Plus size={16}/> Add to list</button>} />
          <div className='grid gap-3 sm:grid-cols-3'>
            <StatCard label='List entries' value={String(matchingItems.length)} detail='Current and archived plans' icon={ListChecks}/>
            <StatCard label='Purchases' value={String(matchingPurchases.length)} detail='Explicitly recorded' icon={Receipt}/>
            <StatCard label='Known shops' value={String(relatedShops.length)} detail='Purchased or manually listed' icon={Store}/>
          </div>
          <section className='rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'><h2 className='font-semibold'>Shops associated with this item</h2>{relatedShops.length ? <div className='mt-3 space-y-2'>{relatedShops.map(shop => <button key={shop.id} onClick={() => { setSelectedShopId(shop.id); setTab('shops'); }} className='flex w-full items-center justify-between rounded-xl bg-stone-50 p-3 text-left dark:bg-neutral-800'><span><span className='block text-sm font-semibold'>{shop.name}</span><span className='text-xs text-stone-500'>{(shop.soldItems ?? []).some(value => value.toLowerCase() === selectedName.toLowerCase()) ? 'Manually listed as sold' : 'Previously purchased here'}</span></span><ChevronRight size={17}/></button>)}</div> : <p className='mt-2 text-sm text-stone-500'>No shop association recorded yet.</p>}</section>
                    <section className='rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'><h2 className='font-semibold'>Shopping-list appearances</h2>{matchingItems.length ? matchingItems.map(item => <div key={item.id} className='flex justify-between border-b border-stone-100 py-3 text-sm dark:border-neutral-800'><span>{lists.find(list => list.id === item.listId)?.name ?? 'Unknown list'}</span><span className='text-stone-500'>{item.quantity} {item.unit}{item.expectedPriceMinor ? ' · Est. ' + money(item.expectedPriceMinor, item.currency) : ''}{item.checked ? ' · Checked' : ''}</span></div>) : <p className='mt-2 text-sm text-stone-500'>Not currently present in a shopping list.</p>}</section>
          <section className='rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'><h2 className='font-semibold'>Price history</h2>{matchingPurchases.length ? <div className='mt-3 space-y-2'>{matchingPurchases.slice(0, 4).map(purchase => <div key={purchase.id} className='flex items-center justify-between rounded-xl bg-stone-50 p-3 text-sm dark:bg-neutral-800'><span>{dateLabel(purchase.purchasedAt)}{purchase.shopName ? ' · ' + purchase.shopName : ''}</span><strong>{money(purchase.unitPriceMinor, purchase.currency)} / {purchase.unit}</strong></div>)}</div> : <p className='mt-2 text-sm text-stone-500'>Record purchases to build a price history.</p>}</section>
          <section className='rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'><h2 className='font-semibold'>Purchase history</h2>{matchingPurchases.length ? matchingPurchases.map(purchase => <PurchaseRow key={purchase.id} purchase={purchase}/>) : <p className='mt-2 text-sm text-stone-500'>No purchases recorded for this item.</p>}</section>
        </div>
      );
    }
    return <div className='space-y-5'><PageHeading title='Items' subtitle='A unified view of items found in your shopping lists and purchase history.' action={<button onClick={() => setModal({ type: 'item', record: { listId: activeLists[0]?.id ?? '' } as BasketRecord })} className='inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white'><Plus size={17}/> Add item</button>}/><div className='relative max-w-lg'><Search className='absolute left-3 top-3 text-stone-400' size={17}/><input className='field pl-10' placeholder='Search items' value={search} onChange={event => setSearch(event.target.value)}/></div>{filteredNames.length ? <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>{filteredNames.map(name => { const listCount=items.filter(item=>item.name.toLowerCase()===name.toLowerCase()).length; const purchaseCount=purchases.filter(purchase=>purchase.itemName.toLowerCase()===name.toLowerCase()).length; return <button key={name} onClick={()=>setSelectedItemName(name)} className='rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:border-green-300 dark:border-neutral-800 dark:bg-neutral-900'><div className='flex items-center justify-between'><span className='grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400'><Package size={20}/></span><ChevronRight size={17} className='text-stone-400'/></div><h3 className='mt-3 font-semibold'>{name}</h3><p className='mt-1 text-xs text-stone-500'>{listCount} list entries · {purchaseCount} purchases</p></button>;})}</div> : <EmptyState icon={Package} title='No items found' description='Items appear here when you add them to a list or record a purchase.' action='Add an item' onAction={()=>setModal({type:'item',record:{listId:activeLists[0]?.id ?? ''} as BasketRecord})}/>}</div>;
  }
  function renderPurchases() {
    const filtered = [...purchases]
      .filter(purchase =>
        (purchase.itemName + ' ' + (purchase.shopName ?? ''))
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
    const total = filtered.reduce(
      (sum, purchase) => sum + purchase.totalMinor,
      0
    );
    return (
      <div className="space-y-5">
        <PageHeading
          title="Purchase history"
          subtitle="A record of what you actually bought."
          action={
            <button
              onClick={() => openPurchase()}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white"
            >
              <Plus size={17} /> Record purchase
            </button>
          }
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Total recorded"
            value={money(total)}
            detail="For the records shown"
            icon={Wallet}
          />
          <StatCard
            label="Purchases"
            value={String(filtered.length)}
            detail="Recorded transactions"
            icon={Receipt}
          />
          <StatCard
            label="This month"
            value={money(monthSpend)}
            detail={monthPurchases.length + ' purchases'}
            icon={CalendarDays}
          />
        </div>
        <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-3 text-stone-400"
                size={17}
              />
              <input
                className="field pl-10"
                placeholder="Search item or shop"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>
            <span className="self-center text-sm text-stone-500">
              {filtered.length} records
            </span>
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No matching purchases"
              description="Purchases appear here only after you record them."
              action="Record a purchase"
              onAction={() => openPurchase()}
            />
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-neutral-800">
              {filtered.map(purchase => (
                <PurchaseRow
                  key={purchase.id}
                  purchase={purchase}
                  onDelete={() =>
                    setModal({
                      type: 'confirm',
                      record: purchase,
                      message: 'Delete this purchase record?',
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }
  function renderShops() {
    const selectedShop = shops.find(shop => shop.id === selectedShopId);
    if (selectedShop) {
      const shopPurchases = [...purchases].filter(purchase => purchase.shopId === selectedShop.id || (!purchase.shopId && purchase.shopName?.toLowerCase() === selectedShop.name.toLowerCase())).sort((a,b)=>b.purchasedAt.localeCompare(a.purchasedAt));
      const knownPurchased = [...new Set(shopPurchases.map(purchase => purchase.itemName))];
      return <div className='space-y-5'><button onClick={()=>setSelectedShopId('')} className='inline-flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400'><ChevronLeft size={17}/> All shops</button><PageHeading title={selectedShop.name} subtitle={selectedShop.category + ' · Personal shop profile'} action={<div className='flex gap-2'><button onClick={()=>setModal({type:'shop',record:selectedShop})} className='inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-3 text-sm font-semibold text-white'><Plus size={15}/> Add items</button><button onClick={()=>setModal({type:'shop',record:selectedShop})} className='inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 px-3 text-sm font-semibold dark:border-neutral-700'><Pencil size={15}/> Edit shop</button></div>}/><div className='grid gap-3 sm:grid-cols-2'><StatCard label='Previously purchased items' value={String(knownPurchased.length)} detail='Derived from purchase records' icon={Receipt}/><StatCard label='Manually listed items' value={String((selectedShop.soldItems ?? []).length)} detail='Items you say this shop sells' icon={Package}/></div><section className='rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'><h2 className='font-semibold'>Shop information</h2><p className='mt-3 text-sm text-stone-600 dark:text-neutral-300'>{selectedShop.address || 'No address saved'}</p><p className='mt-1 text-sm text-stone-600 dark:text-neutral-300'>{selectedShop.phone || 'No phone saved'}</p>{selectedShop.notes && <p className='mt-2 text-sm text-stone-500'>{selectedShop.notes}</p>}</section><section className='rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'><h2 className='font-semibold'>Previously purchased here</h2>{knownPurchased.length ? <div className='mt-3 flex flex-wrap gap-2'>{knownPurchased.map(name=><button key={name} onClick={()=>{setSelectedItemName(name);setTab('items');}} className='rounded-full bg-green-50 px-3 py-2 text-sm font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300'>{name}</button>)}</div> : <p className='mt-2 text-sm text-stone-500'>No purchases have been recorded for this shop.</p>}</section><section className='rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'><h2 className='font-semibold'>Other items sold</h2><p className='mt-1 text-xs text-stone-500'>Manually maintained shop catalogue; separate from purchase history.</p>{(selectedShop.soldItems ?? []).length ? <div className='mt-3 flex flex-wrap gap-2'>{(selectedShop.soldItems ?? []).map(name=><button key={name} onClick={()=>{setSelectedItemName(name);setTab('items');}} className='rounded-full bg-stone-100 px-3 py-2 text-sm dark:bg-neutral-800'>{name}</button>)}</div> : <p className='mt-2 text-sm text-stone-500'>No other items have been listed yet. Use Add items to build this shop catalogue.</p>}</section><section className='rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'><h2 className='font-semibold'>Purchase history</h2>{shopPurchases.length ? shopPurchases.map(purchase=><PurchaseRow key={purchase.id} purchase={purchase}/>) : <p className='mt-2 text-sm text-stone-500'>No transactions recorded for this shop.</p>}</section></div>;
    }
    const filtered = shops.filter(shop =>
      (shop.name + ' ' + shop.category + ' ' + (shop.address ?? ''))
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    return (
      <div className="space-y-5">
        <PageHeading
          title="Your shops"
          subtitle="A personal directory. Shops do not need purchase records."
          action={
            <button
              onClick={() => setModal({ type: 'shop' })}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white"
            >
              <Plus size={17} /> Add shop
            </button>
          }
        />
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-3 text-stone-400" size={17} />
          <input
            className="field pl-10"
            placeholder="Search shops"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No shops saved yet"
            description="Save shops you visit. You can associate them with purchases later."
            action="Add your first shop"
            onAction={() => setModal({ type: 'shop' })}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(shop => (
              <div
                key={shop.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400">
                    <Store size={21} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModal({ type: 'shop', record: shop })}
                      className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-800"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() =>
                        setModal({
                          type: 'confirm',
                          record: shop,
                          message: 'Delete this shop from your directory?',
                        })
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h3 className="mt-3 font-semibold text-stone-900 dark:text-white">
                  {shop.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-green-700 dark:text-green-400">
                  {shop.category}
                </p>
                {shop.address && (
                  <p className="mt-2 text-sm text-stone-500 dark:text-neutral-400">
                    {shop.address}
                  </p>
                )}
                {shop.phone && (
                  <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
                    {shop.phone}
                  </p>
                )}
                <button onClick={() => setSelectedShopId(shop.id)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-green-700 dark:text-green-400">View shop profile <ChevronRight size={15}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  function renderSettings() {
    const displayName = user?.name || user?.email || 'Local user';
    return (
      <div className="max-w-3xl space-y-5">
        <PageHeading
          title="Settings"
          subtitle="Manage your device, account and data."
        />
        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
              <UserRound size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-stone-900 dark:text-white">
                {displayName}
              </p>
              <p className="truncate text-sm text-stone-500 dark:text-neutral-400">
                {user?.email || 'Using this device without an account'}
              </p>
            </div>
            {user ? (
              <button
                onClick={() => void signOut()}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium dark:border-neutral-700"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => void signIn()}
                className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white"
              >
                Sign in to sync
              </button>
            )}
          </div>
          <p className="mt-4 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600 dark:bg-neutral-800 dark:text-neutral-300">
            {user
              ? 'Cloud sync is available for this account. Local records remain available offline.'
              : 'Guest mode stores data on this device. Sign in when online to enable cloud backup and synchronization.'}
          </p>
        </section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-stone-900 dark:text-white">
            Appearance
          </h2>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-stone-100 p-2 text-stone-600 dark:bg-neutral-800 dark:text-neutral-300">
                {dark ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-neutral-100">
                  Dark appearance
                </p>
                <p className="text-xs text-stone-500">
                  Choose a comfortable theme
                </p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={dark}
              onClick={() => setDark(!dark)}
              className={
                'h-7 w-12 rounded-full p-1 transition ' +
                (dark ? 'bg-green-700' : 'bg-stone-300')
              }
            >
              <span
                className={
                  'block h-5 w-5 rounded-full bg-white transition ' +
                  (dark ? 'translate-x-5' : '')
                }
              />
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-stone-900 dark:text-white">
            Data and sync
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-neutral-100">
                Cloud synchronization
              </p>
              <p className="text-xs text-stone-500">
                {syncMessage ||
                  (user ? 'Sync when online' : 'Sign in to enable cloud sync')}
              </p>
            </div>
            <button
              disabled={!user || !online || syncing}
              onClick={() => {
                setSyncing(true);
                syncCloud()
                  .then(() => {
                    setSyncMessage('All changes are synchronized');
                    refresh();
                  })
                  .catch(() =>
                    setSyncMessage('Sync failed. Your local data is safe.')
                  )
                  .finally(() => setSyncing(false));
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 px-3 text-sm font-semibold disabled:opacity-40 dark:border-neutral-700"
            >
              <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />{' '}
              Sync now
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={async () => {
                const data = {
                  app: 'earnsetu-basket',
                  exportedAt: new Date().toISOString(),
                  lists: await allRecords('lists'),
                  items: await allRecords('items'),
                  shops: await allRecords('shops'),
                  purchases: await allRecords('purchases'),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'earnsetu-basket-backup.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-stone-100 px-3 text-sm font-semibold text-stone-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <Download size={16} /> Export backup
            </button>
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-stone-100 px-3 text-sm font-semibold text-stone-700 dark:bg-neutral-800 dark:text-neutral-200">
              <ArrowDownToLine size={16} /> Import backup
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async event => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const data = JSON.parse(await file.text());
                    if (data.app !== 'earnsetu-basket')
                      throw new Error('This is not an EarnSetu Basket backup.');
                    for (const resource of resources) {
                      const records = data[resource] ?? [];
                      if (!Array.isArray(records))
                        throw new Error('The backup contains an invalid ' + resource + ' collection.');
                      for (const record of records) {
                        if (!record || typeof record.id !== 'string' || !record.id)
                          throw new Error('The backup contains a record without a valid ID.');
                        await saveRecord(resource, record as BasketRecord);
                      }
                    }
                    await refresh();
                    if (user && online) {
                      try {
                        setSyncing(true);
                        await syncCloud();
                        setSyncMessage('Backup imported and synchronized.');
                      } catch {
                        setSyncMessage('Backup imported locally. Cloud sync will retry.');
                      } finally {
                        setSyncing(false);
                      }
                    } else {
                      setSyncMessage('Backup imported to this device. Sign in and sync when online to back it up.');
                    }
                    await refresh();
                  } catch (error) {
                    setSyncMessage(
                      error instanceof Error
                        ? error.message
                        : 'Could not import backup.'
                    );
                  }
                  event.target.value = '';
                }}
              />
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-stone-900 dark:text-white">
            About EarnSetu Basket
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-neutral-300">
            A focused shopping-list and purchase-recording application within
            the EarnSetu ecosystem. Your lists are plans; purchases are records
            of what you actually bought.
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500 dark:border-neutral-800">
            <span>Version 1.0 · Web app</span>
            <span>Offline-first</span>
          </div>
        </section>
        <section className="rounded-2xl border border-red-200 bg-white p-5 dark:border-red-950 dark:bg-neutral-900">
          <h2 className="font-semibold text-red-700 dark:text-red-400">
            Local data
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
            Remove all records stored on this device. This does not delete cloud
            records.
          </p>
          <button
            onClick={() =>
              setModal({
                type: 'confirm',
                message:
                  'Permanently clear all local lists, items, shops, purchases and pending sync operations?',
              })
            }
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:text-red-400"
          >
            <Trash2 size={15} /> Clear local data
          </button>
        </section>
      </div>
    );
  }
  const title = navItems.find(item => item.id === tab)?.label ?? 'Home';
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white px-4 py-5 dark:border-neutral-800 dark:bg-neutral-900 lg:flex lg:flex-col">
          <Brand />
          <div className="mt-9">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400">
              Workspace
            </p>
            <nav className="mt-3 space-y-1">
              {navItems.map(item => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={tab === item.id}
                  onClick={() => {
                    setTab(item.id);
                    setSearch('');
                  }}
                />
              ))}
            </nav>
          </div>
          <div className="mt-auto rounded-2xl bg-green-50 p-4 dark:bg-green-950/30">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <ShieldCheck size={17} />
              <span className="text-xs font-bold">Your data, your control</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-green-900/70 dark:text-green-200/70">
              Works offline. Syncs when you are ready.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 px-2 text-xs text-stone-500">
            {online ? (
              <Wifi size={15} className="text-green-600" />
            ) : (
              <WifiOff size={15} className="text-amber-600" />
            )}
            {online ? 'Online' : 'Offline'}
            <span className="ml-auto">{user ? 'Signed in' : 'Guest mode'}</span>
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90 sm:px-7 lg:px-9">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenu(!mobileMenu)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 lg:hidden dark:border-neutral-700"
                >
                  <Menu size={19} />
                </button>
                <div className="lg:hidden">
                  <Brand compact />
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs text-stone-500 dark:text-neutral-400">
                    EarnSetu Basket / {title}
                  </p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">
                    {title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={
                    'hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-medium sm:flex ' +
                    (online
                      ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300')
                  }
                >
                  {syncing ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : online ? (
                    <Cloud size={14} />
                  ) : (
                    <CloudOff size={14} />
                  )}{' '}
                  {syncing
                    ? 'Syncing'
                    : online
                      ? user
                        ? 'Cloud available'
                        : 'Local mode'
                      : 'Offline mode'}
                </div>
                <button
                  onClick={() => setDark(!dark)}
                  aria-label="Toggle theme"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 text-stone-500 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {user ? (
                  <button
                    onClick={() => void signOut()}
                    title="Sign out"
                    className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound size={18} />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => void signIn()}
                    className="h-10 rounded-xl bg-green-700 px-3 text-sm font-semibold text-white hover:bg-green-800"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
            {mobileMenu && (
              <nav className="mt-3 grid grid-cols-2 gap-1 lg:hidden">
                {navItems.map(item => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={tab === item.id}
                    onClick={() => {
                      setTab(item.id);
                      setMobileMenu(false);
                    }}
                  />
                ))}
              </nav>
            )}
          </header>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
            {syncMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                <BadgeCheck size={15} className="text-green-600" />
                {syncMessage}
                <button onClick={() => setSyncMessage('')} className="ml-auto">
                  <X size={14} />
                </button>
              </div>
            )}
            {!authReady && (
              <div className="mb-4 flex items-center gap-2 text-xs text-stone-500">
                <LoaderCircle size={14} className="animate-spin" /> Restoring
                account session…
              </div>
            )}
            {loading ? (
              <div className="grid min-h-[50vh] place-items-center">
                <div className="flex items-center gap-3 text-sm text-stone-500">
                  <LoaderCircle className="animate-spin" /> Loading your local
                  data…
                </div>
              </div>
            ) : tab === 'home' ? (
              renderHome()
            ) : tab === 'lists' ? (
              renderLists()
            ) : tab === 'items' ? (
              renderItems()
            ) : tab === 'purchases' ? (
              renderPurchases()
            ) : tab === 'shops' ? (
              renderShops()
            ) : (
              renderSettings()
            )}
          </div>
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-stone-200 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 lg:hidden">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setSearch('');
              }}
              className={
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold ' +
                (active
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-stone-400 dark:text-neutral-500')
              }
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>
      {modal && (
        <Modal
          modal={modal}
          lists={lists}
          shops={shops}
          purchases={purchases}
          items={items}
          onClose={() => setModal(null)}
          onSave={async (resource, record) => {
            await persist(resource, record);
          }}
          onDelete={async (resource, recordId) => {
            await remove(resource, recordId);
            setModal(null);
          }}
          onClear={async () => {
            await clearAll();
            setModal(null);
            await refresh();
            setSyncMessage('Local data cleared. Cloud data was not changed.');
          }}
        />
      )}
    </div>
  );
}
function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
        <ShoppingBasketIcon />
      </div>
      <div>
        <p className="text-base font-extrabold tracking-tight text-stone-900 dark:text-white">
          EarnSetu
        </p>
        {!compact && (
          <p className="text-xs font-medium text-stone-500 dark:text-neutral-400">
            Basket
          </p>
        )}
      </div>
    </div>
  );
}
function ShoppingBasketIcon() {
  return <ShoppingBag size={21} strokeWidth={2.3} />;
}
function NavButton({
  item,
  active,
  onClick,
}: {
  item: { id: Tab; label: string; icon: typeof Home };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={
        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ' +
        (active
          ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
          : 'text-stone-600 hover:bg-stone-50 dark:text-neutral-300 dark:hover:bg-neutral-800')
      }
    >
      <Icon size={18} />
      {item.label}
    </button>
  );
}
function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  );
}
function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-500 dark:text-neutral-400">
          {label}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-stone-500 dark:text-neutral-400">
        {detail}
      </p>
    </div>
  );
}
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
}: {
  icon: typeof ListChecks;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-9 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-500 dark:bg-neutral-800 dark:text-neutral-300">
        <Icon size={23} />
      </div>
      <h3 className="mt-3 font-semibold text-stone-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-stone-500 dark:text-neutral-400">
        {description}
      </p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white"
        >
          {action}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
function PurchaseRow({
  purchase,
  onDelete,
}: {
  purchase: PurchaseRecord;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-stone-600 dark:bg-neutral-800 dark:text-neutral-300">
        <Receipt size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-800 dark:text-neutral-100">
          {purchase.itemName}
        </p>
        <p className="mt-1 truncate text-xs text-stone-500 dark:text-neutral-400">
          {purchase.quantity} {purchase.unit} · {purchase.shopName || 'No shop'}{' '}
          · {dateLabel(purchase.purchasedAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-stone-900 dark:text-white">
          {money(purchase.totalMinor, purchase.currency)}
        </p>
        <p className="text-[11px] text-stone-400">{purchase.paymentMethod}</p>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label="Delete purchase"
          className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
function Modal({
  modal,
  lists,
  shops,
  purchases,
  items,
  onClose,
  onSave,
  onDelete,
  onClear,
}: {
  modal: NonNullable<ModalState>;
  lists: ListRecord[];
  shops: ShopRecord[];
  purchases: PurchaseRecord[];
  items: ItemRecord[];
  onClose: () => void;
  onSave: (resource: BasketResource, record: BasketRecord) => Promise<void>;
  onDelete: (resource: BasketResource, id: string) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const sourceItem = modal.sourceItem;
  const record = modal.record as
    | (ListRecord & ItemRecord & ShopRecord & PurchaseRecord)
    | undefined;
  const [name, setName] = useState(record?.name ?? sourceItem?.name ?? '');
  const [quantity, setQuantity] = useState(
    String(sourceItem?.quantity ?? record?.quantity ?? 1)
  );
  const [unit, setUnit] = useState(sourceItem?.unit ?? record?.unit ?? 'pcs');
  const [notes, setNotes] = useState(record?.notes ?? '');
  const [listDescription, setListDescription] = useState((record as ListRecord | undefined)?.description ?? '');
  const [plannedFor, setPlannedFor] = useState((record as ListRecord | undefined)?.plannedFor?.slice(0,16) ?? new Date().toISOString().slice(0,16));
  const [itemTab, setItemTab] = useState<'select' | 'custom'>(record?.id ? 'custom' : 'select');
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showListPicker, setShowListPicker] = useState(false);
  const [shopNameDraft, setShopNameDraft] = useState('');
  const [currency, setCurrency] = useState(
    (modal.type === 'item'
      ? (record as ItemRecord | undefined)?.currency
      : (record as PurchaseRecord | undefined)?.currency) ?? 'INR'
  );
  const [listId, setListId] = useState(
    (record as ItemRecord | undefined)?.listId ??
      (modal.record as { listId?: string } | undefined)?.listId ??
      lists[0]?.id ??
      ''
  );
  const [category, setCategory] = useState(
    (record as ShopRecord | undefined)?.category ?? 'Grocery'
  );
  const [phone, setPhone] = useState(
    (record as ShopRecord | undefined)?.phone ?? ''
  );
  const [address, setAddress] = useState(
    (record as ShopRecord | undefined)?.address ?? ''
  );
  const [soldItemsText, setSoldItemsText] = useState(((record as ShopRecord | undefined)?.soldItems ?? []).join(', '));
  const [existingItemName, setExistingItemName] = useState('');
  const reusableNames = [...new Set([...items.map(item => item.name.trim()), ...purchases.map(purchase => purchase.itemName.trim())].filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const [shopId, setShopId] = useState(
    sourceItem?.shopId ??
      (modal.type === 'item'
        ? (record as ItemRecord | undefined)?.shopId
        : (record as PurchaseRecord | undefined)?.shopId) ??
      ''
  );
  const [price, setPrice] = useState(() => {
    if (modal.type === 'item') {
      const plannedPrice = (record as ItemRecord | undefined)?.expectedPriceMinor;
      return plannedPrice != null ? String(plannedPrice / 100) : '';
    }
    const actualPrice = (record as PurchaseRecord | undefined)?.unitPriceMinor;
    return actualPrice != null ? String(actualPrice / 100) : '';
  });
  const [paymentMethod, setPaymentMethod] = useState(
    (record as PurchaseRecord | undefined)?.paymentMethod ?? 'Cash'
  );
  const [purchasedAt, setPurchasedAt] = useState(
    (record as PurchaseRecord | undefined)?.purchasedAt?.slice(0, 10) ?? today()
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const title =
    modal.type === 'list'
      ? record
        ? 'Edit shopping list'
        : 'Create a list'
      : modal.type === 'item'
        ? record
          ? 'Edit item'
          : 'Add an item'
        : modal.type === 'shop'
          ? record
            ? 'Edit shop'
            : 'Add a shop'
          : modal.type === 'purchase'
            ? 'Record a purchase'
            : 'Confirm action';
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (modal.type === 'confirm') return;
    if (modal.type === 'list' && !name.trim())
      return setError('Enter a list name.');
    if (modal.type === 'item' && (!name.trim() || !listId))
      return setError('Choose a list and enter an item name.');
    if (modal.type === 'shop' && !name.trim())
      return setError('Enter a shop name.');
    if (
      modal.type === 'purchase' &&
      (!name.trim() ||
        !Number.isFinite(Number(quantity)) ||
        Number(quantity) <= 0 ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0)
    )
      return setError('Enter an item, a valid quantity and a valid price.');
    setBusy(true);
    try {
      const now = new Date().toISOString();
      if (modal.type === 'list')
        await onSave('lists', {
          id: record?.id ?? id(),
          name: name.trim(),
          archived: false,
          createdAt: record?.createdAt ?? now,
          description: listDescription.trim(),
          plannedFor: plannedFor ? new Date(plannedFor).toISOString() : now,
          updatedAt: now,
        });
      if (modal.type === 'item')
        await onSave('items', {
          id: record?.id ?? id(),
          listId,
          name: name.trim(),
          quantity: Number(quantity),
          unit,
          notes: notes.trim(),
          shopId: shopId || undefined,
          shopName: shops.find(shop => shop.id === shopId)?.name,
          expectedPriceMinor: price.trim() ? Math.round(Number(price) * 100) : undefined,
          currency,
          checked: (record as ItemRecord | undefined)?.checked ?? false,
          position: (record as ItemRecord | undefined)?.position ?? Date.now(),
          createdAt: record?.createdAt ?? now,
          updatedAt: now,
        });
      if (modal.type === 'shop')
        await onSave('shops', {
          id: record?.id ?? id(),
          name: name.trim(),
          category,
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
          soldItems: soldItemsText.split(',').map(value => value.trim()).filter(Boolean),
          createdAt: record?.createdAt ?? now,
          updatedAt: now,
        });
      if (modal.type === 'purchase') {
        const amount = Math.round(Number(price) * 100);
        const selectedShop = shops.find(shop => shop.id === shopId);
        await onSave('purchases', {
          id: record?.id ?? id(),
          itemName: name.trim(),
          quantity: Number(quantity),
          unit,
          unitPriceMinor: amount,
          totalMinor: Math.round(amount * Number(quantity)),
          currency,
          shopId: shopId || undefined,
          shopName: selectedShop?.name,
          paymentMethod,
          notes: notes.trim(),
          purchasedAt: new Date(purchasedAt + 'T12:00:00').toISOString(),
          sourceItemId: sourceItem?.id,
          createdAt: record?.createdAt ?? now,
          updatedAt: now,
        });
      }
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save. Try again.'
      );
    } finally {
      setBusy(false);
    }
  }
  async function confirm() {
    setBusy(true);
    try {
      if (modal.message?.startsWith('Permanently clear')) await onClear();
      else if (record) {
        const resource: BasketResource =
          'listId' in record
            ? 'items'
            : 'category' in record
              ? 'shops'
              : 'itemName' in record
                ? 'purchases'
                : 'lists';
        if (modal.message === 'Archive this list?')
          await onSave('lists', {
            ...record,
            archived: true,
            updatedAt: new Date().toISOString(),
          });
        else await onDelete(resource, record.id);
      }
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }
  const inputClass = 'field';
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-neutral-900 sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-stone-500 dark:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>
        {modal.type === 'confirm' ? (
          <>
            <p className="text-sm leading-6 text-stone-600 dark:text-neutral-300">
              {modal.message}
            </p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="h-10 rounded-xl border border-stone-200 px-4 text-sm font-semibold dark:border-neutral-700"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={() => void confirm()}
                className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? 'Working…' : 'Confirm'}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={event => void submit(event)} className="space-y-4">
            {(modal.type === 'list' ||
              (modal.type === 'item' && itemTab === 'custom') ||
              modal.type === 'shop' ||
              modal.type === 'purchase') && (
              <label className="block">
                <span className="label">
                  {modal.type === 'list'
                    ? 'List name'
                    : modal.type === 'shop'
                      ? 'Shop name'
                      : 'Item name'}{' '}
                  *
                </span>
                <input
                  autoFocus
                  className={inputClass}
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder={
                    modal.type === 'list'
                      ? 'e.g. Weekly groceries'
                      : modal.type === 'shop'
                        ? 'e.g. Raju Store'
                        : 'e.g. Rice'
                  }
                  maxLength={100}
                />
              </label>
            )}
            {modal.type === 'item' && (
              <>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1 dark:bg-neutral-800">
                  <button type="button" onClick={() => setItemTab('select')} className={'rounded-lg px-3 py-2 text-sm font-semibold ' + (itemTab === 'select' ? 'bg-white text-green-700 shadow-sm dark:bg-neutral-700 dark:text-green-300' : 'text-stone-500')}>Select Items</button>
                  <button type="button" onClick={() => setItemTab('custom')} className={'rounded-lg px-3 py-2 text-sm font-semibold ' + (itemTab === 'custom' ? 'bg-white text-green-700 shadow-sm dark:bg-neutral-700 dark:text-green-300' : 'text-stone-500')}>Custom Input</button>
                </div>
                {itemTab === 'select' && <>
                  <p className="text-xs text-stone-500">Choose saved items to add to this plan. This never records a purchase.</p>
                  <div className="relative"><Search className="absolute left-3 top-3 text-stone-400" size={16}/><input className={inputClass + ' pl-9'} value={itemSearch} onChange={event => setItemSearch(event.target.value)} placeholder="Search saved items"/></div>
                  <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">{reusableNames.filter(value => value.toLowerCase().includes(itemSearch.toLowerCase())).length ? reusableNames.filter(value => value.toLowerCase().includes(itemSearch.toLowerCase())).map(value => <label key={value} className={'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition ' + (selectedNames.includes(value) ? 'border-green-600 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-100' : 'border-stone-200 hover:border-green-300 dark:border-neutral-700')}><input type="checkbox" className="h-4 w-4 accent-green-700" checked={selectedNames.includes(value)} onChange={event => setSelectedNames(current => event.target.checked ? [...current,value] : current.filter(name => name !== value))}/>{value}</label>) : <p className="col-span-full rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500 dark:border-neutral-700">No saved items match your search.</p>}</div>
                  <details className="rounded-xl border border-stone-200 p-3 dark:border-neutral-700" open={showListPicker} onToggle={event => setShowListPicker(event.currentTarget.open)}><summary className="cursor-pointer text-sm font-semibold">Shopping list: {lists.find(list => list.id === listId)?.name ?? 'Choose a list'}</summary><label className="mt-3 block"><span className="label">Add selected items to</span><select className={inputClass} value={listId} onChange={event => setListId(event.target.value)}>{lists.filter(list => !list.archived).map(list => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label></details>
                  <div className="grid grid-cols-2 gap-3"><label><span className="label">Quantity</span><input className={inputClass} type="number" min="0.01" step="0.01" value={quantity} onChange={event => setQuantity(event.target.value)}/></label><label><span className="label">Unit</span><select className={inputClass} value={unit} onChange={event => setUnit(event.target.value)}>{['pcs','kg','g','l','ml','packet','pack','box','bottle','dozen','unit'].map(value => <option key={value}>{value}</option>)}</select></label></div>
                  <button type="button" disabled={!selectedNames.length || !listId || busy} onClick={async () => { setBusy(true); setError(''); try { const now = new Date().toISOString(); for (const selectedName of selectedNames) await onSave('items',{id:id(),listId,name:selectedName,quantity:Number(quantity),unit,notes:'',checked:false,position:Date.now(),createdAt:now,updatedAt:now}); onClose(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not add selected items.'); } finally { setBusy(false); } }} className="h-11 w-full rounded-xl bg-green-700 px-4 text-sm font-semibold text-white disabled:opacity-50">Add {selectedNames.length} selected item{selectedNames.length === 1 ? '' : 's'}</button>
                </>}
                {itemTab === 'custom' && <>
                <label className="block">
                  <span className="label">Shopping list *</span>
                  <select
                    className={inputClass}
                    value={listId}
                    onChange={event => setListId(event.target.value)}
                  >
                    {lists
                      .filter(list => !list.archived)
                      .map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="label">Quantity</span>
                    <input
                      className={inputClass}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={quantity}
                      onChange={event => setQuantity(event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="label">Unit</span>
                    <select
                      className={inputClass}
                      value={unit}
                      onChange={event => setUnit(event.target.value)}
                    >
                      {[
                        'pcs',
                        'kg',
                        'g',
                        'l',
                        'ml',
                        'packet',
                        'pack',
                        'box',
                        'bottle',
                        'dozen',
                        'unit',
                      ].map(value => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="label">Preferred shop (optional)</span>
                    <select
                      className={inputClass}
                      value={shopId}
                      onChange={event => setShopId(event.target.value)}
                    >
                      <option value="">No shop selected</option>
                      {shops.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="label">Expected unit price (optional)</span>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={event => setPrice(event.target.value)}
                      placeholder="0.00"
                    />
                  </label>
                </div>
                <label>
                  <span className="label">Currency</span>
                  <select className={inputClass} value={currency} onChange={event => setCurrency(event.target.value)}>
                    {['INR', 'USD', 'EUR', 'GBP'].map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                </>}
              </>
            )}
            {modal.type === 'list' && <><label className="block"><span className="label">Date & time</span><input className={inputClass} type="datetime-local" value={plannedFor} onChange={event => setPlannedFor(event.target.value)}/></label><label className="block"><span className="label">Description (optional)</span><textarea className={inputClass + ' min-h-20 resize-y'} value={listDescription} onChange={event => setListDescription(event.target.value)} placeholder="What is this list for?"/></label></>}
            {modal.type === 'shop' && (
              <>
                <label>
                  <span className="label">Category</span>
                  <select
                    className={inputClass}
                    value={category}
                    onChange={event => setCategory(event.target.value)}
                  >
                    {[
                      'Grocery',
                      'Supermarket',
                      'Vegetable shop',
                      'Pharmacy',
                      'Electronics',
                      'Clothing',
                      'Hardware',
                      'Restaurant',
                      'Other',
                    ].map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Phone (optional)</span>
                  <input
                    className={inputClass}
                    value={phone}
                    onChange={event => setPhone(event.target.value)}
                    placeholder="Contact number"
                  />
                </label>
                <label>
                  <span className="label">Address (optional)</span>
                  <input
                    className={inputClass}
                    value={address}
                    onChange={event => setAddress(event.target.value)}
                    placeholder="Area, town or address"
                  />
                </label>
                {record?.id && <label>
                  <span className="label">Items sold</span>
                  <input
                    className={inputClass}
                    value={soldItemsText}
                    onChange={event => setSoldItemsText(event.target.value)}
                    placeholder="e.g. Rice, Tea, Cooking oil"
                  />
                  <span className="mt-1 block text-xs text-stone-500">Add comma-separated items to this shop's catalogue.</span>
                </label>
              }</>
            )}
            {modal.type === 'purchase' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="label">Quantity *</span>
                    <input
                      className={inputClass}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={quantity}
                      onChange={event => setQuantity(event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="label">Unit</span>
                    <select
                      className={inputClass}
                      value={unit}
                      onChange={event => setUnit(event.target.value)}
                    >
                      {[
                        'pcs',
                        'kg',
                        'g',
                        'l',
                        'ml',
                        'packet',
                        'pack',
                        'box',
                        'bottle',
                        'dozen',
                        'unit',
                      ].map(value => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  <span className="label">Unit price ({currency}) *</span>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={event => setPrice(event.target.value)}
                    placeholder="0.00"
                  />
                </label>
                <label>
                  <span className="label">Currency</span>
                  <select className={inputClass} value={currency} onChange={event => setCurrency(event.target.value)}>
                    {['INR', 'USD', 'EUR', 'GBP'].map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <div className="rounded-xl bg-green-50 p-3 dark:bg-green-950/40">
                  <p className="text-xs font-medium text-green-800 dark:text-green-300">
                    Purchase total
                  </p>
                  <p className="mt-1 text-xl font-bold text-green-900 dark:text-green-200">
                    {money(
                      Math.round(
                        (Number(price) || 0) * 100 * (Number(quantity) || 0)
                      ),
                      currency
                    )}
                  </p>
                </div>
                <label>
                  <span className="label">Shop (optional)</span>
                  <select
                    className={inputClass}
                    value={shopId}
                    onChange={event => setShopId(event.target.value)}
                  >
                    <option value="">No shop selected</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="label">Payment method</span>
                    <select
                      className={inputClass}
                      value={paymentMethod}
                      onChange={event => setPaymentMethod(event.target.value)}
                    >
                      {[
                        'Cash',
                        'UPI',
                        'Card',
                        'Bank transfer',
                        'Credit',
                        'Other',
                      ].map(value => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="label">Purchase date</span>
                    <input
                      className={inputClass}
                      type="date"
                      value={purchasedAt}
                      onChange={event => setPurchasedAt(event.target.value)}
                    />
                  </label>
                </div>
              </>
            )}
            {(modal.type === 'item' ||
              modal.type === 'shop' ||
              modal.type === 'purchase') && (
              <label className="block">
                <span className="label">Notes (optional)</span>
                <textarea
                  className={inputClass + ' min-h-20 resize-y'}
                  value={notes}
                  onChange={event => setNotes(event.target.value)}
                  placeholder="Add a note…"
                />
              </label>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-stone-100 pt-4 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-stone-200 px-4 text-sm font-semibold dark:border-neutral-700"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                type="submit"
                className="h-11 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy
                  ? 'Saving…'
                  : modal.type === 'purchase'
                    ? 'Save purchase'
                    : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
export default App;
