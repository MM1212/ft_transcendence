import {
  RecoilState,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import settingsState from '../state';

export const useSetting = <T>(key: string) =>
  useRecoilState<T>(settingsState.storage(key) as RecoilState<T>);

export const useSettingValue = <T>(key: string) =>
  useRecoilValue<T>(settingsState.storage(key) as RecoilState<T>);

export const useSetSettingValue = <T>(key: string) =>
  useSetRecoilState<T>(settingsState.storage(key) as RecoilState<T>);

