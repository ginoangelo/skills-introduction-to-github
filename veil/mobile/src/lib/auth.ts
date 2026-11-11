import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Amazon Cognito sign-in, called directly over HTTPS (no AWS SDK needed, works in Expo Go and on web).
 * Set EXPO_PUBLIC_COGNITO_REGION and EXPO_PUBLIC_COGNITO_CLIENT_ID from the `sam deploy` outputs.
 */
const REGION = process.env.EXPO_PUBLIC_COGNITO_REGION;
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID;
export const authEnabled = !!(REGION && CLIENT_ID);

export type Session = { email: string; accessToken: string; refreshToken: string; expiresAt: number };

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

const FRIENDLY: Record<string, string> = {
  UsernameExistsException: 'An account with this email already exists. Sign in instead.',
  NotAuthorizedException: 'Wrong email or password.',
  UserNotFoundException: 'Wrong email or password.',
  CodeMismatchException: 'That code isn’t right. Check the email and try again.',
  ExpiredCodeException: 'That code expired. Tap "Send a new code".',
  LimitExceededException: 'Too many attempts. Wait a few minutes and try again.',
  TooManyRequestsException: 'Too many attempts. Wait a few minutes and try again.',
  UserNotConfirmedException: 'Confirm your email first. We sent you a code.',
};

async function cognito<T>(action: string, body: Record<string, unknown>): Promise<T> {
  if (!authEnabled) throw new AuthError('Accounts aren’t set up yet.');
  let res: Response;
  try {
    res = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': `AWSCognitoIdentityProviderService.${action}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError('Could not reach the sign-in service. Check your connection.');
  }
  const data = (await res.json().catch(() => ({}))) as T & { __type?: string; message?: string };
  if (!res.ok) {
    const code = data.__type?.split('#').pop();
    const message = (code && FRIENDLY[code]) || data.message || 'Sign-in failed. Try again.';
    throw new AuthError(message, code);
  }
  return data;
}

type AuthResult = { AuthenticationResult?: { AccessToken: string; RefreshToken?: string; ExpiresIn: number } };

export async function signUp(email: string, password: string) {
  await cognito('SignUp', {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email }],
  });
}

export async function confirmSignUp(email: string, code: string) {
  await cognito('ConfirmSignUp', { ClientId: CLIENT_ID, Username: email, ConfirmationCode: code });
}

export async function resendCode(email: string) {
  await cognito('ResendConfirmationCode', { ClientId: CLIENT_ID, Username: email });
}

export async function signIn(email: string, password: string): Promise<Session> {
  const out = await cognito<AuthResult>('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  });
  const r = out.AuthenticationResult;
  if (!r?.RefreshToken) throw new AuthError('Sign-in needs an extra step this app doesn’t support yet.');
  const session = { email, accessToken: r.AccessToken, refreshToken: r.RefreshToken, expiresAt: Date.now() + r.ExpiresIn * 1000 };
  await saveSession(session);
  return session;
}

/** Returns a session with a fresh access token, refreshing it if it expires within a minute. */
export async function freshSession(session: Session): Promise<Session> {
  if (session.expiresAt - Date.now() > 60_000) return session;
  const out = await cognito<AuthResult>('InitiateAuth', {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { REFRESH_TOKEN: session.refreshToken },
  });
  const r = out.AuthenticationResult;
  if (!r) throw new AuthError('Your session ended. Sign in again.', 'NotAuthorizedException');
  const next = { ...session, accessToken: r.AccessToken, expiresAt: Date.now() + r.ExpiresIn * 1000 };
  await saveSession(next);
  return next;
}

export async function signOut(session: Session) {
  await clearSession();
  await cognito('RevokeToken', { ClientId: CLIENT_ID, Token: session.refreshToken }).catch(() => {});
}

/** Deletes the Cognito account itself. Call the backend's DELETE /me first so stored data goes too. */
export async function deleteAccount(session: Session) {
  await cognito('DeleteUser', { AccessToken: session.accessToken });
  await clearSession();
}

// Tokens live in the iOS Keychain / Android Keystore. Web has no secure store, so it falls back to local storage.
const KEY = 'veil.session.v1';
const secure = Platform.OS !== 'web';

async function saveSession(session: Session) {
  const raw = JSON.stringify(session);
  if (secure) await SecureStore.setItemAsync(KEY, raw);
  else await AsyncStorage.setItem(KEY, raw);
}

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = secure ? await SecureStore.getItemAsync(KEY) : await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

async function clearSession() {
  if (secure) await SecureStore.deleteItemAsync(KEY).catch(() => {});
  else await AsyncStorage.removeItem(KEY).catch(() => {});
}
