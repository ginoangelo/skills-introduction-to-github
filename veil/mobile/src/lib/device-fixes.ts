import { Platform } from 'react-native';

import type { Fix } from './types';

/**
 * Phone-settings fixes Veil can't detect automatically on every platform, so the user
 * confirms them. Each one opens the right Settings screen from the Fixes tab.
 */
export function deviceFixes(): Fix[] {
  const ios = Platform.OS === 'ios';
  return [
    {
      id: 'device-ad-tracking',
      title: 'Limit ad tracking',
      detail: ios
        ? 'Settings › Privacy & Security › Tracking: turn off "Allow Apps to Request to Track".'
        : 'Settings › Privacy › Ads: delete your advertising ID.',
      points: 3,
      severity: 'low',
      minutes: 1,
      source: 'device',
    },
    {
      id: 'device-lock-previews',
      title: 'Hide message previews on the lock screen',
      detail: ios
        ? 'Settings › Notifications › Show Previews: set to "When Unlocked".'
        : 'Settings › Notifications › Notifications on lock screen: hide sensitive content.',
      points: 2,
      severity: 'low',
      minutes: 1,
      source: 'device',
    },
    {
      id: 'device-mic-access',
      title: 'Remove microphone access from apps that don’t need it',
      detail: 'Settings › Privacy › Microphone: switch off any app you wouldn’t talk to.',
      points: 5,
      severity: 'high',
      minutes: 2,
      source: 'device',
    },
    {
      id: 'device-location',
      title: 'Set location to "While Using" for every app',
      detail: 'Settings › Privacy › Location: no app needs "Always" unless it’s navigation.',
      points: 4,
      severity: 'high',
      minutes: 3,
      source: 'device',
    },
  ];
}
