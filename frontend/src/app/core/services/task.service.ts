import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/page-response.model';
import { TaskQuery } from '../models/task-query.model';
import { Task } from '../models/task.model';

/**
 * Единственное место в приложении, которое знает адреса бэкенда.
 *
 * Компоненты обращаются сюда и получают готовые данные — им не нужно
 * знать ни URL, ни формат запроса.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/tasks`;

  /**
   * Список задач с фильтрами, поиском, сортировкой и постранично.
   *
   * Пустые условия в запрос не попадают: адрес получается коротким
   * и читаемым, а бэкенд отличает «фильтр не задан» от «задан пустым».
   */
  getTasks(query: TaskQuery = {}): Observable<PageResponse<Task>> {
    let params = new HttpParams();

    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.tag && query.tag.trim() !== '') {
      params = params.set('tag', query.tag.trim());
    }
    if (query.search && query.search.trim() !== '') {
      params = params.set('search', query.search.trim());
    }
    if (query.page != null) {
      params = params.set('page', query.page);
    }
    if (query.size != null) {
      params = params.set('size', query.size);
    }
    if (query.direction) {
      params = params.set('direction', query.direction);
    }

    return this.http.get<PageResponse<Task>>(this.baseUrl, { params });
  }
}
