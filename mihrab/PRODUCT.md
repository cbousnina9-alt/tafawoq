# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Muslims everywhere (not Algeria-specific), using a phone through the day to know the next prayer, hear the adhan, read Quran, and find the qibla.

## Product Purpose
Mihrab (مِحراب) is an installable Arabic RTL web app served from `public/salat/` on tafawoq.site: on-device prayer times with adhan, the full Quran with recitation, and a qibla compass. Success: correct times for the user's location and a calm, trustworthy daily companion.

## Capabilities and Constraints
- Vanilla HTML/CSS/JS PWA, no build step; offline via service worker.
- Prayer times from the Adhan library (16 methods, madhab, high-latitude rules, minute offsets).
- Quran text: Tanzil Uthmani (CC BY-SA 4.0) bundled; recitation streamed from Islamic Network.
- Adhan only fires while the app is open (web limitation). No licensed adhan recording is bundled; users can choose their own file.

## Brand Commitments
User asked for the look of established prayer apps (Muslim Pro, Pillars, Athan) with a stronger Islamic character and cleaner organisation.

## Product Principles
- Time first: the next prayer is readable at a glance.
- Familiar over novel: standard app patterns, crafted carefully.
- The Quran is presented with the dignity of a printed mushaf.
