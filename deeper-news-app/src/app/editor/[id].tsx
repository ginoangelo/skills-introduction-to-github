import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryArt } from '@/components/story-art';
import { LOCATION_OPTIONS } from '@/data/places';
import { blankStory, cleanStory, copyStory, newStoryId, storyProblems } from '@/data/story-draft';
import { LAYERS, PATH_LABELS, ROOTS_LAYER, type Clip, type HandoffPath, type PathKind, type Story } from '@/data/types';
import { formatTime, parseYouTubeLink } from '@/data/youtube-link';
import { useContent } from '@/state/content';
import { useTokens, type Tokens } from '@/theme/tokens';

const MAX_PATHS = 3;

export default function EditStoryScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { ready, getStory } = useContent();
  const t = useTokens();
  if (!ready) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  let initial: Story | undefined;
  if (id === 'new') {
    const source = from ? getStory(String(from)) : undefined;
    initial = source ? copyStory(source) : blankStory();
  } else {
    const existing = getStory(String(id));
    initial = existing?.draft ? (JSON.parse(JSON.stringify(existing)) as Story) : undefined;
  }
  if (!initial) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <Text style={{ color: t.ink, fontSize: 17 }}>That story isn’t one of yours, so it can’t be edited here.</Text>
        <Pressable onPress={() => router.replace('/editor')} style={[styles.pill, { borderColor: t.line, marginTop: 14 }]}>
          <Text style={{ color: t.ink }}>Back to the editor</Text>
        </Pressable>
      </View>
    );
  }
  return <StoryForm key={`${id}-${from ?? ''}`} initial={initial} isNew={id === 'new'} />;
}

function StoryForm({ initial, isNew }: { initial: Story; isNew: boolean }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { stories, saveDraft, deleteDraft } = useContent();
  const [story, setStory] = useState<Story>(initial);
  const [showProblems, setShowProblems] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const others = stories.filter((s) => s.id !== story.id);
  const knownIds = new Set(others.map((s) => s.id));
  const problems = storyProblems(story, knownIds);

  const set = (patch: Partial<Story>) => setStory((s) => ({ ...s, ...patch }));
  const setClip = (i: number, patch: Partial<Clip>) =>
    setStory((s) => ({ ...s, clips: s.clips.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  const setPath = (i: number, patch: Partial<HandoffPath>) =>
    setStory((s) => ({ ...s, handoff: { ...s.handoff, paths: s.handoff.paths.map((p, j) => (j === i ? { ...p, ...patch } : p)) } }));

  const save = (thenWatch: boolean) => {
    if (problems.length) {
      setShowProblems(true);
      return;
    }
    const final = cleanStory({ ...story, id: story.id || newStoryId(story.short || story.title) });
    saveDraft(final);
    setStory(final);
    setSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    if (thenWatch) router.push({ pathname: '/story/[id]', params: { id: final.id } });
    else if (isNew) router.replace({ pathname: '/editor/[id]', params: { id: final.id } });
  };

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteDraft(story.id);
    router.replace('/editor');
  };

  const decoys = story.predict?.decoys ?? ['', ''];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 140 }}>
        <View style={styles.page}>
          <View style={styles.head}>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/editor'))}
              style={[styles.pill, { borderColor: t.line, backgroundColor: t.surface }]}
              accessibilityRole="button">
              <Text style={{ color: t.ink, fontWeight: '600' }}>← Editor</Text>
            </Pressable>
            <Text style={[styles.h1, { color: t.ink }]}>{isNew ? 'New story' : 'Edit story'}</Text>
          </View>

          <Section t={t} title="The basics">
            <Field t={t} id="title" label="Headline" value={story.title} onChange={(v) => set({ title: v })} placeholder="The Marlow Creek levee gave way at dawn" />
            <View style={styles.twoCol}>
              <Field half t={t} id="short" label="Short name (story circle)" value={story.short} onChange={(v) => set({ short: v })} placeholder="Marlow Creek" />
              <Field half t={t} id="topic" label="Topic" value={story.topic} onChange={(v) => set({ topic: v })} placeholder="Climate & infrastructure" />
            </View>
            <Field
              t={t}
              id="minutes"
              label="Length in minutes"
              value={String(story.minutes)}
              keyboardType="number-pad"
              onChange={(v) => set({ minutes: Math.max(1, Number(v.replace(/\D/g, '')) || 1) })}
            />
          </Section>

          <Section t={t} title="Where it happened" hint="Pick the nearest city; it decides who sees the story under Near you. Then name the exact place.">
            <Chips
              t={t}
              options={LOCATION_OPTIONS.map((c) => ({ value: c.id, label: c.name }))}
              selected={LOCATION_OPTIONS.find((c) => c.lat === story.place.lat && c.lng === story.place.lng)?.id ?? ''}
              onSelect={(cid) => {
                const c = LOCATION_OPTIONS.find((o) => o.id === cid)!;
                set({ place: { name: c.name, region: c.region, country: c.country, countryCode: c.countryCode, lat: c.lat, lng: c.lng } });
              }}
            />
            <Field
              t={t}
              id="place-name"
              label="Place name"
              value={story.place.name}
              onChange={(v) => set({ place: { ...story.place, name: v } })}
              hint={`${story.place.region ? `${story.place.region}, ` : ''}${story.place.country}`}
            />
          </Section>

          <Section t={t} title="Photo" hint="A link to a photo you have the right to use. It shows on the story circle, the card and behind clips without video.">
            <View style={styles.photoRow}>
              <StoryArt story={cleanStory(story)} style={styles.photoPreview} />
              <View style={{ flex: 1, minWidth: 220, gap: 10 }}>
                <Field
                  t={t}
                  id="photo-uri"
                  label="Photo link (https://…)"
                  value={story.image?.uri ?? ''}
                  onChange={(v) => set({ image: { uri: v, alt: story.image?.alt ?? '', credit: story.image?.credit ?? '' } })}
                />
                <Field
                  t={t}
                  id="photo-credit"
                  label="Credit"
                  value={story.image?.credit ?? ''}
                  placeholder="Photographer · license"
                  onChange={(v) => set({ image: { uri: story.image?.uri ?? '', alt: story.image?.alt ?? '', credit: v } })}
                />
              </View>
            </View>
          </Section>

          {story.clips.map((clip, i) => (
            <ClipEditor key={i} t={t} index={i} clip={clip} onChange={(patch) => setClip(i, patch)} />
          ))}

          <Section
            t={t}
            title="What happens next?"
            hint="Before the last clip, viewers guess what followed. The real answer is your Ripples clip title. Write two believable outcomes that did not happen, or leave both empty to skip the guess.">
            <Text style={{ color: t.ink }}>
              <Text style={{ fontWeight: '700' }}>Real answer: </Text>
              {story.clips[story.clips.length - 1]?.title || 'add the Ripples clip title above'}
            </Text>
            <Field t={t} id="decoy-1" label="Wrong answer 1" value={decoys[0]} onChange={(v) => set({ predict: { decoys: [v, decoys[1]] } })} />
            <Field t={t} id="decoy-2" label="Wrong answer 2" value={decoys[1]} onChange={(v) => set({ predict: { decoys: [decoys[0], v] } })} />
          </Section>

          <Section t={t} title="Where it leads" hint="The story ends on a question, then offers up to three paths. The first one plays on its own after a countdown.">
            <Field
              t={t}
              id="question"
              label="The question it ends on"
              value={story.handoff.question}
              placeholder="So why didn’t the state send the money?"
              onChange={(v) => set({ handoff: { ...story.handoff, question: v } })}
            />
            {story.handoff.paths.map((p, i) => (
              <View key={i} style={[styles.pathBox, { borderColor: t.line }]}>
                <View style={styles.pathHead}>
                  <Text style={[styles.label, { color: t.ink }]}>Path {i + 1}{i === 0 ? ' · plays first' : ''}</Text>
                  <Pressable
                    onPress={() => set({ handoff: { ...story.handoff, paths: story.handoff.paths.filter((_, j) => j !== i) } })}
                    accessibilityRole="button">
                    <Text style={{ color: t.warm, fontWeight: '600' }}>Remove</Text>
                  </Pressable>
                </View>
                <Chips
                  t={t}
                  options={(Object.keys(PATH_LABELS) as PathKind[]).map((k) => ({ value: k, label: PATH_LABELS[k] }))}
                  selected={p.kind}
                  onSelect={(k) => setPath(i, { kind: k as PathKind })}
                />
                <Text style={[styles.small, { color: t.muted }]}>Leads to</Text>
                <Chips t={t} options={others.map((s) => ({ value: s.id, label: s.short }))} selected={p.storyId} onSelect={(sid) => setPath(i, { storyId: sid })} />
                <Field t={t} id={`reason-${i}`} label="How they connect" value={p.reason} onChange={(v) => setPath(i, { reason: v })} placeholder="The bill that was supposed to send it, stuck on a tie vote" />
              </View>
            ))}
            {story.handoff.paths.length < MAX_PATHS && (
              <Pressable
                onPress={() => set({ handoff: { ...story.handoff, paths: [...story.handoff.paths, { kind: 'money', storyId: '', reason: '' }] } })}
                style={[styles.pill, { borderColor: t.accent, alignSelf: 'flex-start' }]}
                accessibilityRole="button">
                <Text style={{ color: t.accent, fontWeight: '700' }}>+ Add a path</Text>
              </Pressable>
            )}
          </Section>

          {!isNew && (
            <Pressable onPress={remove} style={[styles.pill, { borderColor: t.warm, alignSelf: 'flex-start' }]} accessibilityRole="button">
              <Text style={{ color: t.warm, fontWeight: '700' }}>{confirmDelete ? 'Tap again to delete this story for good' : 'Delete story'}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View style={[styles.saveBar, { backgroundColor: t.surface, borderColor: t.line, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.page}>
          {showProblems && problems.length > 0 && (
            <View style={{ gap: 2, marginBottom: 8 }}>
              <Text style={{ color: t.warm, fontWeight: '700' }}>
                {problems.length === 1 ? 'One thing to fix before saving:' : `${problems.length} things to fix before saving:`}
              </Text>
              {problems.slice(0, 4).map((p) => (
                <Text key={p} style={{ color: t.ink, fontSize: 13 }}>
                  • {p}
                </Text>
              ))}
              {problems.length > 4 && <Text style={{ color: t.muted, fontSize: 13 }}>and {problems.length - 4} more</Text>}
            </View>
          )}
          <View style={styles.saveRow}>
            <Text style={{ color: t.muted, fontSize: 13, flex: 1, minWidth: 140 }}>
              {savedAt ? `Saved at ${savedAt} on this device` : problems.length ? `${problems.length} fields to finish` : 'Ready to save'}
            </Text>
            <Pressable onPress={() => save(true)} style={[styles.pill, { borderColor: t.line }]} accessibilityRole="button">
              <Text style={{ color: t.ink, fontWeight: '600' }}>Save and watch</Text>
            </Pressable>
            <Pressable onPress={() => save(false)} style={[styles.primary, { backgroundColor: t.accent }]} accessibilityRole="button">
              <Text style={{ color: t.accentInk, fontWeight: '700' }}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function ClipEditor({ t, index, clip, onChange }: { t: Tokens; index: number; clip: Clip; onChange: (patch: Partial<Clip>) => void }) {
  const layer = LAYERS[index];
  const [link, setLink] = useState(clip.youtubeId ? `https://youtu.be/${clip.youtubeId}${clip.startSeconds ? `?t=${clip.startSeconds}` : ''}` : '');
  const parsed = parseYouTubeLink(link);

  const onLink = (v: string) => {
    setLink(v);
    const p = parseYouTubeLink(v);
    onChange(p ? { youtubeId: p.id, startSeconds: p.start } : { youtubeId: undefined, startSeconds: undefined });
  };

  return (
    <Section t={t} title={`${index + 1}. ${layer.name}`} hint={`${layer.depth[0].toUpperCase()}${layer.depth.slice(1)}.${index === ROOTS_LAYER ? ' Usually archive footage or an older decision.' : ''}`}>
      <Field t={t} id={`clip-${index}-title`} label="Clip title" value={clip.title} onChange={(v) => onChange({ title: v })} />
      <Field
        t={t}
        id={`clip-${index}-link`}
        label="YouTube link"
        value={link}
        onChange={onLink}
        placeholder="https://youtu.be/… (copy the link at the moment the clip should start)"
        hint={
          !link
            ? 'Optional. Without one, the story photo shows in the video slot.'
            : parsed
              ? `Found the video. Starts at ${formatTime(parsed.start)}.`
              : 'That doesn’t look like a YouTube link.'
        }
        hintColor={link && !parsed ? t.warm : undefined}
      />
      <View style={styles.twoCol}>
        <Field half t={t} id={`clip-${index}-when`} label="When it was filmed" value={clip.when} onChange={(v) => onChange({ when: v })} placeholder="Day 0, 6:42 a.m." />
        <Field half
          t={t}
          id={`clip-${index}-seconds`}
          label="Seconds to play"
          value={String(clip.seconds)}
          keyboardType="number-pad"
          onChange={(v) => onChange({ seconds: Number(v.replace(/\D/g, '')) || 0 })}
        />
      </View>
      <View style={styles.twoCol}>
        <Field half t={t} id={`clip-${index}-source`} label="Source" value={clip.source} onChange={(v) => onChange({ source: v })} placeholder="Local station" />
        <Field half t={t} id={`clip-${index}-rights`} label="Rights" value={clip.rights} onChange={(v) => onChange({ rights: v })} placeholder="Licensed, Public record…" />
      </View>
      <Field t={t} id={`clip-${index}-why`} label="Why it’s here" value={clip.why} onChange={(v) => onChange({ why: v })} multiline />
    </Section>
  );
}

function Section({ t, title, hint, children }: { t: Tokens; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={[styles.section, { backgroundColor: t.surface, borderColor: t.line }]}>
      <Text style={[styles.h2, { color: t.ink }]}>{title}</Text>
      {hint && <Text style={{ color: t.muted, fontSize: 13, marginTop: -4 }}>{hint}</Text>}
      {children}
    </View>
  );
}

function Field({
  t,
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  hintColor,
  multiline,
  keyboardType,
  half,
}: {
  t: Tokens;
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  hintColor?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  /** Shares a row with another field, side by side when there's room. */
  half?: boolean;
}) {
  return (
    <View style={[styles.field, half && styles.half]}>
      <Text style={[styles.label, { color: t.ink }]}>{label}</Text>
      <TextInput
        id={id}
        nativeID={id}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        accessibilityLabel={label}
        style={[styles.input, multiline && { minHeight: 64, textAlignVertical: 'top' }, { color: t.ink, borderColor: t.line, backgroundColor: t.bg }]}
      />
      {hint && <Text style={{ color: hintColor ?? t.muted, fontSize: 12 }}>{hint}</Text>}
    </View>
  );
}

function Chips({ t, options, selected, onSelect }: { t: Tokens; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const on = o.value === selected;
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.chip, { borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accent : t.bg }]}>
            <Text style={{ color: on ? t.accentInk : t.ink, fontSize: 13, fontWeight: on ? '700' : '500' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 17, fontWeight: '800' },
  section: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 12 },
  twoCol: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  field: { gap: 4 },
  half: { flexGrow: 1, flexBasis: 220 },
  label: { fontSize: 13, fontWeight: '700' },
  small: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  primary: { borderRadius: 999, paddingHorizontal: 22, paddingVertical: 10 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' },
  photoPreview: { width: 96, height: 130, borderRadius: 8 },
  pathBox: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 8 },
  pathHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingTop: 12 },
  saveRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
});
