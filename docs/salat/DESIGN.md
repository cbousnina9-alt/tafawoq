# Design — Mihrab

Mode: Operate. Canon direction (category standard, executed with care), chosen by the user.

## Color
- Masjid emerald `--emerald` (#0b5a4a light / #3fae93 dark) for the current prayer, primary actions and the active tab.
- Illumination gold `--gold` (#b0862f / #e0b862) for ornament: star badges, ayah markers, mushaf frame, prayer icons.
- Cool stone ground `--bg` #f2f4f1 with white surfaces; dark theme on near-black green #07110e.
- Sky header colours are time-driven (`data-phase`: night, dawn, morning, day, afternoon, sunset, dusk), computed from the day's prayer times.

## Type
- Display: Reem Kufi (kufic) for page titles and the next-prayer name.
- UI: IBM Plex Sans Arabic, tabular numerals for all times.
- Quran: Amiri Quran, with U+06DD ayah markers.

## Signature
Home opens on a sky whose colour follows the real time of day, with a sun or crescent moon and a mosque silhouette (lit windows after dark); the prayer list rises over it as a sheet.

## Ornament
8-point star (khatam) used as: surah-number badges, a faint tessellation on emerald cards (verse of the day, continue reading), mushaf frame corner rosettes, and the surah-title cartouche. Never as section dividers or emoji.

## Components
Rounded white cards with soft offset shadows; grouped settings lists with coloured icon tiles; pill segmented controls; bottom sheets for actions; floating dark audio player; tab bar with an emerald pill on the active icon.
