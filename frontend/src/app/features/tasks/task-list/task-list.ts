import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TASK_STATUS_LABELS, Task, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

/**
 * Список задач карточками.
 *
 * Компонент не знает ни про HTTP, ни про адреса — он просит данные
 * у TaskService и разбирается только с тем, что показать на экране.
 */
@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {

  private readonly taskService = inject(TaskService);

  /**
   * signal — значение, за которым Angular следит сам: меняем его,
   * и шаблон перерисовывается без всяких ручных обновлений.
   */
  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  /** Загрузка списка. Вызывается при старте и по кнопке «Повторить». */
  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskService.getTasks().subscribe({
      next: (page) => {
        this.tasks.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Не удалось загрузить задачи. Проверьте, что бэкенд запущен на localhost:8080.',
        );
        this.loading.set(false);
      },
    });
  }

  protected statusLabel(status: TaskStatus): string {
    return TASK_STATUS_LABELS[status];
  }
}
