"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex gap-1 rounded-md border border-border bg-muted p-1">
        <div className="h-7 w-7 rounded" />
      </div>
    )
  }

  return (
    <div
      className="flex gap-0.5 rounded-md border border-border bg-muted/70 p-0.5 text-foreground"
      role="group"
      aria-label="Selecionar tema"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={`h-7 w-7 rounded text-muted-foreground hover:bg-foreground/10 hover:text-foreground ${
          (theme ?? "system") === "light" ? "bg-foreground text-background shadow-sm" : ""
        }`}
        onClick={() => setTheme("light")}
        title="Tema claro"
        aria-pressed={(theme ?? "system") === "light"}
      >
        <Sun className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={`h-7 w-7 rounded text-muted-foreground hover:bg-foreground/10 hover:text-foreground ${
          (theme ?? "system") === "dark" ? "bg-foreground text-background shadow-sm" : ""
        }`}
        onClick={() => setTheme("dark")}
        title="Tema escuro"
        aria-pressed={(theme ?? "system") === "dark"}
      >
        <Moon className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={`h-7 w-7 rounded text-muted-foreground hover:bg-foreground/10 hover:text-foreground ${
          (theme ?? "system") === "system" ? "bg-foreground text-background shadow-sm" : ""
        }`}
        onClick={() => setTheme("system")}
        title="Seguir dispositivo"
        aria-pressed={(theme ?? "system") === "system"}
      >
        <Monitor className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
