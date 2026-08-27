import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { TASK_STATUS_LABELS, Task, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ruPaginatorIntl } from '../../../shared/ru-paginator-intl';

/**
 * Список задач с фильтрами, поиском, сортировкой и постраничной навигацией.
 *
 * Ключевое правило этого экрана: массив задач на фронтенде не фильтруется
 * и не сортируется. Любое изменение условий уходит запросом на бэкенд,
 * и компонент показывает ровно то, что вернул сервер.
 */
@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: ruPaginatorIntl }],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {

  private static readonly DEBOUNCE_MS = 400;

  private readonly taskService = inject(TaskService);

  /** Текстовые фильтры: реагируют с задержкой, чтобы не слать запрос на каждую букву. */
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly tagControl = new FormControl('', { nonNullable: true });

  /** Фильтры-списки: срабатывают сразу, задержка тут не нужна. */
  protected readonly status = signal<TaskStatus | null>(null);
  protected readonly direction = signal<'asc' | 'desc'>('desc');

  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalElements = signal(0);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  /** Отложенные значения текстовых фильтров — то, что реально уходит в запрос. */
  private readonly searchValue = signal('');
  private readonly tagValue = signal('');

  /** Активен ли хоть один фильтр — от этого зависит текст пустого списка. */
  protected readonly hasActiveFilters = computed(
    () =>
      this.status() !== null ||
      this.tagValue() !== '' ||
      this.searchValue() !== '',
  );

  protected readonly statusOptions: ReadonlyArray<{ value: TaskStatus | null; label: string }> = [
    { value: null, label: 'Все статусы' },
    { value: 'TODO', label: TASK_STATUS_LABELS.TODO },
    { value: 'IN_PROGRESS', label: TASK_STATUS_LABELS.IN_PROGRESS },
    { value: 'DONE', label: TASK_STATUS_LABELS.DONE },
  ];

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(TaskList.DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.searchValue.set(value.trim());
        this.onFilterChange();
      });

    this.tagControl.valueChanges
      .pipe(debounceTime(TaskList.DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.tagValue.set(value.trim());
        this.onFilterChange();
      });
  }

  ngOnInit(): void {
    this.load();
  }

  /** Загрузка текущей страницы с текущими условиями. */
  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskService
      .getTasks({
        status: this.status(),
        tag: this.tagValue(),
        search: this.searchValue(),
        page: this.pageIndex(),
        size: this.pageSize(),
        direction: this.direction(),
      })
      .subscribe({
        next: (page) => {
          this.tasks.set(page.content);
          this.totalElements.set(page.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.tasks.set([]);
          this.totalElements.set(0);
          this.errorMessage.set(
            'Не удалось загрузить задачи. Проверьте, что бэкенд запущен на localhost:8080.',
          );
          this.loading.set(false);
        },
      });
  }

  protected onStatusChange(value: TaskStatus | null): void {
    this.status.set(value);
    this.onFilterChange();
  }

  protected onDirectionChange(value: 'asc' | 'desc'): void {
    this.direction.set(value);
    this.onFilterChange();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  protected resetFilters(): void {
    // emitEvent: false — иначе сброс полей сам вызвал бы ещё две загрузки
    this.searchControl.setValue('', { emitEvent: false });
    this.tagControl.setValue('', { emitEvent: false });
    this.searchValue.set('');
    this.tagValue.set('');
    this.status.set(null);
    this.direction.set('desc');
    this.pageIndex.set(0);
    this.load();
  }

  protected statusLabel(status: TaskStatus): string {
    return TASK_STATUS_LABELS[status];
  }

  /**
   * Любое изменение условий возвращает нас на первую страницу.
   * Иначе можно остаться на пятой странице результата, в котором
   * теперь всего одна страница, и увидеть пустоту вместо задач.
   */
  private onFilterChange(): void {
    this.pageIndex.set(0);
    this.load();
  }
}
