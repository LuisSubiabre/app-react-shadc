import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === "dark");

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    setIsDark(!isDark);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Sun
        className={`h-5 w-5 transition-all ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      />
      <Switch checked={isDark} onCheckedChange={toggleTheme} />
      <Moon
        className={`h-5 w-5 transition-all ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
