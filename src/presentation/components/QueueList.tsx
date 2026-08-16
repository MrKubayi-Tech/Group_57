import type { ReactNode } from "react";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "./Pagination";

interface QueueListProps<T> {
  title: string;
  items: T[];
  emptyLabel: string;
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string | number;
  pageSize?: number;
}

export function QueueList<T>({
  title,
  items,
  emptyLabel,
  renderItem,
  getKey,
  pageSize = 5,
}: QueueListProps<T>) {
  const { items: pageItems, page, totalPages, totalItems, setPage } = usePagination(items, pageSize);

  return (
    <section className="queue-list">
      <div className="queue-list__header">
        <h3 className="queue-list__title">
          {title} <span className="queue-list__count">{totalItems}</span>
        </h3>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {items.length === 0 ? (
        <p className="queue-list__empty">{emptyLabel}</p>
      ) : (
        <div className="queue-list__items">
          {pageItems.map((item) => (
            <div key={getKey(item)}>{renderItem(item)}</div>
          ))}
        </div>
      )}
    </section>
  );
}