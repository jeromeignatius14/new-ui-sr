import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { availService } from "../api/avail";

// GET: Sanctioned blocks available for availing (JE/SSE, next N hours, for their depot)
export function useGetSanctionedBlocksForAvailing(hours: number = 12) {
  const { data: session } = useSession();
  const depot = session?.user?.depot;
  return useQuery({
    queryKey: ["avail-sanctioned-blocks", depot, hours],
    queryFn: () => availService.getSanctionedBlocksForAvailing(depot!, hours),
    enabled: !!depot,
    staleTime: 1000 * 60 * 2, // 2 minutes — time-sensitive
    refetchInterval: 1000 * 60 * 5, // refetch every 5 min
  });
}

// GET: Other-dept availing concurrences pending for this SSE (USER role only)
export function useGetPendingAvailConcurrences() {
  const { data: session } = useSession();
  const depot = session?.user?.depot;
  const userDepartement = session?.user?.department;
  return useQuery({
    queryKey: ["avail-concurrences", depot, userDepartement],
    queryFn: () => availService.getPendingConcurrences(depot!, userDepartement!),
    enabled: !!depot && !!userDepartement && session?.user?.role === "USER",
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}

// GET: SM pending approvals and closures for their station
export function useGetSmPending() {
  const { data: session } = useSession();
  const stationCode = session?.user?.depot; // SM's depot field = station code
  return useQuery({
    queryKey: ["sm-pending", stationCode],
    queryFn: () => availService.getSmPending(stationCode!),
    enabled: !!stationCode && session?.user?.role === "SM",
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 3, // refetch every 3 min — SM needs fresh data
  });
}

// GET: All blocks for the logged-in user in any availing status
export function useGetMyAvailBlocks() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["avail-my-blocks", userId],
    queryFn: () => availService.getMyAvailBlocks(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 3,
  });
}

// GET: Single avail request detail (includes all availing fields)
export function useGetAvailRequestById(requestId: string) {
  return useQuery({
    queryKey: ["avail-request", requestId],
    queryFn: () => availService.getAvailRequestById(requestId),
    enabled: !!requestId,
  });
}
