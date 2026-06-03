# ADR-0001: AI Context System

Status: Accepted
Date: 2026-05-27

## Context

Momentum Mosaic is evolving through AI-assisted planning and implementation across multiple tools. Without a stable context system, future sessions may waste tokens, repeat product explanations, drift into generic productivity patterns, or lose the product's execution-centered philosophy.

The repository already contains historical strategy notes in `oldartifacts/`, but those files are long-form planning artifacts rather than compact, permanent AI context.

## Decision

Create `docs/ai-context/` as the permanent AI-readable source of truth for product identity, terminology, UX principles, domain architecture, implementation constraints, feature specs, decision records, and reusable prompt packets.

The system is intentionally lightweight. It summarizes stable meaning and workflow guidance rather than preserving every historical detail.

## Tradeoffs

Gains:

- faster AI onboarding
- lower token usage
- stable product terminology
- less architectural drift
- reusable prompting workflows

Costs:

- context docs must be maintained when durable meaning changes
- stale docs can mislead agents if ignored

## Consequences

Future AI sessions should load `00-context-index.md`, `01-product-identity.md`, and `02-terminology.md` before significant work. Feature-specific work should load only the relevant feature specs and principles.

Historical files in `oldartifacts/` remain useful background, but `docs/ai-context/` becomes the primary source of product and AI collaboration truth.

## Related Docs

- `docs/ai-context/00-context-index.md`
- `docs/ai-context/01-product-identity.md`
- `docs/ai-context/02-terminology.md`
- `docs/ai-context/06-ai-workflows.md`
