import { Routes } from '@angular/router';

import { TaskList } from './features/tasks/task-list/task-list';

/**
 * Маршруты приложения: какой адрес какой экран показывает.
 * Пока экран один — список задач на корневом адресе.
 */
export const routes: Routes = [
  { path: '', component: TaskList },
  { path: '**', redirectTo: '' },
];
