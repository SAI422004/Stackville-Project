# AI Document Review — Contract Risk Workbench

An interactive legal review cockpit built with **Svelte 5**, **TypeScript**, and **Tailwind CSS**. It enables legal and procurement teams to evaluate, navigate, and resolve 24 AI-identified contract risks on an enterprise Master Services Agreement (MSA).

---

## 1. How to Run It

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (or pnpm / yarn)

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Other Commands
- `npm run build` — Create production build
- `npm run preview` — Preview production build locally
- `npm run check` — Run TypeScript & Svelte type checking

---

## 2. Key Design Decisions & Alternatives

| Area | Decision Made | Alternative Considered | Why Chosen |
| :--- | :--- | :--- | :--- |
| **Workspace Layout** | **3-Panel Synchronized View** (Findings \| Document \| Details) | Stepper Wizard or Popup Modals | Keeps surrounding contract context visible while reading AI rationale and evaluating redlines; eliminates modal fatigue. |
| **Highlight Engine** | **Interval-Boundary Slicing** (`annotations.ts`) | Direct DOM manipulation / Regex replacement | Mathematically segments text boundaries `[b_i, b_{i+1}]`. Guarantees 0 text duplication when multiple findings overlap the same sentence. |
| **Redline Display** | **In-House LCS Word Diff** (`computeWordDiff`) | Full replacement blocks or heavy diff libraries | Lawyers need to see exact word additions (`<ins>`) and deletions (`<del>`), not a wall of text. Built with pure TypeScript (zero dependencies). |
| **State Management** | **Svelte 5 Runes Central Store** (`reviewStore.svelte.ts`) | External state library (Redux / Zustand) | Native `$state` and `$derived` provide compile-time fine-grained reactivity and sync all 3 panels without prop drilling or boilerplate. |
| **Data & Persistence** | **Browser `localStorage`** | Remote Database / REST API | Instant zero-latency saves, complete offline privacy for confidential legal text, and zero backend configuration to test. |

---

## 3. What Was Prioritized

1. **Review Speed & Ergonomics:**
   - 1-click **Accept** (`A`) and **Dismiss** (`D`) actions that automatically save and advance to the next finding.
   - Full keyboard navigation (`J`/`K` navigation, `G` jump to text, `E` export, `?` help).
2. **Annotation Robustness:**
   - Handled cross-paragraph spans (e.g., § 3.4 to § 3.5), broken offset fallback matching, and document-level findings (`anchor: null`).
   - Overlap counter badges (`+N`) with click-to-cycle support.
3. **Redline Clarity:**
   - Visual word-level diffs with a toggle between "Diff" and "Clean" text views.
   - Clear "Why This Matters" business explanations and agent confidence ratings.
4. **Audit Trail & Export:**
   - Live completion metrics, celebration banner upon resolution (24/24), and 1-click Markdown / JSON audit report export.

---

## 4. What Was Cut (Trade-Offs)

- **Full In-Document WYSIWYG Editor:** Cut free-form text editing inside the contract canvas to preserve the source contract as an immutable ground truth. Added reviewer notes and an "Apply Edit" preview toggle instead.
- **Real-Time Collaboration (WebSockets/CRDTs):** Omitted live multi-user cursors to focus on single-reviewer throughput, local privacy, and zero server complexity.
- **Dynamic File Uploader / Live LLM API:** Cut generic document uploaders to deliver a deeply tuned, bug-free review experience for the 24 enterprise findings.
- **Native Word (`.docx`) Track Changes Export:** Chose human-readable Markdown and structured JSON export over complex binary OpenXML generation.

---

## 5. What We'd Do with More Time

1. **Interactive Counter-Proposal Editor:** Allow attorneys to tweak the AI's suggested wording directly in the details pane with live re-diffing before accepting.
2. **Native `.docx` Export:** Export directly to Microsoft Word with standard Word Track Changes (`w:ins`/`w:del`) and margin comments for opposing counsel.
3. **Playbook Validation:** Match contract clauses against internal company negotiation playbooks (e.g., standard liability caps, approved governing law).
4. **"Refine with AI" Prompt Chat:** Allow counsel to ask follow-up questions or request alternative phrasing on the fly (*"Make this indemnification clause mutual"*).
5. **Multi-Stakeholder Sign-Off:** Role-based routing (Legal reviews indemnity, Security reviews data return, CISO reviews audit rights).

---

## 6. Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| <kbd>J</kbd> / <kbd>↓</kbd> | Next finding |
| <kbd>K</kbd> / <kbd>↑</kbd> | Previous finding |
| <kbd>A</kbd> | Accept finding & auto-advance |
| <kbd>D</kbd> | Dismiss finding & auto-advance |
| <kbd>G</kbd> | Jump & scroll to anchored contract clause |
| <kbd>E</kbd> | Open Export modal |
| <kbd>?</kbd> | Toggle Keyboard shortcuts cheat sheet |
| <kbd>Esc</kbd> | Close open modals |
