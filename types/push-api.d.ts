// Type definitions for Push API
// Extends ServiceWorkerRegistration to include pushManager

interface PushManager {
  getSubscription(): Promise<PushSubscription | null>;
  subscribe(_options?: PushSubscriptionOptionsInit): Promise<PushSubscription>;
  permissionState(
    _options?: PushSubscriptionOptionsInit
  ): Promise<PushPermissionState>;
}

interface PushSubscription {
  endpoint: string;
  options: PushSubscriptionOptions;
  expirationTime: number | null;
  getKey(_name: PushEncryptionKeyName): ArrayBuffer | null;
  toJSON(): PushSubscriptionJSON;
  unsubscribe(): Promise<boolean>;
}

interface PushSubscriptionJSON {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: Record<string, string>;
}

interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: ArrayBuffer | null;
}

interface PushSubscriptionOptionsInit {
  userVisibleOnly?: boolean;
  applicationServerKey?: BufferSource | string | null;
}

type PushEncryptionKeyName = 'p256dh' | 'auth';
type PushPermissionState = 'denied' | 'granted' | 'prompt';

interface ServiceWorkerRegistration extends EventTarget {
  readonly pushManager: PushManager;
}
