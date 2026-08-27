import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';

import { ApiError } from '../../../core/models/api-error.model';
import { TASK_STATUS_OPTIONS, Task, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

/** Что передаётся в диалог при открытии. Без задачи — режим создания. */
export interface TaskFormDialogData {
  task?: Task;
}

/**
 * Форма создания и редактирования задачи в модальном окне.
 *
 * Диалог закрывается со значением true только после успешного ответа
 * бэкенда — по нему список понимает, что нужно перезагрузиться.
 */
@Component({
  selector: 'app-task-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss',
})
export class TaskFormDialog {

  protected static readonly TITLE_MAX_LENGTH = 120;

  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly dialogRef = inject<MatDialogRef<TaskFormDialog, boolean>>(MatDialogRef);
  private readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);

  protected readonly editedTask = this.data.task ?? null;
  protected readonly isEdit = this.editedTask !== null;

  protected readonly saving = signal(false);
  protected readonly generalError = signal<string | null>(null);

  protected readonly titleMaxLength = TaskFormDialog.TITLE_MAX_LENGTH;

  protected readonly statusOptions = TASK_STATUS_OPTIONS;

  /**
   * Ограничения повторяют серверные: заголовок обязателен и не длиннее 120.
   * Проверка на клиенте — вежливость к пользователю, а не замена серверной:
   * последнее слово всё равно за бэкендом.
   */
  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(TaskFormDialog.TITLE_MAX_LENGTH)]],
    description: [''],
    status: ['TODO' as TaskStatus, Validators.required],
    tags: [''],
  });

  constructor() {
    const task = this.editedTask;
    if (task) {
      this.form.setValue({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        tags: task.tags.join(', '),
      });
    }
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.generalError.set(null);

    const value = this.form.getRawValue();
    const description = value.description.trim();

    const payload = {
      title: value.title.trim(),
      description: description === '' ? null : description,
      status: value.status,
      tags: this.parseTags(value.tags),
    };

    const request$: Observable<Task> = this.editedTask
      ? this.taskService.updateTask(this.editedTask.id, payload)
      : this.taskService.createTask(payload);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (response: HttpErrorResponse) => {
        this.saving.set(false);
        this.showServerError(response);
      },
    });
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Строка «backend, urgent, backend» превращается в ["backend", "urgent"]:
   * пробелы по краям убираются, пустые значения выбрасываются, повторы
   * схлопываются. Нижний регистр — потому что бэкенд всё равно приводит
   * имена тегов к нему, и лучше показать это сразу.
   */
  private parseTags(raw: string): string[] {
    const names = raw
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    return Array.from(new Set(names));
  }

  /**
   * Ошибку с сервера показываем понятным текстом: сообщение из ApiError,
   * а разбивку по полям — рядом с соответствующим полем формы.
   * Никакого стектрейса и технических подробностей.
   */
  private showServerError(response: HttpErrorResponse): void {
    const body = response.error as ApiError | null;

    const titleError = body?.fields?.['title'];
    if (titleError) {
      this.form.controls.title.setErrors({ server: titleError });
      this.form.controls.title.markAsTouched();
    }

    this.generalError.set(
      body?.message ?? 'Не удалось сохранить задачу. Проверьте, что бэкенд запущен.',
    );
  }
}
