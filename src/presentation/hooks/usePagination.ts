import { useEffect, useState } from "react";
import { paginate, type Page } from "../../business";

/**
 * PRESENTATION LAYER (hook)
 * Holds the current page number and re-derives the paginated slice
 * from the business layer whenever items, page, or pageSize change.
 * Resets to page 1 when the list's length changes — e.g. after running
 * automation moves a ticket from "incoming" to "resolved", nobody wants
 * to be stranded on a page that no longer exists.
 */
export function usePagination<T>(items: T[], pageSize = 5): Page<T> & { setPage: (page: number) => void } {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const result = paginate(items, page, pageSize);
  return { ...result, setPage };
}