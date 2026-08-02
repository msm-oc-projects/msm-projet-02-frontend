import { NotFoundComponent } from './pages/not-found/not-found.component';
import { APP_ROUTES } from './app-routing.module';

describe('App routing', () => {
  it('maps the dedicated error URL to the not-found page', () => {
    const notFoundRoute = APP_ROUTES.find((route) => route.path === 'not-found');

    expect(notFoundRoute?.component).toBe(NotFoundComponent);
  });

  it('redirects every unknown URL to the error page', () => {
    const fallbackRoute = APP_ROUTES.find((route) => route.path === '**');

    expect(fallbackRoute?.redirectTo).toBe('not-found');
  });
});
