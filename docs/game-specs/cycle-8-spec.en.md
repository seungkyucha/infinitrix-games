---
game-id: mini-coffee-tycoon
title: Mini Coffee Shop Tycoon
genre: casual, strategy
difficulty: easy
---

# Mini Coffee Shop Tycoon — Detailed Game Design Document (Cycle 8)

---

## §0. Previous Cycle Feedback Integration Mapping

| # | Source | Issue/Suggestion | Response in This Design |
|---|--------|-----------------|------------------------|
| 1 | Cycle 7 post-mortem | **Management/simulation genre challenge** | ✅ This game is the platform's first management/idle tycoon genre. Fills idle/tycoon 0% gap |
| 2 | Cycle 7 post-mortem | **pre-commit hook for assets/ build failure** | §13.1 specifies pre-commit hook script + **`.git/hooks/pre-commit` actual registration verification** item added (Cycle 8 wisdom: specification and registration are different steps) |
| 3 | Cycle 7 post-mortem | Shared engine module separation | Modular class structure within single HTML maintained. §12 specifies shared pattern reuse |
| 4 | Cycle 7 shortcomings | **assets/ + SVG assets 7-cycle recurrence** | §13.1 pre-commit hook blocks commit when `games/mini-coffee-tycoon/assets/` exists. 100% Canvas code drawing. Zero external asset references |
| 5 | Cycle 7 shortcomings | **Partial pure function principle violation** | §10 pre-defines all game logic function parameter signatures. Zero global reference goal. §13.4 full verification checklist |
| 6 | Cycle 7 shortcomings | **Design-implementation value mismatch** | §6, §7 map all balance values 1:1 to `CONFIG` object constants. §13.5 value consistency verification table |
| 7 | Cycle 7 shortcomings | Skill synergy/stats dashboard not implemented | DAY_END settlement screen includes detailed stats (served/lost/tip ratio) matching management genre |
| 8 | platform-wisdom | setTimeout state transition ban | §5 game loop: all delayed transitions via tween onComplete only |
| 9 | platform-wisdom | State × system matrix required | §5.3 includes full matrix |
| 10 | platform-wisdom | cancelAll/add race condition | clearImmediate() API used. §12 TweenManager specification |
| 11 | platform-wisdom | Guard flag required | §5.2 `isTransitioning` guard for state transitions |
| 12 | platform-wisdom | Ghost variable prevention | §13.4 "verify usage of all declared variables" included |
| 13 | platform-wisdom | iframe confirm/alert ban | All confirmation UI via Canvas-based modals |
| 14 | platform-wisdom | Single value update path unification | One value uses either tween OR direct assignment, not both |
| 15 | platform-wisdom [Cycle 8] | **beginTransition() bypass in PAUSED state** | §5.2 designs `beginTransition(state, {immediate: true})` immediate transition mode. All transitions go through beginTransition without exception |
| 16 | platform-wisdom [Cycle 8] | **drawTitle(ctx, 0.016) dt hardcoding** | §5.4 passes gameLoop's dt directly to all render functions. Hardcoding banned |
| 17 | platform-wisdom [Cycle 8] | **pre-commit hook registration incomplete** | §13.1 specifies "hook registration verification" item. Writing a script in the design doc ≠ actually registering it |
| 18 | Analysis report | idle/tycoon genre 0% | ✅ Platform's first management/idle tycoon fills gap |
| 19 | Analysis report | Only 2 easy difficulty games (medium bias) | ✅ Set as difficulty: easy for beginner accessibility |

---

## §1. Game Overview & Core Fun Elements

### Concept
A hybrid casual tycoon game where you grow from a small coffee cart to the **city's top coffee chain**. During the day, you manually brew drinks (manual), and at night baristas auto-operate (idle), using earned money to expand menus, equipment, interiors, and locations. **30 days (in-game time, approximately 15~20 minutes real play)** to open 3 shops for the **ending**.

### 3 Core Fun Elements
1. **Brewing satisfaction**: See customer orders and click/tap ingredients in the right order to complete drinks → Better accuracy = higher tip bonus → "My own barista" immersion
2. **Growth fantasy**: Shabby cart (2 chairs) → cozy cafe (6 seats) → 3-shop franchise. Screen visually becomes progressively more elaborate
3. **Management decisions**: With limited gold, choosing "menu expansion vs barista hire vs interior upgrade" first provides strategic depth

### References
- **Idle Coffee Corp**: Coffee shop idle management, automation tiers
- **Papa's Freezeria**: Manual drink-making minigame, customer satisfaction
- **Leek Factory Tycoon**: Factory expansion + automation + incremental revenue

### Progression Stages — Manual → Automation in 3 Phases
```
Lv.1 (Day 1-5):   Manual brewing — Click/tap ingredient combos, 2 menu items
Lv.2 (Day 6-15):  Semi-auto — First barista hired, basic menu automated, 4 menu items
Lv.3 (Day 16-25): Fully auto — All menus auto-brewed, manager hired
Lv.4 (Day 26-30): Chain expansion — 2nd/3rd shops open, idle revenue
```

---

## §2. Game Rules & Objectives

### Victory Condition
- Reach **Day 30** + Complete **3rd shop opening** → **VICTORY** (final rating S/A/B/C)

### Failure Condition (Soft Failure)
- No bankruptcy. Instead, rating drops if 3rd shop isn't opened by Day 30 (C rating)
- **Customer satisfaction** dropping to 0% means zero revenue that day (warning effect)

### Basic Rules
1. One day (Day) = **30 seconds real-time**. Day is split into "morning (15s, non-peak)" + "afternoon (15s, peak)"
2. Customers enter from left → wait at counter → order displayed → brewing → pickup → exit (right)
3. **Manual brewing**: Click ingredients in order shown in order bubble to complete drink
4. **Auto-brewing**: Hired barista auto-processes orders (speed depends on barista level)
5. Completed drink → delivered to customer → **Gold (₩)** earned
6. Brewing accuracy (correct order clicks) determines **tip bonus** (0%/25%/50%)
7. Wait time exceeded → customer leaves → satisfaction drops
8. Day ends → **daily settlement**: revenue, expenses, net profit, satisfaction, serving stats displayed
9. After settlement → **upgrade screen** (UPGRADE state) for investment

### §2.1 Customer System
- **4 Customer Types**:

| Type | Sprite Color | Patience | Order Menu | Tip Multiplier |
|------|-------------|----------|-----------|---------------|
| Normal | `#5B8C5A` green | 5s | Basic menu | ×1.0 |
| Rushed | `#E74C3C` red | 3s | Basic menu | ×1.5 |
| VIP | `#F1C40F` gold | 7s | Premium menu | ×2.0 |
| Regular | `#8E44AD` purple | 6s | 1 fixed menu | ×1.2 + satisfaction bonus |

- **Spawn rule**: `spawnInterval = max(2.0, 5.0 - day * 0.1)` seconds
- **Simultaneous waiting**: Based on seat count (initial 2, max 8)
- **Queue overflow**: Turn away at door → satisfaction -5%
- **Afternoon peak**: Spawn interval ×0.7 during afternoon (latter 15s of Day)

### §2.2 Customer Type Appearance Probability (Day-Based)

| Day Range | Normal | Rushed | VIP | Regular |
|-----------|--------|--------|-----|---------|
| Day 1-5 | 80% | 15% | 0% | 5% |
| Day 6-15 | 50% | 25% | 15% | 10% |
| Day 16-30 | 30% | 30% | 25% | 15% |

---

## §3. Controls

### Keyboard (Desktop)
| Key | Action |
|-----|--------|
| `1`~`6` | Select ingredient slot 1~6 (drink brewing) |
| `Space` | Confirm drink completion/serving |
| `Tab` | Switch upgrade category |
| `Enter` | Confirm upgrade purchase / Start next day |
| `P` / `Esc` | Pause |

### Mouse (Desktop)
| Action | Description |
|--------|-------------|
| Click ingredient slot | Add ingredient (6 slots at bottom) |
| Click complete button | Finish brewing and serve |
| Click upgrade item | Purchase |
| Click customer | Select that customer's order (priority serving) |

### Touch (Mobile)
| Action | Description |
|--------|-------------|
| Tap ingredient slot | Add ingredient |
| Tap complete button | Finish brewing and serve |
| Tap upgrade item | Purchase |
| Swipe left/right | Switch upgrade category |

> **inputMode auto-detection**: UI hints auto-switch based on first input type (keyboard/mouse/touch). Preventing the mistake of declaring a condition variable but never using it in branching (Cycle 2 wisdom). §13.4 checklist verifies inputMode is referenced in actual branch code.

---

## §4. Visual Style Guide

### Color Palette

| Element | HEX | Usage |
|---------|-----|-------|
| Background (wall) | `#FFF8F0` | Warm ivory. Cafe atmosphere |
| Background (floor) | `#D4A574` | Wooden floor feel |
| Counter | `#8B6914` | Brown wooden counter |
| Espresso machine | `#C0C0C0` | Metallic gray |
| Coffee liquid | `#6F4E37` | Rich coffee brown |
| Milk | `#FDFEFE` | White |
| Syrup | `#E67E22` | Caramel orange |
| Whipped cream | `#F5F0E1` | Cream |
| Ice | `#B0E0E6` | Light sky blue |
| Water | `#87CEEB` | Sky blue |
| Gold (currency) | `#FFD700` | UI gold |
| Satisfaction high | `#27AE60` | Green |
| Satisfaction low | `#E74C3C` | Red |
| Upgrade available | `#3498DB` | Blue highlight |
| Upgrade unavailable | `#7F8C8D` | Gray |
| UI background | `#2C2C2C` | Dark panel |
| UI text | `#FFFFFF` | White text |
| Morning lighting | `rgba(255,248,220,0.1)` | Warm morning tone |
| Afternoon lighting | `rgba(255,200,150,0.15)` | Sunset tone |

### Object Shapes (100% Canvas Code Drawing — Zero External Assets)

| Object | Shape | Size (logical px) |
|--------|-------|------------------|
| Customer | Circle (head) + rounded rect (body) + color for type distinction | 30×50 |
| Order bubble | Rounded rect speech bubble + ingredient icons inside | 80×40 |
| Ingredient icon | Circle/square/triangle combos (color+shape+text triple distinction, Cycle 5 accessibility pattern) | 24×24 |
| Coffee cup | Trapezoid (cup) + semicircle (handle) | 20×24 |
| Espresso machine | Rectangle + 2 circular dials + steam particles | 60×80 |
| Seat | Rounded rect + 4 circular legs | 32×32 |
| Barista NPC | Circle (head) + rectangle (apron, `#4A7C59`) | 28×48 |
| Shop building (2nd+) | Rectangle + triangle (roof) + rectangle (door) | 120×100 |
| Patience bar | Horizontal bar (green→yellow→red gradient) | 30×4 |

> ⚠️ **The assets/ directory must never be created.** No external asset files of any kind — SVG, PNG, JPG, GIF, manifest.json, etc. — shall be created. All visual elements via Canvas API (fillRect, arc, lineTo, quadraticCurveTo, etc.) code drawing. SVG filters like feGaussianBlur banned. (All-cycle recurrence prevention, Cycles 1~8)

### Ingredient Slot Triple Distinction (Color-Blind Accessibility)

| Slot | Color | Shape | Letter |
|------|-------|-------|--------|
| Beans | `#6F4E37` | Circle (●) | B |
| Water | `#87CEEB` | Wave (〰) | W |
| Milk | `#FDFEFE` + black border | Square (■) | M |
| Ice | `#B0E0E6` | Diamond (◆) | I |
| Syrup | `#E67E22` | Triangle (▲) | S |
| Whip | `#F5F0E1` + black border | Star (★) | C |

### Interior Upgrade Visual Changes
| Level | Wall Color | Floor | Added Elements | Seats |
|-------|-----------|-------|---------------|-------|
| Lv1 (Cart) | `#FFF8F0` | `#D4A574` | 2 chairs, counter only | 2 |
| Lv2 (Cafe) | `#FAF0E6` | `#C4956A` tile pattern | Wall frames, plants | 4 |
| Lv3 (Premium) | `#FDF5E6` | Checkerboard tile | Lighting, signage | 6 |
| Lv4 (Franchise) | Gradient | Marble pattern | Chandelier, VIP zone | 8 |

---

## §5. Core Game Loop (Frame-Based Logic Flow)

### §5.1 Game State Machine (FSM)

```
LOADING → TITLE → PLAYING → DAY_END → UPGRADE → PLAYING → ... → VICTORY
                    ↕
                  PAUSED
```

**State List (7)**:

| State | Description | Entry Condition |
|-------|-------------|----------------|
| `LOADING` | Canvas init, font pre-render | Page load |
| `TITLE` | Title screen + new game/continue | LOADING complete |
| `PLAYING` | Core gameplay (customer→order→brew→sell) | Start from TITLE / Next day from UPGRADE |
| `DAY_END` | Daily settlement animation (revenue/expenses/profit/stats) | dayTimer ≤ 0 |
| `UPGRADE` | Upgrade shopping screen | DAY_END settlement complete |
| `PAUSED` | Pause overlay | P/Esc input |
| `VICTORY` | Final rating + stats | Day 30 complete |

### §5.2 State Transition Rules

**All transitions go through `beginTransition()` without exception.** Direct `state = X` absolutely banned.

Supports `immediate` mode for states where instant transition is natural, like PAUSED (Cycle 8 wisdom).

```javascript
const STATE_PRIORITY = {
  VICTORY: 6,
  DAY_END: 4,
  UPGRADE: 3,
  PAUSED: 2,
  PLAYING: 1,
  TITLE: 0,
  LOADING: 0
};

// beginTransition with immediate mode added (Cycle 8 improvement)
function beginTransition(target, opts = {}) {
  if (STATE_PRIORITY[target] < STATE_PRIORITY[state] && !opts.force) return;
  if (isTransitioning && !opts.immediate) return;

  if (opts.immediate) {
    // For states where instant transition is natural, like PAUSED
    enterState(target);
    return;
  }

  isTransitioning = true;
  // fadeOut tween → onComplete → enterState(target) → isTransitioning = false
}
```

### §5.3 State × System Update Matrix

| System \ State | LOADING | TITLE | PLAYING | DAY_END | UPGRADE | PAUSED | VICTORY |
|--------------|---------|-------|---------|---------|---------|--------|---------|
| TweenManager.update(dt) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CustomerManager.update(dt) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| BrewingSystem.update(dt) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| BaristaAI.update(dt) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| DayTimer.update(dt) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ParticleSystem.update(dt) | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| AudioManager (BGM) | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| InputHandler | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Render (per-state draw) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> ⚠️ TweenManager updates even in PAUSED state (Cycle 2 B1 prevention: modal alpha stuck at 0 bug). However, CustomerManager/BrewingSystem/DayTimer are stopped.

> ⚠️ All draw/render functions receive `dt` as a parameter. Hardcoding like `drawTitle(ctx, 0.016)` assumes 60fps and causes animation speed to vary on high/low refresh rates (Cycle 8 technical improvement item).

---

## §6. Difficulty System

### §6.1 Day-Based Progressive Difficulty

All values defined as constants in `CONFIG` object. 1:1 mapping with design doc values.

```javascript
const CONFIG = {
  // §6.1 Difficulty scaling
  DAY_DURATION: 30,                          // seconds
  MORNING_RATIO: 0.5,                        // Morning ratio (50%)
  AFTERNOON_SPAWN_MULT: 0.7,                 // Afternoon spawn interval multiplier

  CUSTOMER_BASE_INTERVAL: 5.0,               // seconds
  CUSTOMER_INTERVAL_DECAY: 0.1,              // per day
  CUSTOMER_MIN_INTERVAL: 2.0,                // seconds
  CUSTOMER_PATIENCE_NORMAL: 5.0,             // seconds
  CUSTOMER_PATIENCE_RUSHED: 3.0,
  CUSTOMER_PATIENCE_VIP: 7.0,
  CUSTOMER_PATIENCE_REGULAR: 6.0,

  // §2.2 Customer type appearance weights
  CUSTOMER_WEIGHTS: {
    EARLY:  { normal: 0.80, rushed: 0.15, vip: 0.00, regular: 0.05 },  // Day 1-5
    MID:    { normal: 0.50, rushed: 0.25, vip: 0.15, regular: 0.10 },  // Day 6-15
    LATE:   { normal: 0.30, rushed: 0.30, vip: 0.25, regular: 0.15 },  // Day 16-30
  },

  // §2.1 Customer tip multipliers
  TIP_MULT_NORMAL: 1.0,
  TIP_MULT_RUSHED: 1.5,
  TIP_MULT_VIP: 2.0,
  TIP_MULT_REGULAR: 1.2,

  // §7 Pricing/revenue
  MENU_BASE_PRICE: 10,                       // Espresso base price
  TIP_PERFECT: 0.50,                         // 50% tip (perfect brewing)
  TIP_GOOD: 0.25,                            // 25% tip (1 mistake)
  TIP_NONE: 0.00,                            // 0% tip (2+ mistakes)

  // §7 Satisfaction
  SATISFACTION_INIT: 70,                     // Initial satisfaction %
  SATISFACTION_LEAVE_PENALTY: -5,            // % per leaving customer
  SATISFACTION_QUEUE_PENALTY: -5,            // % per queue overflow
  SATISFACTION_SERVE_BONUS: 2,               // % per successful serve
  SATISFACTION_PERFECT_BONUS: 3,             // % per perfect serve
  SATISFACTION_REGULAR_BONUS: 1,             // % regular extra bonus
  SATISFACTION_HIGH_THRESHOLD: 80,           // Above this = word-of-mouth effect
  SATISFACTION_LOW_THRESHOLD: 30,            // Below this = bad reviews
  SATISFACTION_HIGH_SPAWN_MULT: 1.2,         // Word-of-mouth: spawn +20%
  SATISFACTION_LOW_SPAWN_MULT: 0.7,          // Bad reviews: spawn -30%

  // §6.3 Upgrade prices
  UPGRADE_PRICES: {
    seat:      [0, 50, 150, 400],            // Seats (2→4→6→8)
    menu:      [0, 30, 80, 200, 500],        // Menu (2→3→4→5→6 types)
    barista:   [100, 300, 800],              // Barista (hire/speed up/master)
    interior:  [0, 200, 600, 1500],          // Interior Lv1~4
    machine:   [0, 100, 350, 900],           // Machine (brew speed -20%/level)
    shop2:     [2000],                       // 2nd shop opening
    shop3:     [5000],                       // 3rd shop opening
  },

  // §6.3 Barista
  BARISTA_SPEED: [4.0, 3.0, 2.0],           // seconds/cup (Lv1, Lv2, Lv3)
  BARISTA_TIP_RATE: [0.25, 0.25, 0.35],     // Tip rate (Lv1, Lv2, Lv3)
  BARISTA_MENU_LIMIT: [2, 4, 6],            // Auto-brewable menu count
  BARISTA_DAILY_WAGE: [5, 10, 20],           // Daily wage (Lv1, Lv2, Lv3)

  // §8 Shop expansion
  SHOP2_IDLE_BASE: 20,                      // 2nd shop base idle revenue/Day
  SHOP3_IDLE_BASE: 35,                      // 3rd shop base idle revenue/Day
  SHOP_IDLE_INTERIOR_MULT: 0.3,             // Interior level bonus multiplier
  SHOP2_MIN_DAY: 15,                        // 2nd shop unlock minimum Day
  SHOP3_MIN_DAY: 25,                        // 3rd shop unlock minimum Day

  // §7 Score/grades
  GRADE_S: 20000,
  GRADE_A: 12000,
  GRADE_B: 6000,
  SCORE_PERFECT_BONUS: 50,
  SCORE_SHOP_BONUS: 2000,
  SCORE_SATISFACTION_MULT: 100,
  SCORE_LOST_PENALTY: 30,
};
```

### §6.2 Menu System

| Menu | Unlock | Steps | Base Price (₩) | Ingredient Order |
|------|--------|-------|---------------|-----------------|
| Espresso | Start | 2 | 10 | Beans→Water |
| Americano | Start | 2 | 15 | Beans→Water (more) |
| Caffe Latte | Menu Lv2 | 3 | 25 | Beans→Water→Milk |
| Caramel Macchiato | Menu Lv3 | 4 | 40 | Beans→Water→Milk→Syrup |
| Frappuccino | Menu Lv4 | 4 | 50 | Beans→Milk→Ice→Whip |
| Special Blend | Menu Lv5 | 5 | 70 | Beans→Water→Milk→Syrup→Whip |

### §6.3 Barista Automation

| Level | Cost (₩) | Effect | Brew Speed | Tip Rate |
|-------|---------|--------|-----------|---------|
| Lv1 (Hire) | 100 | Auto-brews 2 basic menus | 4s/cup | 25% |
| Lv2 (Skilled) | 300 | Auto-brews up to 4 menus | 3s/cup | 25% |
| Lv3 (Master) | 800 | Auto-brews all menus + tip bonus | 2s/cup | 35% |

> Player manual brewing is always faster and gives higher tips than barista → **Maintains value of manual play**

---

## §7. Scoring System

### Gold (₩) — In-Game Currency
```
Serving revenue = menuPrice × (1 + tipRate) × customerTipMult
Daily revenue = Σ(all serving revenues) + Σ(idle shop revenues)
Daily expenses = Σ(barista daily wages)
Net profit = daily revenue - daily expenses
```

### Rating Score (Calculated at VICTORY)
```javascript
function calcFinalScore(scoreData, config) {
  const score = scoreData.totalGold
    + (scoreData.perfectServes * config.SCORE_PERFECT_BONUS)
    + (scoreData.shopsOpened * config.SCORE_SHOP_BONUS)
    + (scoreData.avgSatisfaction * config.SCORE_SATISFACTION_MULT)
    - (scoreData.customersLost * config.SCORE_LOST_PENALTY);

  let grade;
  if (score >= config.GRADE_S) grade = 'S';
  else if (score >= config.GRADE_A) grade = 'A';
  else if (score >= config.GRADE_B) grade = 'B';
  else grade = 'C';

  return { score, grade };
}
```

### Satisfaction System
```
Initial: 70% (CONFIG.SATISFACTION_INIT)
Successful serve: +2% (CONFIG.SATISFACTION_SERVE_BONUS)
Perfect serve: +3% (CONFIG.SATISFACTION_PERFECT_BONUS)
Regular serve: extra +1% (CONFIG.SATISFACTION_REGULAR_BONUS)
Customer leaves: -5% (CONFIG.SATISFACTION_LEAVE_PENALTY)
Queue overflow: -5% (CONFIG.SATISFACTION_QUEUE_PENALTY)
Range: 0% ~ 100%
Effect: Satisfaction ≥ 80% → Customer spawn ×1.2 (word-of-mouth)
        Satisfaction ≤ 30% → Customer spawn ×0.7 (bad reviews)
```

### DAY_END Settlement Screen Stats (Cycle 7 "Shortcomings" Applied: Stats Dashboard)
```
┌──────────────────────────┐
│    Day {N} Closed!        │
│                          │
│  Revenue: ₩{revenue}     │
│  Expenses: ₩{expense}    │
│  Net Profit: ₩{profit}   │
│  ────────────────        │
│  Served: {served}         │
│  Perfect: {perfect} ({%}) │
│  Lost: {lost}             │
│  Satisfaction: {sat}%     │
│                          │
│  [Start Next Day →]       │
└──────────────────────────┘
```

---

## §8. Shop Expansion System (Idle Revenue)

### Multi-Shop Structure
| Shop | Unlock Cost | Unlock Day | Idle Revenue/Day |
|------|-----------|-----------|-----------------|
| Shop 1 (current operation) | Free | Day 1 | Manual + barista revenue |
| Shop 2 | 2000₩ | Day 15+ | `20₩ × (1 + interiorLv × 0.3)` / Day |
| Shop 3 | 5000₩ | Day 25+ | `35₩ × (1 + interiorLv × 0.3)` / Day |

- Shop 2/3 are fully automatic (idle) revenue — player focuses on Shop 1
- Mini building icons shown at screen top on expansion + revenue popup
- Idle revenue summed at DAY_END settlement (not shown per-frame → settlement "surprise" effect)

### Idle Revenue Formula (Pure Function)
```javascript
function calcIdleRevenue(shopCount, interiorLevel, config) {
  let idle = 0;
  if (shopCount >= 2) idle += config.SHOP2_IDLE_BASE * (1 + interiorLevel * config.SHOP_IDLE_INTERIOR_MULT);
  if (shopCount >= 3) idle += config.SHOP3_IDLE_BASE * (1 + interiorLevel * config.SHOP_IDLE_INTERIOR_MULT);
  return Math.floor(idle);
}
```

---

## §9. Sound Design (Web Audio API Procedural Generation)

Zero external audio files. All sounds generated via OscillatorNode + GainNode.

| Event | Sound | Implementation |
|-------|-------|---------------|
| Customer enters | Door bell "ding-dong" | sine 800Hz→600Hz, 0.15s |
| Ingredient added | Pop sound | triangle 400Hz, 0.05s |
| Ingredient mistake | Low "beep" | square 200Hz, 0.1s |
| Drink completed | Bright chime | sine C5→E5→G5 arpeggio, 0.3s |
| Perfect serve | Fanfare | sine C5+E5+G5 chord, 0.4s |
| Customer leaves | Low "boop" | sine 200Hz→100Hz, 0.2s |
| Gold earned | Coin sound | square 1000Hz→1200Hz, 0.1s |
| Upgrade | Level up | sine sweep 400→800Hz, 0.3s |
| Day ends | Bell | sine 600Hz, decay 0.5s |
| Shop opens | Celebration fanfare | sine C4→E4→G4→C5 arpeggio, 0.6s |
| BGM (PLAYING) | Soft jazz loop | sine+triangle chord progression Cmaj7→Fmaj7→G7→Cmaj7, 4-bar repeat (Cycle 8 verified pattern) |

---

## §10. Pure Function Design (Zero Global Reference Goal)

All game logic functions written as pure functions receiving data via parameters. Only `CONFIG` constant object allowed as global reference. Pattern maintaining zero global references for 2 consecutive cycles (Cycles 7~8).

### 18 Function Signatures Pre-Defined

```javascript
// Customer system (4)
function spawnCustomer(day, satisfaction, seatCount, customers, config) → Customer | null
function updateCustomer(customer, dt, config) → { customer, event: 'waiting'|'angry'|'left' }
function getCustomerWeights(day, config) → { normal, rushed, vip, regular }
function getCustomerPatience(type, config) → number

// Brewing system (3)
function getRecipe(menuId, config) → { steps: string[], price: number }
function checkBrewAccuracy(inputSteps, recipeSteps) → 'perfect' | 'good' | 'fail'
function calcServingRevenue(menuPrice, accuracy, customerTipMult, config) → number

// Barista AI (2)
function updateBarista(barista, customers, dt, config) → { barista, servedCustomer: Customer|null }
function getBaristaSpeed(level, config) → number

// Economy (3)
function calcDayResult(dayRevenues, dayExpenses, idleRevenue) → { revenue, expense, profit }
function canAfford(gold, price) → boolean
function applyUpgrade(shopData, upgradeType, config) → shopData

// Satisfaction (2)
function updateSatisfaction(current, event, config) → number
function getSatisfactionEffect(satisfaction, config) → { spawnMultiplier: number }

// Score (1)
function calcFinalScore(scoreData, config) → { score: number, grade: string }

// Shop expansion (1)
function calcIdleRevenue(shopCount, interiorLevel, config) → number

// Save (2)
function serializeState(shopData) → string
function deserializeState(json) → shopData | null
```

---

## §13. Verification Checklist

### §13.1 Pre-Commit Hook (Block Commit When assets/ Exists)

```bash
#!/bin/sh
# .git/hooks/pre-commit
GAME_DIR="games/mini-coffee-tycoon"
if [ -d "$GAME_DIR/assets" ]; then
  echo "ERROR: $GAME_DIR/assets/ directory exists."
  echo "   100% Canvas code drawing policy violated. Delete assets/ and retry."
  exit 1
fi
```

> **Key (Cycle 8 wisdom):** Writing this script in the design doc and **actually registering it in `.git/hooks/pre-commit`** are completely different steps. The root cause of 8-cycle asset recurrence was "specified but not registered."

### §13.4 Code Review Checklist

**Pure function verification:**
- [ ] All 18 pure functions from §10 verified: zero direct global variable references (CONFIG also passed as parameter)
- [ ] All declared variables verified for intended update/usage (zero ghost variables)
- [ ] Each value has only one update path: either tween OR direct assignment

**State transition verification:**
- [ ] All state transitions go through beginTransition() (direct `state =` banned)
- [ ] PAUSED transition uses `beginTransition('PAUSED', { immediate: true })`
- [ ] isTransitioning guard flag applied to all tween state transitions

**Asset verification:**
- [ ] assets/ directory does not exist
- [ ] Zero SVG/PNG/JPG/GIF files
- [ ] Zero Google Fonts or external resource loads
- [ ] `.git/hooks/pre-commit` registration confirmed (Cycle 8 new)

**Code quality:**
- [ ] All draw/render functions receive dt as parameter (hardcoding banned, Cycle 8 new)
- [ ] State × system matrix (§5.3) matches actual gameLoop code

### §13.5 Design-Implementation Value Consistency Verification Table

36 items mapped 1:1 between design doc values and code CONFIG constants, including:
- Day duration, customer intervals, patience values, tip multipliers
- Satisfaction thresholds and bonuses
- Barista speed/tip rates/wages per level
- Grade thresholds (S/A/B/C)
- Shop unlock costs and idle revenue rates

> ⚠️ All 36 rows must be cross-verified against code constants during code review. Prevents Cycle 7 critical value mismatch (30% vs 25%) recurrence.

---

## §14. Sidebar / Game Card Metadata

### Game Page Sidebar

```yaml
game:
  title: "Mini Coffee Shop Tycoon"
  description: "Start from a small coffee cart and grow into the city's top coffee chain! Brew drinks manually, hire baristas, and expand your shops in this hybrid casual tycoon."
  genre: ["casual", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "Mouse/Touch: Click ingredient slots to brew drinks"
    - "1~6 Keys: Ingredient slot shortcuts"
    - "Space: Complete drink/serve"
    - "P/Esc: Pause"
    - "Tab: Switch upgrade category"
    - "Enter: Purchase upgrade/Start next day"
  tags:
    - "#coffeeshop"
    - "#tycoon"
    - "#management"
    - "#idle"
    - "#casual"
    - "#strategy"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## §15. Implementation Priority (Recommended Order)

1. **Phase 0 — Infrastructure**: **Actually register** pre-commit hook in `.git/hooks/pre-commit` + set execution permission
2. **Phase 1 — Skeleton**: Canvas setup + DPR support + FSM (7 states) + enterState + beginTransition (immediate mode included) + gameLoop (dt passed)
3. **Phase 2 — Customers**: CustomerManager + spawn/move/wait/leave + ObjectPool + patience bar
4. **Phase 3 — Brewing**: BrewingSystem + ingredient slot UI (triple distinction) + accuracy check + serving
5. **Phase 4 — Economy**: Gold system + satisfaction + DAY_END settlement (stats included) + localStorage
6. **Phase 5 — Upgrades**: UPGRADE state + menu/seat/machine/interior/barista purchases
7. **Phase 6 — Barista AI**: BaristaAI auto-brewing + NPC rendering
8. **Phase 7 — Shop Expansion**: Shop 2/3 idle revenue + mini building UI + VICTORY settlement
9. **Phase 8 — Polish**: Particles + SFX + BGM + transition animations + interior visual changes

> Run §13.2 banned pattern verification frequently after each Phase completion (Cycle 5 wisdom: once after completion is insufficient).

---

_Written: 2026-03-20 | InfiniTriX Cycle #8 Game Designer_
_Designed based on Cycles 1~8 cumulative platform wisdom + analysis report_
