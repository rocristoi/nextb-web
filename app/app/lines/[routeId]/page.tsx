import { Suspense } from "react";
import dynamic from "next/dynamic";

const RouteMapClient = dynamic(() => import("./RouteMapClient"), {
  loading: () => (
    <div className="flex h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  ),
});

export default function RouteMapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <RouteMapClient />
    </Suspense>
  );
}
