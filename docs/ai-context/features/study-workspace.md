# Study Workspace

## 1. Purpose

The **Study Workspace** is a dedicated, distraction-free environment for intense learning and deep execution. It provides everything needed for an active study block—notes, references, and an integrated session timer—directly inside Momentum Mosaic without cognitive fragmentation.

---

## 2. Core Philosophy

**Execution over Curation**: The workspace is designed like a quiet library carrel where you sit down to do hard, uninterrupted work. It is deliberately **not** a personal knowledge management (PKM) tool, second brain, or Notion-style document garden.

The mental model is session-centric:
- The user enters a workspace to execute a focused block of work.
- The notes and links exist solely to support the active learning block.
- Upon finishing, the user logs completed focus time, leaving a crisp artifact of their thinking.

---

## 3. Canonical Domain Model

The Study Workspace follows a bounded three-tier hierarchy:

1. **WorkspaceSection (`WorkspaceSection`)**: High-level topical domain (e.g., *"Distributed Systems"*, *"DSA & Algorithms"*, *"System Design"*).
2. **Workspace (`Workspace`)**: The execution container for a specific topic or project (e.g., *"Raft Consensus Protocol"*).
3. **WorkspaceEntry (`WorkspaceEntry`)**: Structured, plain-text execution blocks:
   - `entryType = BULLET`: Direct, indented bullet points with keyboard-driven tab/shift-tab nesting and autosave.
   - `entryType = TOGGLE`: Collapsible note sections for deep explanations, code snippets, or drill-down notes.
   - Entries support persistent sort ordering (`sortOrder`) and hierarchical parent-child relationships (`parentEntryId`).
4. **WorkspaceResource (`WorkspaceResource`)**: References and external context materials:
   - Types: `DOCUMENTATION`, `ARTICLE`, `GITHUB`, `AI_CHAT`, `OTHER`.
   - **Real-time Web Scraper (`UrlMetadataService`)**: When a user pastes a URL, backend Jsoup fetches and extracts the page `<title>`. Links from ChatGPT, Claude, and GitHub are automatically classified with custom badge styling.

---

## 4. Key UI/UX Capabilities

### 4.1 Tri-Pane Responsive Layout
- **Left Panel (Navigation & Workspace Hierarchy)**: Sections and workspaces list. Collapsible to 60px mini-strip to maximize writing canvas.
- **Center Canvas (Writing Surface)**: Clean, high-contrast typography optimized for readability and fast typing. Seamless hotkeys for adding bullets (`Enter`), indenting (`Tab`), un-indenting (`Shift+Tab`), and toggling blocks (`Space` or click).
- **Right Panel (Context & Resources)**: Collapsible sidebar housing active resources, external links, linked tasks, and session statistics.

### 4.2 Deep Writing Mode (Distraction-Free Focus)
- Fullscreen immersive execution canvas triggered via hotkey or UI action.
- **Ambient Focus Glow**: Cinematic teal ambient backlighting linked to the active task state.
- **Auto-Hiding Topbar**: Navigation and controls smoothly recede during writing and reappear on mouse movement.
- **Integrated Focus Heartbeat**: Active focus timer stays anchored in the top header, providing uninterrupted awareness of elapsed focus time.
- **One-Click Completion**: Mark the active deep task complete directly from the deep writing overlay.

---

## 5. Architectural Boundaries & Anti-Patterns

| What We Strictly Avoid | Rationale |
|---|---|
| Rich-Text / WYSIWYG Editors | Prevents users from wasting time adjusting fonts, colors, and layouts instead of writing thoughts. |
| Graph Views & Bi-directional Links | Prevents wiki-gardening procrastination. |
| Unlimited Nested Folders | Flat 2-level hierarchy (`Section -> Workspace`) eliminates organizational decision paralysis. |
| Embedded Media Scrapbooking | Keeps queries light, storage lean, and attention centered on text. |

---

## 6. Integrations

- **Task System**: Tasks can be explicitly linked to a workspace (`task.workspaceId`). When a task is started from the workspace, the workspace enters active session mode.
- **Focus System**: Focus timer ticks seamlessly whether in the general workspace or inside Deep Writing mode.
- **Momentum Engine**: Time logged during workspace deep sessions feeds directly into the Momentum Calculator's Deep Focus signal.
