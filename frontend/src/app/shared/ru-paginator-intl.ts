import { MatPaginatorIntl } from '@angular/material/paginator';

/**
 * Русские подписи для постраничной навигации.
 * По умолчанию Material подписывает её по-английски.
 */
export function ruPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.itemsPerPageLabel = 'Задач на странице:';
  intl.nextPageLabel = 'Следующая страница';
  intl.previousPageLabel = 'Предыдущая страница';
  intl.firstPageLabel = 'Первая страница';
  intl.lastPageLabel = 'Последняя страница';

  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 из ${length}`;
    }
    const start = page * pageSize;
    const end = Math.min(start + pageSize, length);
    return `${start + 1} – ${end} из ${length}`;
  };

  return intl;
}
