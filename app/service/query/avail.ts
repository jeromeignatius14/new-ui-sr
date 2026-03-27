import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { availService } from "../api/avail";

// GET: All blocks for a depot (sanctioned + applied pipeline)
// Everyone in the depot sees these — SSE, JE, Tech
export function useGetDepotBlocks() {
  const { data: session } = useSession();
  const depot = session?.user?.depot;
  return useQuery({
    queryKey: ["avail-depot-blocks", depot],
    queryFn: () => availService.getDepotBlocks(depot!),
    enabled: !!depot,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 3,
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
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
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
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 3,
  });
}

// GET: SM pending dashboard
export function useGetSmPending() {
  const { data: session } = useSession();
  const stationCode = session?.user?.depot;
  return useQuery({
    queryKey: ["sm-pending", stationCode],
    queryFn: () => availService.getSmPending(stationCode!),
    enabled: !!stationCode && session?.user?.role === "SM",
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 3,
  });
}

// GET: Single avail request detail
export function useGetAvailRequestById(requestId: string) {
  return useQuery({
    queryKey: ["avail-request", requestId],
    queryFn: () => availService.getAvailRequestById(requestId),
    enabled: !!requestId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// GET: My own avail blocks (blocks I applied to avail) — alias for useGetMyParticipations for dashboard badge
export function useGetMyAvailBlocks() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["avail-my-blocks", userId],
    queryFn: () => availService.getMyParticipations(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
}

// GET: SM station codes
export function useGetSmStations() {
  return useQuery({
    queryKey: ["sm-stations"],
    queryFn: () => availService.getSmStations(),
    staleTime: 1000 * 60 * 10,
  });
}
