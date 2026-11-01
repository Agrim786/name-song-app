import { useQuery } from "@tanstack/react-query";
import { getLanguages } from "../../../api/names";
import { sortLanguages } from "../languages";

// The server offers exactly the languages it has song templates for; they change
// only when templates are added, so the list is cached for hours.
export const useLanguages = () =>
  useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
    staleTime: 6 * 3600_000,
    select: (d) => sortLanguages(d.languages),
  });
