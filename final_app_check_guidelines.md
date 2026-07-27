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

### Ads & AdMob Compliance

* NSUserTrackingUsageDescription present in info.plist for personalized ads (ATT)
* Externalized Ad Unit IDs (loaded from Environment Variables or Remote Config, never hardcoded)
* Not deceptive (no fake close buttons or misleading overlays)
* Correct layout integration (never overlapping critical controls or covering navigation elements)
* Frequency caps enforced to avoid spamming full-screen App Open / Interstitial ads

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

## F. App Store Optimization (ASO) & Store Presence

Check for:

* Title length (≤ 30 characters) and Subtitle length (≤ 30 characters)
* Targeted search keywords (100-character keyword field fully utilized)
* Compelling promotional text and localization of store metadata for target markets
* App Store screenshots showing core value propositions clearly (first 3 screenshots count most)

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

### Ads & AdMob Compliance

* Declare AD_ID permission in manifest and complete target audience declaration
* Externalized Ad Unit IDs (loaded from Env variables, never hardcoded in package)
* Correct layout integration (no overlap with interactive buttons or system navigation)
* Accidental click prevention (clear margins around native / banner ads)
* Frequency limits enforced for launch / interstitial ads to maintain a premium UX

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

## F. App Store Optimization (ASO) & Store Presence

Check for:

* App Title (≤ 30 characters) and Short Description (≤ 80 characters)
* Natural placement of core search keywords in the Full Description (target 2-3% keyword density)
* Visual asset compliance (1024x500 Feature Graphic, icons, screenshots)
* Localization of titles and descriptions for key regions to increase global reach

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
