# 🍎 FINAL APP STORE READINESS AUDIT — iOS v2

## Goal

Perform a **read-only audit** of `coderespite` iOS repo for:

* TestFlight readiness
* App Store submission

---

## A. Security / Repo Hygiene

Check for:

* Hardcoded secrets
* Unsafe logging
* Debug code in Release
* ATS exceptions

### Firebase App Check

* iOS provider:

  * DeviceCheck / App Attest
* Ensure:

  * No debug tokens in production
  * Backend enforces validation

---

## B. App Store Review Readiness

### Authentication

* Apple Sign-In required if Google login exists

### Subscriptions

* Clear pricing
* Restore purchases
* No misleading paywalls

### Ads

* Not deceptive
* Not spammy

---

## C. Build / Release

* Release scheme correct
* Signing config valid
* Bundle ID consistent

---

## D. Privacy / Compliance

### App Tracking Transparency (ATT)

* ATT implemented if tracking used
* `NSUserTrackingUsageDescription` present
* Prompt BEFORE ads/tracking
* No tracking before consent

### Permissions

* Proper usage descriptions
* No unused permissions

---

## E. UX / Reviewability

* No placeholder UI
* Clear first experience
* No dead screens

---

## Output Format

(Same structured audit output)

---

## Final Note

Must comply with:

* App Store Review Guidelines
* ATT enforcement
* Privacy disclosures
* Subscription rules




# 🤖 FINAL PLAY STORE READINESS AUDIT — ANDROID v2

## Goal

Perform a **read-only audit** of the `coderespite` Android repo to determine if it is ready for:

* Google Play Store submission
* Internal / closed testing

Use **current Google Play policies** as benchmark.

---

## Scope

---

## A. Security / Repo Hygiene

Check for:

* Hardcoded API keys / Firebase configs
* Exposed secrets in:

  * `google-services.json`
  * env files
* Unsafe logging (tokens, user data)
* Debug code in release builds
* Insecure storage (SharedPreferences, plaintext)

### Firebase App Check

* Verify App Check is enabled
* Android provider: **Play Integrity API**
* Ensure:

  * Debug tokens NOT in production
  * Backend enforces App Check

---

## B. Play Store Compliance

Check for:

* Broken onboarding / login
* Misleading claims
* Minimum functionality issues

### Ads Compliance

* Ads not deceptive
* No accidental click traps
* Ads not spammy on launch

### Subscription Compliance

* Clear pricing
* Restore purchases works
* No fake paywalls

### Account Management

* Account deletion available (if login exists)

---

## C. Build / Release Readiness

Check for:

* `release` build variant configured
* Signing config valid
* No debug flags in release
* Proguard / R8 rules safe

---

## D. Privacy / Data Safety

Check for:

* Data collection from code
* Firebase / analytics tracking

### Play Data Safety Form Alignment

* Ensure declared data matches actual usage

### Permissions

* Only necessary permissions
* No unused dangerous permissions

---

## E. Product / UX

Check for:

* No dummy UI
* No crashes on fresh install
* Clean onboarding
* No broken screens

---

## Output Format

(Same as iOS version)

* Executive Verdict
* Blockers
* Risks
* Security Findings
* Compliance Findings
* Checklist
* Top Actions

---

## Final Note

Must comply with:

* Google Play Developer Policy
* Data Safety requirements
* Play Integrity (App Check)
