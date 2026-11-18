import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export function startMockApi(): Promise<unknown> {
  return worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}

/**
 * Turns mocking back on for this tab after the browser restarted the worker.
 *
 * Browsers stop a service worker that has been idle for a while. When it
 * starts again, the MSW worker has forgotten which tabs it mocks for and lets
 * their requests through to the real server, so the chat stops updating.
 * Announcing the tab again, the way `worker.start()` does, fixes that.
 *
 * Resolves to `true` once the worker confirms, or `false` if this page has no
 * worker (for example after a hard reload) or it does not answer in time.
 */
export function reactivateMockApi(timeoutMs = 2000): Promise<boolean> {
  const container = navigator.serviceWorker;
  const controller = container?.controller;
  if (!controller) return Promise.resolve(false);

  return new Promise((resolve) => {
    const finish = (ok: boolean) => {
      container.removeEventListener('message', onMessage);
      clearTimeout(timer);
      resolve(ok);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MOCKING_ENABLED') finish(true);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    container.addEventListener('message', onMessage);
    controller.postMessage('MOCK_ACTIVATE');
  });
}
