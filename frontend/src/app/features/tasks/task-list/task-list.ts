import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ApiError } from '../../../core/models/api-error.model';
import { TASK_STATUS_LABELS, Task, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { ruPaginatorIntl } from '../../../shared/ru-paginator-intl';
import { TaskFormDialog, TaskFormDialogData } from '../task-form-dialog/task-form-dialog';

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
    MatProgressBarModule,
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
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  /** Текстовые фильтры: реагируют с задержкой, чтобы не слать запрос на каждую букву. */
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly tagControl = new FormControl('', { nonNullable: true });

  /** Фильтры-списки: срабатывают сразу, задержка тут не нужна. */
  protected readonly status = signal<TaskStatus | null>(null);
  protected readonly direction = signal<'asc' | 'desc'>('desc');

  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalElements = signal(0);

  /** Задача, по которой сейчас идёт запрос: её кнопки заблокированы. */
  protected readonly pendingTaskId = signal<number | null>(null);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

  /** Идёт ли запрос прямо сейчас. Сам по себе на разметку не влияет. */
  private readonly loading = signal(true);

  /**
   * Первая загрузка: показывать нечего, поэтому уместен большой индикатор
   * на всю область списка.
   */
  protected readonly initialLoading = computed(
    () => this.loading() && this.tasks().length === 0,
  );

  /**
   * Фоновое обновление: данные на экране уже есть. Список остаётся на месте,
   * сверху показывается тонкая полоска — иначе разметка схлопнулась бы,
   * страница стала короче и браузер отбросил бы прокрутку наверх.
   */
  protected readonly refreshing = computed(
    () => this.loading() && this.tasks().length > 0,
  );

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

  /** Статусы для смены прямо на карточке — без варианта «Все». */
  protected readonly editableStatusOptions: ReadonlyArray<{ value: TaskStatus; label: string }> = [
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
          // Список и счётчик не трогаем: последние удачно загруженные данные
          // лучше пустого экрана, а сообщение об ошибке покажем над ними.
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

  /** Открывает пустую форму создания. */
  protected openCreateDialog(): void {
    this.openFormDialog({});
  }

  /** Открывает форму, заполненную данными задачи. */
  protected openEditDialog(task: Task): void {
    this.openFormDialog({ task });
  }

  /**
   * Смена статуса прямо на карточке.
   * Локально task.status не правим: правду о задаче знает бэкенд,
   * поэтому после успеха просто перезагружаем список.
   */
  protected onStatusSelected(task: Task, status: TaskStatus): void {
    if (status === task.status || this.pendingTaskId() === task.id) {
      return;
    }

    this.pendingTaskId.set(task.id);

    this.taskService.updateTaskStatus(task.id, status).subscribe({
      next: () => {
        this.pendingTaskId.set(null);
        this.notify('Статус обновлён');
        this.load();
      },
      error: (response: HttpErrorResponse) => {
        this.pendingTaskId.set(null);
        this.notifyError(response, 'Не удалось изменить статус');
        // Перезагружаем, чтобы выпадающий список вернулся к реальному статусу
        this.load();
      },
    });
  }

  /** Спрашивает подтверждение и только потом удаляет. */
  protected confirmDelete(task: Task): void {
    if (this.pendingTaskId() === task.id) {
      return;
    }

    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      width: '440px',
      maxWidth: '95vw',
      data: {
        title: 'Удалить задачу?',
        message: `Задача «${task.title}» будет удалена без возможности восстановления.`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        danger: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTask(task);
      }
    });
  }

  protected statusLabel(status: TaskStatus): string {
    return TASK_STATUS_LABELS[status];
  }

  private deleteTask(task: Task): void {
    this.pendingTaskId.set(task.id);

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.pendingTaskId.set(null);
        this.notify('Задача удалена');
        this.reloadAfterDelete();
      },
      error: (response: HttpErrorResponse) => {
        this.pendingTaskId.set(null);
        this.notifyError(response, 'Не удалось удалить задачу');
      },
    });
  }

  /**
   * Если удалили единственную задачу на непервой странице, эта страница
   * перестала существовать. Шагаем на предыдущую, иначе пользователь
   * упрётся в пустой экран, хотя задачи есть.
   */
  private reloadAfterDelete(): void {
    const wasOnlyTaskOnPage = this.tasks().length === 1 && this.pageIndex() > 0;

    if (wasOnlyTaskOnPage) {
      this.pageIndex.set(this.pageIndex() - 1);
    }
    this.load();
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Закрыть', { duration: 3000 });
  }

  /**
   * Сообщение из ApiError показываем только если оно действительно пришло
   * с бэкенда: при обрыве связи в response.error лежит техническая ошибка
   * браузера, которую пользователю видеть незачем.
   */
  private notifyError(response: HttpErrorResponse, fallback: string): void {
    const body = response.error as ApiError | null;
    const serverMessage =
      response.status >= 400 && typeof body?.message === 'string' ? body.message : null;

    this.snackBar.open(serverMessage ?? fallback, 'Закрыть', { duration: 5000 });
  }

  /**
   * Диалог возвращает true, только если бэкенд подтвердил сохранение.
   * Тогда список перезагружается с сервера — локально массив не правим,
   * иначе экран разошёлся бы с тем, что на самом деле в базе.
   */
  private openFormDialog(data: TaskFormDialogData): void {
    const isEdit = data.task != null;

    const dialogRef = this.dialog.open<TaskFormDialog, TaskFormDialogData, boolean>(
      TaskFormDialog,
      { data, width: '560px', maxWidth: '95vw', autoFocus: 'first-tabbable' },
    );

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.notify(isEdit ? 'Задача обновлена' : 'Задача создана');
        this.load();
      }
    });
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
