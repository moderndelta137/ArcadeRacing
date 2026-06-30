import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MAX_SPEED = 140;
const DECK_SIZE = 12;
const MAX_COPIES = 4;
const COMMON_IDS = new Set(['drift', 'full_throttle', 'back_down']);
const HRCN_POOL = [
  'drift',
  'full_throttle',
  'back_down',
  'clutch_kick',
  'trail_braking',
  'full_countersteer',
  'exit_drift',
  'drift_extend',
  'gutter_boost',
  'blind_attack',
  'jump_exit'
];
const P911_POOL = [
  'drift',
  'full_throttle',
  'back_down',
  'progressive_acceleration',
  'early_power',
  'traction_control',
  'grip_line',
  'balanced_chassis',
  'torque_split',
  'micro_correction',
  'line_lock'
];
const GT500_POOL = [
  'drift',
  'full_throttle',
  'back_down',
  'raw_horsepower',
  'straight_line_monster',
  'panic_stop',
  'chrome_bumper',
  'shove_aside',
  'burn_rubber',
  'door_slam',
  'no_room'
];
const AE86_POOL = [
  'drift',
  'full_throttle',
  'back_down',
  'hard_brake',
  'change_lane',
  'early_brake_cornering',
  'rocket_start',
  'change_shift'
];
const DEFAULT_DECKS = {
  ae86: expandDeck([
    ['drift', 2],
    ['full_throttle', 3],
    ['back_down', 2],
    ['hard_brake', 1],
    ['change_lane', 1],
    ['early_brake_cornering', 1],
    ['rocket_start', 1],
    ['change_shift', 1]
  ]),
  huracan: expandDeck([
    ['drift', 1],
    ['full_throttle', 3],
    ['back_down', 2],
    ['clutch_kick', 1],
    ['trail_braking', 1],
    ['full_countersteer', 1],
    ['exit_drift', 1],
    ['gutter_boost', 1],
    ['jump_exit', 1]
  ]),
  porsche911: expandDeck([
    ['progressive_acceleration', 3],
    ['early_power', 2],
    ['traction_control', 2],
    ['torque_split', 3],
    ['micro_correction', 2]
  ]),
  mustang: expandDeck([
    ['straight_line_monster', 1],
    ['panic_stop', 2],
    ['shove_aside', 2],
    ['burn_rubber', 2],
    ['door_slam', 1],
    ['no_room', 4]
  ])
};

function expandDeck(entries) {
  return entries.flatMap(([id, count]) => Array.from({ length: count }, () => id));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n') {
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') cell += ch;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift();
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(array, rng) {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function getGear(speed) {
  if (speed <= 20) return { gear: 1, mp: 1 };
  if (speed <= 50) return { gear: 2, mp: 2 };
  if (speed <= 80) return { gear: 3, mp: 3 };
  if (speed <= 110) return { gear: 4, mp: 4 };
  return { gear: 5, mp: 5 };
}

function getPenaltySpeed(gearLevel) {
  if (gearLevel <= 1) return 0;
  if (gearLevel === 2) return 20;
  if (gearLevel === 3) return 50;
  if (gearLevel === 4) return 80;
  return 110;
}

const clampSpeed = speed => Math.max(0, Math.min(MAX_SPEED, speed));

function drawCards(player, count, rng) {
  while (player.hand.length < count) {
    if (player.deck.length === 0) {
      if (player.discard.length === 0) break;
      player.deck = shuffle(player.discard, rng);
      player.discard = [];
    }
    player.hand.push(player.deck.pop());
    player.telemetry.drawn++;
  }
}

function buildCatalog(rows) {
  const byId = Object.fromEntries(rows.map(row => [row.id, row]));
  return Object.fromEntries(rows.filter(row => String(row.implemented).toLowerCase() === 'true').map(row => {
    const req = String(row.requirement || '');
    const min = req.match(/^Min\s+(\d+)/i);
    const max = req.match(/^Max\s+(\d+)/i);
    const speedDelta = Number(row.effect.match(/Speed\s*([+-])\s*(\d+)/i)?.slice(1).reduce((sign, n) => sign === '-' ? -Number(n) : Number(n)) || 0);
    const canPlay = player => min ? player.speed >= Number(min[1]) : max ? player.speed <= Number(max[1]) : true;
    return [row.id, { ...row, speedDelta, canPlay, row: byId[row.id] }];
  }));
}

function buildTrack(seed, cardCount = 12) {
  const cards = parseCsv(fs.readFileSync(path.join(ROOT, 'racing_corner_cards.csv'), 'utf8'));
  const rng = makeRng(seed);
  const spaces = [[], []];
  let distance = 0;
  const addPair = (limit, innerLane = null, roadCard = 'STRAIGHT') => {
    const idx0 = spaces[0].length;
    const idx1 = spaces[1].length;
    spaces[0].push({ lane: 0, idx: idx0, adj: [idx1], limit: innerLane === 0 ? limit : limit === null ? null : limit + 20, isOuter: innerLane === 1, distance, roadCard });
    spaces[1].push({ lane: 1, idx: idx1, adj: [idx0], limit: innerLane === 1 ? limit : limit === null ? null : limit + 20, isOuter: innerLane === 0, distance, roadCard });
    distance += 140;
  };
  for (let i = 0; i < 4; i++) addPair(null, null, 'START');
  for (let c = 0; c < cardCount; c++) {
    const card = cards[Math.floor(rng() * cards.length)];
    for (let i = 0; i < Number(card.entry_spaces); i++) addPair(null, null, card.name);
    for (const segment of JSON.parse(card.segments_json)) {
      if (segment.type === 'straight') {
        for (let i = 0; i < segment.spaces; i++) addPair(null, null, card.name);
      } else {
        const innerLane = rng() >= 0.5 ? 0 : 1;
        for (let i = 0; i < Math.max(segment.in_spaces, segment.out_spaces); i++) addPair(segment.speed_limit, innerLane, card.name);
      }
    }
    for (let i = 0; i < Number(card.exit_spaces); i++) addPair(null, null, card.name);
  }
  for (let i = 0; i < 5; i++) addPair(null, null, 'FINISH');
  spaces[0][spaces[0].length - 1].isGoal = true;
  spaces[1][spaces[1].length - 1].isGoal = true;
  return spaces;
}

function makePlayer(id, name, deck, rng) {
  const player = {
    id,
    name,
    lane: id,
    idx: 0,
    distance: 0,
    speed: 0,
    deck: shuffle(deck, rng),
    discard: [],
    hand: [],
    modifiers: {},
    lastCornerSpeedBonus: 0,
    telemetry: {
      drawn: 0,
      played: {},
      playable: {},
      passedChecks: 0,
      failedChecks: 0,
      understeers: 0,
      blocks: 0,
      skips: 0,
      beforePlayDistance: {}
    }
  };
  drawCards(player, 4, rng);
  return player;
}

function effectiveCheck(player, space) {
  if (!space || space.limit === null || player.modifiers.ignoreSpeedLimits) return null;
  let limit = space.limit;
  if (player.modifiers.driftBonus) limit += player.modifiers.driftBonus;
  if (player.modifiers.innerLaneSpeedCheckBonus && !space.isOuter) limit += player.modifiers.innerLaneSpeedCheckBonus;
  if (player.modifiers.lineLockBonus && player.modifiers.lineLockLane === player.lane) limit += player.modifiers.lineLockBonus;
  if (player.modifiers.speedCheckBonusOnce) limit += player.modifiers.speedCheckBonusOnce;
  const speed = player.modifiers.trailBraking && player.speed > limit ? Math.max(0, player.speed - 10) : player.speed;
  return { speed, limit };
}

function applyCard(cardId, player, opponent, track, cards, opts = {}) {
  player.discard.push(cardId);
  player.telemetry.played[cardId] = (player.telemetry.played[cardId] || 0) + 1;
  player.telemetry.beforePlayDistance[cardId] ??= [];
  player.telemetry.beforePlayDistance[cardId].push(player.distance);
  switch (cardId) {
    case 'full_throttle':
      player.speed = clampSpeed(player.speed + 40);
      break;
    case 'back_down':
      player.speed = clampSpeed(player.speed - 20);
      if (!opts.skipCycle) cycleWorst(player, opponent, track, cards, 1, true);
      break;
    case 'hard_brake':
      player.speed = clampSpeed(player.speed - 50);
      break;
    case 'change_lane':
      changeLane(player, opponent, track);
      if (!opts.skipCycle) cycleWorst(player, opponent, track, cards, 1, true);
      break;
    case 'drift':
      player.modifiers.driftBonus = Math.max(player.modifiers.driftBonus || 0, 30);
      break;
    case 'early_brake_cornering':
      player.speed = clampSpeed(player.speed - 20);
      if (track[player.lane][player.idx].isOuter) changeLane(player, opponent, track);
      break;
    case 'rocket_start':
      player.modifiers.rocketSpeedDelta = 50;
      if (!opts.skipCycle) cycleWorst(player, opponent, track, cards, 2, false);
      break;
    case 'change_shift':
      resolveChangeShift(player, track);
      player.modifiers.extraCardPlay = true;
      break;
    case 'clutch_kick':
      player.speed = clampSpeed(player.speed + 20);
      player.modifiers.speedCheckBonusOnce = Math.max(player.modifiers.speedCheckBonusOnce || 0, 50);
      break;
    case 'trail_braking':
      player.modifiers.trailBraking = true;
      break;
    case 'full_countersteer':
      player.modifiers.countersteerCancel = true;
      break;
    case 'exit_drift':
      player.modifiers.exitDriftPending = true;
      break;
    case 'drift_extend':
      if (player.lastCornerSpeedBonus) player.modifiers.driftBonus = Math.max(player.modifiers.driftBonus || 0, player.lastCornerSpeedBonus);
      break;
    case 'gutter_boost':
      player.modifiers.innerLaneSpeedCheckBonus = 50;
      break;
    case 'blind_attack':
      player.discard.push(...player.hand);
      player.hand = [];
      player.modifiers.blindAttack = true;
      break;
    case 'jump_exit':
      player.modifiers.fixedMovePoints = 4;
      player.modifiers.ignoreSpeedLimits = true;
      break;
    case 'progressive_acceleration':
      player.modifiers.progressiveAcceleration = true;
      break;
    case 'early_power':
      player.modifiers.earlyPowerPending = true;
      break;
    case 'traction_control':
      player.modifiers.tractionControl = true;
      break;
    case 'grip_line':
      player.modifiers.driftBonus = Math.max(player.modifiers.driftBonus || 0, 20);
      if (!opts.skipCycle) cycleWorst(player, opponent, track, cards, 1, true);
      break;
    case 'balanced_chassis':
      player.modifiers.balancedChassis = true;
      break;
    case 'torque_split':
      resolveTorqueSplit(player, track);
      break;
    case 'micro_correction':
      player.modifiers.microCorrection = true;
      break;
    case 'line_lock':
      player.modifiers.lineLockLane = player.lane;
      player.modifiers.lineLockBonus = 30;
      break;
    case 'raw_horsepower':
      player.speed = clampSpeed(player.speed + 50);
      player.modifiers.forwardOnly = true;
      break;
    case 'straight_line_monster': {
      const current = track[player.lane][player.idx];
      player.speed = clampSpeed(player.speed + (current.limit === null ? 40 : 20));
      break;
    }
    case 'panic_stop':
      player.speed = clampSpeed(player.speed - 80);
      player.discard.push(...player.hand);
      player.hand = [];
      break;
    case 'chrome_bumper':
      player.modifiers.chromeBumper = true;
      break;
    case 'shove_aside':
      player.modifiers.shoveAside = true;
      break;
    case 'burn_rubber':
      player.modifiers.burnRubberPending = true;
      break;
    case 'door_slam':
      changeLane(player, opponent, track);
      player.modifiers.doorSlam = true;
      break;
    case 'no_room':
      player.modifiers.noRoomLane = player.lane;
      break;
    default:
      throw new Error(`Unsupported card: ${cardId}`);
  }
}

function changeLane(player, opponent, track) {
  const newLane = 1 - player.lane;
  const newIdx = track[player.lane][player.idx].adj.at(-1) ?? player.idx;
  if (opponent.lane === newLane && opponent.idx === newIdx) return false;
  player.lane = newLane;
  player.idx = newIdx;
  player.distance = track[newLane][newIdx].distance;
  return true;
}

function resolveChangeShift(player, track) {
  const next = track[player.lane][Math.min(player.idx + 1, track[player.lane].length - 1)];
  const up = effectiveCheck({ ...player, speed: clampSpeed(player.speed + 10), modifiers: { ...player.modifiers, pendingChoice: null } }, next);
  player.speed = clampSpeed(player.speed + (up && up.speed > up.limit ? -10 : 10));
}

function resolveTorqueSplit(player, track) {
  const next = track[player.lane][Math.min(player.idx + 1, track[player.lane].length - 1)];
  const withSpeed = effectiveCheck({ ...player, speed: clampSpeed(player.speed + 30) }, next);
  if (withSpeed && withSpeed.speed > withSpeed.limit) {
    player.modifiers.speedCheckBonusOnce = Math.max(player.modifiers.speedCheckBonusOnce || 0, 40);
  } else {
    player.speed = clampSpeed(player.speed + 30);
  }
}

function cycleWorst(player, opponent, track, cards, max, required) {
  const count = Math.min(max, player.hand.length, required ? max : 1);
  if (count <= 0) return;
  const ranked = player.hand
    .map((id, index) => ({ id, index, score: scoreCard(id, player, opponent, track, cards) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map(item => item.index);
  const set = new Set(ranked);
  player.discard.push(...player.hand.filter((_, i) => set.has(i)));
  player.hand = player.hand.filter((_, i) => !set.has(i));
}

function validMoves(player, track) {
  const moves = [];
  if (track[player.lane][player.idx + 1]) moves.push({ lane: player.lane, idx: player.idx + 1 });
  for (const adj of track[player.lane][player.idx].adj || []) {
    if (track[1 - player.lane][adj]) moves.push({ lane: 1 - player.lane, idx: adj });
  }
  return moves;
}

function scorePosition(player, opponent, track) {
  const space = track[player.lane][player.idx];
  let score = player.distance + player.speed * 1.5 + getGear(player.speed).mp * 12;
  if (player.distance > opponent.distance) score += 80;
  const check = effectiveCheck(player, space);
  if (check && check.speed > check.limit) score -= (check.speed - check.limit) * (space.isOuter ? 12 : 7) + 180;
  if (space?.isGoal) score += 100000;
  return score;
}

function scoreCard(cardId, player, opponent, track, cards) {
  const card = cards[cardId];
  if (!card || !card.canPlay(player)) return -Infinity;
  const test = clonePlayer(player);
  const before = scorePosition(test, opponent, track);
  applyCard(cardId, test, opponent, track, cards, { skipCycle: true });
  const moveScore = Math.max(scorePosition(test, opponent, track), ...validMoves(test, track).map(move => scorePosition({ ...test, ...move, distance: track[move.lane][move.idx].distance }, opponent, track)));
  const handCost = Math.max(0, player.hand.length - test.hand.length) * 16;
  return moveScore - before - handCost;
}

function chooseCard(player, opponent, track, cards) {
  for (const id of player.hand) {
    if (cards[id]?.canPlay(player)) player.telemetry.playable[id] = (player.telemetry.playable[id] || 0) + 1;
  }
  const candidates = player.hand
    .map((id, index) => ({ id, index, score: scoreCard(id, player, opponent, track, cards) }))
    .filter(item => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score);
  if (!candidates.length || candidates[0].score < 8) return null;
  return candidates[0];
}

function chooseMove(player, opponent, track) {
  const moves = validMoves(player, track)
    .map(move => {
      const moved = { ...player, ...move, distance: track[move.lane][move.idx].distance };
      let score = scorePosition(moved, opponent, track);
      if (move.lane === player.lane) score += 12;
      return { ...move, score };
    })
    .sort((a, b) => b.score - a.score);
  return moves[0] ?? null;
}

function moveOne(player, opponent, track) {
  const move = chooseMove(player, opponent, track);
  if (!move) return { goal: false, crash: false };
  if (player.modifiers.forwardOnly && move.lane !== player.lane) return { goal: false, crash: false };
  if (opponent.modifiers.noRoomLane === move.lane && !(opponent.lane === move.lane && opponent.idx === move.idx)) return { goal: false, crash: false };
  if (opponent.lane === move.lane && opponent.idx === move.idx) {
    player.telemetry.blocks++;
    if (player.modifiers.chromeBumper && player.hand.length > 0) {
      player.discard.push(player.hand.shift());
      opponent.speed = clampSpeed(opponent.speed - 40);
      delete player.modifiers.chromeBumper;
    }
    if (player.modifiers.doorSlam) {
      opponent.speed = clampSpeed(opponent.speed - 20);
      opponent.modifiers.skipRemainingMove = true;
    }
    if (player.modifiers.shoveAside) {
      const oldLane = opponent.lane;
      const oldIdx = opponent.idx;
      if (changeLane(opponent, player, track)) {
        player.lane = oldLane;
        player.idx = oldIdx;
        player.distance = track[oldLane][oldIdx].distance;
        delete player.modifiers.shoveAside;
        return { goal: false, crash: false };
      }
      player.speed = getPenaltySpeed(getGear(player.speed).gear - 2);
      opponent.speed = getPenaltySpeed(getGear(opponent.speed).gear - 2);
      opponent.modifiers.skipRemainingMove = true;
      return { goal: false, crash: true };
    }
    if (player.modifiers.blindAttack && changeLane(player, opponent, track)) return { goal: false, crash: false, blocked: true };
    if (player.speed > opponent.speed) player.speed = opponent.speed;
    return { goal: false, crash: false, blocked: true };
  }
  const oldLane = player.lane;
  player.lane = move.lane;
  player.idx = move.idx;
  player.distance = track[move.lane][move.idx].distance;
  const movedSideways = oldLane !== player.lane;
  const freeSideStep = movedSideways && player.modifiers.balancedChassis && player.hand.length > 0;
  if (freeSideStep) {
    player.discard.push(player.hand.shift());
    delete player.modifiers.balancedChassis;
  }
  const space = track[player.lane][player.idx];
  if (space.isGoal) return { goal: true, crash: false };
  const check = effectiveCheck(player, space);
  if (check) {
    player.modifiers.passedSpeedCheck = true;
    if (player.modifiers.trailBraking && player.speed > check.limit) player.speed = check.speed;
    if (player.modifiers.speedCheckBonusOnce) delete player.modifiers.speedCheckBonusOnce;
      if (check.speed <= check.limit || player.modifiers.ignoreSpeedLimits) {
        player.telemetry.passedChecks++;
      player.modifiers.usedCornerSpeedBonus = Math.max(
        player.modifiers.usedCornerSpeedBonus || 0,
        player.modifiers.driftBonus || 0,
        player.modifiers.innerLaneSpeedCheckBonus || 0
      );
    } else {
      player.telemetry.failedChecks++;
      player.telemetry.understeers++;
      player.modifiers.speedCheckFailed = true;
      if (player.modifiers.tractionControl) {
        delete player.modifiers.tractionControl;
        player.speed = clampSpeed(player.speed - 20);
        return { goal: false, crash: false, refund: freeSideStep };
      }
      if (player.modifiers.countersteerCancel && player.hand.length > 0) {
        player.discard.push(player.hand.shift());
        delete player.modifiers.countersteerCancel;
      } else if (space.isOuter) {
        player.speed = getPenaltySpeed(getGear(player.speed).gear - (space.guardrail ? 1 : 2));
        return { goal: false, crash: true };
      } else {
        changeLane(player, opponent, track);
      }
      if (player.modifiers.microCorrection) {
        const down = effectiveCheck({ ...player, speed: clampSpeed(player.speed - 10), modifiers: { ...player.modifiers, microCorrection: false } }, space);
        player.speed = clampSpeed(player.speed + (down && down.speed <= down.limit ? -10 : 10));
      }
    }
  }
  if (player.modifiers.progressiveAcceleration) player.speed = clampSpeed(player.speed + 10);
  return { goal: false, crash: false, refund: freeSideStep };
}

function cleanup(player, opponent, rng) {
  if (player.modifiers.rocketSpeedDelta) player.speed = clampSpeed(player.speed + player.modifiers.rocketSpeedDelta);
  if (player.modifiers.exitDriftPending && player.modifiers.passedSpeedCheck) player.speed = clampSpeed(player.speed + 30);
  if (player.modifiers.earlyPowerPending && player.modifiers.passedSpeedCheck && !player.modifiers.speedCheckFailed) player.speed = clampSpeed(player.speed + 40);
  if (player.modifiers.burnRubberPending && player.distance > opponent.distance) {
    player.speed = clampSpeed(player.speed + 60);
    player.discard.push(...player.hand);
    player.hand = [];
  }
  player.lastCornerSpeedBonus = Math.max(
    player.modifiers.driftBonus || 0,
    player.modifiers.innerLaneSpeedCheckBonus || 0,
    player.modifiers.speedCheckBonusOnce || 0,
    player.modifiers.usedCornerSpeedBonus || 0
  );
  player.modifiers = {};
  drawCards(player, 4, rng);
}

function clonePlayer(player) {
  return {
    ...player,
    deck: [...player.deck],
    discard: [...player.discard],
    hand: [...player.hand],
    modifiers: { ...player.modifiers },
    telemetry: {
      ...player.telemetry,
      played: { ...player.telemetry.played },
      playable: { ...player.telemetry.playable },
      beforePlayDistance: { ...player.telemetry.beforePlayDistance }
    }
  };
}

function playTurn(player, opponent, track, cards, rng) {
  let extra = true;
  while (extra) {
    extra = false;
    const pick = chooseCard(player, opponent, track, cards);
    if (pick) {
      player.hand.splice(pick.index, 1);
      applyCard(pick.id, player, opponent, track, cards);
      extra = Boolean(player.modifiers.extraCardPlay);
      delete player.modifiers.extraCardPlay;
    } else {
      player.telemetry.skips++;
      cycleWorst(player, opponent, track, cards, 2, false);
    }
  }
  let mp = player.modifiers.fixedMovePoints ?? getGear(player.speed).mp;
  while (mp-- > 0) {
    const result = moveOne(player, opponent, track);
    if (result.goal) return true;
    if (result.crash) break;
    if (result.refund) mp++;
    if (player.modifiers.skipRemainingMove) break;
  }
  cleanup(player, opponent, rng);
  return false;
}

function orderPlayers(players) {
  const [a, b] = players;
  if (a.distance !== b.distance) return a.distance > b.distance ? [a, b] : [b, a];
  if (a.speed !== b.speed) return a.speed > b.speed ? [a, b] : [b, a];
  return a.lane === 1 ? [b, a] : [a, b];
}

function simulateGame({ seed, opponentDeck, opponentName, targetDeck, targetName, targetFirst, cards, roadCards }) {
  const rng = makeRng(seed ^ 0xA5A5A5A5);
  const track = buildTrack(seed, roadCards);
  const players = targetFirst
    ? [makePlayer(0, targetName, targetDeck, rng), makePlayer(1, opponentName, opponentDeck, rng)]
    : [makePlayer(0, opponentName, opponentDeck, rng), makePlayer(1, targetName, targetDeck, rng)];
  let order = orderPlayers(players);
  const maxTurns = Math.max(120, roadCards * 22);
  for (let turn = 1; turn <= maxTurns; turn++) {
    for (const player of order) {
      const opponent = players[1 - player.id];
      if (playTurn(player, opponent, track, cards, rng)) {
        return { winner: player.name, turns: turn, players, trackLength: track[0].at(-1).distance };
      }
    }
    order = orderPlayers(players);
  }
  return { winner: order[0].name, turns: maxTurns, players, timeout: true, trackLength: track[0].at(-1).distance };
}

function summarize(deckName, results, targetName, pool) {
  const totals = {};
  const played = {};
  const playable = {};
  const drawn = {};
  let wins = 0;
  let turns = 0;
  let lead = 0;
  let timeouts = 0;
  for (const result of results) {
    if (result.winner === targetName) wins++;
    if (result.timeout) timeouts++;
    turns += result.turns;
    const hrcn = result.players.find(player => player.name === targetName);
    const opponent = result.players.find(player => player.name !== targetName);
    lead += hrcn.distance - opponent.distance;
    for (const id of hrcn.deck.concat(hrcn.discard, hrcn.hand)) drawn[id] = (drawn[id] || 0);
    for (const [id, count] of Object.entries(hrcn.telemetry.played)) played[id] = (played[id] || 0) + count;
    for (const [id, count] of Object.entries(hrcn.telemetry.playable)) playable[id] = (playable[id] || 0) + count;
    totals.passedChecks = (totals.passedChecks || 0) + hrcn.telemetry.passedChecks;
    totals.failedChecks = (totals.failedChecks || 0) + hrcn.telemetry.failedChecks;
    totals.understeers = (totals.understeers || 0) + hrcn.telemetry.understeers;
    totals.skips = (totals.skips || 0) + hrcn.telemetry.skips;
    totals.blocks = (totals.blocks || 0) + hrcn.telemetry.blocks;
    totals.drawn = (totals.drawn || 0) + hrcn.telemetry.drawn;
  }
  return {
    deckName,
    targetName,
    pool,
    games: results.length,
    targetWinRate: wins / results.length,
    avgTurns: turns / results.length,
    avgDistanceLead: lead / results.length,
    timeoutRate: timeouts / results.length,
    passRate: totals.passedChecks / Math.max(1, totals.passedChecks + totals.failedChecks),
    understeersPerGame: totals.understeers / results.length,
    skipsPerGame: totals.skips / results.length,
    blocksPerGame: totals.blocks / results.length,
    played,
    playable
  };
}

function evaluate(deck, opponentDeck, opponentName, cards, games, roadCards, targetName, pool) {
  const results = [];
  for (let i = 0; i < games; i++) {
    results.push(simulateGame({
      seed: 100000 + Math.floor(i / 2),
      opponentDeck,
      opponentName,
      targetDeck: deck,
      targetName,
      targetFirst: i % 2 === 1,
      cards,
      roadCards
    }));
  }
  return summarize(describeDeck(deck), results, targetName, pool);
}

function describeDeck(deck) {
  const counts = {};
  for (const id of deck) counts[id] = (counts[id] || 0) + 1;
  return Object.entries(counts).map(([id, count]) => `${id}x${count}`).join(' ');
}

function generateCandidateDecks(pool, maxCommon = 5) {
  const decks = [];
  const walk = (start, remaining, counts) => {
    if (remaining === 0) {
      decks.push(Object.entries(counts).flatMap(([id, count]) => Array.from({ length: count }, () => id)));
      return;
    }
    for (let i = start; i < pool.length; i++) {
      const id = pool[i];
      if ((counts[id] || 0) >= MAX_COPIES) continue;
      counts[id] = (counts[id] || 0) + 1;
      walk(i, remaining - 1, counts);
      counts[id]--;
      if (!counts[id]) delete counts[id];
    }
  };
  walk(0, DECK_SIZE, {});
  return decks.filter(deck => deck.filter(id => COMMON_IDS.has(id)).length <= maxCommon && deck.some(id => !COMMON_IDS.has(id)));
}

function printSummary(label, summary, cards) {
  console.log(`\n## ${label}`);
  console.log(`deck=${summary.deckName}`);
  console.log(`${summary.targetName.toLowerCase()}_win=${(summary.targetWinRate * 100).toFixed(1)}% avg_turns=${summary.avgTurns.toFixed(1)} timeout=${(summary.timeoutRate * 100).toFixed(1)}% avg_lead=${summary.avgDistanceLead.toFixed(0)} pass=${(summary.passRate * 100).toFixed(1)}% understeer/game=${summary.understeersPerGame.toFixed(2)} skip/game=${summary.skipsPerGame.toFixed(2)}`);
  console.log('card,played_per_game,playable_seen_per_game');
  for (const id of summary.pool) {
    if (!summary.deckName.includes(`${id}x`)) continue;
    console.log(`${cards[id].name},${((summary.played[id] || 0) / summary.games).toFixed(2)},${((summary.playable[id] || 0) / summary.games).toFixed(2)}`);
  }
}

const args = new Map(process.argv.slice(2).map(arg => {
  const [key, value = true] = arg.replace(/^--/, '').split('=');
  return [key, value];
}));
const games = Number(args.get('games') || 1000);
const searchLimit = Number(args.get('search-limit') || 250);
const roadCards = Number(args.get('road-cards') || 8);
const CAR_CONFIGS = {
  ae86: { name: 'AE86', deck: DEFAULT_DECKS.ae86, pool: AE86_POOL },
  huracan: { name: 'HRCN', deck: DEFAULT_DECKS.huracan, pool: HRCN_POOL },
  porsche911: { name: 'P911', deck: DEFAULT_DECKS.porsche911, pool: P911_POOL },
  mustang: { name: 'GT500', deck: DEFAULT_DECKS.mustang, pool: GT500_POOL }
};

const target = String(args.get('target') || 'huracan');
const opponent = String(args.get('opponent') || 'ae86');
const maxCommon = Number(args.get('max-common') ?? 5);
const targetConfig = CAR_CONFIGS[target] || CAR_CONFIGS.huracan;
const opponentConfig = CAR_CONFIGS[opponent] || CAR_CONFIGS.ae86;
const targetName = targetConfig.name;
const targetDefaultDeck = targetConfig.deck;
const targetPool = targetConfig.pool;
const cards = buildCatalog(parseCsv(fs.readFileSync(path.join(ROOT, 'racing_cards.csv'), 'utf8')));
const requestedDeck = args.has('deck')
  ? String(args.get('deck')).split(',').map(item => item.trim()).filter(Boolean)
  : null;

if (args.has('search-all')) {
  const roadSet = String(args.get('road-set') || '5,8').split(',').map(Number).filter(Boolean);
  const opponents = Object.entries(CAR_CONFIGS).filter(([key]) => key !== target);
  const candidates = generateCandidateDecks(targetPool, maxCommon);
  const sampled = shuffle(candidates, makeRng(777331)).slice(0, searchLimit);
  const perEvalGames = Math.max(60, Math.floor(games / 6));
  const ranked = sampled.map(deck => {
    const summaries = [];
    for (const road of roadSet) {
      for (const [, opponentInfo] of opponents) {
        summaries.push(evaluate(deck, opponentInfo.deck, opponentInfo.name, cards, perEvalGames, road, targetName, targetPool));
      }
    }
    const rates = summaries.map(summary => summary.targetWinRate);
    const maxDev = Math.max(...rates.map(rate => Math.abs(rate - 0.5)));
    const avgDev = rates.reduce((sum, rate) => sum + Math.abs(rate - 0.5), 0) / rates.length;
    const commonCount = deck.filter(id => COMMON_IDS.has(id)).length;
    const deadCount = targetPool.filter(id => describeDeck(deck).includes(`${id}x`) && summaries.every(summary => !summary.played[id])).length;
    return {
      deck,
      deckName: describeDeck(deck),
      rates,
      score: maxDev + avgDev * 0.7 + commonCount * (target === 'porsche911' || target === 'mustang' ? 0.015 : 0) + deadCount * 0.08
    };
  }).sort((a, b) => a.score - b.score).slice(0, 8);
  console.log(`search_all target=${targetName} games_per_eval=${perEvalGames} roads=${roadSet.join('/')}`);
  for (let i = 0; i < ranked.length; i++) {
    const item = ranked[i];
    console.log(`candidate ${i + 1}: score=${item.score.toFixed(3)} rates=${item.rates.map(rate => `${(rate * 100).toFixed(1)}%`).join(',')} deck=${item.deckName}`);
  }
  process.exit(0);
}

const baseline = evaluate(requestedDeck || targetDefaultDeck, opponentConfig.deck, opponentConfig.name, cards, games, roadCards, targetName, targetPool);
printSummary('baseline', baseline, cards);

if (args.has('search')) {
  const candidates = generateCandidateDecks(targetPool, maxCommon);
  const sampled = shuffle(candidates, makeRng(424242)).slice(0, searchLimit);
  const ranked = sampled
    .map(deck => evaluate(deck, opponentConfig.deck, opponentConfig.name, cards, Math.max(100, Math.floor(games / 5)), roadCards, targetName, targetPool))
    .map(summary => ({
      ...summary,
      commonCount: summary.deckName.split(' ').reduce((sum, part) => {
        const [id, count] = part.split('x');
        return sum + (COMMON_IDS.has(id) ? Number(count) : 0);
      }, 0),
      deadCards: targetPool.filter(id => summary.deckName.includes(`${id}x`) && !summary.played[id]),
      score: Math.abs(summary.targetWinRate - 0.5)
        + targetPool.filter(id => summary.deckName.includes(`${id}x`) && !summary.played[id]).length * 0.08
        + summary.deckName.split(' ').reduce((sum, part) => {
          const [id, count] = part.split('x');
          return sum + (COMMON_IDS.has(id) ? Number(count) : 0);
        }, 0) * (target === 'porsche911' ? 0.012 : 0)
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
  for (let i = 0; i < ranked.length; i++) printSummary(`candidate ${i + 1}`, ranked[i], cards);
}
