/** @format */

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  daysInMonth,
  firstWeekdayOfMonth,
  formatDateLabel,
  formatMonthYear,
  todayParts,
  toDateKey,
} from "@/utils/date";
import { cn } from "@/utils/cn";

interface DateFieldProps {
  label?: string;
  value: string;
  onChange: (dateKey: string) => void;
  error?: string;
  hint?: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function DateField({
  label,
  value,
  onChange,
  error,
  hint,
}: DateFieldProps) {
  const today = todayParts();
  const initial = value
    ? { year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)) }
    : { year: today.year, month: today.month };

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(initial.year || today.year);
  const [month, setMonth] = useState(initial.month || today.month);

  const cells = useMemo(() => {
    const total = daysInMonth(year, month);
    const leading = firstWeekdayOfMonth(year, month);
    const values: (number | null)[] = Array.from(
      { length: leading },
      () => null,
    );
    for (let day = 1; day <= total; day += 1) values.push(day);
    while (values.length % 7 !== 0) values.push(null);
    return values;
  }, [year, month]);

  const selectedKey = value;
  const todayKey = toDateKey(new Date());

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
  };

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-xs font-semibold text-stone-600 dark:text-neutral-300">
          {label}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        className={cn(
          "h-11 flex-row items-center justify-between rounded-xl border bg-white px-3 dark:bg-neutral-900",
          error
            ? "border-red-500"
            : open
              ? "border-green-600"
              : "border-stone-300 dark:border-neutral-700",
        )}
      >
        <Text className="text-base text-stone-900 dark:text-white">
          {value ? formatDateLabel(`${value}T12:00:00`) : "Choose a date"}
        </Text>
        <CalendarDays size={17} color="#78716c" />
      </Pressable>

      {open ? (
        <View className="rounded-xl border border-stone-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityLabel="Previous month"
              onPress={() => shiftMonth(-1)}
              className="h-9 w-9 items-center justify-center rounded-lg"
            >
              <ChevronLeft size={18} color="#57534e" />
            </Pressable>
            <Text className="text-sm font-semibold text-stone-800 dark:text-neutral-100">
              {formatMonthYear(year, month - 1)}
            </Text>
            <Pressable
              accessibilityLabel="Next month"
              onPress={() => shiftMonth(1)}
              className="h-9 w-9 items-center justify-center rounded-lg"
            >
              <ChevronRight size={18} color="#57534e" />
            </Pressable>
          </View>

          <View className="mt-2 flex-row">
            {WEEKDAYS.map((day, index) => (
              <Text
                key={`${day}-${index}`}
                className="flex-1 text-center text-[10px] font-semibold uppercase text-stone-400"
              >
                {day}
              </Text>
            ))}
          </View>

          <View className="mt-1 flex-row flex-wrap">
            {cells.map((day, index) => {
              if (day === null) {
                return (
                  <View
                    key={`blank-${index}`}
                    style={{ width: `${100 / 7}%`, height: 40 }}
                  />
                );
              }

              const key = toDateKey(new Date(year, month - 1, day));
              const isSelected = key === selectedKey;
              const isToday = key === todayKey;

              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={`${day} ${formatMonthYear(year, month - 1)}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  style={{ width: `${100 / 7}%`, height: 40 }}
                  className="items-center justify-center"
                >
                  <View
                    className={cn(
                      "h-9 w-9 items-center justify-center rounded-full",
                      isSelected
                        ? "bg-green-700"
                        : isToday
                          ? "border border-green-600"
                          : "bg-transparent",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm",
                        isSelected
                          ? "font-bold text-white"
                          : "text-stone-700 dark:text-neutral-200",
                      )}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onChange(todayKey);
              setOpen(false);
            }}
            className="mt-2 h-9 items-center justify-center rounded-lg bg-stone-100 dark:bg-neutral-800"
          >
            <Text className="text-xs font-semibold text-stone-700 dark:text-neutral-200">
              Today
            </Text>
          </Pressable>
        </View>
      ) : null}

      {error ? (
        <Text className="text-xs text-red-600 dark:text-red-400">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-stone-500 dark:text-neutral-400">{hint}</Text>
      ) : null}
    </View>
  );
}
