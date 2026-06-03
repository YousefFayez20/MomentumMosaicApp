# Implementation Plan — Structured Density Focus Workspace

We are transitioning the dashboard from a collection of "floating cards in open space" into a premium, cohesive, **Layered Workspace Environment**. The goal is "Structured Density"—creating a filled, grounded, and spatially organized environment without clutter or added cognitive load.

---

## 1. Shallow Top Momentum Overview (Reimagined Arrival Presence)

**The Problem:** Removing the large hero card left the page feeling sparse and missing "arrival presence." But bringing it back as a massive widget would ruin the focus gravity.

**The Solution:** Build a shallow, elegant **Top Workspace Overview Strip** above the grid.

* **Layout:** A horizontal surface with high-end, compact framing (`bg-white/50 dark:bg-muted/[0.03] border border-white/60 dark:border-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden`).
* **Left Segment:**
  * Subtitle: `TODAY'S MOMENTUM` (text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase).
  * Title: `Monday, May 18` (text-base sm:text-lg font-black tracking-tight text-primary).
  * Footnote: `"Structured execution • One active session at a time"` (text-[10.5px] font-semibold text-muted-foreground/50).
* **Right Segment:** Segmented inline flat telemetry:
  * `2 completed • 1 remaining • 2h planned` (text-xs font-bold text-muted-foreground/70).
* **Embedded Environmental Progress:** A thin, high-end progress track running along the absolute bottom edge of the overview strip (`h-1 w-full bg-primary/10 absolute bottom-0 left-0` with progress width styled dynamically). Quiet, atmospheric momentum.

---

## 2. Macro Workspace Containment ("Layered Workspace Surfaces")

Instead of cards floating independently, the workspace is split into two primary **Grouped Surfaces**:

```
 ┌────────────────────────────────────────────────────────────────────────────┐
 │  TOP WORKSPACE OVERVIEW STRIP                                              │
 │  Date • Today's Momentum • Completion Inline                               │
 │  [─────────────────── Quiet Environmental Progress Track ───────────────]  │
 └────────────────────────────────────────────────────────────────────────────┘
 ┌────────────────────────────────────────┐ ┌─────────────────────────────────┐
 │ LEFT WORKSPACE SURFACE PANEL           │ │ RIGHT SYSTEM SUPPORT SURFACE    │
 │ (bg-white/40 dark:bg-muted/[0.04])     │ │ (bg-white/45 dark:bg-muted/[0.04])│
 │                                        │ │                                 │
 │  ACTIVE FOCUS CARD (NOW)               │ │  SYSTEM TELEMETRY               │
 │                                        │ │  - Momentum / Streak            │
 │  ─── NEXT FLOW ──────────────────────  │ │  - Tasks / Planned              │
 │  Upcoming tasks list                   │ │                                 │
 │                                        │ │  ─── RECOVERY / FITNESS ──────  │
 │  ─── MOMENTUM HISTORY ───────────────  │ │  Ambient workout logger         │
 │  Pills footer                          │ │                                 │
 └────────────────────────────────────────┘ └─────────────────────────────────┘
```

---

## 3. Sectional Spacing & Internal Dividers (Left Workspace Panel)

* **Workspace Panel Container:** Wrap all execution elements in a single unified left workspace container (`bg-white/40 dark:bg-muted/[0.03] backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`).
* **Sectional Dividers:** Separate the execution phases inside the left container with clean, quiet, labeled dividers:
  * `ACTIVE FOCUS`
  * `─── NEXT FLOW ───` (divider)
  * `─── MOMENTUM HISTORY ───` (divider)
  This adds structure and rhythm, preventing visual drift between the active card and the completed tasks at the bottom.

---

## 4. Sidebar Panel Cohesion ("System Support")

* **Unified Right Sidebar Panel:** Wrap all support elements in a single unified surface (`bg-white/45 dark:bg-muted/[0.03] backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-3xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]`).
* **Integrated Sections:**
  * **System Telemetry:** Top segment displaying high-contrast data.
  * **Recovery & Fitness:** Bottom segment separated by a soft horizontal divider (`border-t border-border/5 pt-6`).

---

## 5. Spacing Rhythm & Workspace Polish (Visual Music)

* **Rhythmic Spacing:** Add dynamic spacing so the page breathes rhythmically (Dense overview -> Spacing -> Grouped grid panels -> Light micro-telemetry -> Dense active card -> Breathing room).
* **Layered Backdrop Atmosphere:** Enhance layout background tints and glow transitions in `app/globals.css` or container states.

---

## Verification Plan

### Compilation & Build
- Run `npm run build` or `docker compose up --build` to confirm all DOM nests and tags compile successfully without errors.
