# AI Workflow Rules

These rules define how the AI coding agent must behave while building this project.  
Follow them strictly. Do not improvise beyond the defined constraints.

---

## 1. Overall Approach

1. Work in a **spec-driven and incremental manner**.
2. Always base implementation on existing project documents:
   - `project-overview.md`
   - `architecture.md`
3. Do not start coding without a clearly defined unit of work.
4. Build the system **one unit at a time**, not multiple systems in parallel.
5. Prefer **correctness and clarity over speed**.

---

## 2. Scoping Rules

1. Only implement **one logical unit of work at a time**.
   - Examples:
     - WhatsApp webhook handler
     - Product CRUD
     - Order creation flow
     - RAG retrieval module

2. Do not:
   - Implement unrelated features
   - Add “nice-to-have” improvements
   - Refactor unrelated code

3. Do not expand scope unless explicitly instructed.

4. Every unit must:
   - Have a clear input/output
   - Be testable in isolation
   - Be consistent with architecture decisions

---

## 3. Splitting Work into Smaller Steps

Split work when:

1. The task involves **more than one responsibility**
2. The task touches **multiple layers** (API + DB + UI)
3. The task includes **external integrations** (WhatsApp, AI, storage)
4. The logic cannot be explained clearly in one pass

When splitting:

- Define sub-steps explicitly
- Complete them sequentially
- Verify each before moving forward

---

## 4. Handling Missing or Ambiguous Requirements

1. Do not guess behavior that affects:
   - Data models
   - Business logic
   - External APIs
   - AI decision-making

2. If ambiguity exists:
   - Stop implementation
   - Ask for clarification

3. If a safe default is required:
   - Choose the **simplest possible behavior**
   - Document the assumption clearly

4. Never invent:
   - Hidden features
   - Implicit workflows
   - Unspecified automation

---

## 5. File Modification Rules

Do NOT modify the following without explicit instruction:

1. Generated UI components (e.g. component libraries)
2. Shared design system files
3. Authentication core logic (unless required and approved)
4. Database schema outside the current task scope
5. External integration wrappers (unless the task is about them)

Allowed modifications:

- Files directly related to the current unit of work
- New files required for the feature
- Minimal changes to existing files (only if necessary)

---

## 6. Documentation Sync Rules

1. Keep implementation aligned with:
   - `architecture.md`
   - `project-overview.md`

2. If implementation changes behavior:
   - Update documentation immediately

3. Do not allow:
   - Code that contradicts documentation
   - Documentation that does not reflect current behavior

4. If a design decision changes:
   - Explicitly state the change
   - Update the relevant section

---

## 7. AI System Rules (Project-Specific)

1. Never use RAG for:
   - Product price
   - Product stock
   - Order status
   - Customer identity

2. Always use structured DB queries for:
   - Orders
   - Products
   - Customers

3. AI must:
   - Fall back when uncertain
   - Never hallucinate missing data

4. If confidence is low:
   - Trigger escalation
   - Do not generate speculative answers

---

## 8. Verification Checklist (MANDATORY)

Before completing any unit, verify:

### Functionality

- [ ] The feature works end-to-end for its scope
- [ ] Inputs and outputs are clearly defined
- [ ] Edge cases are handled (empty data, missing values)

### Architecture Compliance

- [ ] Code follows `architecture.md`
- [ ] Data is stored in the correct layer (DB vs storage vs vector)
- [ ] `shop_id` is enforced for all relevant queries

### Safety & Constraints

- [ ] No cross-tenant data access
- [ ] No hardcoded sensitive values
- [ ] No violations of invariants

### AI Behavior

- [ ] AI does not hallucinate critical data
- [ ] RAG is only used for allowed data types
- [ ] Fallback/escalation logic exists where needed

### Code Quality

- [ ] No unnecessary complexity
- [ ] No unrelated refactoring
- [ ] Clear function boundaries

### Documentation

- [ ] Any changes are reflected in documentation
- [ ] Assumptions are explicitly stated

---

## 9. Completion Rules

1. Do not move to the next unit until:
   - All checklist items are satisfied
   - The unit is logically complete

2. Do not leave:
   - Partial implementations
   - Placeholder logic without explanation

3. Every completed unit must be:
   - Runnable (if applicable)
   - Testable
   - Consistent with the system design

---

## 10. Absolute Constraints

These must never be violated:

1. Never expose data across shops
2. Never trust AI for critical business data
3. Never skip validation when creating orders
4. Never continue automation after escalation
5. Never modify unrelated parts of the system

---
