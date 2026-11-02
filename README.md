# Mumken Mobile

A mobile discussion app for browsing updates, posting comments, and replying to other users. Supports English and Arabic with LTR and RTL layouts.

## Stack

Expo SDK 57, React Native, React 19, TypeScript, Expo Router, and Reanimated.

## Run locally

```sh
npm ci
npm start
```

Open in Expo Go, or press `i` for an iOS simulator and `a` for an Android emulator.

## Checks

```sh
npm test
npm run lint
npm run typecheck
```

The app uses local sample data. Submitted comments and replies stay in memory for the current application session only.

## Persistence

- **Language preference:** English/Arabic selection is stored in device `AsyncStorage` under `mumken.locale` and restored before the screens render. Once saved, it survives app closure, a fresh launch, and a device reboot. Clearing app data or uninstalling the app removes the preference. If storage fails, switching still works for the current session, but persistence is not guaranteed.
- **Comments and replies:** New submissions are stored only in the session repository and shared React state. They survive navigation and background/resume while the app process remains alive. Reloading, force-closing and relaunching, a device reboot, or the OS terminating the process starts a new session with the supplied JSON seed. They are never written to `AsyncStorage` or a backend. Selecting a development Demo scenario also resets the discussion session without resetting the language.
- **Drafts and interface state:** Draft text, reply selection, and expanded/collapsed threads are temporary UI state. Failed submissions retain the draft and reply target for retry; drafts are not restored after a fresh app launch.

The assessment requires submitted comments to persist only for the current application session. Persisting the language is an optional usability enhancement.

To verify on a device or simulator: select Arabic, post a comment and a reply, and navigate away and back; both submissions should remain. Force-close and reopen the app, then repeat after a device reboot: Arabic should remain selected, while the new comment and reply should be absent and the original sample discussion restored. Backgrounding alone does not necessarily end the session.

The development-only **Demo** button provides loading, empty, and failure scenarios. Selecting a scenario resets the session; simulated failures happen once, then retry succeeds.

## Technical Decisions & Assumptions

- **Scope and inputs:** The PDF defined the required commenting journey, JSON supplied the local seed, and Figma supplied the visual direction. Comments and one level of replies require no backend.
- **Missing records screen:** Figma supplied the discussion/details screen but omitted the `/records` listing. The listing was inferred from the PDF journey and multiple records in the JSON, retaining the supplied colors, typography and visual language across web and mobile.
- **Visual refinements:** Spacing, header/content alignment, clipped text and icons were refined across both implementations. Mobile adapts that direction to smaller screens, scalable text and touch targets.
- **Motion:** Figma provided no interaction prototype or transition specification. Mobile adds smooth reply disclosure, animated scrolling to the composer and content-shaped loading skeletons, with reduced-motion support.
- **Reply interaction:** Collapsible threads reduce scrolling and start expanded. Reply scrolls to and focuses the existing composer; a “Replying to” bar identifies the author, and Cancel retains the draft. This avoids adding a modal or a second editor for unspecified reply behavior.
- **Validation and recovery:** Whitespace-only input is rejected after trimming; text is limited to 2,000 characters. Duplicate submissions are blocked, comments appear only after success, and failures preserve the draft and reply target for retry. Loading, empty, unavailable and error states cover the remaining journey.
- **Mobile behavior:** Safe-area spacing and keyboard avoidance keep the composer usable. Reply focuses the shared input; successful posting dismisses the keyboard. Expo Router manages the native navigation stack, and the logo is decorative rather than another navigation action.
- **State and data:** Expo Router handles navigation. React Context shares session data and locale; drafts and submission state remain local to the composer. A repository clones the JSON seed and validates writes; comments and replies share a flat collection linked by record and parent IDs. No extra state/data library is needed for this scope.
- **Localization:** Small English/Arabic dictionaries, explicit layout direction and content-aware text styles avoid an additional i18n dependency or a restart when switching languages. The selected language is saved on the device and restored across app restarts. Authored comments keep their language. UTC timestamps display in the device timezone using the Gregorian calendar.
- **Accessibility:** Contextual control names, input guidance, error/success announcements, visible input focus, scalable text and hidden decorative/collapsed content support native assistive technologies. These improvements do not establish full VoiceOver/TalkBack or WCAG conformance.
- **Limits:** The seeded user stands in for authentication. A new session resets submitted comments and replies; only the language preference has durable device storage. There is no backend persistence, pagination or multi-user synchronization. Artificial delays and demo failures are development-only. Physical-device, Android assistive-technology and full screen-reader validation remain follow-up work.
