"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/app/utils/axiosInstance";

export type SectionOption = { value: string; label: string };

export function useMasterSections() {
  const [majorSectionOptions, setMajorSectionOptions] = useState<SectionOption[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("/api/master?type=MAJOR")
      .then((res) => {
        const opts: SectionOption[] = (res.data.data ?? [])
          .sort((a: any, b: any) => a.sort - b.sort)
          .map((m: any) => ({ value: m.code, label: m.label || m.code }));
        setMajorSectionOptions([{ value: "All", label: "All" }, ...opts]);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return { majorSectionOptions, loaded };
}
