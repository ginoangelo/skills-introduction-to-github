/**
 * SAMPLE CONTENT. Every story, town and person here is fictional, including the
 * towns placed in real countries.
 *
 * To add a real clip, set `youtubeId` (the part after `watch?v=` in a YouTube link)
 * and `startSeconds` on a clip. Only use videos published publicly on YouTube by
 * the outlet or agency that made them; the app embeds them, it never re-uploads.
 */
import type { Story, Thread } from './types';

export const STORIES: Story[] = [
  {
    id: 'marlow',
    place: { name: 'Marlow Creek', region: 'Harlan River valley', country: 'United States', countryCode: 'US', lat: 38.35, lng: -85.6 },
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
    predict: { decoys: ['The town votes to abandon its riverfront', 'A federal team takes over the levee repairs'] },
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
    place: { name: 'Ostend Mills', region: 'Harlan River valley', country: 'United States', countryCode: 'US', lat: 37.95, lng: -86.0 },
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
    predict: { decoys: ['Residents sue to stop the new levee', 'The state pays for the levee after all'] },
    handoff: {
      question: 'Will the state ever pay for levees like this?',
      paths: [
        { kind: 'money', storyId: 'funding', reason: 'The bill that was supposed to pay for it' },
        { kind: 'place', storyId: 'marlow', reason: 'Upriver, where this started' },
        { kind: 'people', storyId: 'room-river', reason: 'A Dutch town that moved its dikes back instead' },
      ],
    },
  },
  {
    id: 'funding',
    place: { name: 'State capitol', region: 'Harlan River valley', country: 'United States', countryCode: 'US', lat: 38.2, lng: -84.9 },
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
    predict: { decoys: ['The governor finds the money elsewhere', 'The committee votes again and passes the bill'] },
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
    place: { name: 'River towns', region: 'Harlan River valley', country: 'United States', countryCode: 'US', lat: 38.25, lng: -85.75 },
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
    predict: { decoys: ['The state orders the insurers to come back', 'Premiums fall once the new flood maps are out'] },
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
    place: { name: 'Lock 7', region: 'Harlan River valley', country: 'United States', countryCode: 'US', lat: 38.0, lng: -86.3 },
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
    predict: { decoys: ['The grain moves by rail within a day', 'Grain prices drop across the country'] },
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
    place: { name: 'Halvard Port', region: 'Gulf Coast', country: 'United States', countryCode: 'US', lat: 29.95, lng: -90.07 },
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
    predict: { decoys: ['The strike ends the next morning', 'The port cancels the automated cranes'] },
    handoff: {
      question: 'What happens to the grain stuck upriver?',
      paths: [
        { kind: 'place', storyId: 'grain', reason: 'The barges waiting above Lock 7' },
        { kind: 'people', storyId: 'bayport', reason: 'Workers on another continent training for the same cranes' },
      ],
    },
  },
  {
    id: 'schools',
    place: { name: 'Harlan County', region: 'Harlan River valley', country: 'United States', countryCode: 'US', lat: 38.4, lng: -85.4 },
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
    predict: { decoys: ['The schools move online for the year', 'A donor pays for every repair'] },
    handoff: {
      question: 'When will the schools get money for repairs?',
      paths: [
        { kind: 'money', storyId: 'funding', reason: 'The bill the repairs are waiting on' },
        { kind: 'people', storyId: 'floating-schools', reason: 'Halfway around the world, a village keeps school open on boats' },
        { kind: 'place', storyId: 'marlow', reason: 'The flood that closed the school' },
      ],
    },
  },
  {
    id: 'floating-schools',
    place: { name: 'Char Kalia', region: 'Sundarbans delta', country: 'Bangladesh', countryCode: 'BD', lat: 22.3, lng: 89.6 },
    short: 'Boat schools',
    title: 'In a delta village, school moves onto boats for flood season',
    topic: 'Community',
    hue: 165,
    minutes: 3,
    clips: [
      { title: 'The first boat school pulls up to the landing', when: 'Week 1', source: 'Regional broadcaster', rights: 'Licensed', why: 'The headline.', seconds: 20 },
      { title: 'A morning lesson while the boat moves between villages', when: 'Week 1', source: 'Teacher upload', rights: 'Consent on file', why: 'Shows how a class works when the classroom floats.', seconds: 20 },
      { title: 'A student who hasn’t missed a day this monsoon', when: 'Week 2', source: 'Partner interview', rights: 'Licensed', why: 'In past years she lost months of school to flooding.', seconds: 20 },
      { title: 'Archive: the year the old school washed away', when: '2007', source: 'Regional archive', rights: 'Archive license', why: 'Why the village stopped building schools on land.', seconds: 20 },
      { title: 'Two more districts order boats', when: 'Week 6', source: 'Regional broadcaster', rights: 'Licensed', why: 'The idea starts to spread.', seconds: 20 },
    ],
    predict: { decoys: ['Regulators ban the boats as unsafe', 'The program ends after one season'] },
    handoff: {
      question: 'Could American river towns do something like this?',
      paths: [
        { kind: 'people', storyId: 'schools', reason: 'Teachers in Harlan County working out of borrowed rooms' },
        { kind: 'place', storyId: 'room-river', reason: 'Another country that has learned to live with rising water' },
      ],
    },
  },
  {
    id: 'room-river',
    place: { name: 'Veldmaas', region: 'Meuse valley', country: 'Netherlands', countryCode: 'NL', lat: 51.4, lng: 5.9 },
    short: 'Veldmaas',
    title: 'A Dutch river town moves its dikes back and lets the river in',
    topic: 'Climate & infrastructure',
    hue: 210,
    minutes: 4,
    clips: [
      { title: 'The new floodplain opens', when: 'Day 0', source: 'Regional broadcaster', rights: 'Licensed', why: 'The headline.', seconds: 20 },
      { title: 'Drone footage: the old dike line and the new one', when: 'Day 0', source: 'Water board', rights: 'Public record', why: 'Shows how much land was handed back to the river.', seconds: 20 },
      { title: 'A farmer who sold his fields to the project', when: 'Day 2', source: 'Partner interview', rights: 'Licensed', why: 'Not everyone wanted to move.', seconds: 20 },
      { title: 'Archive: the near-flood that started the plan', when: '1995', source: 'National archive', rights: 'Archive license', why: 'Why the country changed its approach.', seconds: 20 },
      { title: 'The first high water since the dikes moved', when: 'Month 4', source: 'Resident upload', rights: 'Consent on file', why: 'The test the plan was built for.', seconds: 20 },
    ],
    predict: { decoys: ['The town rebuilds the old dikes', 'Farmers win a court case to reverse the plan'] },
    handoff: {
      question: 'Is a higher wall or more room for the river the better bet?',
      paths: [
        { kind: 'place', storyId: 'ostend', reason: 'An American town choosing the opposite: a higher levee' },
        { kind: 'people', storyId: 'floating-schools', reason: 'A village that adapted instead of building walls' },
      ],
    },
  },
  {
    id: 'bayport',
    place: { name: 'Bayport', region: 'Lagos coast', country: 'Nigeria', countryCode: 'NG', lat: 6.45, lng: 3.4 },
    short: 'Bayport',
    title: 'Dockworkers in a West African port train for automated cranes',
    topic: 'Labor',
    hue: 20,
    minutes: 3,
    clips: [
      { title: 'The first automated crane arrives by ship', when: 'Day 0', source: 'Regional broadcaster', rights: 'Licensed', why: 'The headline.', seconds: 20 },
      { title: 'Inside the training simulator', when: 'Day 3', source: 'Port authority', rights: 'Public record', why: 'Workers learn to run the cranes from a control room.', seconds: 20 },
      { title: 'A crane operator choosing to retrain', when: 'Day 3', source: 'Partner interview', rights: 'Licensed', why: 'He sees it differently from the Halvard strikers.', seconds: 20 },
      { title: 'The union deal that made training part of the plan', when: '2024', source: 'Union recording', rights: 'Publisher permission', why: 'Why there was no strike here.', seconds: 20 },
      { title: 'Ships start choosing this port over others', when: 'Month 3', source: 'Regional broadcaster', rights: 'Licensed', why: 'What faster loading means for trade.', seconds: 20 },
    ],
    predict: { decoys: ['Workers strike, just like in Halvard', 'The cranes are shipped back'] },
    handoff: {
      question: 'Why did one port strike while this one retrained?',
      paths: [{ kind: 'people', storyId: 'port', reason: 'Halvard dockworkers striking over the same cranes' }],
    },
  },
];

export const THREADS: Thread[] = [
  { id: 'harlan-river', name: 'Harlan River flooding', kind: 'Place', storyIds: ['marlow', 'ostend', 'grain', 'schools'] },
  { id: 'flood-budget', name: 'State flood budget', kind: 'Decision', storyIds: ['funding', 'marlow', 'ostend', 'schools'] },
  { id: 'insurance', name: 'Insurance in river towns', kind: 'Issue', storyIds: ['insurers', 'marlow', 'grain'] },
  { id: 'store-owner', name: 'The Front Street store owner', kind: 'Person', storyIds: ['marlow', 'insurers'] },
  { id: 'river-freight', name: 'River freight', kind: 'Issue', storyIds: ['grain', 'port'] },
  { id: 'rising-water', name: 'Living with rising water', kind: 'Issue', storyIds: ['marlow', 'ostend', 'room-river', 'floating-schools'] },
  { id: 'cranes-and-jobs', name: 'Cranes and jobs', kind: 'Issue', storyIds: ['port', 'bayport'] },
];

const byId = new Map(STORIES.map((s) => [s.id, s]));

export function getStory(id: string): Story | undefined {
  return byId.get(id);
}

/** Stories this one connects to, through its hand-off paths. */
export function connectedStories(story: Story): Story[] {
  return story.handoff.paths.map((p) => byId.get(p.storyId)).filter((s): s is Story => !!s);
}
