# CS229 daily study panel

A local, dependency-free dashboard for `CS229_ML_Fundamentals_Daily_Plan_2026.pdf`.

## Open

From `/Users/ququ/CSAPP`:

```sh
python3 -m http.server 5175 --bind 127.0.0.1 --directory cs229-dashboard
```

Visit http://127.0.0.1:5175. Keep the same browser and address to retain progress.
The HTML can also open directly, but browser storage behavior for local files varies.

## Use

- Today follows the device's local date. Browsing another date does not change the current-phase/topic summary.
- Select a day, navigate weeks, use the date picker, or click a phase or milestone.
- Mark a session complete after its tasks and stop condition are met. Click again to undo.
- Progress is saved only in this browser. A storage warning appears if saving is unavailable.
- Overall and phase progress count all 93 scheduled days. ML sessions (54) and CSAPP/buffer days (39) also have separate counts.
- Unfinished past ML sessions remain on their original dates. The backlog link opens the earliest one.
- Milestones are fixed-date targets, not automatically certified by checking a day complete.

## Source fidelity

The sole curriculum source is the supplied PDF, September 19–December 20, 2026:
93 consecutive dates, 400 daily bullets, 7 phases, 7 milestones, and 12 final mastery questions.

`schedule.json` is the immutable extracted curriculum. `schedule.js` is the same data packaged for direct browser loading. Progress is stored separately under `cs229.daily-plan.2026.progress.v1`.

Original daily bullet order and done conditions are retained. Only PDF line-wrap artifacts are normalized. Day titles are short excerpts from their own source row; category labels help scanning without moving tasks. The PDF has one “Done when” column, so it appears as the combined “Mastery check / Done & stop condition,” rather than inventing a separate assessment. If no separate math patch is specified, the dashboard says so.

The source's lecture/version references remain plain task text. The app contains no resource library, course links, external fonts, analytics, or remote requests.

## Re-extract

Using Poppler's `pdftotext`:

```sh
pdftotext -bbox-layout /path/to/CS229_ML_Fundamentals_Daily_Plan_2026.pdf /tmp/cs229-plan.xml
python3 cs229-dashboard/scripts/extract_plan.py /tmp/cs229-plan.xml
```

The parser validates every date, weekday, and required row. Do not hand-edit the generated curriculum.

## Verification

`scripts/verify.cjs` uses Playwright and Chrome for an isolated test browser. With Playwright available through Node's module path and the server running:

```sh
TZ=America/Chicago node cs229-dashboard/scripts/verify.cjs
```

You can specify `PLAYWRIGHT_MODULE` as the full path to an existing Playwright installation. The app itself needs no npm installation or build step.

Checks cover all 93 rendered task lists and stop conditions, the source-excerpt titles, date continuity and DST, milestones, completion/undo/reload persistence, weekly navigation, mobile overflow, outside-plan dates, malformed storage, and browser errors. Test screenshots go to `../tmp/cs229/`.
