import { queryOptions } from "@tanstack/react-query";
import { getMeetings } from "@/lib/api/meetings";
import { queryKeys } from "@/lib/query/queryKeys";

export const meetingsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.meetings,
    queryFn: getMeetings,
  });
