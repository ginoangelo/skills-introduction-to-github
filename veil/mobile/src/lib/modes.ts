export type ModeId = 'surface' | 'low' | 'submerged' | 'ninja';
export type SwitchState = 'on' | 'off' | 'limited';

export type Mode = {
  id: ModeId;
  name: string;
  depth: string;
  tagline: string;
  switches: { label: string; state: SwitchState }[];
};

/**
 * Privacy Modes. Phones don't let apps flip system switches directly, so Veil shows the
 * user what each mode changes and walks them through it. Later versions install an iOS
 * Shortcut + Focus per mode and use Android's Do Not Disturb / VPN-firewall APIs.
 */
export const MODES: Mode[] = [
  {
    id: 'surface',
    name: 'Surface',
    depth: '0 m',
    tagline: 'Normal phone. Veil just watches.',
    switches: [
      { label: 'Ad tracking', state: 'on' },
      { label: 'Location', state: 'on' },
      { label: 'Notifications', state: 'on' },
      { label: 'Calls', state: 'on' },
    ],
  },
  {
    id: 'low',
    name: 'Low Profile',
    depth: '−10 m',
    tagline: 'Less tracking, quieter lock screen',
    switches: [
      { label: 'Ad tracking', state: 'off' },
      { label: 'Lock screen previews', state: 'off' },
      { label: 'Location', state: 'limited' },
      { label: 'Unknown callers', state: 'off' },
    ],
  },
  {
    id: 'submerged',
    name: 'Submerged',
    depth: '−50 m',
    tagline: 'Signals off, favorites only, VPN on',
    switches: [
      { label: 'Bluetooth', state: 'off' },
      { label: 'Wi‑Fi scanning', state: 'off' },
      { label: 'Location', state: 'off' },
      { label: 'Calls', state: 'limited' },
      { label: 'VPN', state: 'on' },
    ],
  },
  {
    id: 'ninja',
    name: 'Ninja',
    depth: '−∞',
    tagline: 'Dark. Encrypted messenger only.',
    switches: [
      { label: 'Cellular data', state: 'off' },
      { label: 'Bluetooth', state: 'off' },
      { label: 'Location', state: 'off' },
      { label: 'Calls + SMS', state: 'off' },
      { label: 'Encrypted messenger', state: 'on' },
      { label: 'VPN', state: 'on' },
    ],
  },
];
