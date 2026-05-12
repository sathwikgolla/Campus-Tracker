import { Check } from "lucide-react";
import { campusThemes, useTheme } from "../context/ThemeContext";
import { Card } from "./ui/Card";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  return (
    <Card className="p-5">
      <h3 className="text-xl font-black text-white">Dynamic Themes</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(campusThemes).map(([name, config]) => (
          <button key={name} onClick={() => setTheme(name)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-cyan/30">
            <span className="block h-12 rounded-2xl" style={{ background: `linear-gradient(135deg, ${config.accent}, #050816)` }} />
            <span className="mt-3 flex items-center justify-between text-sm font-bold text-white">{name}{theme === name && <Check className="h-4 w-4 text-cyan" />}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
