import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

/**
 * Корневой компонент: верхняя панель и контейнер страницы.
 * <p>
 * Standalone-компонент: зависимости перечислены прямо в imports,
 * отдельный NgModule не нужен.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly appName = 'Task Tracker';
  protected readonly appTagline = 'Manage. Focus. Complete.';
}
