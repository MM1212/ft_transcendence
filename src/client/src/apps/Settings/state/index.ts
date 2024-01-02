import { AtomEffect, atomFamily } from 'recoil';

const localStorageEffect =
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
    default: null,
    effects: (param) => [localStorageEffect(`settings:${param}`)],
  });
})();

export default settingsState;
