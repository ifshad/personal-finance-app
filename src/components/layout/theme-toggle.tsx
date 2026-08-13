"use client";

import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasMounted } from "@/hooks/use-has-mounted";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // next-themes reads localStorage/system preference after mount, so the
  // server-rendered value would mismatch the client's until then — render
  // nothing meaningful until mounted rather than guess.
  const mounted = useHasMounted();

  return (
    <Tabs value={mounted ? theme ?? "system" : "system"} onValueChange={(value) => value && setTheme(value)}>
      <TabsList className="w-full">
        {OPTIONS.map((option) => (
          <TabsTrigger key={option.value} value={option.value} className="flex-1">
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
