import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

/**
 * Настройка приложения. В standalone-архитектуре всё, что раньше
 * объявлялось в NgModule, регистрируется здесь как provider.
 *
 * provideHttpClient добавлен заранее: без него компоненты не смогут
 * обращаться к бэкенду. Сами запросы появятся на следующем этапе.
 *
 * Angular Material 21 не требует отдельного пакета анимаций —
 * @angular/animations нет в его peer-зависимостях, поэтому
 * provideAnimations здесь не нужен.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};
