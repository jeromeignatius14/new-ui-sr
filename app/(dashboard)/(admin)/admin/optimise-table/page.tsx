import { Suspense } from "react";
import OptimiseTablePage from "./content";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-lg">Loading...</div>}>
      <OptimiseTablePage />
    </Suspense>
  );
}
