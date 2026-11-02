import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';
import { createRepository, type Scenario } from './repository';
import type { DiscussionData, Locale } from './types';

const LOCALE_KEY = 'mumken.locale';

function useStore() {
  const [locale, setLocale] = useState<Locale>('en');
  const [localeReady, setLocaleReady] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(LOCALE_KEY)
      .then(saved => { if (active && (saved === 'en' || saved === 'ar')) setLocale(saved); })
      .catch(error => console.warn('Unable to restore language', error))
      .finally(() => { if (active) setLocaleReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (localeReady) {
      AsyncStorage.setItem(LOCALE_KEY, locale).catch(error => console.warn('Unable to save language', error));
    }
  }, [locale, localeReady]);
  const [{ scenario, generation, repository }, setSession] = useState(() => ({ scenario: 'normal' as Scenario, generation: 0, repository: createRepository({ development: __DEV__, delay: Number(process.env.EXPO_PUBLIC_DEMO_DELAY_MS ?? 900) }) }));
  const [data, setData] = useState<DiscussionData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    repository.loadInitialData().then(value => { if (active) { setData(value); setStatus('success'); } }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [repository, attempt]);
  const selectScenario = useCallback((next: Scenario) => {
    if (!__DEV__) return;
    setStatus('loading');
    setData(null);
    setSession(value => ({ scenario: next, generation: value.generation + 1, repository: createRepository({ development: __DEV__, scenario: next, delay: Number(process.env.EXPO_PUBLIC_DEMO_DELAY_MS ?? 900) }) }));
  }, []);
  return { localeReady, locale, rtl: locale === 'ar', t: locale === 'ar' ? ar : en, toggleLocale: () => setLocale(l => l === 'en' ? 'ar' : 'en'), data, status, repository, retry: () => { setStatus('loading'); setAttempt(n => n + 1); }, scenario, generation, selectScenario,
    append: (comment: DiscussionData['comments'][number]) => setData(value => value ? { ...value, comments: [...value.comments, comment] } : value) };
}
const Context = createContext<ReturnType<typeof useStore> | null>(null);
export function DiscussionProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  if (!store.localeReady) return null;
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useDiscussion() {
  const context = useContext(Context);
  if (!context) throw new Error('DiscussionProvider is required');
  return context;
}
