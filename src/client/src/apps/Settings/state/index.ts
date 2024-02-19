import { AtomEffect, atomFamily } from 'recoil';

export type KeySettingsKey =
  | 'Move Up'
  | 'Move Down'
  | 'Move Left'
  | 'Move Right'
  | 'Snowball'
  | 'Dance'
  | 'Wave'
  | 'Sit';

export type KeySettings = {
  [key in KeySettingsKey]: string;
};

export const keySettingsDefault : KeySettings = {
  'Move Up': 'w',
  'Move Down': 's',
  'Move Left': 'a',
  'Move Right': 'd',
  Snowball: 'f',
  Dance: 'g',
  Wave: 'h',
  Sit: 'j',
};

export const localStorageEffect =
  (key: string): AtomEffect<unknown> =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

const settingsState = new (class SettingsState {
  storage = atomFamily<unknown, string>({
    key: 'settings/storage',
    default: keySettingsDefault,
    effects: (param) => [localStorageEffect(`settings:${param}`)],
  });
})();

export default settingsState;
