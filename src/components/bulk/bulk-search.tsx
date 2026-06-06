"use client";

import { useState } from "react";
import type { BulkData } from "@/lib/cosine/types";
import { BulkForm } from "./bulk-form";
import { BulkResults } from "./bulk-results";

export function BulkSearch() {
  const [data, setData] = useState<BulkData | null>(null);

  return (
    <div className="flex flex-col gap-10">
      <BulkForm onResults={setData} />

      <div aria-live="polite" className="min-h-0">
        {data ? <BulkResults data={data} /> : null}
      </div>
    </div>
  );
}
