import { LogBox } from 'react-native';

/**
 * Warnings emitted by dependencies that we can't fix from here.
 *
 * - InteractionManager: @react-navigation/stack v6 still calls
 *   InteractionManager.createInteractionHandle() in views/Stack/Card.tsx, which
 *   trips the RN 0.86 deprecation getter on `react-native`'s index. Nothing in
 *   this app uses InteractionManager directly.
 */
const IGNORED_WARNINGS = ['InteractionManager has been deprecated'];

if (__DEV__) {
  // Hides the in-app LogBox toast.
  LogBox.ignoreLogs(IGNORED_WARNINGS);

  // LogBox doesn't stop the message from being forwarded to the Metro terminal,
  // so filter it at the console too.
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      IGNORED_WARNINGS.some((warning) => (args[0] as string).includes(warning))
    ) {
      return;
    }
    originalWarn(...args);
  };
}
