# Momentum Mosaic — Study Workspace Product Strategy

> "Everything needed for this session already exists here." — The guiding principle for the Study Workspace.

This document explores the philosophical, psychological, and strategic boundaries of the Study Workspace feature. It ensures the feature reinforces Momentum Mosaic's identity as an **active execution system**, rather than accidentally degrading into a passive knowledge management database.

---

## 1. Product Philosophy: Execution vs. Curation

The biggest risk to this feature is the "Notion gravity well." When building a workspace that includes notes, it is incredibly tempting to optimize for *information organization* (folders, tags, backlinks, block styling, databases). 

But Momentum Mosaic is a **discipline tool**, not a "second brain."

**The philosophical stance:** Curation is often procrastination disguised as productivity. Spending 45 minutes organizing notes is not the same as spending 45 minutes doing deep work. 

The Study Workspace must optimize for **flow continuity and focused execution**. 
- It is a **container for an active session**, not an archive for passive reading.
- It should feel like a quiet library carrel where you sit down to do the hard work of learning, not a filing cabinet.
- **The mental model:** You aren't opening a "document" to read it. You are entering a "workspace" to *act* in it.

---

## 2. Intentional Absences: Feature Boundaries

To protect the product identity, we must explicitly define what the workspace is *not*, and what we will intentionally refuse to build.

| What we will NOT build | Why it damages the product identity |
| :--- | :--- |
| **Bi-directional linking & Graph views** | Encourages endless wiki-gardening instead of focused studying. Optimizes for network-building rather than execution. |
| **Complex Block Editors (Notion style)** | Block editors encourage formatting over writing. Users waste time dragging blocks and tweaking columns instead of capturing thoughts. |
| **Nested Folder Hierarchies (Beyond 2 levels)** | Creates cognitive load. The user must spend mental energy deciding "where does this go?" rather than "what do I need to learn?" |
| **Rich Media Galleries** | A workspace is not a scrapbook. It is for thinking and processing. |
| **An "Everything" Dashboard inside the workspace** | The workspace should not try to replicate the main Momentum Mosaic dashboard. It should contain *only* what is necessary for the current subject. |

**The Boundary:** The workspace stops at the edge of the *current learning context*. It does not try to connect all knowledge you possess. 

---

## 3. UI/UX Psychology & Cognitive Load

The workspace must emotionally feel **calm, minimal, and bounded**. 

### The Aesthetics of Focus
The workspace should use a highly constrained layout. When a user opens it, their eye shouldn't dart around looking for what to click.
- **Progressive Disclosure:** The sidebar (Resources, Tasks, Reflections) should be collapsible. When collapsed, the user sees only their Notes and a prominent "Start Focus Session" button.
- **Typography over UI:** The interface should recede. The content (the user's notes and the timer) should dominate.

### Focus Mode Integration & Flow Continuity
The timer must not feel like a disconnected widget, nor should it hijack the entire screen in a way that blocks the user's notes.

**The Interaction Design:**
1. The user clicks "Start Session" within the workspace.
2. The UI subtly shifts. The peripheral navigation dims or hides. The timer appears inline, anchoring the top or sidebar of the workspace — acting as the silent heartbeat of the session.
3. **Flow Continuity:** The notes area remains fully editable. The user is now *inside* a DEEP task. They can type, read, and sketch without ever breaking the visual context of the timer. 
4. **Session-Centric vs Document-Centric:** The presence of the active timer temporarily shifts the workspace from "Document Mode" (viewing the subject) to "Session Mode" (actively executing a task). 

---

## 4. Architecture from a Product Perspective

### Should workspaces feel temporary (session) or permanent (knowledge)?
Both, but experienced sequentially.
- The **Subject/Topic** is permanent. It is the persistent container.
- The **Interaction** is temporary. You enter the workspace to complete a session, and you leave a reflection behind as an artifact of that session.
- **The shift:** The workspace is a permanent room, but you only visit it to do temporary, intense work.

### How tightly should tasks and notes be coupled?
They are conceptually intertwined. A Study Session *is* a DEEP work task. 
By allowing a DEEP task to be launched *from* the workspace, we anchor the abstract concept of "Deep Work" to a concrete context ("Deep Work: Machine Learning"). The notes are the byproduct of that task.

### Should reflections become a core identity feature?
Yes. Currently, the Daily Reflection asks "How did today go?" 
A Study Reflection asks "What did I grasp, and what am I still confused about?" 
This is **Active Learning**. Forcing the user to spend 30 seconds synthesizing their session before they leave the workspace is the ultimate discipline mechanic. It proves they didn't just passively read; they engaged.

---

## 5. Visual Thinking: The Canvas Question

You mentioned integrating lightweight sketching (like tldraw). This perfectly aligns with the execution philosophy, provided it is implemented carefully.

**Why Visual Thinking fits:**
Learning often requires spatial reasoning—drawing an architecture diagram, a flowchart, or a mind map. Forcing users to leave the app to sketch breaks flow continuity.

**The Implementation Strategy (Lightweight & Ephemeral):**
- **Do not build a whiteboard app.** Use a library like `tldraw` as an embedded engine.
- **JSON Storage:** Store the canvas data as JSON, not static image blobs. This allows the user to return to a sketch and modify it in a future session.
- **Hybrid Workflow:** The canvas should not replace the notes. It should be a toggleable layer or an expandable block *within* the notes. 
- **The UX feeling:** It should feel like pulling out a scratchpad next to your notebook. Quick, unpretentious, and functional.

---

## 6. Technical Philosophy & V1 Scope

To preserve momentum and avoid overengineering, the technical choices must align with the product strategy.

### The Editor: Markdown vs. TipTap
- **V1 Recommendation:** Use a robust, constrained rich-text editor (like TipTap) configured to feel like Markdown. 
- **Why?** Raw Markdown textareas are easy to build but can feel jarring for users who expect immediate visual feedback. However, a full block-editor (like Editor.js or Notion) is too complex and encourages formatting over writing. 
- A constrained TipTap editor (bold, italic, lists, headers, code blocks) gives the smoothness of WYSIWYG without the distraction of blocks. It outputs clean HTML or Markdown to the backend.

### Autosave Philosophy
- **Zero Friction:** There is no "Save" button. Ever.
- **Debounced Updates:** The frontend debounces keystrokes (e.g., 1.5 seconds) and silently patches the backend.
- **Optimistic UI:** The user never waits for a network request to continue typing. The interface always feels instantaneous.

### What goes in the MVP?
If we are to build this incrementally:
1. **MVP:** 2-level hierarchy (Subject -> Workspace), simple markdown/rich-text notes, collapsible sidebar with Resources, and the ability to launch a DEEP task timer directly from the workspace.
2. **V1.1:** Add Reflections tied to the end of the focus session.
3. **V1.2:** Integrate the `tldraw` scratchpad.

---

## Summary of the Shift

By anchoring the Study Workspace to **Focus Sessions** rather than **Knowledge Organization**, we protect Momentum Mosaic's soul. It remains a tool that asks *"What are you doing right now?"* rather than *"Where should I file this information?"* 

The workspace simply provides the quietest, most focused room possible for the user to answer that question.
