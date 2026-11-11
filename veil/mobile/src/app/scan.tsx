import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Body, Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { C, Font } from '@/constants/theme';
import { isDemoMode, runScan, ScanError } from '@/lib/api';
import { useStore } from '@/lib/store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEPS = ['Data breaches', 'Leaked passwords', 'Phone settings'];

export default function Scan() {
  const { setReport } = useStore();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = EMAIL_RE.test(email.trim());

  async function start() {
    if (!valid) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const report = await runScan(email.trim().toLowerCase());
      setReport(report);
      router.replace('/score');
    } catch (e) {
      setError(e instanceof ScanError ? e.message : 'Something went wrong. Try again.');
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={s.top}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={s.iconBtn}>
            <Icon name="back" size={18} color={C.text} strokeWidth={2} />
          </Pressable>
          <Eyebrow>{busy ? 'SCAN · IN PROGRESS' : 'NEW SCAN'}</Eyebrow>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ gap: 6 }}>
          <Title>{busy ? 'Mapping your exposure' : 'Which email should we check?'}</Title>
          <Body>
            {busy
              ? 'Checking breach databases. This takes a few seconds.'
              : 'We check it against known data breaches. Your address is never stored or shared.'}
          </Body>
        </View>

        {!busy && (
          <View style={{ gap: 8 }}>
            <Text nativeID="emailLabel" style={s.label}>
              Email address
            </Text>
            <TextInput
              accessibilityLabelledBy="emailLabel"
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={start}
              placeholder="you@example.com"
              placeholderTextColor={C.faint}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="go"
              style={s.input}
            />
            {error && (
              <Text style={s.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
          </View>
        )}

        <View style={{ gap: 10 }}>
          {STEPS.map((step) => (
            <Card key={step} style={s.stepRow}>
              {busy ? (
                <ActivityIndicator color={C.accent} />
              ) : (
                <Icon name="check" size={18} color={C.faint} strokeWidth={2} />
              )}
              <Text style={s.stepText}>{step}</Text>
              <Text style={[s.stepState, { color: busy ? C.accent : C.faint }]}>{busy ? 'CHECKING' : 'READY'}</Text>
            </Card>
          ))}
        </View>

        {!busy && <Button label="Start scan" onPress={start} disabled={!valid} />}
        {isDemoMode && (
          <Text style={s.demo}>Demo mode: no backend is connected, so results are sample data.</Text>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: C.textSoft, fontSize: 14 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    color: C.text,
    fontSize: 16,
  },
  error: { color: C.dangerSoft, fontSize: 13 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  stepText: { flex: 1, color: C.text, fontSize: 15 },
  stepState: { fontFamily: Font.mono, fontSize: 12 },
  demo: { color: C.faint, fontSize: 12, textAlign: 'center' },
});
