/**
 * SAMPLE CONTENT. Every story, town and person here is fictional.
 *
 * To add a real clip, set `youtubeId` (the part after `watch?v=` in a YouTube link)
 * and `startSeconds` on a clip. Only use videos published publicly on YouTube by
 * the outlet or agency that made them; the app embeds them, it never re-uploads.
 */
import type { Story, Thread } from './types';

export const STORIES: Story[] = [
  {
    id: 'marlow',
    short: 'Marlow Creek',
    title: 'The Marlow Creek levee gave way at dawn',
    topic: 'Climate & infrastructure',
    hue: 192,
    minutes: 4,
    clips: [
      { title: 'Evening bulletin: the levee gives way', when: 'Day 0, 6:00 p.m.', source: 'Local station', rights: 'Licensed', why: 'The version most people saw first. The clips after it show what the bulletin left out.', seconds: 20 },
      { title: 'A porch camera catches the first water', when: 'Day 0, 6:42 a.m.', source: 'Resident upload', rights: 'Consent on file', why: 'The earliest footage. It puts the breach 40 minutes before the first emergency call.', seconds: 20 },
      { title: 'Volunteer boat crew, helmet camera', when: 'Day 0, 9:05 a.m.', source: 'Volunteer upload', rights: 'Consent on file', why: 'A first-person view of the rescues on Front Street.', seconds: 20 },
      { title: '2019: the council puts off levee repairs', when: '2019', source: 'Town meeting archive', rights: 'Public record', why: 'A 4–3 vote pushed the repairs back five years.', seconds: 20 },
      { title: 'State hearing on emergency flood funds', when: 'Day 9', source: 'State legislature feed', rights: 'Public record', why: "The town's request cites the county's drone survey.", seconds: 20 },
    ],
    handoff: {
      question: "So why didn't the state send the money?",
      paths: [
        { kind: 'money', storyId: 'funding', reason: 'The bill that was supposed to send it, stuck on a tie vote' },
        { kind: 'people', storyId: 'insurers', reason: "The Front Street store owner's insurer pulls out" },
        { kind: 'place', storyId: 'ostend', reason: 'Downriver, the next town decides not to wait' },
      ],
    },
  },
  {
    id: 'ostend',
    short: 'Ostend Mills',
    title: 'Ostend Mills votes to raise its own levee',
    topic: 'Climate & infrastructure',
    hue: 204,
    minutes: 3,
    clips: [
      { title: 'Council recap: a 6–1 vote', when: 'Day 40', source: 'Local station', rights: 'Licensed', why: 'The headline.', seconds: 20 },
      { title: 'The town engineer walks the low section', when: 'Day 38', source: 'Town channel', rights: 'Public record', why: 'Shows exactly which stretch the vote covers.', seconds: 20 },
      { title: 'Residents at the microphone', when: 'Day 40', source: 'Town meeting archive', rights: 'Public record', why: 'Two speakers say they watched the Marlow Creek footage.', seconds: 20 },
      { title: 'Archive: the 1998 flood reaches Ostend Mills', when: '1998', source: 'Regional archive', rights: 'Archive license', why: 'The same flood that hit Marlow Creek.', seconds: 20 },
      { title: 'Contractors tour the levee site', when: 'Day 60', source: 'Local station', rights: 'Licensed', why: 'The first work under the new plan.', seconds: 20 },
    ],
    handoff: {
      question: 'Will the state ever pay for levees like this?',
      paths: [
        { kind: 'money', storyId: 'funding', reason: 'The bill that was supposed to pay for it' },
        { kind: 'place', storyId: 'marlow', reason: 'Upriver, where this started' },
      ],
    },
  },
  {
    id: 'funding',
    short: 'Flood budget',
    title: 'The state flood-fund bill stalls in committee',
    topic: 'Politics',
    hue: 252,
    minutes: 4,
    clips: [
      { title: 'The finance committee stalls the bill', when: 'Day 30', source: 'State legislature feed', rights: 'Public record', why: 'The headline.', seconds: 20 },
      { title: 'The 5–5 vote, full recording', when: 'Day 30', source: 'State legislature feed', rights: 'Public record', why: 'The tie happens at 23:20 in the recording.', seconds: 20 },
      { title: "Marlow Creek's mayor after the vote", when: 'Day 30', source: 'Partner interview', rights: 'Licensed', why: 'Her town asked for the largest share.', seconds: 20 },
      { title: '2021: the flood reserve is cut by a third', when: '2021', source: 'State legislature feed', rights: 'Public record', why: 'Why the fund was short to begin with.', seconds: 20 },
      { title: 'Ostend Mills decides to pay for its own levee', when: 'Day 40', source: 'Local station', rights: 'Licensed', why: 'One town stops waiting for the state.', seconds: 20 },
    ],
    handoff: {
      question: "Who pays when the state doesn't?",
      paths: [
        { kind: 'money', storyId: 'insurers', reason: 'Insurers start pulling out of river towns' },
        { kind: 'place', storyId: 'ostend', reason: 'The town that paid for its own levee' },
        { kind: 'people', storyId: 'schools', reason: 'Teachers working out of borrowed buildings' },
      ],
    },
  },
  {
    id: 'insurers',
    short: 'Insurance',
    title: 'Two insurers stop writing policies in river towns',
    topic: 'Economy',
    hue: 28,
    minutes: 3,
    clips: [
      { title: 'Two insurers pull back', when: 'Day 21', source: 'Partner report', rights: 'Licensed', why: 'The headline.', seconds: 20 },
      { title: 'Industry briefing on the new flood maps', when: 'Day 18', source: 'Webinar recording', rights: 'Publisher permission', why: 'The slide at 12:40 lists the affected zip codes.', seconds: 20 },
      { title: 'The Front Street store owner reads her renewal letter', when: 'Day 21', source: 'Partner interview', rights: 'Licensed', why: 'You may have met her in the Marlow Creek story.', seconds: 20 },
      { title: 'The county flood map, last revised in 2009', when: '2009', source: 'County records', rights: 'Public record', why: 'The maps insurers had been using until now.', seconds: 20 },
      { title: 'A grain elevator loses its coverage', when: 'Day 25', source: 'Partner report', rights: 'Licensed', why: 'This leads into the river freight story.', seconds: 20 },
    ],
    handoff: {
      question: "What happens to a business that can't get insured?",
      paths: [
        { kind: 'money', storyId: 'grain', reason: 'A grain elevator stuck with nowhere to ship' },
        { kind: 'people', storyId: 'marlow', reason: "Where the store owner's story began" },
      ],
    },
  },
  {
    id: 'grain',
    short: 'River freight',
    title: 'Grain barges back up while the river stays closed',
    topic: 'Economy',
    hue: 46,
    minutes: 3,
    clips: [
      { title: 'Barges stack up above Lock 7', when: 'Day 12', source: 'Local station', rights: 'Licensed', why: 'The headline.', seconds: 20 },
      { title: 'Idle barges, filmed from the bank', when: 'Day 10', source: 'Resident upload', rights: 'Consent on file', why: 'The lock below Marlow Creek is still shut for debris.', seconds: 20 },
      { title: 'An elevator operator on the wait', when: 'Day 12', source: 'Partner interview', rights: 'Licensed', why: "He's paying to store grain he can't ship.", seconds: 20 },
      { title: '2020 report on the lock repair backlog', when: '2020', source: 'Federal agency briefing', rights: 'Public record', why: 'Lock 7 was already on the repair list.', seconds: 20 },
      { title: 'Halvard Port backs up too', when: 'Day 15', source: 'Local station', rights: 'Licensed', why: 'The same cargo was due at the port.', seconds: 20 },
    ],
    handoff: {
      question: 'Where was all that grain supposed to go?',
      paths: [
        { kind: 'place', storyId: 'port', reason: 'A port already shut down by a strike' },
        { kind: 'money', storyId: 'insurers', reason: 'Why the elevator lost its insurance' },
      ],
    },
  },
  {
    id: 'port',
    short: 'Halvard Port',
    title: 'Halvard dockworkers strike over automated cranes',
    topic: 'Labor',
    hue: 346,
    minutes: 3,
    clips: [
      { title: 'Dockworkers walk out', when: 'Day 14', source: 'Partner feed', rights: 'Licensed', why: 'The headline.', seconds: 20 },
      { title: 'The picket line at Gate 3', when: 'Day 14', source: 'Worker upload', rights: 'Consent on file', why: 'Filmed by a picketer at the shift change.', seconds: 20 },
      { title: 'A crane operator of 22 years', when: 'Day 14', source: 'Partner interview', rights: 'Licensed', why: 'He explains what the new cranes would replace.', seconds: 20 },
      { title: '2023: the automation clause is tabled', when: '2023', source: 'Union livestream', rights: 'Publisher permission', why: 'The dispute was postponed, not settled.', seconds: 20 },
      { title: 'Grain shippers caught in both', when: 'Day 15', source: 'Local station', rights: 'Licensed', why: 'The river closure and the strike hit the same cargo.', seconds: 20 },
    ],
    handoff: {
      question: 'What happens to the grain stuck upriver?',
      paths: [{ kind: 'place', storyId: 'grain', reason: 'The barges waiting above Lock 7' }],
    },
  },
  {
    id: 'schools',
    short: 'Harlan schools',
    title: 'Harlan County schools reopen in borrowed buildings',
    topic: 'Community',
    hue: 150,
    minutes: 3,
    clips: [
      { title: 'Schools reopen a week after the flood', when: 'Day 7', source: 'Local station', rights: 'Licensed', why: 'The headline.', seconds: 20 },
      { title: 'First morning at the church hall', when: 'Day 7', source: 'Parent upload', rights: 'Consent on file', why: 'Thirty desks in a room built for dinners.', seconds: 20 },
      { title: 'A teacher whose classroom was on Front Street', when: 'Day 7', source: 'Partner interview', rights: 'Licensed', why: 'Her school is two doors from the hardware store.', seconds: 20 },
      { title: 'The 1998 flood closed the same school', when: '1998', source: 'Regional archive', rights: 'Archive license', why: 'It reopened four months later.', seconds: 20 },
      { title: 'Repair money depends on the stalled bill', when: 'Day 30', source: 'State legislature feed', rights: 'Public record', why: 'This leads into the flood budget story.', seconds: 20 },
    ],
    handoff: {
      question: 'When will the schools get money for repairs?',
      paths: [
        { kind: 'money', storyId: 'funding', reason: 'The bill the repairs are waiting on' },
        { kind: 'place', storyId: 'marlow', reason: 'The flood that closed the school' },
      ],
    },
  },
];

export const THREADS: Thread[] = [
  { id: 'harlan-river', name: 'Harlan River flooding', kind: 'Place', storyIds: ['marlow', 'ostend', 'grain', 'schools'] },
  { id: 'flood-budget', name: 'State flood budget', kind: 'Decision', storyIds: ['funding', 'marlow', 'ostend', 'schools'] },
  { id: 'insurance', name: 'Insurance in river towns', kind: 'Issue', storyIds: ['insurers', 'marlow', 'grain'] },
  { id: 'store-owner', name: 'The Front Street store owner', kind: 'Person', storyIds: ['marlow', 'insurers'] },
  { id: 'river-freight', name: 'River freight', kind: 'Issue', storyIds: ['grain', 'port'] },
];

const byId = new Map(STORIES.map((s) => [s.id, s]));

export function getStory(id: string): Story | undefined {
  return byId.get(id);
}

/** Stories this one connects to, through its hand-off paths. */
export function connectedStories(story: Story): Story[] {
  return story.handoff.paths.map((p) => byId.get(p.storyId)).filter((s): s is Story => !!s);
}
