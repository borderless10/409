import type { ReactNode } from "react"
import { MainSidebar } from "@/components/main-sidebar"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <MainSidebar />

      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}

