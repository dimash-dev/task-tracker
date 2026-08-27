import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/page-response.model';
import { Task } from '../models/task.model';

/**
 * Единственное место в приложении, которое знает адреса бэкенда.
 *
 * Компоненты обращаются сюда и получают готовые данные — им не нужно
 * знать ни URL, ни формат запроса. Захотим сменить адрес или версию
 * API — правим только этот файл.
 *
 * providedIn: 'root' означает, что Angular создаст сервис один раз
 * на всё приложение и сам подставит его туда, где он запрошен.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/tasks`;

  /**
   * Список задач. Бэкенд отдаёт страницу, а не голый массив,
   * поэтому и тип здесь PageResponse<Task>.
   */
  getTasks(): Observable<PageResponse<Task>> {
    return this.http.get<PageResponse<Task>>(this.baseUrl);
  }
}
