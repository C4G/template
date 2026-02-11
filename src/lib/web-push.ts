import webpush from 'web-push';

// Get public VAPID key (optional at build time, validated at request time)
const publicKeyEnv = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const publicKey: string | undefined = publicKeyEnv;

// Initialize web-push configuration with private key at request time
let webpushConfigured = false;

const ensureWebPushConfigured = () => {
  if (webpushConfigured) return;

  if (!publicKey) {
    throw new Error(
      'NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured. Please check your environment variables.'
    );
  }

  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      'VAPID_PRIVATE_KEY is not configured. Please check your environment variables.'
    );
  }

  webpush.setVapidDetails('mailto:admin@c4g.dev', publicKey, privateKey);
  webpushConfigured = true;
};

export { ensureWebPushConfigured, publicKey, webpush };
