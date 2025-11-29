---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **React Native (Expo)**: `app/`, `components/`, `hooks/`, `services/`, `types/`, `constants/` at repository root
- **Screens**: `app/[feature]/[screen].tsx` (Expo Router file-based routing)
- **Components**: `components/[feature]/[component].tsx` or `components/ui/[component].tsx`
- **Hooks**: `hooks/use-[feature].ts`
- **Types**: `types/[feature].ts`
- **Services**: `services/api/[service].ts`
- Paths shown below assume React Native/Expo structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize React Native/Expo project with required dependencies
- [ ] T003 [P] Configure ESLint and Prettier with pre-commit hooks
- [ ] T004 [P] Setup Sentry SDK for error tracking and performance monitoring
- [ ] T005 [P] Setup Reactotron for development debugging
- [ ] T006 [P] Configure TypeScript strict mode and types structure
- [ ] T007 Verify all file naming follows kebab-case convention

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T008 Setup navigation structure with Expo Router layouts
- [ ] T009 [P] Implement error boundary with Sentry integration
- [ ] T010 [P] Create theme system in constants/theme.ts
- [ ] T011 [P] Setup API client service with Sentry performance monitoring
- [ ] T012 Configure environment variables using expo-constants
- [ ] T013 [P] Create base reusable UI components (buttons, inputs, cards)
- [ ] T014 [P] Setup AsyncStorage wrapper with type safety
- [ ] T015 Integrate Reactotron with API client for request/response logging

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T011 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create [Entity1] types in types/[entity1].ts
- [ ] T013 [P] [US1] Create reusable [Component1] in components/[feature]/[component1].tsx
- [ ] T014 [P] [US1] Create reusable [Component2] in components/[feature]/[component2].tsx
- [ ] T015 [US1] Implement custom hook use[Feature] in hooks/use-[feature].ts (depends on T012)
- [ ] T016 [US1] Create screen component in app/[feature]/[screen].tsx (depends on T013, T014, T015)
- [ ] T017 [US1] Add Sentry error tracking to critical operations
- [ ] T018 [US1] Add Reactotron logging for debugging [feature] flow
- [ ] T019 [US1] Implement error handling with user-friendly messages
- [ ] T020 [US1] Verify naming conventions: files (kebab-case), components (PascalCase)
- [ ] T021 [US1] Optimize performance: use FlatList if listing, expo-image for images

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T019 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create [Entity] types in types/[entity].ts
- [ ] T021 [P] [US2] Create reusable components in components/[feature]/
- [ ] T022 [US2] Implement custom hook in hooks/use-[feature].ts
- [ ] T023 [US2] Create screen in app/[feature]/[screen].tsx
- [ ] T024 [US2] Add Sentry tracking and Reactotron logging
- [ ] T025 [US2] Integrate with User Story 1 components (if needed, ensure no duplication)
- [ ] T026 [US2] Verify no code duplication with existing features

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T025 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create [Entity] types in types/[entity].ts
- [ ] T027 [P] [US3] Create reusable components in components/[feature]/
- [ ] T028 [US3] Implement custom hook in hooks/use-[feature].ts
- [ ] T029 [US3] Create screen in app/[feature]/[screen].tsx
- [ ] T030 [US3] Add Sentry tracking and Reactotron logging
- [ ] T031 [US3] Ensure DRY principle: extract any shared logic with US1/US2

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/ or README.md
- [ ] TXXX Code cleanup and refactoring to eliminate any remaining duplication
- [ ] TXXX Performance optimization: verify 60fps animations, optimize images
- [ ] TXXX [P] Additional unit tests (if requested) in __tests__/
- [ ] TXXX Security hardening: validate all user inputs, secure API keys
- [ ] TXXX Accessibility improvements: screen reader support, touch targets
- [ ] TXXX Final verification: all naming conventions followed (kebab-case files, PascalCase components)
- [ ] TXXX Final Sentry verification: error boundaries cover all major sections
- [ ] TXXX Final Reactotron verification: all critical flows have logging
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all types for User Story 1 together:
Task: "Create [Entity1] types in types/[entity1].ts"
Task: "Create [Entity2] types in types/[entity2].ts"

# Launch all components for User Story 1 together:
Task: "Create reusable [Component1] in components/[feature]/[component1].tsx"
Task: "Create reusable [Component2] in components/[feature]/[component2].tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
