import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { availService } from "../api/avail";

// Keep showing previous data while refetching (no loading flash)
const keep = (prev: unknown) => prev;

// GET: All blocks for a depot (sanctioned + applied pipeline)
export function useGetDepotBlocks() {
  const { data: session } = useSession();
  const depot = session?.user?.depot;
  return useQuery({
    queryKey: ["avail-depot-blocks", depot],
    queryFn: () => availService.getDepotBlocks(depot!),
    enabled: !!depot,
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
    placeholderData: keep,
  });
}

// GET: My active participations (blocks where I'm an AvailParticipant)
export function useGetMyParticipations() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["avail-my-participations", userId],
    queryFn: () => availService.getMyParticipations(),
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
    placeholderData: keep,
  });
}

// GET: Pending concurrences for my dept/depot (S&T, TRD people)
export function useGetPendingAvailConcurrences() {
  const { data: session } = useSession();
  const depot = session?.user?.depot;
  const userDepartment = session?.user?.department;
  const role = session?.user?.role;
  return useQuery({
    queryKey: ["avail-concurrences", depot, userDepartment],
    queryFn: () => availService.getPendingConcurrences(depot!, userDepartment!),
    enabled: !!depot && !!userDepartment && (role === "USER" || role === "JE"),
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
    placeholderData: keep,
  });
}

// GET: SM pending dashboard — live operations, needs tighter polling
export function useGetSmPending() {
  const { data: session } = useSession();
  const stationCode = session?.user?.depot;
  return useQuery({
    queryKey: ["sm-pending", stationCode],
    queryFn: () => availService.getSmPending(stationCode!),
    enabled: !!stationCode && session?.user?.role === "SM",
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keep,
  });
}

// GET: Single avail request detail — field worker watching live status
export function useGetAvailRequestById(requestId: string) {
  return useQuery({
    queryKey: ["avail-request", requestId],
    queryFn: () => availService.getAvailRequestById(requestId),
    enabled: !!requestId,
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keep,
  });
}

// GET: My own avail blocks — alias for dashboard badge
export function useGetMyAvailBlocks() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["avail-my-blocks", userId],
    queryFn: () => availService.getMyParticipations(),
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
    placeholderData: keep,
  });
}

// GET: SM station codes — static, no polling needed
export function useGetSmStations() {
  return useQuery({
    queryKey: ["sm-stations"],
    queryFn: () => availService.getSmStations(),
    staleTime: 1000 * 60 * 10,
  });
}

// GET: TRD Controller permit dashboard
export function useGetTrdPending() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["trd-pending"],
    queryFn: () => availService.getTrdPending(),
    enabled: session?.user?.role === "DEPT_CONTROLLER" && session?.user?.department === "TRD",
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keep,
  });
}
