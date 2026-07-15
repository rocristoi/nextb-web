import { BottomNav } from "./BottomNav";
import { InstallPrompt } from "./InstallPrompt";
import { ToastProvider } from "@/components/ui/Toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:h-auto lg:min-h-dvh lg:overflow-visible">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:overflow-visible lg:pl-[220px]">
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pb-[calc(4.25rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] lg:overflow-visible lg:pb-0">
            {children}
          </main>
        </div>
        <BottomNav />
        <InstallPrompt />
      </div>
    </ToastProvider>
  );
}
