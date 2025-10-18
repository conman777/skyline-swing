# Skyline Swing - Complete Implementation Plan

**Goal**: Transform this from a buggy prototype into a polished, complete 2D endless runner with grappling hook mechanics.

**Timeline**: 5 phases, systematic implementation following TDD principles.

---

## Phase 1: Critical Bug Fixes (MUST FIX FIRST)

These bugs break core gameplay and must be fixed before anything else.

### 1.1 Fix Player Grounding Logic
**File**: `src/entities/Player.ts:83-92`
**Problem**: Player can get stuck grounded or airborne forever
**Fix**: Correct the conditional logic in `markGrounded()`
**Test**: Write unit test for grounding state transitions

### 1.2 Fix Wheel Input Stacking
**File**: `src/scenes/GameScene.ts:175-180`
**Problem**: Multiple timeouts stack, breaking reel control
**Fix**: Implement proper debounce pattern with timeout tracking
**Test**: Manual test rapid scrolling

### 1.3 Implement Line of Sight Check
**File**: `src/scenes/GameScene.ts:291-294`
**Problem**: Players can attach to anchors through walls
**Fix**: Implement raycast against platforms and hazards
**Test**: Create test segment with blocked anchor, verify cannot attach

### 1.4 Fix Web Physics Delta Timing
**File**: `src/entities/Web.ts:123`
**Problem**: Direct velocity mutation, no delta compensation, magic numbers
**Fix**:
- Extract `WEB_PULL_STRENGTH` constant
- Use acceleration-based forces
- Add delta-time compensation
- Add damping for smooth swings
**Test**: Verify consistent swing behavior at 30fps vs 60fps

---

## Phase 2: Core Mechanics Completion

Complete missing features and improve existing systems.

### 2.1 Implement Collision System
**New Files**:
- `src/systems/CollisionManager.ts`
**Features**:
- Player vs Platform collision
- Player vs Hazard collision (death/damage)
- Web vs Hazard collision (break web)
**Test**: Integration tests for each collision type

### 2.2 Complete Hazard Implementations
**File**: `src/systems/HazardManager.ts`
**Current State**: Hazards spawn but don't do anything
**Implement**:
- Spikes: static death zones
- Saw: rotating circular death zones
- Laser: beam with timing pattern
- Wind: push force applied to player
- Swing-gate: pendulum obstacle
- Electric: arc with on/off cycle
- Turret: projectile spawner
**Test**: Each hazard type with mock player collision

### 2.3 Platform Types
**File**: `src/systems/PlatformManager.ts`
**Implement**:
- Ground: standard solid platform
- Crumble: breaks after N seconds when touched
**Test**: Crumble platform timing

### 2.4 Pickup System
**New Files**:
- `src/entities/Pickup.ts`
- `src/systems/PickupManager.ts`
**Implement**:
- Longer Web pickup (duration-based)
- Slow-Mo pickup (time dilation)
- Double Jump pickup (air jump)
- Anchor Magnet pickup (larger aim cone)
**Test**: Each pickup effect and duration

### 2.5 Scoring System
**New Files**: `src/systems/ScoreManager.ts`
**Implement**:
- Distance-based scoring
- Chain bonus (consecutive swings without touching ground)
- Near-miss bonus (passing hazard within threshold)
- Beacon bonus (using beacon anchors)
- Style multiplier (chains + near-misses)
**Test**: Score calculations for each event

### 2.6 Death & Game Over
**Implement in GameScene**:
- Hazard collision → death
- Fall below world → death
- Left boundary collision → death
- Death animation/effect
- Proper stats tracking on death
**Test**: Each death condition triggers results scene

---

## Phase 3: Game Balance & Progression

Make the game challenging, fair, and fun.

### 3.1 Dynamic Difficulty Scaling
**File**: `src/systems/SegmentGenerator.ts`
**Implement**:
- Difficulty based on distance traveled (not segment count)
- Formula: `difficulty = 1 + floor(distanceMeters / 50)` (caps at 10)
- Segment pool filtering by difficulty range
**Test**: Verify difficulty increases over time

### 3.2 Difficulty-Scaled Constants
**File**: `src/config/constants.ts`
**Add difficulty scaling functions**:
```typescript
export function getScrollSpeed(difficulty: number): number
export function getWebTension(difficulty: number): number
export function getCoyoteTime(difficulty: number): number
export function getJumpBuffer(difficulty: number): number
```
**Scale**:
- Scroll speed: increase gradually
- Web tension limit: increase with difficulty
- Jump timing assistance: decrease with difficulty
**Test**: Verify curves feel fair

### 3.3 Improved Segment Generation
**File**: `src/systems/SegmentGenerator.ts`
**Improvements**:
- Ensure segments are beatable (verify path exists)
- Balance anchor placement (not too easy, not impossible)
- Difficulty tags (easy/medium/hard/expert)
- Prevent consecutive impossible segments
**Test**: Generate 1000 segments, verify no unbeatable combinations

### 3.4 Create More Segments
**File**: `src/config/segments.ts`
**Current**: ~5 segments defined
**Target**: 30+ segments with variety
**Categories**:
- Tutorial segments (difficulty 1-2)
- Basic challenges (difficulty 3-4)
- Advanced patterns (difficulty 5-7)
- Expert gauntlets (difficulty 8-10)
**Test**: Play through first 10 minutes, verify variety

### 3.5 Pacing System
**New File**: `src/systems/PacingManager.ts`
**Implement**:
- Speed variation (fast sections, breather sections)
- Hazard density variation
- Anchor density variation
- "Safe zones" every N segments
**Purpose**: Create rhythm, prevent monotony
**Test**: Manual playtest for pacing feel

---

## Phase 4: Polish & UX

Make the game feel good to play.

### 4.1 Visual Feedback
**Implement**:
- Player animation states (idle, run, jump, swing)
- Web tension visual (color shift red as tension increases)
- Screen shake on web break
- Particle effects (web attach, web break, hazard hit)
- Speed lines at high velocity
- Anchor highlight on hover
**Files**: Multiple scene/entity files

### 4.2 Audio System
**New Files**: `src/systems/AudioManager.ts`
**Implement**:
- Jump sound
- Web attach/detach sounds
- Web break sound
- Hazard warning sounds
- Background music (speed-adaptive)
- Collision sounds
**Use**: Web Audio API or Phaser sound system

### 4.3 Camera Improvements
**File**: `src/scenes/GameScene.ts`
**Implement**:
- Look-ahead when swinging fast
- Smooth zoom based on speed
- Screen shake on impacts
- Vertical bounds to keep player in view

### 4.4 UI Improvements
**File**: `src/ui/HUDOverlay.ts`
**Add**:
- Web tension meter
- Active pickup indicators with timers
- Chain counter with combo animation
- Speed indicator with visual zones
- Minimap of upcoming segment

### 4.5 Tutorial System
**New Scene**: `src/scenes/TutorialScene.ts`
**Implement**:
- Movement tutorial
- Web mechanics tutorial
- Reel tutorial
- Hazard introduction
- Scoring explanation
**Test**: Complete first-time user experience

### 4.6 Settings Enhancements
**File**: `src/scenes/SettingsScene.ts`
**Add**:
- Volume controls (master, SFX, music)
- Graphics quality (particle density)
- Accessibility toggles
- Key rebinding
- Controller support

---

## Phase 5: Testing & Optimization

Ensure quality and performance.

### 5.1 Memory Management
**Implement**:
- Proper cleanup in all scenes (`shutdown` handler)
- Object pooling for platforms, anchors, hazards
- Texture atlas for sprites
- Destroy off-screen entities immediately
**Test**: Play for 30 minutes, monitor memory usage

### 5.2 Performance Optimization
**Optimize**:
- Reduce draw calls (batch graphics)
- Cull off-screen entities
- Optimize collision detection (spatial hashing)
- Reduce anchor scanning frequency
- Cache frequently accessed values
**Target**: 60fps on mid-range hardware

### 5.3 Bug Testing
**Test**:
- Rapid input sequences
- Edge cases (zero-length web, max-length web)
- Pause/unpause during critical moments
- Settings changes mid-game
- Browser resize
**Fix**: All discovered issues

### 5.4 Balance Testing
**Playtest**:
- First 5 minutes (new player experience)
- 10-20 minute runs (difficulty curve)
- Expert runs (30+ minutes)
**Adjust**: Difficulty scaling, segment variety, pacing

### 5.5 Cross-Browser Testing
**Test on**:
- Chrome
- Firefox
- Safari
- Edge
**Fix**: Browser-specific issues

---

## Code Quality Standards

Throughout all phases, follow these practices:

### File Organization
```
src/
├── config/          # Constants, segments, assists
├── entities/        # Player, Web, Pickup, etc.
├── scenes/          # Phaser scenes
├── systems/         # Managers (Collision, Score, Audio, etc.)
├── ui/              # HUD, menus
└── utils/           # Helper functions
```

### Naming Conventions
- Files: PascalCase (e.g., `CollisionManager.ts`)
- Classes: PascalCase (e.g., `class Player`)
- Functions: camelCase (e.g., `handleJump()`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `PLAYER_GRAVITY`)
- Interfaces: PascalCase with `I` prefix optional (e.g., `PlayerConfig`)

### Constants Management
- All magic numbers → `constants.ts`
- Add comments explaining physical units
- Group related constants
- Use functions for difficulty-scaled values

### Error Handling
- Validate all inputs
- Add null checks before dereferencing
- Use TypeScript strict mode
- Fail fast with clear error messages

### Testing Strategy
- Unit tests for pure logic (utils, calculations)
- Integration tests for system interactions
- Manual playtesting for feel/balance
- Run tests before each commit

### Performance Guidelines
- Avoid creating objects in update loops
- Use object pooling for frequent spawns
- Cache computed values
- Profile before optimizing
- Target: <5ms update loop at 60fps

---

## Implementation Order

**Week 1**: Phase 1 (Critical Bugs)
- Day 1: Fix grounding logic + write tests
- Day 2: Fix wheel input + web physics
- Day 3: Implement line of sight + collision foundation
- Day 4-5: Buffer for testing and bug fixes

**Week 2**: Phase 2 (Core Mechanics)
- Day 1-2: Collision system + hazard implementations
- Day 3: Pickup system
- Day 4: Scoring system
- Day 5: Death/game over polish

**Week 3**: Phase 3 (Balance)
- Day 1-2: Difficulty scaling system
- Day 3-4: Create 30+ segments
- Day 5: Pacing system

**Week 4**: Phase 4 (Polish)
- Day 1-2: Visual feedback
- Day 3: Audio system
- Day 4: UI improvements
- Day 5: Tutorial

**Week 5**: Phase 5 (Testing)
- Day 1-2: Optimization
- Day 3-4: Bug hunting
- Day 5: Final balance pass

---

## Success Criteria

Game is "complete" when:

- ✅ All critical bugs fixed
- ✅ All hazard types functional
- ✅ Collision system working perfectly
- ✅ Scoring system complete
- ✅ 30+ unique segments
- ✅ Difficulty scales smoothly from 0-30 minutes
- ✅ Death conditions all working
- ✅ Tutorial playable start-to-finish
- ✅ Audio/visual feedback on all actions
- ✅ No memory leaks in 30-minute runs
- ✅ 60fps maintained
- ✅ Settings persist correctly
- ✅ Game is fun (subjective but testable via playtesting)

---

## Known Technical Debt to Address

1. **Type safety**: Add stricter TypeScript checks
2. **Scene lifecycle**: Proper cleanup on all transitions
3. **Input system**: Centralize input handling
4. **State management**: Consider Redux/MobX if complexity grows
5. **Asset loading**: Implement proper loading screen with progress
6. **Save system**: Add high score persistence, run history
7. **Replay system**: Record inputs for replay functionality
8. **Accessibility**: Full keyboard nav, screen reader support

---

## Future Enhancements (Post-MVP)

- Daily challenges with leaderboards
- Unlockable characters/skins
- Multiple game modes (time attack, survival, speedrun)
- Level editor with sharing
- Multiplayer ghost racing
- Achievements system
- Mobile touch controls
- Progressive Web App support

---

**End of Plan**
