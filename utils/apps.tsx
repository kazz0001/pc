import type { Dispatch, FC } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { AppComponent, AppConstructor } from '@/contexts/App';
import type { AppAction, Apps } from '@/contexts/Apps';

import App from '@/contexts/App';
import { DosAppLoader } from '@/components/Apps/Dos';
import { Explorer } from '@/components/Apps/Explorer';
import { WinampLoader } from '@/components/Apps/Winamp';
import { getFileExtension } from '@/utils/files';

// Q: What is the overlap between AppComponent, App & AppConstructor types?

export type AppLoader = {
  loader: FC<AppComponent>;
  loaderOptions?: Partial<AppConstructor>;
  loadedAppOptions?: Partial<AppComponent>;
};

const appLoader = (url: string): AppLoader | undefined => {
  const { pathname, searchParams } = new URL(url) || {};

  return pathname === '/'
    ? appLoaderByName(searchParams.get('app') || '')
    : appLoaderByFileType(pathname, searchParams);
};

const dosLoaderOptions = {
  hideScrollbars: true,
  lockAspectRatio: true,
  width: 320,
  height: 224
};

const appLoaderByName = (name: string): AppLoader | undefined => {
  switch (name) {
    case 'dos':
      return {
        loader: DosAppLoader,
        loaderOptions: dosLoaderOptions
      };
    case 'explorer':
      return {
        loader: Explorer,
        loaderOptions: {
          width: 450,
          height: 250
        }
      };
    case 'winamp':
      return {
        loader: WinampLoader,
        loaderOptions: {
          windowed: false
        }
      };
  }
};

const appLoaderByFileType = (
  path: string,
  searchParams: URLSearchParams
): AppLoader | undefined => {
  switch (getFileExtension(path)) {
    case 'jsdos':
      return {
        loader: DosAppLoader,
        loaderOptions: dosLoaderOptions,
        loadedAppOptions: {
          url: path,
          args: [...searchParams.entries()].flat()
        }
      };
  }
};

const appToForegroundOthersToBackground = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void =>
  apps.forEach(({ id: appId }) => {
    updateApp({
      id: appId,
      updates: { foreground: id === appId }
    });
  });

// TODO: Stop storing stackOrder in every app
const appToStackTopOnEveryApp = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void =>
  apps.forEach(({ id: appId, stackOrder }) => {
    updateApp({
      id: appId,
      updates: {
        stackOrder: [
          id,
          ...stackOrder.filter((windowId: string) => windowId !== id)
        ]
      }
    });
  });

export const appClose = (apps: Apps, updateApp: Dispatch<AppAction>) => (
  id: string,
  [, newForegroundAppId]: Array<string> // TODO: Does this logic make sense?
): void => {
  if (newForegroundAppId) {
    appFocus(apps, updateApp)(newForegroundAppId);
  }

  // TODO: Does stackOrder make sense the same way anymore?
  // Maybe apps can keep track of this now that its only running
  updateApp({ id });
};

export const appFocus = (apps: Apps, updateApp: Dispatch<AppAction>) => (
  id: string,
  focus = true
): void => {
  if (focus) {
    appToForegroundOthersToBackground(apps, updateApp, id);
    appToStackTopOnEveryApp(apps, updateApp, id);
  } else {
    updateApp({ id, updates: { foreground: false } });
  }
};

export const appMinimize = (updateApp: Dispatch<AppAction>) => (
  id: string,
  minimize = true
): void => {
  if (minimize) {
    updateApp({ updates: { foreground: false, minimized: true }, id });
  } else {
    updateApp({ updates: { foreground: true, minimized: false }, id });
  }
};

export const appOpen = (updateApp: Dispatch<AppAction>) => (
  url: string,
  icon: string,
  name: string
): void => {
  const loader = appLoader(url);

  if (loader) {
    updateApp({
      app: new App({
        loader,
        icon,
        name,
        ...loader.loaderOptions
      })
    });
  }
};

export const appPosition = (updateApp: Dispatch<AppAction>) => (
  id: string
): RndDragCallback => (_event, { x, y }): void =>
  updateApp({ id, updates: { x, y } });

export const appSize = (updateApp: Dispatch<AppAction>) => (
  id: string
): RndResizeCallback => (
  _event,
  _direction,
  { offsetWidth, offsetHeight }
): void =>
  updateApp({ id, updates: { height: offsetHeight, width: offsetWidth } });
