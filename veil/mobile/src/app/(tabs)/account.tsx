import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Body, Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { C } from '@/constants/theme';
import { useAccount } from '@/lib/account';
import { AuthError, confirmSignUp, resendCode, signUp } from '@/lib/auth';

type Step = 'signIn' | 'signUp' | 'confirm';

export default function AccountScreen() {
  const account = useAccount();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ gap: 2 }}>
          <Eyebrow>ACCOUNT</Eyebrow>
          <Title>{account.status === 'signedIn' ? 'You’re signed in' : 'Keep your progress safe'}</Title>
        </View>
        {!account.available ? (
          <Card>
            <Text style={s.cardTitle}>Accounts aren’t switched on yet</Text>
            <Body>
              This build is in demo mode. Once Veil’s server is deployed, you can create an account here and your fixes
              and privacy mode will follow you to any phone.
            </Body>
          </Card>
        ) : account.status === 'loading' ? null : account.status === 'signedIn' ? (
          <SignedIn />
        ) : (
          <SignedOut />
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function SignedIn() {
  const { email, syncError, signOut, deleteAccount } = useAccount();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t delete your account. Try again.');
      setBusy(false);
    }
  }

  return (
    <>
      <Card>
        <Text style={s.label}>Signed in as</Text>
        <Text style={s.cardTitle}>{email}</Text>
        <View style={s.syncRow}>
          <Icon name={syncError ? 'alert' : 'check'} size={16} color={syncError ? C.warn : C.accent} strokeWidth={2} />
          <Text style={{ color: syncError ? C.warnSoft : C.muted, fontSize: 13, flex: 1 }}>
            {syncError ?? 'Your fixes and privacy mode are synced to your account.'}
          </Text>
        </View>
      </Card>

      <Button label="Sign out" variant="secondary" onPress={() => signOut()} />

      <Card style={{ borderColor: '#3A2219' }}>
        <Text style={s.cardTitle}>Delete account</Text>
        <Body>Permanently deletes your account and everything Veil stores about you. This can’t be undone.</Body>
        {confirming ? (
          <View style={{ gap: 10 }}>
            <Pressable accessibilityRole="button" disabled={busy} onPress={remove} style={s.danger}>
              <Text style={s.dangerText}>{busy ? 'Deleting…' : 'Yes, delete everything'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setConfirming(false)} style={s.textBtn}>
              <Text style={{ color: C.textSoft, fontSize: 14 }}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setConfirming(true)} style={s.textBtn}>
            <Text style={{ color: C.dangerSoft, fontSize: 14, fontWeight: '600' }}>Delete my account</Text>
          </Pressable>
        )}
        {error && <Text style={s.error}>{error}</Text>}
      </Card>
    </>
  );
}

function SignedOut() {
  const { signIn } = useAccount();
  const [step, setStep] = useState<Step>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const cleanEmail = email.trim().toLowerCase();

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await task();
    } catch (e) {
      if (e instanceof AuthError && e.code === 'UserNotConfirmedException') {
        await resendCode(cleanEmail).catch(() => {});
        setStep('confirm');
      }
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const submit = () =>
    run(async () => {
      if (step === 'signIn') {
        await signIn(cleanEmail, password);
      } else if (step === 'signUp') {
        if (password.length < 10 || !/[0-9]/.test(password) || !/[a-z]/.test(password)) {
          throw new Error('Use at least 10 characters with a lowercase letter and a number.');
        }
        await signUp(cleanEmail, password);
        setStep('confirm');
        setNotice(`We emailed a 6-digit code to ${cleanEmail}.`);
      } else {
        await confirmSignUp(cleanEmail, code.trim());
        await signIn(cleanEmail, password);
      }
    });

  return (
    <>
      <Body>
        {step === 'confirm'
          ? 'Enter the code we emailed you to finish creating your account.'
          : 'An account saves your fixes and privacy mode so they follow you to a new phone. Your scan results stay on this device.'}
      </Body>

      {step !== 'confirm' && (
        <View style={s.segment}>
          {(['signIn', 'signUp'] as const).map((id) => {
            const on = step === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  setStep(id);
                  setError(null);
                }}
                style={[s.segmentBtn, on && { backgroundColor: C.text }]}>
                <Text style={{ color: on ? C.bg : C.textSoft, fontWeight: '600', fontSize: 14 }}>
                  {id === 'signIn' ? 'Sign in' : 'Create account'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {step === 'confirm' ? (
        <Field label="Verification code" value={code} onChange={setCode} keyboardType="number-pad" autoComplete="one-time-code" />
      ) : (
        <>
          <Field label="Email" value={email} onChange={setEmail} keyboardType="email-address" autoComplete="email" />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            secure
            autoComplete={step === 'signUp' ? 'new-password' : 'current-password'}
            hint={step === 'signUp' ? 'At least 10 characters, with a lowercase letter and a number.' : undefined}
          />
        </>
      )}

      {notice && <Text style={{ color: C.accent, fontSize: 13 }}>{notice}</Text>}
      {error && (
        <Text style={s.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      <Button
        label={step === 'signIn' ? 'Sign in' : step === 'signUp' ? 'Create account' : 'Confirm and sign in'}
        onPress={submit}
        loading={busy}
        disabled={step === 'confirm' ? code.trim().length < 6 : !cleanEmail.includes('@') || !password}
      />
      {step === 'confirm' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => run(async () => { await resendCode(cleanEmail); setNotice('New code sent.'); })}
          style={s.textBtn}>
          <Text style={{ color: C.accent, fontSize: 14 }}>Send a new code</Text>
        </Pressable>
      )}
    </>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  secure?: boolean;
  hint?: string;
  keyboardType?: 'email-address' | 'number-pad';
  autoComplete?: 'email' | 'new-password' | 'current-password' | 'one-time-code';
}) {
  const id = `field-${props.label.replace(/\W/g, '')}`;
  return (
    <View style={{ gap: 8 }}>
      <Text nativeID={id} style={s.label}>
        {props.label}
      </Text>
      <TextInput
        accessibilityLabelledBy={id}
        value={props.value}
        onChangeText={props.onChange}
        secureTextEntry={props.secure}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={props.keyboardType}
        autoComplete={props.autoComplete}
        placeholderTextColor={C.faint}
        style={s.input}
      />
      {props.hint && <Text style={{ color: C.faint, fontSize: 12 }}>{props.hint}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  cardTitle: { color: C.text, fontSize: 16, fontWeight: '600' },
  label: { color: C.textSoft, fontSize: 14 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  segment: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  segmentBtn: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  input: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, paddingHorizontal: 16, color: C.text, fontSize: 16 },
  error: { color: C.dangerSoft, fontSize: 13 },
  textBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  danger: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.dangerTint, borderWidth: 1, borderColor: '#5A2A1C' },
  dangerText: { color: C.dangerSoft, fontSize: 15, fontWeight: '600' },
});
