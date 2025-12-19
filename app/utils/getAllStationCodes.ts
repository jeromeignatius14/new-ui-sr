import { blockSection } from "@/app/lib/store";

export const getAllStationCodes = (): string[] => {
  const stationSet = new Set<string>();

  Object.values(blockSection).forEach((sectionArray) => {
    sectionArray.forEach((station) => {
      if (station.endsWith("-YD")) return;

      station
        .split("-")
        .map((s) =>
          s
            .trim()
            .replace(/\s*Jn\s*/gi, "")
            .replace(/\/.*$/, "")
        )
        .filter(Boolean)
        .forEach((code) => {
          if (code !== "YD") stationSet.add(code);
        });
    });
  });

  return Array.from(stationSet).sort();
};
