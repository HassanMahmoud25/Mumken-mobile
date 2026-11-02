# iOS walkthrough

[Project README](../../README.md)

Captured on November 2, 2026, in Expo Go on an iPhone 17 Pro simulator running iOS 26.5. There are 13 native images: one startup frame and six English/Arabic pairs. Some views are scrolled to show the form and feedback.

The blue Expo Go control and **Demo / تجربة** button are development tools. Selecting a demo scenario resets session comments; each failure happens once, then retry succeeds. Authored text keeps its original language.

## 1. Startup

The Mumken overlay stays for at least 1.2 seconds and fades when fonts and the saved language are ready. It does not replay during normal navigation or background/resume. This frame was extracted from a native launch recording; the overlay is shared by both languages.

<img src="00-startup.png" alt="Mumken startup overlay on iOS" width="300" />

## 2. Updates

Switch language and open an update. The titles, summaries, dates, and layout direction change between English/LTR and Arabic/RTL.

| English | العربية |
| --- | --- |
| <img src="01-records-en.png" alt="Updates in English on iOS" width="300" /> | <img src="01-records-ar.png" alt="Updates in Arabic on iOS" width="300" /> |

## 3. Empty discussion and validation

Choose **Empty discussion / نقاش فارغ**, then submit without entering text. The form shows validation feedback and the discussion invites the first comment.

| English | العربية |
| --- | --- |
| <img src="02-empty-validation-en.png" alt="Empty discussion and validation in English on iOS" width="300" /> | <img src="02-empty-validation-ar.png" alt="Empty discussion and validation in Arabic on iOS" width="300" /> |

## 4. Failed reply

Choose **Next submission fails / فشل الإرسال التالي**, open the first update, and reply to Lina Haddad. The first attempt fails. Both the draft and reply target remain, including when the interface language changes.

| English | العربية |
| --- | --- |
| <img src="03-reply-failure-en.png" alt="Failed reply in English on iOS" width="300" /> | <img src="03-reply-failure-ar.png" alt="Failed reply in Arabic on iOS" width="300" /> |

## 5. Successful retry

Retry the saved reply. The composer clears, a green confirmation appears, and the count increases from five to six. The reply remains under its parent further down the thread.

| English | العربية |
| --- | --- |
| <img src="04-success-en.png" alt="Successful retry in English on iOS" width="300" /> | <img src="04-success-ar.png" alt="Successful retry in Arabic on iOS" width="300" /> |

## 6. Loading error

Choose **Initial load failure / فشل التحميل الأولي**. The error is translated and includes Try again. Retry was checked and restored the list.

| English | العربية |
| --- | --- |
| <img src="05-load-error-en.png" alt="Loading error in English on iOS" width="300" /> | <img src="05-load-error-ar.png" alt="Loading error in Arabic on iOS" width="300" /> |

## 7. Unavailable update

Choose **Unavailable record / تحديث غير متاح**. The screen explains that the update cannot be found and provides a way back to the list.

| English | العربية |
| --- | --- |
| <img src="06-unavailable-en.png" alt="Unavailable update in English on iOS" width="300" /> | <img src="06-unavailable-ar.png" alt="Unavailable update in Arabic on iOS" width="300" /> |

## Review results

The simulator walkthrough checked language switching, opening records, empty-input validation, posting a new comment, reply selection, failed-draft recovery, success feedback, loading-error retry, and missing-record navigation.

All eight repository/model tests, lint, and TypeScript checks passed on November 2, 2026. Tests cover seed data, ordering, session isolation, validation, one-time failures, production demo isolation, and dates. See the [check commands](../../README.md#checks). The native UI was checked separately on the simulator.

Physical-device, reboot, full VoiceOver, and software-keyboard checks remain follow-up work. Storage behavior is documented in the main README.
