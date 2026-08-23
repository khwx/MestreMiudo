"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as typeof locale)}>
      <SelectTrigger className={className ?? "w-[180px]"} aria-label="Idioma">
        <Languages className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
      </SelectContent>
    </Select>
  );
}
