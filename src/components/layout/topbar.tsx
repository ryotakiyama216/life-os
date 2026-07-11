"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Moon, LogOut, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QuickCaptureDialog } from "@/components/quick-capture-dialog";
import { NavLinks } from "@/components/layout/nav-links";
import { createClient } from "@/lib/supabase/client";

export function Topbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="md:hidden" aria-label="メニュー">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="h-14 justify-center border-b px-4">
              <SheetTitle className="text-left text-sm font-semibold">Life OS</SheetTitle>
            </SheetHeader>
            <NavLinks onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "yyyy年M月d日（E）", { locale: ja })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <QuickCaptureDialog />
        <Button
          size="icon"
          variant="ghost"
          aria-label="テーマ切替"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
        <Button size="icon" variant="ghost" aria-label="ログアウト" onClick={handleSignOut}>
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
