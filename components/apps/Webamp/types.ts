import type { Position } from 'react-rnd';

type WebampDispatchOptionalProps = {
  positions?: {
    main: Position;
    playlist: Position;
  };
  windowId?: string;
  window?: string;
};

type WebampDispatch = WebampDispatchOptionalProps & {
  type: string;
};

export type WebampCI = {
  close: () => void;
  dispose: () => void;
  onWillClose: (cb: (cancel: () => void) => void) => () => void;
  onMinimize: (cb: () => void) => () => void;
  renderWhenReady: (domNode: HTMLElement) => Promise<void>;
  store: {
    dispatch: (command: WebampDispatch) => void;
  };
};

type Track = {
  metaData: {
    artist?: string;
    title: string;
  };
  url: string;
};

export type WebampOptions = {
  initialSkin?: {
    url: string;
  };
  initialTracks?: Track[];
};

interface WebampConstructor {
  new (options?: WebampOptions): WebampCI;
}

declare global {
  interface Window {
    Webamp: WebampConstructor;
  }
}
