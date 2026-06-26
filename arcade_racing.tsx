import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Users, Bot, ChevronRight, ChevronLeft, Radio, FastForward, Crosshair } from 'lucide-react';

const MAX_SPEED = 140;

const getGear = (speed) => {
  if (speed <= 20) return { gear: 1, mp: 1, max: 20 };
  if (speed <= 50) return { gear: 2, mp: 2, max: 50 };
  if (speed <= 80) return { gear: 3, mp: 3, max: 80 };
  if (speed <= 110) return { gear: 4, mp: 4, max: 110 };
  return { gear: 5, mp: 5, max: 140 };
};

const getPenaltySpeed = (gearLevel) => {
  if (gearLevel <= 1) return 0;
  if (gearLevel === 2) return 20;
  if (gearLevel === 3) return 50;
  if (gearLevel === 4) return 80;
  return 110;
};

const getNextNNActiveTurnIdx = (actionOrder, currentTurnIdx, mpLeft) => {
  const otherTurnIdx = 1 - currentTurnIdx;
  const otherPlayerId = actionOrder[otherTurnIdx];
  const currentPlayerId = actionOrder[currentTurnIdx];

  if (mpLeft[otherPlayerId] > 0) return otherTurnIdx;
  if (mpLeft[currentPlayerId] > 0) return currentTurnIdx;
  return null;
};

const createTrackRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
};

const DEFAULT_CORNER_CARD_ROWS = [
  { id: 'sweeper', name: 'SWEEPER', entry_spaces: '1', exit_spaces: '2', weight: '1', segments_json: '[{"type":"curve","direction":"random","angle":70,"radius":540,"in_spaces":3,"out_spaces":4,"speed_limit":80}]' },
  { id: 'hairpin', name: 'HAIRPIN', entry_spaces: '3', exit_spaces: '2', weight: '1', segments_json: '[{"type":"curve","direction":"random","angle":180,"radius":250,"in_spaces":3,"out_spaces":5,"speed_limit":40}]' },
  { id: 'chicane', name: 'CHICANE', entry_spaces: '2', exit_spaces: '1', weight: '1', segments_json: '[{"type":"curve","direction":"random","angle":45,"radius":310,"in_spaces":2,"out_spaces":3,"speed_limit":60},{"type":"curve","direction":"opposite","angle":45,"radius":310,"in_spaces":2,"out_spaces":3,"speed_limit":60}]' },
  { id: 'increasing_radius', name: 'INCREASING RADIUS', entry_spaces: '1', exit_spaces: '3', weight: '1', segments_json: '[{"type":"curve","direction":"random","angle":45,"radius":240,"in_spaces":2,"out_spaces":3,"speed_limit":50},{"type":"curve","direction":"same","angle":45,"radius":500,"in_spaces":3,"out_spaces":4,"speed_limit":70}]' },
  { id: 'decreasing_radius', name: 'DECREASING RADIUS', entry_spaces: '3', exit_spaces: '1', weight: '1', segments_json: '[{"type":"curve","direction":"random","angle":45,"radius":500,"in_spaces":3,"out_spaces":4,"speed_limit":70},{"type":"curve","direction":"same","angle":45,"radius":240,"in_spaces":2,"out_spaces":3,"speed_limit":50}]' },
  { id: 'double_apex', name: 'DOUBLE APEX', entry_spaces: '2', exit_spaces: '0', weight: '1', segments_json: '[{"type":"curve","direction":"random","angle":65,"radius":310,"in_spaces":2,"out_spaces":3,"speed_limit":50},{"type":"straight","spaces":1},{"type":"curve","direction":"same","angle":65,"radius":310,"in_spaces":2,"out_spaces":3,"speed_limit":50}]' },
  { id: 'corner_90', name: '90 DEG CORNER', entry_spaces: '1', exit_spaces: '1', weight: '1', segments_json: '[{"type":"curve","direction":"random","angle":90,"radius":350,"in_spaces":2,"out_spaces":3,"speed_limit":60}]' }
];

const parseCornerCardRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Corner card CSV has no data rows.');
  const parsed = rows.map(row => {
    const entrySpaces = Number(row.entry_spaces);
    const exitSpaces = Number(row.exit_spaces);
    const weight = Number(row.weight || 1);
    const segments = JSON.parse(row.segments_json);
    if (!row.id || !row.name || !Number.isInteger(entrySpaces) || !Number.isInteger(exitSpaces)) throw new Error('Corner card identity or spacing is invalid.');
    if (entrySpaces < 0 || entrySpaces > 3 || exitSpaces < 0 || exitSpaces > 3 || entrySpaces + exitSpaces < 2 || entrySpaces + exitSpaces > 5) throw new Error(`Corner card spacing is invalid: ${row.id}`);
    if (!Number.isInteger(weight) || weight < 1 || !Array.isArray(segments) || segments.length === 0) throw new Error(`Corner card weight or segments are invalid: ${row.id}`);
    segments.forEach(segment => {
      if (segment.type === 'straight') {
        if (!Number.isInteger(segment.spaces) || segment.spaces < 1) throw new Error(`Straight segment is invalid: ${row.id}`);
        return;
      }
      if (segment.type !== 'curve' || !['random', 'same', 'opposite'].includes(segment.direction)) throw new Error(`Curve segment is invalid: ${row.id}`);
      for (const key of ['angle', 'radius', 'in_spaces', 'out_spaces', 'speed_limit']) {
        if (!Number.isFinite(segment[key]) || segment[key] <= 0) throw new Error(`Curve ${key} is invalid: ${row.id}`);
      }
    });
    return { id: row.id, name: row.name, entrySpaces, exitSpaces, weight, segments };
  });
  if (new Set(parsed.map(card => card.id)).size !== parsed.length) throw new Error('Corner card IDs must be unique.');
  return parsed;
};

function generateTrack(seed = Date.now(), cornerCardRows = DEFAULT_CORNER_CARD_ROWS, retry = 0, requestedRoadCards = 12) {
  let cx = 0, cy = 0, dir = 0; // dir 0 = UP
  let globalDistance = 0;
  const LANE_W = 70;
  const SPACE_LEN = 140;
  const MIN_TRACK_CLEARANCE = 340;
  const MAX_LAYOUT_RETRIES = 24;
  const random = createTrackRandom(seed);

  let leftTrack = [];
  let rightTrack = [];

  function getP(cx, cy, angleDeg, offset) {
    const r = angleDeg * Math.PI / 180;
    const nx = Math.cos(r);
    const ny = Math.sin(r);
    return { x: cx + nx * offset, y: cy + ny * offset };
  }

  function addNodesStraight(len, limitL, limitR, isGoalSegment) {
    let startL = leftTrack.length;
    let startR = rightTrack.length;

    for (let i = 0; i < len; i++) {
      const isGoal = isGoalSegment && i === len - 1;
      const fwdX = Math.sin(dir * Math.PI / 180);
      const fwdY = -Math.cos(dir * Math.PI / 180);

      const bx = cx + fwdX * (i * SPACE_LEN);
      const by = cy + fwdY * (i * SPACE_LEN);
      const fx = cx + fwdX * ((i + 1) * SPACE_LEN);
      const fy = cy + fwdY * ((i + 1) * SPACE_LEN);

      const bl_L = getP(bx, by, dir, -LANE_W);
      const br_L = getP(bx, by, dir, 0);
      const fl_L = getP(fx, fy, dir, -LANE_W);
      const fr_L = getP(fx, fy, dir, 0);

      const pathL = `M ${bl_L.x} ${bl_L.y} L ${br_L.x} ${br_L.y} L ${fr_L.x} ${fr_L.y} L ${fl_L.x} ${fl_L.y} Z`;
      const centerL = getP(cx + fwdX * ((i + 0.5) * SPACE_LEN), cy + fwdY * ((i + 0.5) * SPACE_LEN), dir, -LANE_W / 2);
      const d = globalDistance + (i + 0.5) * SPACE_LEN;

      leftTrack.push({ id: `L${leftTrack.length}`, path: pathL, center: centerL, limit: limitL, isGoal, adj: [startR + i], angle: dir, isOuter: false, distance: d });

      const br_R = getP(bx, by, dir, LANE_W);
      const fr_R = getP(fx, fy, dir, LANE_W);

      const pathR = `M ${br_L.x} ${br_L.y} L ${br_R.x} ${br_R.y} L ${fr_R.x} ${fr_R.y} L ${fr_L.x} ${fr_L.y} Z`;
      const centerR = getP(cx + fwdX * ((i + 0.5) * SPACE_LEN), cy + fwdY * ((i + 0.5) * SPACE_LEN), dir, LANE_W / 2);

      rightTrack.push({ id: `R${rightTrack.length}`, path: pathR, center: centerR, limit: limitR, isGoal, adj: [startL + i], angle: dir, isOuter: false, distance: d });
    }

    cx += Math.sin(dir * Math.PI / 180) * (len * SPACE_LEN);
    cy += -Math.cos(dir * Math.PI / 180) * (len * SPACE_LEN);
    globalDistance += len * SPACE_LEN;
  }

  function addNodesCurve(turnRight, angleDeg, inSpaces, outSpaces, inLimit, outLimit, guardrail, radius = 350) {
    const sign = turnRight ? 1 : -1;
    const rCenterOffset = sign * radius;
    const rotCx = cx + Math.cos(dir * Math.PI / 180) * rCenterOffset;
    const rotCy = cy + Math.sin(dir * Math.PI / 180) * rCenterOffset;

    const startAngle = dir - sign * 90;
    const totalSweep = sign * angleDeg;
    const rotStartAngle = turnRight ? dir + 180 : dir;

    const lSpaces = turnRight ? outSpaces : inSpaces;
    const rSpaces = turnRight ? inSpaces : outSpaces;
    const lLimitVal = turnRight ? outLimit : inLimit;

    const startIdxL = leftTrack.length;
    const startIdxR = rightTrack.length;
    const curveLenCenter = radius * (angleDeg * Math.PI / 180);

    function getArcPath(r1, r2, stepIdx, totalSteps, isLeft) {
      const a1 = rotStartAngle + (stepIdx / totalSteps) * totalSweep;
      const a2 = rotStartAngle + ((stepIdx + 1) / totalSteps) * totalSweep;
      const rad1 = a1 * Math.PI / 180, rad2 = a2 * Math.PI / 180;

      const p1x = rotCx + r1 * Math.cos(rad1), p1y = rotCy + r1 * Math.sin(rad1);
      const p2x = rotCx + r2 * Math.cos(rad1), p2y = rotCy + r2 * Math.sin(rad1);
      const p3x = rotCx + r2 * Math.cos(rad2), p3y = rotCy + r2 * Math.sin(rad2);
      const p4x = rotCx + r1 * Math.cos(rad2), p4y = rotCy + r1 * Math.sin(rad2);

      const sweep = turnRight ? 1 : 0;
      const sweepBack = turnRight ? 0 : 1;
      return `M ${p1x} ${p1y} L ${p2x} ${p2y} A ${r2} ${r2} 0 0 ${sweep} ${p3x} ${p3y} L ${p4x} ${p4y} A ${r1} ${r1} 0 0 ${sweepBack} ${p1x} ${p1y} Z`;
    }

    const l_r1 = turnRight ? radius : radius - LANE_W;
    const l_r2 = turnRight ? radius + LANE_W : radius;

    for (let i = 0; i < lSpaces; i++) {
      const pathL = getArcPath(l_r1, l_r2, i, lSpaces, true);
      const midA = rotStartAngle + ((i + 0.5) / lSpaces) * totalSweep;
      const midR = (l_r1 + l_r2) / 2;
      const centerL = { x: rotCx + midR * Math.cos(midA * Math.PI / 180), y: rotCy + midR * Math.sin(midA * Math.PI / 180) };
      const curDir = dir + ((i + 0.5) / lSpaces) * totalSweep;
      const d = globalDistance + ((i + 0.5) / lSpaces) * curveLenCenter;

      let effLimitL = lLimitVal;
      if (turnRight && i < lSpaces - rSpaces) effLimitL = null; // Outer lane starts limit later

      leftTrack.push({ id: `L${leftTrack.length}`, path: pathL, center: centerL, limit: effLimitL, guardrail: (guardrail === 'outer' && turnRight), angle: curDir, isOuter: turnRight, distance: d, adj: [] });
    }

    const r_r1 = turnRight ? radius - LANE_W : radius;
    const r_r2 = turnRight ? radius : radius + LANE_W;
    const rLimitVal = turnRight ? inLimit : outLimit;

    for (let i = 0; i < rSpaces; i++) {
      const pathR = getArcPath(r_r1, r_r2, i, rSpaces, false);
      const midA = rotStartAngle + ((i + 0.5) / rSpaces) * totalSweep;
      const midR = (r_r1 + r_r2) / 2;
      const centerR = { x: rotCx + midR * Math.cos(midA * Math.PI / 180), y: rotCy + midR * Math.sin(midA * Math.PI / 180) };
      const curDir = dir + ((i + 0.5) / rSpaces) * totalSweep;
      const d = globalDistance + ((i + 0.5) / rSpaces) * curveLenCenter;

      let effLimitR = rLimitVal;
      if (!turnRight && i < rSpaces - lSpaces) effLimitR = null; // Outer lane starts limit later

      rightTrack.push({ id: `R${rightTrack.length}`, path: pathR, center: centerR, limit: effLimitR, guardrail: (guardrail === 'outer' && !turnRight), angle: curDir, isOuter: !turnRight, distance: d, adj: [] });
    }

    // Map Inter-lane Adjacencies
    if (lSpaces >= rSpaces) {
      for (let i = 0; i < lSpaces; i++) {
        const rIdx = Math.floor((i + 0.5) / lSpaces * rSpaces);
        leftTrack[startIdxL + i].adj.push(startIdxR + rIdx);
        if (!rightTrack[startIdxR + rIdx].adj.includes(startIdxL + i)) rightTrack[startIdxR + rIdx].adj.push(startIdxL + i);
      }
    } else {
      for (let i = 0; i < rSpaces; i++) {
        const lIdx = Math.floor((i + 0.5) / rSpaces * lSpaces);
        rightTrack[startIdxR + i].adj.push(startIdxL + lIdx);
        if (!leftTrack[startIdxL + lIdx].adj.includes(startIdxR + i)) leftTrack[startIdxL + lIdx].adj.push(startIdxR + i);
      }
    }

    dir += totalSweep;
    const newCenterA = rotStartAngle + totalSweep;
    cx = rotCx + radius * Math.cos(newCenterA * Math.PI / 180);
    cy = rotCy + radius * Math.sin(newCenterA * Math.PI / 180);
    globalDistance += curveLenCenter;
  }

  const curve = (turnRight, angle, radius, inSpaces, outSpaces, limit) => ({
    type: 'curve', turnRight, angle, radius, inSpaces, outSpaces,
    limitIn: limit, limitOut: limit, guardrail: 'outer'
  });
  const straight = (len) => ({ type: 'straight', len, limitL: null, limitR: null });
  const side = () => random() >= 0.5;
  const cornerCard = (name, entrySpaces, defs, exitSpaces) => ({
    name,
    defs: [straight(entrySpaces), ...defs, straight(exitSpaces)].filter(def => def.len !== 0)
  });
  const cornerCards = parseCornerCardRows(cornerCardRows);
  const ROAD_CARD_FACTORIES = cornerCards.flatMap(card => Array.from({ length: card.weight }, () => () => {
    let turnRight = side();
    const defs = card.segments.map(segment => {
      if (segment.type === 'straight') return straight(segment.spaces);
      if (segment.direction === 'random') turnRight = side();
      else if (segment.direction === 'opposite') turnRight = !turnRight;
      return curve(turnRight, segment.angle, segment.radius, segment.in_spaces, segment.out_spaces, segment.speed_limit);
    });
    return cornerCard(card.name, card.entrySpaces, defs, card.exitSpaces);
  }));
  ROAD_CARD_FACTORIES.push(() => ({ name: 'STRAIGHT', defs: [straight(5 + Math.floor(random() * 3))] }));

  const roadCards = [];
  const addRoadCard = (card, cardIndex, checkClearance = true) => {
    const snapshot = { left: leftTrack.length, right: rightTrack.length, cx, cy, dir, globalDistance };
    for (const def of card.defs) {
      if (def.type === 'straight') addNodesStraight(def.len, def.limitL, def.limitR, def.goal);
      else addNodesCurve(def.turnRight, def.angle, def.inSpaces, def.outSpaces, def.limitIn, def.limitOut, def.guardrail, def.radius);
    }

    if (checkClearance) {
      const previousSpaces = [
        ...leftTrack.slice(0, Math.max(0, snapshot.left - 5)),
        ...rightTrack.slice(0, Math.max(0, snapshot.right - 5))
      ];
      const newSpaces = [
        ...leftTrack.slice(snapshot.left),
        ...rightTrack.slice(snapshot.right)
      ];
      const tooClose = newSpaces.some(next => previousSpaces.some(previous =>
        Math.hypot(next.center.x - previous.center.x, next.center.y - previous.center.y) < MIN_TRACK_CLEARANCE
      ));
      if (tooClose) {
        leftTrack.length = snapshot.left;
        rightTrack.length = snapshot.right;
        ({ cx, cy, dir, globalDistance } = snapshot);
        return false;
      }
    }

    for (let i = snapshot.left; i < leftTrack.length; i++) {
      leftTrack[i].roadCard = card.name;
      leftTrack[i].roadCardIndex = cardIndex;
    }
    for (let i = snapshot.right; i < rightTrack.length; i++) {
      rightTrack[i].roadCard = card.name;
      rightTrack[i].roadCardIndex = cardIndex;
    }
    leftTrack[snapshot.left].roadCardStart = { index: cardIndex + 1, name: card.name };
    roadCards.push(card);
    return true;
  };

  addRoadCard({ name: 'START STRAIGHT', defs: [straight(4)] }, 0, false);
  let previousFactory = -1;
  for (let i = 0; i < requestedRoadCards; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 80 && !placed; attempt++) {
      let factoryIndex;
      do factoryIndex = Math.floor(random() * ROAD_CARD_FACTORIES.length);
      while (factoryIndex === previousFactory);
      placed = addRoadCard(ROAD_CARD_FACTORIES[factoryIndex](), i + 1);
      if (placed) previousFactory = factoryIndex;
    }
    if (!placed) {
      if (retry >= MAX_LAYOUT_RETRIES) throw new Error('Unable to generate a clear track layout.');
      return generateTrack((seed + 0x9E3779B9) >>> 0, cornerCardRows, retry + 1, requestedRoadCards);
    }
  }
  if (!addRoadCard({ name: 'FINISH STRAIGHT', defs: [{ ...straight(5), goal: true }] }, requestedRoadCards + 1)) {
    if (retry >= MAX_LAYOUT_RETRIES) throw new Error('Unable to place finish straight.');
    return generateTrack((seed + 0x9E3779B9) >>> 0, cornerCardRows, retry + 1, requestedRoadCards);
  }

  for (const lane of [leftTrack, rightTrack]) {
    lane.forEach((space, index) => {
      space.id = `${space.id}-${seed}`;
      space.trackIndex = index;
    });
  }

  return { 0: leftTrack, 1: rightTrack, seed, roadCardCount: roadCards.length };
}

const IMPLEMENTED_CARD_IDS = [
  'drift', 'full_throttle', 'back_down', 'hard_brake', 'change_lane', 'early_brake_cornering', 'rocket_start', 'change_shift',
  'clutch_kick', 'trail_braking', 'full_countersteer', 'exit_drift', 'drift_extend', 'gutter_boost', 'blind_attack', 'jump_exit',
  'progressive_acceleration', 'early_power', 'traction_control', 'grip_line', 'balanced_chassis', 'torque_split', 'micro_correction', 'line_lock',
  'raw_horsepower', 'straight_line_monster', 'panic_stop', 'chrome_bumper', 'shove_aside', 'burn_rubber', 'door_slam', 'no_room'
];

const DEFAULT_CARD_ROWS = [
  { id: 'drift', name: 'Drift', category: 'Common / Starter Cards - Bright Red AE86', requirement: 'Max 60', type: 'Turn', timing: 'Drive', effect: '+30 km/h to the speed check this turn.', implemented: 'true', deck_code: 'AE86', serial_number: 'AE86-01' },
  { id: 'full_throttle', name: 'Full throttle', category: 'Common / Starter Cards - Bright Red AE86', requirement: 'Any', type: 'Gas', timing: 'Before', effect: 'Speed +40 km/h.', implemented: 'true', deck_code: 'AE86', serial_number: 'AE86-02' },
  { id: 'back_down', name: 'Back down', category: 'Common / Starter Cards - Bright Red AE86', requirement: 'Any', type: 'Brake', timing: 'Before', effect: 'Speed -20 km/h. Discard 1 card.', implemented: 'true', deck_code: 'AE86', serial_number: 'AE86-03' },
  { id: 'hard_brake', name: 'Hard Brake', category: 'Balance set / Starter Cards - Bright Red AE86', requirement: 'Min 50', type: 'Brake', timing: 'Before', effect: 'Speed -50 km/h.', implemented: 'true', deck_code: 'AE86', serial_number: 'AE86-04' },
  { id: 'change_lane', name: 'Change Lane', category: 'Balance set / Starter Cards - Bright Red AE86', requirement: 'Any', type: 'Turn', timing: 'Before', effect: 'Move to the other lane. Discard 1 card.', implemented: 'true', deck_code: 'AE86', serial_number: 'AE86-05' },
  { id: 'early_brake_cornering', name: 'Early Brake Cornering', category: 'Balance set / Starter Cards - Bright Red AE86', requirement: 'Max 60', type: 'Turn', timing: 'Before', effect: 'Speed -20 km/h. Move to the inner lane.', implemented: 'true', deck_code: 'AE86', serial_number: 'AE86-06' },
  { id: 'rocket_start', name: 'Rocket Start', category: 'Balance set / Starter Cards - Bright Red AE86', requirement: 'Max 40', type: 'Gas', timing: 'After', effect: 'Speed +50 km/h. You may discard 2 cards.', implemented: 'true', deck_code: 'AE86', serial_number: 'AE86-07' },
  { id: 'change_shift', name: 'Change Shift', category: 'Balance set / Starter Cards - Bright Red AE86', requirement: 'Any', type: 'Gas', timing: 'Before', effect: 'Speed +10 km/h or -10 km/h. You may then play another card.', implemented: 'true', deck_code: 'AE86', serial_number: 'AE86-08' },
  { id: 'clutch_kick', name: 'Clutch Kick', category: 'RWD Drift set - Bright Green Lamborghini Huracan', requirement: 'Min 60', type: 'Gas', timing: 'Before', effect: 'Speed +20 km/h. This turn, your first speed check gains +50 km/h.', implemented: 'true', deck_code: 'HRCN', serial_number: 'HRCN-01' },
  { id: 'trail_braking', name: 'Trail Braking', category: 'RWD Drift set - Bright Green Lamborghini Huracan', requirement: 'Max 80', type: 'Brake', timing: 'Drive', effect: 'Before each speed check this turn, you may reduce Speed by 10 km/h.', implemented: 'true', deck_code: 'HRCN', serial_number: 'HRCN-02' },
  { id: 'full_countersteer', name: 'Full Countersteer', category: 'RWD Drift set - Bright Green Lamborghini Huracan', requirement: 'Any', type: 'Turn', timing: 'Step', effect: 'If you would understeer this turn, discard 1 card and cancel that understeer once.', implemented: 'true', deck_code: 'HRCN', serial_number: 'HRCN-03' },
  { id: 'exit_drift', name: 'Exit Drift', category: 'RWD Drift set - Bright Green Lamborghini Huracan', requirement: 'Max 60', type: 'Gas', timing: 'After', effect: 'If you moved through at least 1 speed check space this turn, Speed +30 km/h.', implemented: 'true', deck_code: 'HRCN', serial_number: 'HRCN-04' },
  { id: 'drift_extend', name: 'Drift Extend', category: 'RWD Drift set - Bright Green Lamborghini Huracan', requirement: 'Max 80', type: 'Turn', timing: 'Drive', effect: 'If you gain corner speed bonus last turn, it also applies to the speed check this turn.', implemented: 'true', deck_code: 'HRCN', serial_number: 'HRCN-05' },
  { id: 'gutter_boost', name: 'Gutter Boost', category: 'RWD Drift set - Bright Green Lamborghini Huracan', requirement: 'Max 80', type: 'Turn', timing: 'Drive', effect: 'If you are on the inner lane, +50 km/h to the corner speed limit calculation.', implemented: 'true', deck_code: 'HRCN', serial_number: 'HRCN-06' },
  { id: 'blind_attack', name: 'Blind Attack', category: 'RWD Drift set - Bright Green Lamborghini Huracan', requirement: 'Min 50', type: 'Turn', timing: 'Drive', effect: 'Discard all cards in your hand. If you get blocked, move to the other lane and gain 1 move point.', implemented: 'true', deck_code: 'HRCN', serial_number: 'HRCN-07' },
  { id: 'jump_exit', name: 'Jump Exit', category: 'RWD Drift set - Bright Green Lamborghini Huracan', requirement: 'Max 30', type: 'Gas', timing: 'Drive', effect: 'You have 4 move points this turn regardless of your gear, ignore the corner speed limit.', implemented: 'true', deck_code: 'HRCN', serial_number: 'HRCN-08' },
  { id: 'progressive_acceleration', name: 'Progressive Acceleration', category: 'AWD Grip Set - Yellow Porsche 911', requirement: 'Any', type: 'Gas', timing: 'Drive', effect: 'After each move this turn, Speed +10 km/h.', implemented: 'true', deck_code: 'P911', serial_number: 'P911-01' },
  { id: 'early_power', name: 'Early Power', category: 'AWD Grip Set - Yellow Porsche 911', requirement: 'Max 60', type: 'Gas', timing: 'After', effect: 'If you passed all speed checks this turn, Speed +40 km/h.', implemented: 'true', deck_code: 'P911', serial_number: 'P911-02' },
  { id: 'traction_control', name: 'Traction Control', category: 'AWD Grip Set - Yellow Porsche 911', requirement: 'Any', type: 'Brake', timing: 'Drive', effect: 'If you would understeer this turn, reduce your speed by 20 km/h and cancel that understeer.', implemented: 'true', deck_code: 'P911', serial_number: 'P911-03' },
  { id: 'grip_line', name: 'Grip Line', category: 'AWD Grip Set - Yellow Porsche 911', requirement: 'Max 60', type: 'Turn', timing: 'Drive', effect: '+20 km/h to the speed check this turn. Discard 1 card.', implemented: 'true', deck_code: 'P911', serial_number: 'P911-04' },
  { id: 'balanced_chassis', name: 'Balanced Chassis', category: 'AWD Grip Set - Yellow Porsche 911', requirement: 'Any', type: 'Turn', timing: 'Step', effect: 'Once this turn, you may move sideways by discard 1 card.', implemented: 'true', deck_code: 'P911', serial_number: 'P911-05' },
  { id: 'torque_split', name: 'Torque Split', category: 'AWD Grip Set - Yellow Porsche 911', requirement: 'Any', type: 'Gas', timing: 'Before', effect: 'Choose one: Speed +30 km/h, or +40 km/h to the speed check this turn.', implemented: 'true', deck_code: 'P911', serial_number: 'P911-06' },
  { id: 'micro_correction', name: 'Micro Correction', category: 'AWD Grip Set - Yellow Porsche 911', requirement: 'Any', type: 'Turn', timing: 'Drive', effect: 'After each speed check this turn, you may choose Speed +10 km/h or Speed -10 km/h.', implemented: 'true', deck_code: 'P911', serial_number: 'P911-07' },
  { id: 'line_lock', name: 'Line Lock', category: 'AWD Grip Set - Yellow Porsche 911', requirement: 'Max 60', type: 'Turn', timing: 'Drive', effect: 'While you remain in your current lane , all speed checks gain +30 km/h this turn.', implemented: 'true', deck_code: 'P911', serial_number: 'P911-08' },
  { id: 'raw_horsepower', name: 'Raw Horsepower', category: 'Muscle Car Set - Blue Mustang GT500 with Black Stripes', requirement: 'Any', type: 'Gas', timing: 'Before', effect: 'Speed +50 km/h. You may only move forward this turn.', implemented: 'true', deck_code: 'GT500', serial_number: 'GT500-01' },
  { id: 'straight_line_monster', name: 'Straight-Line Monster', category: 'Muscle Car Set - Blue Mustang GT500 with Black Stripes', requirement: 'Any', type: 'Gas', timing: 'Before', effect: 'If you are on a straight, Speed +40 km/h. Otherwise, Speed +20 km/h', implemented: 'true', deck_code: 'GT500', serial_number: 'GT500-02' },
  { id: 'panic_stop', name: 'Panic Stop', category: 'Muscle Car Set - Blue Mustang GT500 with Black Stripes', requirement: 'Any', type: 'Brake', timing: 'Drive', effect: 'Speed -80km/h. Discard all cards from hand.', implemented: 'true', deck_code: 'GT500', serial_number: 'GT500-03' },
  { id: 'chrome_bumper', name: 'Chrome Bumper', category: 'Muscle Car Set - Blue Mustang GT500 with Black Stripes', requirement: 'Min 60', type: 'Attack', timing: 'Step', effect: 'When you get blocked, discard 1 card, then the blocking car loses 40 km/h.', implemented: 'true', deck_code: 'GT500', serial_number: 'GT500-04' },
  { id: 'shove_aside', name: 'Shove Aside', category: 'Muscle Car Set - Blue Mustang GT500 with Black Stripes', requirement: 'Min 80', type: 'Attack', timing: 'Step', effect: 'Move the blocking car to the other lane. You may enter the space it left. If it cannot move, both cars spin-off.', implemented: 'true', deck_code: 'GT500', serial_number: 'GT500-05' },
  { id: 'burn_rubber', name: 'Burn Rubber', category: 'Muscle Car Set - Blue Mustang GT500 with Black Stripes', requirement: 'Any', type: 'Gas', timing: 'After', effect: 'If you overtake this turn, Speed +60 km/h. Discard all cards.', implemented: 'true', deck_code: 'GT500', serial_number: 'GT500-06' },
  { id: 'door_slam', name: 'Door Slam', category: 'Muscle Car Set - Blue Mustang GT500 with Black Stripes', requirement: 'Min 80', type: 'Attack', timing: 'Step', effect: 'Move to the other lane. If you get blocked the blocking car loses 20 km/h and all his remaining move points.', implemented: 'true', deck_code: 'GT500', serial_number: 'GT500-07' },
  { id: 'no_room', name: 'No Room', category: 'Muscle Car Set - Blue Mustang GT500 with Black Stripes', requirement: 'Min 60', type: 'Attack', timing: 'Drive', effect: 'Other cars cannot move into your lane until next turn.', implemented: 'true', deck_code: 'GT500', serial_number: 'GT500-08' }
];

const COURSE_OPTIONS = [
  { id: 'akagi', name: 'Akagi Redline', region: 'Gunma', seed: 17031, difficulty: 'Technical', length: 'Short', cardCount: 5, path: 'M18 74 C35 68 25 48 45 45 S62 55 72 38 S68 17 88 14' },
  { id: 'haruna', name: 'Haruna Skyline', region: 'Gunma', seed: 28417, difficulty: 'Balanced', length: 'Medium', cardCount: 8, path: 'M12 28 C26 10 43 18 42 35 S20 52 33 70 S65 82 88 66' },
  { id: 'hakone', name: 'Hakone Turnpike', region: 'Kanagawa', seed: 39163, difficulty: 'High Speed', length: 'Long', cardCount: 12, path: 'M14 78 C20 52 38 63 43 39 S71 32 62 13 M62 13 L88 23' },
  { id: 'random', name: 'Wildcard Route', region: 'Unknown', seed: null, difficulty: 'Variable', path: 'M14 70 C31 80 38 53 50 57 S67 68 73 46 S66 21 88 18' }
];

const CAR_OPTIONS = [
  { id: 'ae86', name: 'Toyota AE86', drive: 'RWD', specialty: 'Lightweight balance. Predictable drifts and fast line changes.' },
  { id: 'huracan', name: 'Lamborghini Huracan', drive: 'AWD', specialty: 'Explosive exits. Strong grip when power comes down early.' },
  { id: 'porsche911', name: 'Porsche 911', drive: 'RWD', specialty: 'Rear-engine traction. Precise corrections through technical bends.' },
  { id: 'mustang', name: 'Mustang GT500', drive: 'RWD', specialty: 'Raw straight-line power. Built to pressure rivals door to door.' }
];

const RANDOM_SIZE_CARDS = { small: 5, medium: 8, long: 12 };

const PLATE_CAR_CODES = { AE86: '86', HRCN: '63', P911: '91', GT500: '50' };
const getPlateSerial = (deckCode, serialNumber) => {
  const match = (serialNumber || '').match(/-(\d{2})$/);
  return `${PLATE_CAR_CODES[deckCode] || deckCode || '--'}-${match ? match[1] : '??'}`;
};

const parseCSV = (text) => {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      if (row.some(cell => cell.length > 0)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.replace(/\r$/, ''));
    rows.push(row);
  }
  if (rows.length < 2) throw new Error('Card CSV has no data rows.');

  const headers = rows[0].map((header, index) => index === 0 ? header.replace(/^\uFEFF/, '').trim() : header.trim());
  return rows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()])));
};

const getRequirementRule = (requirement) => {
  const match = requirement.match(/^(Min|Max)\s+(\d+)/i);
  if (!match) return { label: 'None', canPlay: () => true };
  const value = Number(match[2]);
  if (match[1].toLowerCase() === 'min') return { label: `Min ${value} km/h`, canPlay: player => player.speed >= value };
  return { label: `Max ${value} km/h`, canPlay: player => player.speed <= value };
};

const getSpeedDelta = (effect) => {
  const match = effect.match(/Speed\s*([+-])\s*(\d+)\s*km\/h/i);
  if (!match) return 0;
  return Number(match[2]) * (match[1] === '-' ? -1 : 1);
};

const getCornerLimitBonus = (effect) => {
  const match = effect.match(/([+-]?\d+)\s*km\/h to the corner speed limit/i);
  return match ? Number(match[1]) : 0;
};

const getOptionalDiscardCount = (effect) => {
  const match = effect.match(/may discard\s+(\d+)\s+cards?/i);
  return match ? Number(match[1]) : 0;
};

const getForcedDiscardCount = (effect) => {
  if (/discard all cards/i.test(effect)) return Infinity;
  const match = effect.match(/(?:^|[.]\s*)Discard\s+(\d+)\s+cards?/i);
  return match ? Number(match[1]) : 0;
};

const clampSpeed = (speed) => Math.max(0, Math.min(MAX_SPEED, speed));

const getLaneChangeTarget = (player, track) => {
  const current = track[player.lane][player.idx];
  const newLane = 1 - player.lane;
  const newIdx = current.adj[current.adj.length - 1] ?? player.idx;
  return { lane: newLane, idx: newIdx };
};

const canOccupy = (lane, idx, otherPlayer) => !(otherPlayer.lane === lane && otherPlayer.idx === idx);

const buildCardCatalog = (rows) => {
  const rowById = Object.fromEntries(rows.map(row => [row.id, row]));

  return Object.fromEntries(IMPLEMENTED_CARD_IDS.map(id => {
    const row = rowById[id];
    if (!row) throw new Error(`Missing implemented card in CSV: ${id}`);

    const requirement = getRequirementRule(row.requirement);
    const speedDelta = getSpeedDelta(row.effect);
    const cornerBonus = getCornerLimitBonus(row.effect);
    const optionalCycleCards = getOptionalDiscardCount(row.effect);
    const forcedCycleCards = getForcedDiscardCount(row.effect);
    const addCycle = (player, count, required = false) => count > 0 ? {
      ...player,
      modifiers: {
        ...player.modifiers,
        cycleCards: Math.max(player.modifiers.cycleCards || 0, count),
        cycleRequired: Boolean(player.modifiers.cycleRequired || required)
      }
    } : player;

    const card = {
      id: row.id,
      name: row.name,
      category: row.category,
      deckCode: row.deck_code || '',
      serialNumber: row.serial_number || '',
      plateSerial: getPlateSerial(row.deck_code, row.serial_number),
      type: row.type,
      timing: row.timing,
      req: requirement.label,
      desc: row.effect,
      canPlay: requirement.canPlay
    };

    if (id === 'full_throttle' || id === 'back_down' || id === 'hard_brake') {
      card.play = player => addCycle({ ...player, speed: clampSpeed(player.speed + speedDelta) }, forcedCycleCards, forcedCycleCards > 0);
    } else if (id === 'raw_horsepower') {
      card.play = player => ({ ...player, speed: clampSpeed(player.speed + speedDelta), modifiers: { ...player.modifiers, forwardOnly: true } });
    } else if (id === 'straight_line_monster') {
      card.play = (player, track) => {
        const current = track[player.lane][player.idx];
        const delta = current.limit === null ? 40 : 20;
        return { ...player, speed: clampSpeed(player.speed + delta) };
      };
    } else if (id === 'panic_stop') {
      card.play = player => ({
        ...player,
        speed: clampSpeed(player.speed + speedDelta),
        discard: [...player.discard, ...player.hand],
        hand: []
      });
    } else if (id === 'change_lane') {
      card.play = (player, track, otherPlayer) => {
        let nextPlayer = addCycle({ ...player }, forcedCycleCards, forcedCycleCards > 0);
        const target = getLaneChangeTarget(nextPlayer, track);
        if (!canOccupy(target.lane, target.idx, otherPlayer)) return nextPlayer;
        return { ...nextPlayer, lane: target.lane, idx: target.idx, distance: track[target.lane][target.idx].distance };
      };
    } else if (id === 'drift') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, driftBonus: 30 } });
    } else if (id === 'early_brake_cornering') {
      card.play = (player, track, otherPlayer) => {
        let nextPlayer = { ...player, speed: clampSpeed(player.speed + speedDelta) };
        const current = track[nextPlayer.lane][nextPlayer.idx];
        if (!current.isOuter) return nextPlayer;
        const target = getLaneChangeTarget(nextPlayer, track);
        if (!canOccupy(target.lane, target.idx, otherPlayer)) return nextPlayer;
        return { ...nextPlayer, lane: target.lane, idx: target.idx, distance: track[target.lane][target.idx].distance };
      };
    } else if (id === 'rocket_start') {
      card.play = player => addCycle({ ...player, modifiers: { ...player.modifiers, rocketSpeedDelta: speedDelta } }, optionalCycleCards);
    } else if (id === 'change_shift') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, pendingChoice: 'change_shift' } });
    } else if (id === 'clutch_kick') {
      card.play = player => ({ ...player, speed: clampSpeed(player.speed + speedDelta), modifiers: { ...player.modifiers, speedCheckBonusOnce: 50 } });
    } else if (id === 'trail_braking') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, trailBraking: true } });
    } else if (id === 'full_countersteer') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, countersteerCancel: true } });
    } else if (id === 'exit_drift') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, exitDriftPending: true } });
    } else if (id === 'drift_extend') {
      card.play = player => player.lastCornerSpeedBonus ? {
        ...player,
        modifiers: { ...player.modifiers, driftBonus: Math.max(player.modifiers.driftBonus || 0, player.lastCornerSpeedBonus) }
      } : player;
    } else if (id === 'gutter_boost') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, innerLaneSpeedCheckBonus: cornerBonus || 50 } });
    } else if (id === 'blind_attack') {
      card.play = player => ({
        ...player,
        discard: [...player.discard, ...player.hand],
        hand: [],
        modifiers: { ...player.modifiers, blindAttack: true }
      });
    } else if (id === 'jump_exit') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, fixedMovePoints: 4, ignoreSpeedLimits: true } });
    } else if (id === 'progressive_acceleration') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, progressiveAcceleration: true } });
    } else if (id === 'early_power') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, earlyPowerPending: true } });
    } else if (id === 'traction_control') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, tractionControl: true } });
    } else if (id === 'grip_line') {
      card.play = player => addCycle({ ...player, modifiers: { ...player.modifiers, driftBonus: Math.max(player.modifiers.driftBonus || 0, 20) } }, forcedCycleCards, forcedCycleCards > 0);
    } else if (id === 'balanced_chassis') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, balancedChassis: true } });
    } else if (id === 'torque_split') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, pendingChoice: 'torque_split' } });
    } else if (id === 'micro_correction') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, microCorrection: true } });
    } else if (id === 'line_lock') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, lineLockLane: player.lane, lineLockBonus: 30 } });
    } else if (id === 'chrome_bumper') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, chromeBumper: true } });
    } else if (id === 'shove_aside') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, shoveAside: true } });
    } else if (id === 'burn_rubber') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, burnRubberPending: true } });
    } else if (id === 'door_slam') {
      card.play = (player, track, otherPlayer) => {
        const target = getLaneChangeTarget(player, track);
        const nextPlayer = canOccupy(target.lane, target.idx, otherPlayer)
          ? { ...player, lane: target.lane, idx: target.idx, distance: track[target.lane][target.idx].distance }
          : player;
        return { ...nextPlayer, modifiers: { ...nextPlayer.modifiers, doorSlam: true } };
      };
    } else if (id === 'no_room') {
      card.play = player => ({ ...player, modifiers: { ...player.modifiers, noRoomLane: player.lane } });
    } else {
      card.play = player => player;
    }

    return [id, card];
  }));
};

const DECK_COMPOSITIONS = {
  ae86: [
    ['drift', 2],
    ['full_throttle', 3],
    ['back_down', 2],
    ['hard_brake', 1],
    ['change_lane', 1],
    ['early_brake_cornering', 1],
    ['rocket_start', 1],
    ['change_shift', 1]
  ],
  huracan: [
    ['drift', 1],
    ['full_throttle', 3],
    ['back_down', 2],
    ['clutch_kick', 1],
    ['trail_braking', 1],
    ['full_countersteer', 1],
    ['exit_drift', 1],
    ['gutter_boost', 1],
    ['jump_exit', 1]
  ],
  porsche911: [
    ['drift', 1],
    ['full_throttle', 3],
    ['back_down', 2],
    ['progressive_acceleration', 1],
    ['early_power', 1],
    ['traction_control', 1],
    ['grip_line', 1],
    ['torque_split', 1],
    ['micro_correction', 1]
  ],
  mustang: [
    ['full_throttle', 3],
    ['back_down', 2],
    ['hard_brake', 1],
    ['raw_horsepower', 1],
    ['straight_line_monster', 1],
    ['panic_stop', 1],
    ['chrome_bumper', 1],
    ['shove_aside', 1],
    ['door_slam', 1]
  ]
};

const getDeckIdsForCar = (carId, rows) => {
  const rowById = Object.fromEntries(rows.map(row => [row.id, row]));
  const composition = DECK_COMPOSITIONS[carId] || DECK_COMPOSITIONS.ae86;
  const deck = composition.flatMap(([id, count]) => rowById[id] && IMPLEMENTED_CARD_IDS.includes(id) ? Array.from({ length: count }, () => id) : []);
  return deck.length > 0 ? deck : DECK_COMPOSITIONS.ae86.flatMap(([id, count]) => Array.from({ length: count }, () => id));
};

const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const drawCards = (deck, discard, hand, count) => {
  let newHand = [...hand];
  let newDeck = [...deck];
  let newDiscard = [...discard];

  while (newHand.length < count) {
    if (newDeck.length === 0) {
      if (newDiscard.length === 0) break;
      newDeck = shuffle(newDiscard);
      newDiscard = [];
    }
    newHand.push(newDeck.pop());
  }
  return { deck: newDeck, discard: newDiscard, hand: newHand };
};

const RenderCard = ({ card, scale = 1, isHovered = false, onClick, onMouseEnter, onMouseLeave, disabled = false, extraClasses = "", isSelected = false }) => {
  const shadowColor = card.type === 'Gas' ? 'rgba(253,224,71,0.8)' : card.type === 'Brake' ? 'rgba(239,68,68,0.8)' : 'rgba(59,130,246,0.8)';
  const textColor = card.type === 'Gas' ? 'text-yellow-50' : card.type === 'Brake' ? 'text-red-50' : 'text-blue-50';
  const typeColor = card.type === 'Gas' ? 'text-yellow-500' : card.type === 'Brake' ? 'text-red-500' : 'text-blue-500';

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ transform: `scale(${scale})` }}
      className={`relative w-48 h-64 rounded-xl border-2 flex flex-col p-4 shadow-2xl text-left transition-colors duration-300
      ${disabled ? 'bg-zinc-950 border-zinc-900 opacity-80 cursor-not-allowed' : 'bg-zinc-800 border-zinc-500 hover:border-white hover:bg-zinc-700 cursor-pointer'}
      ${isSelected ? 'ring-4 ring-red-500 border-red-500 bg-red-950/50' : ''}
      ${extraClasses}`}
    >
      <div className="h-6 flex items-start w-full">
        {card.req !== 'None' && <span className="text-[10px] font-bold text-yellow-500 bg-yellow-950/50 px-1.5 py-0.5 rounded border border-yellow-700/50">Req: {card.req}</span>}
      </div>
      <div className={`font-black text-2xl leading-none mb-3 text-white ${textColor}`} style={{ filter: `drop-shadow(0 0 8px ${shadowColor})` }}>{card.name}</div>
      <div className="text-sm text-zinc-300 flex-1 leading-snug">
        <span className="font-bold text-zinc-400 uppercase text-xs mr-1">{card.timing}:</span>
        {card.desc}
      </div>
      <div className="mt-auto flex items-end justify-between gap-2">
        {card.serialNumber ? (
          <div className="rotate-[4deg] rounded-sm border border-white/80 bg-zinc-950 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_7px)] px-2 py-0.5 text-white shadow">
            <div className="text-[7px] font-black uppercase tracking-wider leading-none">{card.deckCode}</div>
            <div className="text-[12px] font-black leading-tight">{card.plateSerial}</div>
          </div>
        ) : <span />}
        <div className={`text-right text-xs font-black uppercase tracking-widest ${typeColor}`}>{card.type}</div>
      </div>
      {isSelected && <div className="absolute inset-0 bg-red-500/20 rounded-xl pointer-events-none mix-blend-overlay"></div>}
    </button>
  );
};

const RenderCardBack = ({ playerId }) => (
  <div className={`w-48 h-64 rounded-xl border-2 shadow-2xl p-3 ${playerId === 0 ? 'border-red-500 bg-red-950' : 'border-blue-500 bg-blue-950'}`}>
    <div className="w-full h-full rounded-lg border border-white/20 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_8px,transparent_8px,transparent_16px)] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-white/70 rotate-45 mb-8 flex items-center justify-center">
        <div className="w-7 h-7 bg-white/80" />
      </div>
      <div className="text-xs font-black tracking-[0.3em] text-white/80">DRIVING CARD</div>
      <div className="mt-2 text-[10px] font-bold tracking-[0.2em] text-white/40">FACE DOWN</div>
    </div>
  </div>
);

export default function ArcadeRacingGame() {
  const [appState, setAppState] = useState('TITLE');
  const [gameMode, setGameMode] = useState('PvE');
  const [gameState, setGameState] = useState(null);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [winSize, setWinSize] = useState({ w: 1000, h: 800 });
  const [hoveredCardIdx, setHoveredCardIdx] = useState(null);
  const [discardSelection, setDiscardSelection] = useState([]);
  const [inspectDiscardOpen, setInspectDiscardOpen] = useState(false);
  const [nnRevealStage, setNNRevealStage] = useState('faceDown');
  const [cardRows, setCardRows] = useState(DEFAULT_CARD_ROWS);
  const [cardDataSource, setCardDataSource] = useState('loading');
  const [cornerCardRows, setCornerCardRows] = useState(DEFAULT_CORNER_CARD_ROWS);
  const [cornerDataSource, setCornerDataSource] = useState('loading');
  const [selectedCourseId, setSelectedCourseId] = useState('akagi');
  const [courseDirection, setCourseDirection] = useState('downhill');
  const [randomMapSize, setRandomMapSize] = useState('medium');
  const [selectedCars, setSelectedCars] = useState([null, null]);
  const [activeCarPlayer, setActiveCarPlayer] = useState(0);

  // Panning & Zoom State
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.65);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const [trackSeed, setTrackSeed] = useState(() => Date.now());
  const [trackCardCount, setTrackCardCount] = useState(12);
  const TRACK = useMemo(() => generateTrack(trackSeed, cornerCardRows, 0, trackCardCount), [trackSeed, cornerCardRows, trackCardCount]);
  const CARDS = useMemo(() => buildCardCatalog(cardRows), [cardRows]);

  useEffect(() => {
    let cancelled = false;
    const url = `racing_cards.csv?updated=${Date.now()}`;

    fetch(url, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`Card CSV request failed: ${response.status}`);
        return response.text();
      })
      .then(text => {
        const rows = parseCSV(text);
        IMPLEMENTED_CARD_IDS.forEach(id => {
          if (!rows.some(row => row.id === id)) throw new Error(`Card CSV is missing ${id}`);
        });
        if (!cancelled) {
          setCardRows(rows);
          setCardDataSource('csv');
        }
      })
      .catch(() => {
        if (!cancelled) setCardDataSource('fallback');
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const url = `racing_corner_cards.csv?updated=${Date.now()}`;

    fetch(url, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`Corner card CSV request failed: ${response.status}`);
        return response.text();
      })
      .then(text => {
        const rows = parseCSV(text);
        parseCornerCardRows(rows);
        if (!cancelled) {
          setCornerCardRows(rows);
          setCornerDataSource('csv');
        }
      })
      .catch(() => {
        if (!cancelled) setCornerDataSource('fallback');
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const updateSize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const beginSetup = (mode) => {
    setGameMode(mode);
    setSelectedCourseId('akagi');
    setCourseDirection('downhill');
    setRandomMapSize('medium');
    setSelectedCars([null, mode === 'PvE' ? 'huracan' : null]);
    setActiveCarPlayer(0);
    setAppState('SELECT');
  };

  const initGame = () => {
    const selectedCourse = COURSE_OPTIONS.find(course => course.id === selectedCourseId) || COURSE_OPTIONS[0];
    const cardCount = selectedCourse.id === 'random' ? RANDOM_SIZE_CARDS[randomMapSize] : selectedCourse.cardCount;
    const directionOffset = courseDirection === 'uphill' ? 7919 : 0;
    const nextSeed = selectedCourse.seed === null
      ? Date.now() + Math.floor(Math.random() * 100000)
      : selectedCourse.seed + directionOffset;
    const nextTrack = generateTrack(nextSeed, cornerCardRows, 0, cardCount);
    const p1Draw = drawCards(shuffle(getDeckIdsForCar(selectedCars[0], cardRows)), [], [], 4);
    const p2Draw = drawCards(shuffle(getDeckIdsForCar(selectedCars[1], cardRows)), [], [], 4);

    setTrackSeed(nextSeed);
    setTrackCardCount(cardCount);
    setGameState({
      raceSetup: { courseId: selectedCourse.id, direction: selectedCourse.id === 'random' ? null : courseDirection, size: selectedCourse.id === 'random' ? randomMapSize : null, cars: [...selectedCars] },
      players: [
        { id: 0, name: 'Player 1', carId: selectedCars[0], color: 'red', speed: 20, lane: 0, idx: 0, distance: nextTrack[0][0].distance, ...p1Draw, modifiers: {}, lastPlayed: null },
        { id: 1, name: gameMode === 'PvE' ? 'AI Racer' : 'Player 2', carId: selectedCars[1], color: 'blue', speed: 20, lane: 1, idx: 0, distance: nextTrack[1][0].distance, ...p2Draw, modifiers: {}, lastPlayed: null }
      ],
      turnOrder: [0, 1],
      activePlayerIdx: 0,
      phase: 'PLAY_CARD',
      mpLeft: 0,
      logs: ['Race started! Player 1 is the Lead Player.'],
      winner: null,
      overtakeEvent: null,
      crashEvent: null,
      mangaCutin: null,
      nnSelections: null,
      nnActionOrder: null,
      nnActiveTurnIdx: null,
      nnMpLeft: null,
      cycleContext: null,
      cycleQueue: null,
      cycleQueueIndex: 0,
      isNNRound: false
    });
    setInspectDiscardOpen(false);
    setPanOffset({ x: 0, y: 0 });
    setZoom(0.65);
    setAppState('PLAYING');
  };

  const addLog = (msg) => {
    setGameState(prev => ({ ...prev, logs: [msg, ...prev.logs].slice(0, 20) }));
  };

  const getNNActionOrder = (players, fallbackOrder) => {
    const p1 = players[0];
    const p2 = players[1];

    if (p1.speed > p2.speed) return [0, 1];
    if (p2.speed > p1.speed) return [1, 0];

    const p1Outer = TRACK[p1.lane][p1.idx].isOuter;
    const p2Outer = TRACK[p2.lane][p2.idx].isOuter;
    if (!p1Outer && p2Outer) return [0, 1];
    if (!p2Outer && p1Outer) return [1, 0];
    return fallbackOrder;
  };

  const getTurnMovePoints = (player) => player.modifiers.fixedMovePoints ?? getGear(player.speed).mp;

  useEffect(() => {
    if (gameState?.overtakeEvent) {
      const timer = setTimeout(() => setGameState(prev => prev ? { ...prev, overtakeEvent: null } : prev), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.overtakeEvent]);

  useEffect(() => {
    if (gameState?.crashEvent) {
      const timer = setTimeout(() => setGameState(prev => prev ? { ...prev, crashEvent: null } : prev), 1800);
      return () => clearTimeout(timer);
    }
  }, [gameState?.crashEvent]);

  useEffect(() => {
    if (gameState?.mangaCutin) {
      const timer = setTimeout(() => setGameState(prev => prev ? { ...prev, mangaCutin: null } : prev), 1200);
      return () => clearTimeout(timer);
    }
  }, [gameState?.mangaCutin]);

  useEffect(() => {
    if (gameState?.phase !== 'NN_REVEAL') {
      setNNRevealStage('faceDown');
      return;
    }

    setNNRevealStage('faceDown');
    const revealTimer = setTimeout(() => setNNRevealStage('revealed'), 800);
    const decisionTimer = setTimeout(() => setNNRevealStage('decision'), 1700);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(decisionTimer);
    };
  }, [gameState?.phase, gameState?.nnSelections?.[0], gameState?.nnSelections?.[1]]);

  const resolveNNReveal = () => {
    if (nnRevealStage !== 'decision') return;
    setDiscardSelection([]);
    setGameState(prev => {
      let newPlayers = [...prev.players];
      const order = getNNActionOrder(newPlayers, prev.turnOrder);

      let logs = [`N&N Reveal! Order: ${newPlayers[order[0]].name} then ${newPlayers[order[1]].name}`];

      order.forEach(pid => {
        const cardId = prev.nnSelections[pid];
        if (cardId) {
          const card = CARDS[cardId];
          logs.unshift(`${newPlayers[pid].name} revealed ${card.name}!`);
          let p = { ...newPlayers[pid] };
          p.discard.push(cardId);
          p.lastPlayed = cardId;
          p = card.play(p, TRACK, newPlayers[1 - pid]);
          if (p.modifiers.pendingChoice === 'torque_split') {
            const { pendingChoice, ...remainingModifiers } = p.modifiers;
            p = { ...p, speed: clampSpeed(p.speed + 30), modifiers: remainingModifiers };
            logs.unshift(`${p.name} auto-chose Torque Split speed in N&N.`);
          } else if (p.modifiers.pendingChoice === 'change_shift') {
            const { pendingChoice, ...remainingModifiers } = p.modifiers;
            p = { ...p, speed: clampSpeed(p.speed + 10), modifiers: remainingModifiers };
            logs.unshift(`${p.name} auto-chose Change Shift speed in N&N.`);
          }
          newPlayers[pid] = p;
        } else {
          logs.unshift(`${newPlayers[pid].name} revealed no card.`);
        }
      });

      const nnMpLeft = {
        0: getTurnMovePoints(newPlayers[0]),
        1: getTurnMovePoints(newPlayers[1])
      };
      const cycleQueue = order.filter(pid => (newPlayers[pid].modifiers.cycleCards || 0) > 0 && newPlayers[pid].hand.length > 0);

      return {
        ...prev,
        players: newPlayers,
        phase: cycleQueue.length > 0 ? 'NN_CARD_CYCLE' : 'NN_MOVE',
        nnActionOrder: order,
        nnActiveTurnIdx: 0,
        nnMpLeft,
        cycleQueue,
        cycleQueueIndex: 0,
        logs: [...logs, ...prev.logs].slice(0, 20)
      };
    });
  };

  const activePlayerId = gameState?.phase === 'NN_MOVE' ? gameState.nnActionOrder[gameState.nnActiveTurnIdx] : gameState?.phase === 'NN_CARD_CYCLE' ? gameState.cycleQueue[gameState.cycleQueueIndex] : gameState?.turnOrder[gameState?.activePlayerIdx];
  const activePlayer = gameState?.players[activePlayerId];
  const otherPlayer = gameState?.players[1 - activePlayerId];
  const isLead = gameState?.activePlayerIdx === 0 && !gameState?.isNNRound;

  const getValidMoves = (p) => {
    let moves = [];
    const current = TRACK[p.lane][p.idx];
    if (p.idx + 1 < TRACK[p.lane].length) moves.push({ lane: p.lane, idx: p.idx + 1 });
    if (!p.modifiers.forwardOnly) current.adj.forEach(adjIdx => moves.push({ lane: 1 - p.lane, idx: adjIdx }));
    const opponent = gameState?.players?.[1 - p.id];
    if (opponent?.modifiers?.noRoomLane !== undefined) {
      moves = moves.filter(move => move.lane !== opponent.modifiers.noRoomLane || (move.lane === opponent.lane && move.idx === opponent.idx));
    }
    return moves;
  };

  useEffect(() => {
    if (appState !== 'PLAYING' || !gameState || gameState.winner) return;

    // Auto end move phase if no points left
    if (gameState.phase === 'MOVE' && gameState.mpLeft <= 0) {
      const timer = setTimeout(() => endTurn(), 400);
      return () => clearTimeout(timer);
    }
  }, [appState, gameState?.phase, gameState?.mpLeft, gameState?.winner]);

  useEffect(() => {
    if (
      appState !== 'PLAYING' ||
      gameState?.phase !== 'NN_MOVE' ||
      !gameState.nnMpLeft ||
      gameState.nnMpLeft[0] > 0 ||
      gameState.nnMpLeft[1] > 0
    ) return;

    const timer = setTimeout(() => finalizeNNRound(), 400);
    return () => clearTimeout(timer);
  }, [appState, gameState?.phase, gameState?.nnMpLeft?.[0], gameState?.nnMpLeft?.[1]]);

  useEffect(() => {
    if (appState !== 'PLAYING' || gameMode !== 'PvE' || !gameState || gameState.winner || activePlayerId !== 1 || gameState.phase === 'NN_REVEAL') return;

    const aiTimer = setTimeout(() => {
      if (gameState.phase === 'PLAY_CARD' || gameState.phase === 'NN_SELECT_CARD') {
        const playableIdxs = activePlayer.hand.map((id, idx) => ({ id, idx })).filter(c => CARDS[c.id].canPlay(activePlayer));
        if (playableIdxs.length > 0) {
          const pick = playableIdxs[Math.floor(Math.random() * playableIdxs.length)];
          playCard(pick.id, pick.idx);
        } else skipToDiscard();
      } else if (gameState.phase === 'DISCARD') {
         // AI discards 1 random card if hand has unplayable, or just 1 card to cycle
         let selection = [];
         if (activePlayer.hand.length > 0) {
             selection = [Math.floor(Math.random() * activePlayer.hand.length)];
         }
         confirmDiscard(selection);
      } else if (gameState.phase === 'CARD_CYCLE' || gameState.phase === 'NN_CARD_CYCLE') {
        const selection = activePlayer.hand.length > 0 ? [Math.floor(Math.random() * activePlayer.hand.length)] : [];
        confirmCardCycle(selection);
      } else if (gameState.phase === 'CARD_CHOICE') {
        const defaultChoice = gameState.choiceContext?.type === 'micro_correction' ? 'speed_up'
          : gameState.choiceContext?.type === 'change_shift' ? 'speed_up'
          : 'speed';
        resolveCardChoice(defaultChoice);
      } else if (gameState.phase === 'SLIPSTREAM') {
        acceptSlipstream(true);
      } else if (gameState.phase === 'MOVE' && gameState.mpLeft > 0) {
        const validMoves = getValidMoves(activePlayer);
        let target = validMoves.find(m => m.lane === activePlayer.lane);
        if (!target || (target.lane === otherPlayer.lane && target.idx === otherPlayer.idx)) {
          target = validMoves.find(m => m.lane !== activePlayer.lane) || validMoves[0];
        }
        if (target) attemptMove(target.lane, target.idx);
      } else if (gameState.phase === 'NN_MOVE' && gameState.nnMpLeft[activePlayerId] > 0) {
        const validMoves = getValidMoves(activePlayer);
        let target = validMoves.find(m => m.lane === activePlayer.lane);
        if (!target || (target.lane === otherPlayer.lane && target.idx === otherPlayer.idx)) {
          target = validMoves.find(m => m.lane !== activePlayer.lane) || validMoves[0];
        }
        if (target) attemptMove(target.lane, target.idx);
      }
    }, 800);

    return () => clearTimeout(aiTimer);
  }, [gameState, appState, gameMode, discardSelection, activePlayerId]);

  const playCard = (cardId, handIndex) => {
    const card = CARDS[cardId];

    if (gameState.phase === 'NN_SELECT_CARD') {
      addLog(`${activePlayer.name} locked in a card.`);
      let newPlayers = [...gameState.players];
      let p = { ...activePlayer };
      p.hand = p.hand.filter((_, i) => i !== handIndex);
      newPlayers[activePlayerId] = p;

      setGameState(prev => {
        const newSelections = { ...prev.nnSelections, [activePlayerId]: cardId };
        const nextIdx = prev.activePlayerIdx + 1;
        if (nextIdx >= 2) {
          return { ...prev, players: newPlayers, nnSelections: newSelections, phase: 'NN_REVEAL' };
        } else {
          return { ...prev, players: newPlayers, nnSelections: newSelections, activePlayerIdx: nextIdx };
        }
      });
      setHoveredCardIdx(null);
      return;
    }

    addLog(`${activePlayer.name} played ${card.name}.`);

    let newPlayers = [...gameState.players];
    let p = { ...activePlayer };

    p.hand = p.hand.filter((_, i) => i !== handIndex);
    p.discard.push(cardId);
    p.lastPlayed = cardId;
    p = card.play(p, TRACK, otherPlayer);
    newPlayers[activePlayerId] = p;

    let nextPhase = 'MOVE';
    let mp = getTurnMovePoints(p);

    if (!isLead && p.lane === otherPlayer.lane && p.distance < otherPlayer.distance) nextPhase = 'SLIPSTREAM';

    const cycleMax = p.modifiers.cycleCards || 0;
    const shouldCycle = cycleMax > 0 && p.hand.length > 0;
    const pendingChoice = p.modifiers.pendingChoice;
    const canPlayExtraCard = p.modifiers.extraCardPlay && p.hand.some(id => CARDS[id].canPlay(p));
    if (canPlayExtraCard) {
      const { extraCardPlay, ...remainingModifiers } = p.modifiers;
      p.modifiers = remainingModifiers;
      newPlayers[activePlayerId] = p;
      nextPhase = 'PLAY_CARD';
      mp = 0;
      addLog(`${p.name} may play another card.`);
    }
    setDiscardSelection([]);
    setGameState(prev => ({
      ...prev,
      players: newPlayers,
      phase: pendingChoice ? 'CARD_CHOICE' : shouldCycle ? 'CARD_CYCLE' : nextPhase,
      mpLeft: mp,
      cycleContext: shouldCycle ? { max: cycleMax, required: Boolean(p.modifiers.cycleRequired), resumePhase: nextPhase, resumeMp: mp } : null,
      choiceContext: pendingChoice ? { type: pendingChoice, playerId: activePlayerId, resumePhase: nextPhase, resumeMp: mp } : null,
      mangaCutin: { card: cardId, player: p.name, color: p.id === 0 ? 'text-red-500' : 'text-blue-500', type: card.type }
    }));
    setHoveredCardIdx(null);
  };

  const skipToDiscard = () => {
    addLog(`${activePlayer.name} skips card play.`);
    setDiscardSelection([]);
    setGameState(prev => ({ ...prev, phase: 'DISCARD' }));
  };

  const toggleDiscardSelection = (idx) => {
    setDiscardSelection(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const confirmDiscard = (overrideSelection = null) => {
    let newPlayers = [...gameState.players];
    let p = { ...activePlayer };

    const selectionToUse = Array.isArray(overrideSelection) ? overrideSelection : discardSelection;
    const discardedIds = selectionToUse.map(i => p.hand[i]);
    p.hand = p.hand.filter((_, i) => !selectionToUse.includes(i));
    p.discard.push(...discardedIds);
    p.lastPlayed = null;

    if (discardedIds.length > 0) addLog(`${p.name} discarded ${discardedIds.length} cards.`);

    newPlayers[activePlayerId] = p;

    if (gameState.isNNRound) {
       setGameState(prev => {
         const nextIdx = prev.activePlayerIdx + 1;
         if (nextIdx >= 2) {
           return { ...prev, players: newPlayers, phase: 'NN_REVEAL' };
         } else {
           return { ...prev, players: newPlayers, activePlayerIdx: nextIdx, phase: 'NN_SELECT_CARD' };
         }
       });
       setDiscardSelection([]);
       return;
    }

    let nextPhase = 'MOVE';
    let mp = getGear(p.speed).mp;
    if (!isLead && p.lane === otherPlayer.lane && p.distance < otherPlayer.distance) nextPhase = 'SLIPSTREAM';

    setGameState(prev => ({ ...prev, players: newPlayers, phase: nextPhase, mpLeft: mp }));
    setDiscardSelection([]);
  };

  const toggleCardCycleSelection = (idx) => {
    const max = gameState.phase === 'CARD_CYCLE' ? gameState.cycleContext.max : (activePlayer.modifiers.cycleCards || 1);
    setDiscardSelection(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      if (prev.length >= max) return prev;
      return [...prev, idx];
    });
  };

  const confirmCardCycle = (overrideSelection = null) => {
    const max = gameState.phase === 'CARD_CYCLE' ? gameState.cycleContext.max : (activePlayer.modifiers.cycleCards || 1);
    const required = gameState.phase === 'CARD_CYCLE' ? gameState.cycleContext.required : Boolean(activePlayer.modifiers.cycleRequired);
    const requested = Array.isArray(overrideSelection) ? overrideSelection : discardSelection;
    const selection = requested.filter(idx => idx >= 0 && idx < activePlayer.hand.length).slice(0, max);
    if (required && selection.length < Math.min(max, activePlayer.hand.length)) return;
    const newPlayers = [...gameState.players];
    const player = { ...activePlayer };
    const discardedIds = selection.map(idx => player.hand[idx]);
    player.hand = player.hand.filter((_, idx) => !selection.includes(idx));
    player.discard = [...player.discard, ...discardedIds];
    const { cycleCards, cycleRequired, ...remainingModifiers } = player.modifiers;
    player.modifiers = remainingModifiers;
    newPlayers[activePlayerId] = player;

    if (discardedIds.length > 0) addLog(`${player.name} cycles ${discardedIds.length} card.`);

    if (gameState.phase === 'CARD_CYCLE') {
      setGameState(prev => ({
        ...prev,
        players: newPlayers,
        phase: prev.cycleContext.resumePhase,
        mpLeft: prev.cycleContext.resumeMp,
        cycleContext: null
      }));
    } else {
      setGameState(prev => {
        const nextQueueIndex = prev.cycleQueueIndex + 1;
        return {
          ...prev,
          players: newPlayers,
          phase: nextQueueIndex >= prev.cycleQueue.length ? 'NN_MOVE' : 'NN_CARD_CYCLE',
          cycleQueueIndex: nextQueueIndex
        };
      });
    }
    setDiscardSelection([]);
  };

  const resolveCardChoice = (choice) => {
    if (gameState.phase !== 'CARD_CHOICE' || !gameState.choiceContext) return;
    const context = gameState.choiceContext;
    const newPlayers = [...gameState.players];
    let player = { ...newPlayers[context.playerId] };
    let logs = [];

    if (context.type === 'torque_split') {
      const { pendingChoice, ...remainingModifiers } = player.modifiers;
      if (choice === 'check_bonus') {
        player.modifiers = { ...remainingModifiers, speedCheckBonusOnce: Math.max(remainingModifiers.speedCheckBonusOnce || 0, 40) };
        logs.unshift(`TORQUE SPLIT: ${player.name} adds 40 km/h to the next speed check.`);
      } else {
        player.modifiers = remainingModifiers;
        player.speed = clampSpeed(player.speed + 30);
        logs.unshift(`TORQUE SPLIT: ${player.name} gains 30 km/h.`);
      }
    } else if (context.type === 'change_shift') {
      const { pendingChoice, ...remainingModifiers } = player.modifiers;
      player.speed = clampSpeed(player.speed + (choice === 'speed_down' ? -10 : 10));
      player.modifiers = { ...remainingModifiers, extraCardPlay: true };
      logs.unshift(`CHANGE SHIFT: ${player.name} ${choice === 'speed_down' ? 'loses' : 'gains'} 10 km/h.`);
    } else if (context.type === 'micro_correction') {
      player.speed = clampSpeed(player.speed + (choice === 'speed_down' ? -10 : 10));
      logs.unshift(`MICRO CORRECTION: ${player.name} ${choice === 'speed_down' ? 'loses' : 'gains'} 10 km/h.`);
    }

    newPlayers[context.playerId] = player;
    setDiscardSelection([]);
    setGameState(prev => {
      let nextPhase = context.resumePhase;
      let nextMp = context.resumeMp;
      let cycleContext = prev.cycleContext;

      if (context.type === 'change_shift') {
        const canPlayExtraCard = player.modifiers.extraCardPlay && player.hand.some(id => CARDS[id].canPlay(player));
        if (canPlayExtraCard) {
          const { extraCardPlay, ...remainingModifiers } = player.modifiers;
          player = { ...player, modifiers: remainingModifiers };
          newPlayers[context.playerId] = player;
          nextPhase = 'PLAY_CARD';
          nextMp = 0;
          logs.unshift(`${player.name} may play another card.`);
        }
      }

      return {
        ...prev,
        players: newPlayers,
        phase: nextPhase,
        mpLeft: context.resumePhase === 'MOVE' ? nextMp : prev.mpLeft,
        nnMpLeft: context.resumePhase === 'NN_MOVE' ? context.nnMpLeft : prev.nnMpLeft,
        choiceContext: null,
        cycleContext,
        logs: [...logs, ...prev.logs].slice(0, 20)
      };
    });
  };

  const acceptSlipstream = (accept) => {
    let newPlayers = [...gameState.players];
    let p = { ...activePlayer };

    if (accept) {
      p.speed = Math.min(MAX_SPEED, p.speed + 10);
      addLog(`${p.name} takes the Slipstream! (+10 km/h)`);
    } else {
      addLog(`${p.name} declined the Slipstream.`);
    }

    newPlayers[activePlayerId] = p;
    setGameState(prev => ({ ...prev, players: newPlayers, phase: 'MOVE', mpLeft: getTurnMovePoints(p) }));
  };

  const attemptMove = (targetLane, targetIdx) => {
    const isNN = gameState.phase === 'NN_MOVE';
    const mpAvail = isNN ? gameState.nnMpLeft[activePlayerId] : gameState.mpLeft;
    if (mpAvail <= 0) return;

    let p = { ...activePlayer };
    let op = { ...otherPlayer };
    let newPlayers = [...gameState.players];
    let triggeredCrash = null;

    if (op.modifiers.noRoomLane !== undefined && targetLane === op.modifiers.noRoomLane && !(targetLane === op.lane && targetIdx === op.idx)) {
      addLog(`NO ROOM: ${op.name} blocks ${p.name} from entering that lane.`);
      return;
    }

    if (targetLane === op.lane && targetIdx === op.idx) {
      addLog(`${p.name} is blocked by ${op.name}!`);
      if (p.modifiers.chromeBumper && p.hand.length > 0) {
        const discardedId = p.hand[0];
        p = { ...p, hand: p.hand.slice(1), discard: [...p.discard, discardedId], modifiers: { ...p.modifiers, chromeBumper: false } };
        op = { ...op, speed: clampSpeed(op.speed - 40) };
        addLog(`CHROME BUMPER: ${op.name} loses 40 km/h.`);
      }
      if (p.modifiers.doorSlam) {
        op = { ...op, speed: clampSpeed(op.speed - 20), modifiers: { ...op.modifiers, skipRemainingMove: true } };
        addLog(`DOOR SLAM: ${op.name} loses 20 km/h and remaining move points.`);
      }
      if (p.modifiers.shoveAside) {
        const shoveTarget = getLaneChangeTarget(op, TRACK);
        const blockedShove = p.lane === shoveTarget.lane && p.idx === shoveTarget.idx;
        if (!blockedShove) {
          const oldLane = op.lane;
          const oldIdx = op.idx;
          op = { ...op, lane: shoveTarget.lane, idx: shoveTarget.idx, distance: TRACK[shoveTarget.lane][shoveTarget.idx].distance };
          p = { ...p, lane: oldLane, idx: oldIdx, distance: TRACK[oldLane][oldIdx].distance, modifiers: { ...p.modifiers, shoveAside: false } };
          addLog(`SHOVE ASIDE: ${p.name} forces ${op.name} out of the lane.`);
          newPlayers[activePlayerId] = p;
          newPlayers[1 - activePlayerId] = op;
          if (isNN) advanceNNTurn(newPlayers, activePlayerId, mpAvail - 1, triggeredCrash || gameState.crashEvent);
          else setGameState(prev => ({ ...prev, players: newPlayers, mpLeft: prev.mpLeft - 1 }));
          return;
        }
        triggeredCrash = { name: `${p.name} / ${op.name}`, type: 'SPIN OFF', penalty: '-2 Gears' };
        p.speed = getPenaltySpeed(getGear(p.speed).gear - 2);
        op = { ...op, speed: getPenaltySpeed(getGear(op.speed).gear - 2), modifiers: { ...op.modifiers, skipRemainingMove: true } };
        addLog(`SHOVE ASIDE: no space. Both cars spin off and lose remaining move points.`);
        newPlayers[activePlayerId] = p;
        newPlayers[1 - activePlayerId] = op;
        if (isNN) advanceNNTurn(newPlayers, activePlayerId, 0, triggeredCrash || gameState.crashEvent);
        else setGameState(prev => ({ ...prev, players: newPlayers, mpLeft: 0, crashEvent: triggeredCrash || prev.crashEvent, mangaCutin: null }));
        return;
      }
      if (p.modifiers.blindAttack) {
        const blindTarget = getLaneChangeTarget(p, TRACK);
        const targetOccupied = op.lane === blindTarget.lane && op.idx === blindTarget.idx;
        if (!targetOccupied) {
          const { blindAttack, ...remainingModifiers } = p.modifiers;
          p = {
            ...p,
            lane: blindTarget.lane,
            idx: blindTarget.idx,
            distance: TRACK[blindTarget.lane][blindTarget.idx].distance,
            modifiers: remainingModifiers
          };
          addLog(`BLIND ATTACK: ${p.name} switches lanes and keeps momentum.`);
          newPlayers[activePlayerId] = p;
          if (isNN) advanceNNTurn(newPlayers, activePlayerId, mpAvail, triggeredCrash || gameState.crashEvent);
          else setGameState(prev => ({ ...prev, players: newPlayers, mpLeft: prev.mpLeft }));
          return;
        }
      }
      if (p.speed > op.speed) {
        p.speed = op.speed;
        addLog(`${p.name} matches speed to ${op.speed}.`);
      }
      newPlayers[activePlayerId] = p;
      newPlayers[1 - activePlayerId] = op;
      if (isNN) advanceNNTurn(newPlayers, activePlayerId, mpAvail - 1, triggeredCrash || gameState.crashEvent);
      else setGameState(prev => ({ ...prev, players: newPlayers, mpLeft: prev.mpLeft - 1 }));
      return;
    }

    p.lane = targetLane;
    p.idx = targetIdx;
    p.distance = TRACK[targetLane][targetIdx].distance;

    let currentMp = mpAvail - 1;
    const movedSideways = targetLane !== activePlayer.lane;
    if (movedSideways && p.modifiers.balancedChassis && p.hand.length > 0) {
      const discardedId = p.hand[0];
      const { balancedChassis, ...remainingModifiers } = p.modifiers;
      p = { ...p, hand: p.hand.slice(1), discard: [...p.discard, discardedId], modifiers: remainingModifiers };
      currentMp = mpAvail;
      addLog(`BALANCED CHASSIS: ${p.name} discards 1 card for a free side step.`);
    }
    let understeering = true;

    while (understeering) {
      if (p.idx >= TRACK[p.lane].length) break;
      const space = TRACK[p.lane][p.idx];

      if (space.isGoal) {
        setGameState(prev => ({ ...prev, players: newPlayers, winner: p.name }));
        setAppState('GAMEOVER');
        return;
      }

      let effLimit = space.limit;
      if (effLimit !== null) {
        p.modifiers = { ...p.modifiers, passedSpeedCheck: true };
        if (p.modifiers.driftBonus) {
          effLimit += p.modifiers.driftBonus;
          p.modifiers.usedCornerSpeedBonus = Math.max(p.modifiers.usedCornerSpeedBonus || 0, p.modifiers.driftBonus);
        }
        if (p.modifiers.innerLaneSpeedCheckBonus && !space.isOuter) {
          effLimit += p.modifiers.innerLaneSpeedCheckBonus;
          p.modifiers.usedCornerSpeedBonus = Math.max(p.modifiers.usedCornerSpeedBonus || 0, p.modifiers.innerLaneSpeedCheckBonus);
        }
        if (p.modifiers.lineLockBonus && p.modifiers.lineLockLane === p.lane) {
          effLimit += p.modifiers.lineLockBonus;
          p.modifiers.usedCornerSpeedBonus = Math.max(p.modifiers.usedCornerSpeedBonus || 0, p.modifiers.lineLockBonus);
        }
        if (p.modifiers.speedCheckBonusOnce) {
          effLimit += p.modifiers.speedCheckBonusOnce;
          p.modifiers.usedCornerSpeedBonus = Math.max(p.modifiers.usedCornerSpeedBonus || 0, p.modifiers.speedCheckBonusOnce);
          const { speedCheckBonusOnce, ...remainingModifiers } = p.modifiers;
          p.modifiers = remainingModifiers;
        }
        if (p.modifiers.trailBraking && p.speed > effLimit && p.speed - 10 >= 0) {
          p.speed = Math.max(0, p.speed - 10);
          addLog(`TRAIL BRAKING: ${p.name} sheds 10 km/h before the speed check.`);
        }
      }

      if (effLimit !== null && p.speed > effLimit && !p.modifiers.ignoreSpeedLimits) {
        if (p.modifiers.tractionControl) {
          const { tractionControl, ...remainingModifiers } = p.modifiers;
          p = { ...p, speed: clampSpeed(p.speed - 20), modifiers: remainingModifiers };
          addLog(`TRACTION CONTROL: ${p.name} loses 20 km/h and cancels understeer.`);
          understeering = false;
          continue;
        }
        if (p.modifiers.countersteerCancel && p.hand.length > 0) {
          const discardedId = p.hand[0];
          const { countersteerCancel, ...remainingModifiers } = p.modifiers;
          p = {
            ...p,
            hand: p.hand.slice(1),
            discard: [...p.discard, discardedId],
            modifiers: remainingModifiers
          };
          addLog(`FULL COUNTERSTEER: ${p.name} discards 1 card and cancels understeer.`);
          understeering = false;
          continue;
        }
        addLog(`UNDERSTEER: ${p.name} speed ${p.speed} exceeds limit ${effLimit}.`);
        p.modifiers = { ...p.modifiers, speedCheckFailed: true };
        if (space.isOuter) {
          const pGear = getGear(p.speed).gear;
          if (space.guardrail) {
            triggeredCrash = { name: p.name, type: 'GUARDRAIL', penalty: '-1 Gear' };
            addLog(`CRASH: ${p.name} hits the guardrail. (-1 Gear, remaining move points lost)`);
            p.speed = getPenaltySpeed(pGear - 1);
          } else {
            triggeredCrash = { name: p.name, type: 'SPIN OFF', penalty: '-2 Gears' };
            addLog(`SPIN OFF: ${p.name} leaves the road. (-2 Gears, remaining move points lost)`);
            p.speed = getPenaltySpeed(pGear - 2);
          }
          currentMp = 0;
          understeering = false;
        } else {
          // Push outward
          const outLane = 1 - p.lane;
          const outIdx = space.adj[space.adj.length - 1] || 0;
          p.lane = outLane;
          p.idx = outIdx;
          p.distance = TRACK[outLane][outIdx].distance;

          if (p.lane === op.lane && p.idx === op.idx) {
            triggeredCrash = { name: p.name, type: 'COLLISION', penalty: '-1 Gear' };
            addLog(`COLLISION: ${p.name} side-swipes ${op.name}.`);
            p.speed = getPenaltySpeed(getGear(p.speed).gear - 1);
            op.speed = getPenaltySpeed(getGear(op.speed).gear - 1);
            understeering = false;
          }
        }
      } else {
        if (effLimit !== null && p.modifiers.microCorrection) {
          newPlayers[activePlayerId] = p;
          newPlayers[1 - activePlayerId] = op;
          if (isNN) {
            setGameState(prev => ({
              ...prev,
              players: newPlayers,
              phase: 'CARD_CHOICE',
              choiceContext: {
                type: 'micro_correction',
                playerId: activePlayerId,
                resumePhase: 'NN_MOVE',
                resumeMp: currentMp,
                nnMpLeft: { ...prev.nnMpLeft, [activePlayerId]: currentMp }
              }
            }));
          } else {
            setGameState(prev => ({
              ...prev,
              players: newPlayers,
              phase: 'CARD_CHOICE',
              mpLeft: currentMp,
              choiceContext: {
                type: 'micro_correction',
                playerId: activePlayerId,
                resumePhase: 'MOVE',
                resumeMp: currentMp
              }
            }));
          }
          return;
        }
        understeering = false;
      }
    }

    if (p.modifiers.progressiveAcceleration) {
      p.speed = clampSpeed(p.speed + 10);
      addLog(`PROGRESSIVE ACCELERATION: ${p.name} gains 10 km/h.`);
    }

    newPlayers[activePlayerId] = p;
    newPlayers[1 - activePlayerId] = op;

    if (isNN) advanceNNTurn(newPlayers, activePlayerId, currentMp, triggeredCrash || gameState.crashEvent);
    else setGameState(prev => ({ ...prev, players: newPlayers, mpLeft: currentMp, crashEvent: triggeredCrash || prev.crashEvent, mangaCutin: triggeredCrash ? null : prev.mangaCutin }));
  };

  const advanceNNTurn = (newPlayers, movedPlayerId, currentMp, crashEvent) => {
    setGameState(prev => {
      const newNnMpLeft = { ...prev.nnMpLeft, [movedPlayerId]: currentMp };
      newPlayers.forEach(player => {
        if (player.modifiers.skipRemainingMove) newNnMpLeft[player.id] = 0;
      });
      const nextTurnIdx = getNextNNActiveTurnIdx(prev.nnActionOrder, prev.nnActiveTurnIdx, newNnMpLeft);

      return {
        ...prev,
        players: newPlayers,
        nnMpLeft: newNnMpLeft,
        nnActiveTurnIdx: nextTurnIdx ?? prev.nnActiveTurnIdx,
        crashEvent,
        mangaCutin: crashEvent ? null : prev.mangaCutin
      };
    });
  };

  const finalizeNNRound = () => {
    setGameState(prev => {
      if (!prev) return prev;
      let newPlayers = [...prev.players];
      let newLogs = [...prev.logs];

      [0, 1].forEach(pid => {
         let p = { ...newPlayers[pid] };
         if (p.modifiers.rocketSpeedDelta) {
           p.speed = clampSpeed(p.speed + p.modifiers.rocketSpeedDelta);
           newLogs.unshift(`ROCKET START: ${p.name} gains ${p.modifiers.rocketSpeedDelta} km/h.`);
         }
         if (p.modifiers.exitDriftPending && p.modifiers.passedSpeedCheck) {
           p.speed = clampSpeed(p.speed + 30);
           newLogs.unshift(`EXIT DRIFT: ${p.name} gains 30 km/h.`);
         }
         if (p.modifiers.earlyPowerPending && p.modifiers.passedSpeedCheck && !p.modifiers.speedCheckFailed) {
           p.speed = clampSpeed(p.speed + 40);
           newLogs.unshift(`EARLY POWER: ${p.name} gains 40 km/h.`);
         }
         if (p.modifiers.burnRubberPending && p.distance > newPlayers[1 - pid].distance) {
           p.speed = clampSpeed(p.speed + 60);
           p.discard = [...p.discard, ...p.hand];
           p.hand = [];
           newLogs.unshift(`BURN RUBBER: ${p.name} gains 60 km/h and discards all cards.`);
         }
         p.lastCornerSpeedBonus = Math.max(
           p.modifiers.driftBonus || 0,
           p.modifiers.innerLaneSpeedCheckBonus || 0,
           p.modifiers.speedCheckBonusOnce || 0,
           p.modifiers.usedCornerSpeedBonus || 0
         );
         p.modifiers = {};
         const drawn = drawCards(p.deck, p.discard, p.hand, 4);
         p.deck = drawn.deck; p.discard = drawn.discard; p.hand = drawn.hand;
         p.lastPlayed = null;
         newPlayers[pid] = p;
      });

      const p1 = newPlayers[0], p2 = newPlayers[1];
      let newTurnOrder = prev.turnOrder;
      let newOvertakeEvent = prev.overtakeEvent;

      if (p1.distance > p2.distance) newTurnOrder = [0, 1];
      else if (p2.distance > p1.distance) newTurnOrder = [1, 0];
      else {
        if (p1.speed > p2.speed) newTurnOrder = [0, 1];
        else if (p2.speed > p1.speed) newTurnOrder = [1, 0];
        else newTurnOrder = p1.lane === 1 ? [0, 1] : [1, 0];
      }

      if (newTurnOrder[0] !== prev.turnOrder[0]) {
        newOvertakeEvent = newPlayers[newTurnOrder[0]].name;
        newLogs.unshift(`OVERTAKE: ${newPlayers[newTurnOrder[0]].name} takes the lead!`);
      }

      newLogs.unshift(`-- N&N Complete. ${newPlayers[newTurnOrder[0]].name} is Lead. --`);

      const isNextNN = p1.lane !== p2.lane && TRACK[p1.lane][p1.idx].adj.includes(p2.idx);

      return {
         ...prev, players: newPlayers, turnOrder: newTurnOrder,
         activePlayerIdx: 0,
         phase: isNextNN ? 'NN_SELECT_CARD' : 'PLAY_CARD',
         mpLeft: 0, logs: newLogs.slice(0, 20), overtakeEvent: newOvertakeEvent,
         nnSelections: isNextNN ? {0:null, 1:null} : null,
         isNNRound: isNextNN
      };
    });
  };

  const endTurn = () => {
    setGameState(prev => {
      if (!prev) return prev;

      let newPlayers = [...prev.players];
      let p = { ...newPlayers[prev.turnOrder[prev.activePlayerIdx]] };
      let newLogs = [...prev.logs];

      if (p.modifiers.rocketSpeedDelta) {
        p.speed = clampSpeed(p.speed + p.modifiers.rocketSpeedDelta);
           newLogs.unshift(`ROCKET START: ${p.name} gains ${p.modifiers.rocketSpeedDelta} km/h.`);
      }
      if (p.modifiers.exitDriftPending && p.modifiers.passedSpeedCheck) {
        p.speed = clampSpeed(p.speed + 30);
        newLogs.unshift(`EXIT DRIFT: ${p.name} gains 30 km/h.`);
      }
      if (p.modifiers.earlyPowerPending && p.modifiers.passedSpeedCheck && !p.modifiers.speedCheckFailed) {
        p.speed = clampSpeed(p.speed + 40);
        newLogs.unshift(`EARLY POWER: ${p.name} gains 40 km/h.`);
      }
      const opponent = newPlayers[1 - p.id];
      if (p.modifiers.burnRubberPending && p.distance > opponent.distance) {
        p.speed = clampSpeed(p.speed + 60);
        p.discard = [...p.discard, ...p.hand];
        p.hand = [];
        newLogs.unshift(`BURN RUBBER: ${p.name} gains 60 km/h and discards all cards.`);
      }

      p.lastCornerSpeedBonus = Math.max(
        p.modifiers.driftBonus || 0,
        p.modifiers.innerLaneSpeedCheckBonus || 0,
        p.modifiers.speedCheckBonusOnce || 0,
        p.modifiers.usedCornerSpeedBonus || 0
      );
      p.modifiers = {};
      const drawn = drawCards(p.deck, p.discard, p.hand, 4);
      p.deck = drawn.deck;
      p.discard = drawn.discard;
      p.hand = drawn.hand;

      newPlayers[p.id] = p;

      const isNNNow = newPlayers[0].lane !== newPlayers[1].lane &&
        TRACK[newPlayers[0].lane][newPlayers[0].idx].adj.includes(newPlayers[1].idx);

      if (isNNNow) {
        newPlayers = newPlayers.map(player => ({ ...player, lastPlayed: null }));
        newLogs.unshift(`NECK AND NECK: Both cards are locked in.`);
        return {
          ...prev,
          players: newPlayers,
          activePlayerIdx: 0,
          phase: 'NN_SELECT_CARD',
          mpLeft: 0,
          logs: newLogs.slice(0, 20),
          nnSelections: { 0: null, 1: null },
          nnActionOrder: null,
          nnActiveTurnIdx: null,
          nnMpLeft: null,
          isNNRound: true
        };
      }

      let nextIdx = prev.activePlayerIdx + 1;
      let newTurnOrder = prev.turnOrder;
      let newOvertakeEvent = prev.overtakeEvent;
      let nextPhase = 'PLAY_CARD';
      let isNN = false;

      if (nextIdx >= 2) {
        nextIdx = 0;
        const p1 = newPlayers[0], p2 = newPlayers[1];
        if (p1.distance > p2.distance) newTurnOrder = [0, 1];
        else if (p2.distance > p1.distance) newTurnOrder = [1, 0];
        else {
          if (p1.speed > p2.speed) newTurnOrder = [0, 1];
          else if (p2.speed > p1.speed) newTurnOrder = [1, 0];
          else newTurnOrder = p1.lane === 1 ? [0, 1] : [1, 0];
        }

        if (newTurnOrder[0] !== prev.turnOrder[0]) {
          newOvertakeEvent = newPlayers[newTurnOrder[0]].name;
        newLogs.unshift(`OVERTAKE: ${newPlayers[newTurnOrder[0]].name} takes the lead!`);
        }

        newLogs.unshift(`-- Round End. ${newPlayers[newTurnOrder[0]].name} is Lead. --`);

        isNN = p1.lane !== p2.lane && TRACK[p1.lane][p1.idx].adj.includes(p2.idx);
        if (isNN) {
           nextPhase = 'NN_SELECT_CARD';
           newLogs.unshift(`NECK AND NECK ENGAGED!`);
        }
      }

      const nextActiveId = newTurnOrder[nextIdx];
      newPlayers[nextActiveId].lastPlayed = null;

      return {
        ...prev, players: newPlayers, turnOrder: newTurnOrder, activePlayerIdx: nextIdx,
        phase: nextPhase, mpLeft: 0, logs: newLogs.slice(0, 20), overtakeEvent: newOvertakeEvent,
        nnSelections: isNN ? {0:null, 1:null} : null, isNNRound: isNN
      };
    });
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.no-pan') || e.target.tagName.toLowerCase() === 'path') return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY };
    panStart.current = { ...panOffset };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setPanOffset({
      x: panStart.current.x + (clientX - dragStart.current.x) / zoom,
      y: panStart.current.y + (clientY - dragStart.current.y) / zoom
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    if (e.target.closest('.no-pan')) return;
    setZoom(z => Math.max(0.3, Math.min(2.5, z - e.deltaY * 0.001)));
  };

  const Speedometer = ({ player, position, projectedSpeed, isTurn, phase, mpLeft, isLeadStatus }) => {
    const gearInfo = getGear(player.speed);
    const angle = (player.speed / MAX_SPEED) * 180 - 90;
    const ghostAngle = projectedSpeed !== null ? (projectedSpeed / MAX_SPEED) * 180 - 90 : null;
    const isP1 = player.id === 0;
    const lastCard = player.lastPlayed ? CARDS[player.lastPlayed] : null;
    const isBottomLeft = position === 'bottom-left';
    const meterPositionClass = isBottomLeft ? 'bottom-4 left-4' : 'top-12 right-4';

    return (
      <div className={`fixed ${meterPositionClass} z-40 flex flex-col items-center bg-zinc-900/90 backdrop-blur p-4 rounded-2xl border border-zinc-700 shadow-2xl w-64 no-pan pointer-events-none`}>

        {/* Lead / Following Badge */}
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border ${isLeadStatus ? 'bg-yellow-400 text-black border-yellow-500 whitespace-nowrap' : 'bg-zinc-800 text-zinc-400 border-zinc-600 whitespace-nowrap'}`}>
          {isLeadStatus ? 'LEADING' : 'FOLLOWING'}
        </div>

        <h3 className={`text-xl font-black mb-2 uppercase tracking-wider ${isP1 ? 'text-red-500' : 'text-blue-500'}`}>{player.name}</h3>
        <div className="relative w-48 h-24 overflow-hidden mb-2">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M 20 100 A 80 80 0 0 1 35 60" fill="none" stroke="#3f3f46" strokeWidth="15" />
            <path d="M 35 60 A 80 80 0 0 1 70 30" fill="none" stroke="#52525b" strokeWidth="15" />
            <path d="M 70 30 A 80 80 0 0 1 130 30" fill="none" stroke="#71717a" strokeWidth="15" />
            <path d="M 130 30 A 80 80 0 0 1 165 60" fill="none" stroke="#f59e0b" strokeWidth="15" />
            <path d="M 165 60 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="15" />

            {/* Hover Ghost Needle */}
            {ghostAngle !== null && (
              <line x1="100" y1="100" x2="100" y2="25" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeDasharray="6 4" style={{ transform: `rotate(${ghostAngle}deg)`, transformOrigin: '100px 100px', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
            )}

            {/* Actual Needle */}
            <line x1="100" y1="100" x2="100" y2="25" stroke="white" strokeWidth="4" style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
            <circle cx="100" cy="100" r="8" fill="white" />
          </svg>
          <div className="absolute bottom-0 w-full text-center font-mono text-4xl font-black text-white shadow-black drop-shadow-md">{player.speed}</div>
        </div>
        <div className="flex justify-between w-full text-xs font-bold text-zinc-400 px-2">
          <span>GEAR {gearInfo.gear}</span><span>{gearInfo.mp} MP</span>
        </div>

        {/* Moves Left Badge Pop-up */}
        {isTurn && (phase === 'MOVE' || phase === 'NN_MOVE') && mpLeft > 0 && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur px-6 py-2 rounded-xl border-2 border-green-500 shadow-2xl pointer-events-auto flex items-center gap-3">
            <div className="text-3xl font-black text-green-400 leading-none">{mpLeft}</div>
            <div className="text-[10px] text-zinc-300 uppercase tracking-widest text-left leading-tight">Moves<br/>Left</div>
          </div>
        )}

        {/* Full Played Card Display anchored near each driver's meter. */}
        {lastCard && (
          <div className={`absolute ${isBottomLeft ? 'bottom-full left-8 mb-5' : 'top-full right-8 mt-5'} z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300`}>
            <div className={`absolute ${isBottomLeft ? '-top-3' : '-top-3'} left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300 shadow-xl z-10 whitespace-nowrap`}>
              Played Card
            </div>
            <RenderCard card={lastCard} scale={0.62} extraClasses="opacity-90 grayscale-[0.2]" />
          </div>
        )}
      </div>
    );
  };

  const PileWidget = ({ type, count, topCard, onClick }) => {
    const isDiscard = type === 'discard';
    const title = isDiscard ? 'Discard' : 'Deck';
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!isDiscard || count === 0}
        className={`relative h-36 w-28 rounded-xl border-2 p-2 text-left shadow-2xl transition no-pan ${isDiscard ? 'border-orange-500/70 bg-zinc-900 hover:border-orange-300 hover:-translate-y-1 cursor-pointer' : 'border-zinc-600 bg-zinc-950 cursor-not-allowed'}`}
      >
        <div className="absolute -right-2 -top-2 flex h-8 min-w-8 items-center justify-center rounded-full border border-white/20 bg-black px-2 text-sm font-black text-white shadow-xl">{count}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</div>
        <div className="mt-2 h-24 rounded-lg border border-white/15 overflow-hidden">
          {isDiscard && topCard ? (
            <div className="h-full bg-zinc-800 p-2">
              <div className={`text-[10px] font-black uppercase ${topCard.type === 'Gas' ? 'text-yellow-400' : topCard.type === 'Brake' ? 'text-red-400' : 'text-blue-400'}`}>{topCard.type}</div>
              <div className="mt-2 text-sm font-black leading-tight text-white">{topCard.name}</div>
              <div className="mt-2 text-[9px] leading-tight text-zinc-400 line-clamp-3">{topCard.desc}</div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_7px,transparent_7px,transparent_14px)]">
              <div className="h-8 w-8 rotate-45 border-4 border-white/50" />
              <div className="mt-4 text-[9px] font-black tracking-[0.2em] text-white/40">FACE DOWN</div>
            </div>
          )}
        </div>
      </button>
    );
  };

  if (appState === 'TITLE') {
    return (
      <div className="relative flex h-screen w-full overflow-hidden text-white flex-col items-center justify-center bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(127,29,29,0.38)_0%,rgba(17,24,39,0.42)_36%,rgba(0,0,0,0.96)_78%)]" />
        <div className="absolute inset-0 opacity-35 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_2px,transparent_2px,transparent_16px),repeating-linear-gradient(45deg,rgba(250,204,21,0.07)_0px,rgba(250,204,21,0.07)_1px,transparent_1px,transparent_34px)]" />
        <div className="absolute left-[-15vw] top-[12vh] h-[54vh] w-[130vw] -rotate-3 bg-[linear-gradient(105deg,transparent_0%,rgba(24,24,27,0.78)_14%,rgba(5,5,5,0.96)_48%,rgba(24,24,27,0.75)_82%,transparent_100%)] shadow-[0_0_70px_rgba(0,0,0,0.8)]" />
        <div className="absolute left-[-12vw] top-[12vh] h-[54vh] w-[130vw] -rotate-3 opacity-35 bg-[linear-gradient(90deg,rgba(255,255,255,0.14)_0_1px,transparent_1px_32px),linear-gradient(0deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_32px)]" />
        <div className="absolute left-[-14vw] top-[21vh] h-12 w-[128vw] -skew-x-12 bg-red-600/24 shadow-[0_0_35px_rgba(239,68,68,0.35)]" />
        <div className="absolute left-[-10vw] top-[40vh] h-9 w-[118vw] -skew-x-12 bg-yellow-400/20 shadow-[0_0_30px_rgba(250,204,21,0.28)]" />
        <div className="absolute bottom-[-22vh] h-[48vh] w-[145vw] -rotate-6 bg-[linear-gradient(90deg,transparent_0%,rgba(39,39,42,0.78)_18%,rgba(9,9,11,0.94)_50%,rgba(39,39,42,0.78)_82%,transparent_100%)]" />
        <div className="absolute bottom-[9vh] h-1 w-[120vw] -rotate-6 bg-white/16" />
        <div className="relative z-10 flex flex-col items-center">
        <img
          src="Assets/title-logo-transparent.png"
          alt="山道疾走：ドリフトデュエル Mountain Chase: Drift Duel"
          className="mb-8 max-h-[50vh] w-[min(92vw,940px)] object-contain drop-shadow-[0_0_28px_rgba(239,68,68,0.45)]"
        />
        <p className="text-zinc-400 font-mono tracking-widest mb-12">TACTICAL DRIFT CARD BATTLES</p>
        <div className="flex gap-6">
          <button onClick={() => beginSetup('PvE')} className="group relative px-8 py-4 bg-zinc-900 border-2 border-zinc-700 rounded-xl hover:border-red-500 hover:bg-zinc-800 transition-all shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <div className="relative flex items-center gap-3 text-xl font-bold"><Bot className="text-zinc-400 group-hover:text-red-400" /><span>VS AI Racers</span></div>
          </button>
          <button onClick={() => beginSetup('PvP')} className="group relative px-8 py-4 bg-zinc-900 border-2 border-zinc-700 rounded-xl hover:border-blue-500 hover:bg-zinc-800 transition-all shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <div className="relative flex items-center gap-3 text-xl font-bold"><Users className="text-zinc-400 group-hover:text-blue-400" /><span>VS Player 2</span></div>
          </button>
        </div>
        </div>
        <div className={`fixed bottom-6 px-4 py-2 rounded-full border text-xs font-bold tracking-wide ${cardDataSource === 'csv' && cornerDataSource === 'csv' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' : cardDataSource === 'loading' || cornerDataSource === 'loading' ? 'bg-zinc-900/80 border-zinc-700 text-zinc-400' : 'bg-amber-950/80 border-amber-700 text-amber-300'}`}>
          {cardDataSource === 'loading' || cornerDataSource === 'loading'
            ? 'LOADING CSV DATA...'
            : `DRIVING CARDS: ${cardDataSource === 'csv' ? 'LIVE' : 'FALLBACK'} / CORNER CARDS: ${cornerDataSource === 'csv' ? 'LIVE' : 'FALLBACK'}${cardDataSource !== 'csv' || cornerDataSource !== 'csv' ? ' / RUN start_arcade_racing.cmd FOR LIVE CSV' : ''}`}
        </div>
      </div>
    );
  }

  if (appState === 'SELECT') {
    const selectedCourse = COURSE_OPTIONS.find(course => course.id === selectedCourseId) || COURSE_OPTIONS[0];
    const activePicker = gameMode === 'PvE' ? 0 : activeCarPlayer;
    const chooseCar = (carId) => {
      setSelectedCars(current => current.map((car, index) => index === activePicker ? carId : car));
      if (gameMode === 'PvP' && activePicker === 0 && selectedCars[1] === null) setActiveCarPlayer(1);
    };
    const selectedCarData = selectedCars.map(carId => CAR_OPTIONS.find(car => car.id === carId));
    const CarPortrait = ({ car, player }) => (
      <div className={`relative h-36 sm:h-44 overflow-hidden border-b-4 ${player === 0 ? 'border-red-500 bg-gradient-to-br from-red-950 to-zinc-950' : 'border-blue-500 bg-gradient-to-bl from-blue-950 to-zinc-950'}`}>
        <div className={`absolute inset-0 opacity-20 ${player === 0 ? 'bg-[linear-gradient(135deg,transparent_35%,#ef4444_35%,#ef4444_38%,transparent_38%)]' : 'bg-[linear-gradient(45deg,transparent_35%,#3b82f6_35%,#3b82f6_38%,transparent_38%)]'}`} />
        {car ? (
          <svg viewBox="0 0 360 170" className="absolute inset-x-0 bottom-0 h-full w-full drop-shadow-[0_12px_12px_rgba(0,0,0,0.8)]" aria-label={`${car.name} placeholder portrait`}>
            <path d="M54 111 L83 75 Q96 57 127 52 L229 52 Q255 57 280 83 L320 97 Q333 102 336 119 L330 137 L302 139 Q295 157 273 157 Q252 157 244 139 L112 139 Q104 157 82 157 Q60 157 53 139 L31 135 L29 118 Z" fill={player === 0 ? '#ef4444' : '#3b82f6'} stroke="#f4f4f5" strokeWidth="4" />
            <path d="M117 60 L149 60 L142 88 L91 88 Z M159 60 L224 60 Q241 65 259 87 L151 87 Z" fill="#09090b" stroke="#a1a1aa" strokeWidth="3" />
            <circle cx="83" cy="137" r="21" fill="#09090b" stroke="#d4d4d8" strokeWidth="6"/><circle cx="273" cy="137" r="21" fill="#09090b" stroke="#d4d4d8" strokeWidth="6"/>
          </svg>
        ) : <div className="absolute inset-0 flex items-center justify-center text-6xl font-black italic text-white/10">SELECT</div>}
        <div className={`absolute top-3 ${player === 0 ? 'left-4' : 'right-4'} text-2xl font-black italic`}>{player === 0 ? '1P' : gameMode === 'PvE' ? 'CPU' : '2P'}</div>
      </div>
    );

    return (
      <div className="h-screen w-full overflow-y-auto bg-[#090b08] text-white selection:bg-yellow-400 selection:text-black">
        <div className="min-h-screen bg-[radial-gradient(circle_at_50%_20%,rgba(91,108,59,0.32),transparent_45%),linear-gradient(120deg,rgba(127,29,29,0.16),transparent_38%,rgba(30,58,138,0.16))] px-4 py-4 sm:px-6 lg:px-10">
          <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/15 pb-3">
            <button onClick={() => setAppState('TITLE')} className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white"><ChevronLeft size={18}/> Mode Select</button>
            <div className="text-center"><div className="text-2xl sm:text-4xl font-black italic tracking-tight">RACE SETUP</div><div className="text-[10px] font-bold tracking-[0.35em] text-yellow-400">COURSE & MACHINE SELECT</div></div>
            <div className="rounded border border-white/20 bg-black/40 px-3 py-2 text-xs font-black uppercase text-zinc-300">{gameMode === 'PvE' ? '1P vs CPU' : '1P vs 2P'}</div>
          </header>

          <main className="mx-auto grid max-w-7xl gap-4 py-4 lg:grid-rows-[minmax(270px,42vh)_minmax(300px,1fr)]">
            <section className="grid overflow-hidden border border-white/15 bg-black/60 shadow-2xl lg:grid-cols-[1.25fr_1fr]">
              <div className="relative min-h-52 border-b border-white/15 p-5 lg:border-b-0 lg:border-r">
                <div className="absolute left-5 top-4 z-10"><div className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Player 1 Course Pick</div><h2 className="text-3xl font-black italic uppercase sm:text-4xl">{selectedCourse.name}</h2><p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{selectedCourse.region} / {selectedCourse.difficulty} / {selectedCourse.id === 'random' ? randomMapSize : selectedCourse.length} / {selectedCourse.id === 'random' ? RANDOM_SIZE_CARDS[randomMapSize] : selectedCourse.cardCount} cards</p></div>
                <svg viewBox="0 0 100 90" className="absolute inset-0 h-full w-full p-6 pt-16" aria-label={`${selectedCourse.name} mini map`}>
                  <path d={selectedCourse.path} fill="none" stroke="#18181b" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={selectedCourse.path} fill="none" stroke={selectedCourse.id === 'random' ? '#facc15' : '#f4f4f5'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={selectedCourse.id === 'random' ? '3 4' : undefined} />
                  <circle cx="14" cy={selectedCourse.id === 'haruna' ? '28' : selectedCourse.id === 'hakone' ? '78' : '70'} r="3" fill="#22c55e" stroke="white" strokeWidth="1" />
                </svg>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {selectedCourse.id === 'random' ? Object.keys(RANDOM_SIZE_CARDS).map(size => <button key={size} onClick={() => setRandomMapSize(size)} className={`px-3 py-2 text-xs font-black uppercase ${randomMapSize === size ? 'bg-yellow-400 text-black' : 'border border-white/20 bg-black/70 text-zinc-300 hover:border-yellow-400'}`}>{size}<span className="ml-1 text-[9px] opacity-60">{RANDOM_SIZE_CARDS[size]} cards</span></button>) : ['downhill', 'uphill'].map(direction => <button key={direction} onClick={() => setCourseDirection(direction)} className={`px-4 py-2 text-xs font-black uppercase ${courseDirection === direction ? 'bg-yellow-400 text-black' : 'border border-white/20 bg-black/70 text-zinc-300 hover:border-yellow-400'}`}>{direction === 'downhill' ? 'DOWN' : 'UP'} {direction}</button>)}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 p-3 lg:grid-cols-2">
                {COURSE_OPTIONS.map((course, index) => <button key={course.id} onClick={() => setSelectedCourseId(course.id)} className={`group relative min-h-24 overflow-hidden border p-3 text-left transition ${selectedCourseId === course.id ? 'border-yellow-400 bg-yellow-400/15' : 'border-white/15 bg-zinc-950/80 hover:border-white/50'}`}>
                  <span className="text-[10px] font-black text-zinc-500">0{index + 1}</span><div className="mt-2 text-xs sm:text-base font-black uppercase leading-tight">{course.name}</div><div className="mt-1 hidden text-[10px] uppercase tracking-widest text-zinc-500 sm:block">{course.difficulty} / {course.id === 'random' ? `${RANDOM_SIZE_CARDS[randomMapSize]} cards` : `${course.length} / ${course.cardCount} cards`}</div>
                  {selectedCourseId === course.id && <span className="absolute right-2 top-2 h-2 w-2 bg-yellow-400 shadow-[0_0_10px_#facc15]"/>}
                </button>)}
              </div>
            </section>

            <section className="grid gap-3 lg:grid-cols-[1fr_1.25fr_1fr]">
              {[0, 1].map(player => {
                const car = selectedCarData[player];
                const waiting = activePicker === player;
                return <button type="button" key={player} onClick={() => !(player === 1 && gameMode === 'PvE') && setActiveCarPlayer(player)} className={`overflow-hidden border bg-black/65 text-left ${player === 1 ? 'lg:col-start-3' : ''} ${player === 1 && gameMode === 'PvE' ? 'cursor-default' : 'cursor-pointer hover:border-white/50'} ${waiting ? player === 0 ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]' : 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.25)]' : 'border-white/15'}`}>
                  <CarPortrait car={car} player={player}/>
                  <div className={`p-4 ${player === 1 ? 'text-right' : ''}`}>
                    <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black uppercase">{car?.name || (waiting ? 'Choose Machine' : 'Waiting...')}</h3>{car && <span className="border border-yellow-500/50 bg-yellow-500/10 px-2 py-1 text-xs font-black text-yellow-300">{car.drive}</span>}</div>
                    <p className="mt-2 min-h-10 text-xs leading-relaxed text-zinc-400">{car?.specialty || (player === 1 && gameMode === 'PvE' ? 'CPU machine locked.' : 'Select from machine grid.')}</p>
                    {car && !(player === 1 && gameMode === 'PvE') && <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Press panel, then press any machine</div>}
                  </div>
                </button>;
              })}

              <div className="grid grid-cols-2 gap-2 self-stretch lg:col-start-2 lg:row-start-1">
                {CAR_OPTIONS.map((car, index) => {
                  const pickedBy = selectedCars.reduce((players, id, player) => id === car.id ? [...players, player] : players, []);
                  return <button key={car.id} onClick={() => chooseCar(car.id)} className={`group relative min-h-36 overflow-hidden border bg-zinc-950 p-3 text-left transition hover:-translate-y-1 hover:border-yellow-400 ${pickedBy.length ? 'border-yellow-500/60' : 'border-white/15'}`}>
                    <div className="absolute -right-3 -top-4 text-7xl font-black italic text-white/[0.04]">0{index + 1}</div><div className="relative text-[10px] font-black uppercase tracking-widest text-zinc-500">{car.drive} / Machine 0{index + 1}</div><div className="relative mt-4 text-lg font-black uppercase leading-tight">{car.name}</div>
                    <svg viewBox="0 0 160 55" className="absolute bottom-4 right-3 w-4/5 opacity-50 group-hover:opacity-90"><path d="M8 39 L25 24 L52 17 L105 17 L128 31 L151 36 L154 45 L139 47 Q133 55 123 47 L40 47 Q31 55 24 47 L8 45 Z" fill="#a1a1aa"/></svg>
                    <div className="absolute bottom-2 left-2 flex gap-1">{pickedBy.map(player => <span key={player} className={`px-2 py-1 text-[10px] font-black text-white ${player === 0 ? 'bg-red-600' : 'bg-blue-600'}`}>{player === 0 ? '1P' : gameMode === 'PvE' ? 'CPU' : '2P'}</span>)}</div>
                  </button>;
                })}
                <div className="col-span-2 flex min-h-14 items-center justify-center">
                  {selectedCars.every(Boolean) ? <button onClick={initGame} className="group flex items-center gap-3 border-2 border-yellow-300 bg-yellow-400 px-8 py-3 text-lg font-black italic uppercase text-black shadow-[0_0_26px_rgba(250,204,21,0.4)] transition hover:scale-105 hover:bg-yellow-300">Start Your Engines <Play size={20}/></button> : <div className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{activePicker === 0 ? 'Player 1: choose machine' : 'Player 2: choose machine'}</div>}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const cameraTarget = gameState ? TRACK[activePlayer.lane][activePlayer.idx].center : { x: 0, y: 0 };
  const isAITurn = gameMode === 'PvE' && activePlayerId === 1;
  const showRecenter = Math.abs(panOffset.x) > 10 || Math.abs(panOffset.y) > 10;
  const validMovesList = gameState && (gameState.phase === 'MOVE' || gameState.phase === 'NN_MOVE') && !isAITurn && ((gameState.phase === 'MOVE' && gameState.mpLeft > 0) || (gameState.phase === 'NN_MOVE' && gameState.nnMpLeft[activePlayerId] > 0)) ? getValidMoves(activePlayer) : [];

  const p1 = gameState?.players[0];
  const p2 = gameState?.players[1];
  const isNeckAndNeck = p1 && p2 && p1.lane !== p2.lane && TRACK[p1.lane][p1.idx].adj.includes(p2.idx);
  const nnPreviewOrder = gameState?.phase === 'NN_REVEAL' ? getNNActionOrder(gameState.players, gameState.turnOrder) : null;
  const nnFirstMover = nnPreviewOrder ? gameState.players[nnPreviewOrder[0]] : null;
  const nnRevealStageIndex = { faceDown: 0, revealed: 1, decision: 2 }[nnRevealStage];
  const activeCycleMax = gameState?.phase === 'CARD_CYCLE' ? (gameState.cycleContext?.max || 0) : gameState?.phase === 'NN_CARD_CYCLE' ? (activePlayer.modifiers.cycleCards || 0) : 0;
  const activeCycleRequired = gameState?.phase === 'CARD_CYCLE' ? Boolean(gameState.cycleContext?.required) : gameState?.phase === 'NN_CARD_CYCLE' ? Boolean(activePlayer.modifiers.cycleRequired) : false;
  const activeCycleNeeded = activeCycleRequired ? Math.min(activeCycleMax, activePlayer?.hand?.length || 0) : 0;
  const activeChoiceType = gameState?.phase === 'CARD_CHOICE' ? gameState.choiceContext?.type : null;
  const p1DiscardTopCard = p1?.discard?.length ? CARDS[p1.discard[p1.discard.length - 1]] : null;
  const p1HandVisible = !isAITurn && activePlayerId === 0 && (gameState.phase === 'PLAY_CARD' || gameState.phase === 'NN_SELECT_CARD' || gameState.phase === 'MOVE' || gameState.phase === 'NN_MOVE');
  const p1HandCanPlay = gameState.phase === 'PLAY_CARD' || gameState.phase === 'NN_SELECT_CARD';
  const p1HandTucked = !p1HandCanPlay;

  // Calculate projected speed for speedometer preview
  let activeProjectedSpeed = null;
  if (gameState && !isAITurn && hoveredCardIdx !== null && activePlayer && (gameState.phase === 'PLAY_CARD' || gameState.phase === 'NN_SELECT_CARD')) {
    const cardId = activePlayer.hand[hoveredCardIdx];
    const card = CARDS[cardId];
    if (card && card.canPlay(activePlayer)) {
      activeProjectedSpeed = card.play({...activePlayer, discard:[], hand:[]}, TRACK, otherPlayer).speed;
    }
  }

  return (
    <div
      className="relative h-screen w-full bg-[#1b2215] text-white font-sans overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Custom Styles for intense effects */}
      <style>{`
        @keyframes stripe-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 60px 0; }
        }
        @keyframes manga-slash {
          0% { transform: rotate(-12deg) scaleY(0); opacity: 0; }
          20% { transform: rotate(-12deg) scaleY(1); opacity: 1; }
          100% { transform: rotate(-12deg) scaleY(0.1); opacity: 0; }
        }
        @keyframes manga-pop {
          0% { transform: scale(3) rotate(-15deg); opacity: 0; filter: blur(10px); }
          10% { transform: scale(1) rotate(0deg); opacity: 1; filter: blur(0px); }
          80% { transform: scale(1.05) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.5) rotate(5deg); opacity: 0; }
        }
        @keyframes car-wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        @keyframes nn-card-deal-left {
          0% { transform: translateX(-120px) translateY(35px) rotate(-12deg) scale(0.8); opacity: 0; }
          100% { transform: translateX(0) translateY(0) rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes nn-card-deal-right {
          0% { transform: translateX(120px) translateY(35px) rotate(12deg) scale(0.8); opacity: 0; }
          100% { transform: translateX(0) translateY(0) rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes nn-card-flip {
          0% { transform: rotateY(90deg) scale(0.92); filter: brightness(2); }
          55% { transform: rotateY(-8deg) scale(1.04); }
          100% { transform: rotateY(0deg) scale(1); filter: brightness(1); }
        }
        @keyframes nn-decision-pop {
          0% { transform: translateY(18px) scale(0.92); opacity: 0; }
          65% { transform: translateY(-3px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .nn-card-stage { perspective: 1000px; transform-style: preserve-3d; }
        .nn-card-deal-left { animation: nn-card-deal-left 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .nn-card-deal-right { animation: nn-card-deal-right 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .nn-card-reveal { animation: nn-card-flip 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .nn-decision-pop { animation: nn-decision-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>

      <svg width="100%" height="100%" className="absolute inset-0 z-0 bg-[#1e2418]">
        <defs>
          <pattern id="forest" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform={`scale(${zoom})`}>
            {/* Mountain terrain / forest floor pattern */}
            <rect width="120" height="120" fill="#1e2418" />
            <circle cx="30" cy="30" r="25" fill="#252d1d" />
            <circle cx="90" cy="50" r="35" fill="#1a1f14" />
            <circle cx="40" cy="100" r="20" fill="#252d1d" />
            <circle cx="100" cy="110" r="15" fill="#2a3321" />
            <path d="M 0 60 Q 30 20 60 60 T 120 60 L 120 120 L 0 120 Z" fill="#2d2318" opacity="0.3" />
            <path d="M 20 10 Q 50 40 80 10" fill="none" stroke="#161c11" strokeWidth="4" opacity="0.5"/>
          </pattern>
          <pattern id="asphalt" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform={`scale(${zoom})`}>
            <rect width="60" height="60" fill="#2a2a2c" />
            <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.05)" />
            <circle cx="45" cy="40" r="1.5" fill="rgba(0,0,0,0.2)" />
            <circle cx="20" cy="50" r="1" fill="rgba(255,255,255,0.03)" />
          </pattern>
          <pattern id="red-asphalt" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform={`scale(${zoom})`}>
            <rect width="60" height="60" fill="#881313" />
            <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.1)" />
            <circle cx="45" cy="40" r="1.5" fill="rgba(0,0,0,0.3)" />
            <circle cx="20" cy="50" r="1" fill="rgba(255,255,255,0.08)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#forest)" />

        <g transform={`translate(${winSize.w/2 - 140}, ${winSize.h/2}) scale(${zoom}) translate(${-cameraTarget.x + panOffset.x}, ${-cameraTarget.y + panOffset.y})`} style={{ transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }}>

          {/* Top-down terrain backdrop moves and zooms with the road. */}
          <image
            href="Assets/Backgrounds/touge_topdown_terrain_01.png"
            x="-2600"
            y="-2600"
            width="5200"
            height="5200"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.88"
            className="pointer-events-none"
          />
          <rect x="-2600" y="-2600" width="5200" height="5200" fill="rgba(2, 6, 23, 0.2)" className="pointer-events-none" />

          {/* Render Track Base */}
          {[0, 1].map(lane =>
            TRACK[lane].map((space, i) => (
              <g key={`base-${lane}-${i}`}>
                <path d={space.path} fill={space.limit ? 'url(#red-asphalt)' : 'url(#asphalt)'} stroke="#d4d4d8" strokeWidth="2" />
                {/* Manga Style Dashed Center/Lane Lines */}
                {!space.isOuter && <path d={space.path} fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="20 20" />}
                {/* Guardrails */}
                {space.guardrail && <path d={space.path} fill="none" stroke="#9ca3af" strokeWidth="8" strokeDasharray="25 5" filter="drop-shadow(0 5px 5px rgba(0,0,0,0.6))" />}
              </g>
            ))
          )}

          {/* Road card signs */}
          {TRACK[0].filter(s => s.roadCardStart).map((s) => (
            <g key={`road-card-${s.roadCardStart.index}`} transform={`translate(${s.center.x}, ${s.center.y}) rotate(${s.angle})`} className="pointer-events-none">
              <g transform="translate(-35, 58)">
                <rect x="-95" y="-17" width="190" height="34" rx="8" fill="rgba(9,9,11,0.88)" stroke="#facc15" strokeWidth="2" />
                <text fill="#facc15" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" dy="5">
                  {String(s.roadCardStart.index).padStart(2, '0')} / {s.roadCardStart.name}
                </text>
              </g>
            </g>
          ))}

          {/* Render Limits Text */}
          {[0, 1].map(lane =>
            TRACK[lane].filter(s => s.limit).map((s, i) => {
               const isLeftTrack = s.id.startsWith('L');
               const xOffset = isLeftTrack ? -65 : 65;

               return (
                  <g key={`limit-${lane}-${i}`} transform={`translate(${s.center.x}, ${s.center.y}) rotate(${s.angle})`}>
                    <g transform={`translate(${xOffset}, 0)`}>
                      <rect x="-4" y="0" width="8" height="35" fill="#9ca3af" stroke="#4b5563" strokeWidth="1" filter="drop-shadow(0 4px 4px rgba(0,0,0,0.5))" />
                      <circle r="26" fill="#fff" filter="drop-shadow(0 5px 5px rgba(0,0,0,0.5))" />
                      <circle r="22" fill="none" stroke="#dc2626" strokeWidth="6" />
                      <text fill="#000" fontSize="24" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" dy="8">{s.limit}</text>
                    </g>
                  </g>
               );
            })
          )}

          {/* Render Goal Flags */}
          {[0, 1].map(lane =>
            TRACK[lane].filter(s => s.isGoal).map((s, i) => (
              <g key={`goal-${lane}-${i}`} transform={`translate(${s.center.x}, ${s.center.y}) rotate(${s.angle})`}>
                <g transform="translate(-22, -26)" opacity="0.95">
                  <path d="M -5,-6 L -5,58" stroke="#e5e7eb" strokeWidth="5" />
                  <rect width="44" height="44" fill="#fff" stroke="#111827" strokeWidth="3" />
                  <rect x="0" y="0" width="11" height="11" fill="#111827" />
                  <rect x="22" y="0" width="11" height="11" fill="#111827" />
                  <rect x="11" y="11" width="11" height="11" fill="#111827" />
                  <rect x="33" y="11" width="11" height="11" fill="#111827" />
                  <rect x="0" y="22" width="11" height="11" fill="#111827" />
                  <rect x="22" y="22" width="11" height="11" fill="#111827" />
                  <rect x="11" y="33" width="11" height="11" fill="#111827" />
                  <rect x="33" y="33" width="11" height="11" fill="#111827" />
                </g>
              </g>
            ))
          )}

          {/* Valid Move Overlays */}
          {validMovesList.map(m => (
            <path key={`move-${m.lane}-${m.idx}`} d={TRACK[m.lane][m.idx].path} fill="rgba(255, 255, 255, 0.3)" className="cursor-pointer hover:fill-white/50 transition-colors" onClick={() => attemptMove(m.lane, m.idx)} />
          ))}

          {/* Render Cars - Initial D Manga Style */}
          {gameState && gameState.players.map(p => {
            const s = TRACK[p.lane][p.idx];
            const lastCardType = p.lastPlayed ? CARDS[p.lastPlayed].type : null;
            const isGas = lastCardType === 'Gas';
            const isTurn = lastCardType === 'Turn';
            const isBrake = lastCardType === 'Brake';

            return (
              <g key={`car-${p.id}`} transform={`translate(${s.center.x}, ${s.center.y}) rotate(${s.angle})`} style={{ transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }} className="pointer-events-none">

                {/* Dynamic Manga Skidmarks & Flames */}
                {isTurn && (
                  <path d="M -24,40 Q -40,60 -20,100 M 24,40 Q 40,60 20,100" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="6" strokeDasharray="10 10" className="animate-pulse" />
                )}
                {isBrake && (
                  <path d="M -20,40 L -20,100 M 20,40 L 20,100" fill="none" stroke="rgba(255,100,100,0.8)" strokeWidth="8" strokeDasharray="15 10" className="animate-pulse" />
                )}
                {isGas && (
                  <g className="animate-pulse">
                    <polygon points="-16,40 -10,65 -4,40" fill="#facc15" />
                    <polygon points="16,40 10,65 4,40" fill="#facc15" />
                    <polygon points="-13,40 -10,55 -7,40" fill="#fff" />
                    <polygon points="13,40 10,55 7,40" fill="#fff" />
                  </g>
                )}

                {/* Car Shadow */}
                <rect x="-24" y="-40" width="48" height="80" rx="8" fill="rgba(0,0,0,0.7)" transform="translate(12, 12)" filter="blur(4px)" />

                {/* Car Body Wobble Container */}
                <g style={{ animation: 'car-wobble 0.5s infinite' }}>
                  <rect x="-26" y="-42" width="52" height="84" rx="10" fill={p.id === 0 ? '#ef4444' : '#3b82f6'} stroke="#fff" strokeWidth="4" />

                  {/* Windshield & Windows */}
                  <polygon points="-20,-15 20,-15 16,-32 -16,-32" fill="#000" />
                  <polygon points="-20,15 20,15 16,36 -16,36" fill="#000" />

                  {/* Manga Highlights */}
                  <path d="M -20,-38 L -10,-38 L -22,-20 Z" fill="rgba(255,255,255,0.4)" />

                  {/* Headlights */}
                  <rect x="-22" y="-40" width="10" height="6" rx="2" fill="#fff" filter={isGas ? "drop-shadow(0 -10px 15px white)" : ""} />
                  <rect x="12" y="-40" width="10" height="6" rx="2" fill="#fff" filter={isGas ? "drop-shadow(0 -10px 15px white)" : ""} />

                  {/* Taillights */}
                  <rect x="-22" y="36" width="12" height="6" rx="2" fill="#ef4444" filter={isBrake ? "drop-shadow(0 10px 15px red)" : ""} />
                  <rect x="10" y="36" width="12" height="6" rx="2" fill="#ef4444" filter={isBrake ? "drop-shadow(0 10px 15px red)" : ""} />

                  {/* Initials */}
                  <text fill="#fff" fontSize="24" fontWeight="black" fontStyle="italic" textAnchor="middle" dy="8" transform="rotate(-90)">{p.name.substring(0, 2).toUpperCase()}</text>
                </g>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Neck-and-Neck Warning Stripes Overlay */}
      {gameState?.isNNRound && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex flex-col justify-between">
          <div className="h-6 w-full opacity-90 shadow-[0_0_25px_rgba(251,191,36,0.8)] border-b-4 border-yellow-500" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #fbbf24, #fbbf24 30px, #000 30px, #000 60px)', backgroundSize: '85px 100%', animation: 'stripe-scroll 0.5s linear infinite' }}></div>
          <div className="h-6 w-full opacity-90 shadow-[0_0_25px_rgba(251,191,36,0.8)] border-t-4 border-yellow-500" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 30px, #000 30px, #000 60px)', backgroundSize: '85px 100%', animation: 'stripe-scroll 0.5s linear infinite' }}></div>
        </div>
      )}

      {/* Overtake Banner Overlay */}
      {gameState?.overtakeEvent && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none w-full overflow-hidden flex flex-col items-center">
          <div className="bg-gradient-to-r from-transparent via-red-600 to-transparent w-full py-6 transform -skew-y-3 shadow-[0_0_50px_rgba(220,38,38,0.8)] flex items-center justify-center animate-in zoom-in duration-200">
            <h2 className="text-7xl font-black text-white italic tracking-tighter drop-shadow-2xl uppercase">OVERTAKE!</h2>
          </div>
          <div className="text-center mt-4 text-3xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-bounce bg-black/50 px-8 py-2 rounded-full border border-yellow-500/30">
            {gameState.overtakeEvent} takes the lead!
          </div>
        </div>
      )}

      {/* Crash Penalty Banner Overlay */}
      {gameState?.crashEvent && (
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[130] pointer-events-none w-full flex flex-col items-center animate-in zoom-in-50 duration-100">
          <div className="bg-red-700 border-y-8 border-white w-full transform -skew-y-2 shadow-[0_0_50px_rgba(220,38,38,1)] py-4 flex flex-col items-center justify-center">
             <h2 className="text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl uppercase">{gameState.crashEvent.type}!</h2>
          </div>
          <div className="mt-6 text-4xl font-black text-white drop-shadow-[0_0_25px_rgba(255,0,0,1)] animate-bounce bg-black/90 px-10 py-4 rounded-full border-2 border-red-500">
            {gameState.crashEvent.name} suffers {gameState.crashEvent.penalty}
          </div>
        </div>
      )}

      {gameState && (
        <>
          <Speedometer
            player={gameState.players[0]} position="bottom-left"
            projectedSpeed={activePlayerId === 0 ? activeProjectedSpeed : null}
            isTurn={activePlayerId === 0} phase={gameState.phase}
            mpLeft={gameState.phase === 'NN_MOVE' ? gameState.nnMpLeft[0] : gameState.mpLeft}
            isLeadStatus={gameState.turnOrder[0] === 0}
          />
          <Speedometer
            player={gameState.players[1]} position="top-right"
            projectedSpeed={activePlayerId === 1 ? activeProjectedSpeed : null}
            isTurn={activePlayerId === 1} phase={gameState.phase}
            mpLeft={gameState.phase === 'NN_MOVE' ? gameState.nnMpLeft[1] : gameState.mpLeft}
            isLeadStatus={gameState.turnOrder[0] === 1}
          />
        </>
      )}

      {gameState && (
        <div className="fixed bottom-5 right-5 z-40 flex items-end gap-3 no-pan">
          <PileWidget type="discard" count={p1.discard.length} topCard={p1DiscardTopCard} onClick={() => p1.discard.length > 0 && setInspectDiscardOpen(true)} />
          <PileWidget type="deck" count={p1.deck.length} />
        </div>
      )}

      {inspectDiscardOpen && p1 && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 backdrop-blur-sm p-5 no-pan pointer-events-auto">
          <div className="w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-2xl border-2 border-orange-500 bg-zinc-950 shadow-[0_0_50px_rgba(249,115,22,0.25)]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-400">Player 1</div>
                <h2 className="text-2xl font-black uppercase text-white">Discard Pile ({p1.discard.length})</h2>
              </div>
              <button onClick={() => setInspectDiscardOpen(false)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-black uppercase text-zinc-300 hover:border-white hover:text-white">Close</button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {p1.discard.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {p1.discard.slice().reverse().map((cardId, idx) => (
                    <div key={`${cardId}-${idx}`} className="flex justify-center">
                      <RenderCard card={CARDS[cardId]} scale={0.78} extraClasses="cursor-default" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-sm font-bold uppercase tracking-widest text-zinc-500">No discarded cards</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRecenter && (
        <button onClick={() => setPanOffset({ x: 0, y: 0 })} className="fixed top-32 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-2xl z-50 flex items-center gap-2 no-pan transition-all animate-bounce">
          <Crosshair size={18} /> Recenter
        </button>
      )}

      {/* N&N Top Info Banner */}
      {gameState?.isNNRound && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-yellow-500 px-8 py-2 rounded-full shadow-2xl z-40 flex items-center gap-4 no-pan">
             <span className="text-yellow-500 font-black italic tracking-widest uppercase">Neck and Neck</span>
             {gameState.phase === 'NN_MOVE' && (
                <span className="text-white font-bold">| {activePlayer.name}'s Step ({gameState.nnMpLeft[activePlayerId]} left)</span>
             )}
         </div>
      )}

      {/* Blocking N&N Reveal Banner */}
      {gameState?.phase === 'NN_REVEAL' && nnFirstMover && (
        <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-pan pointer-events-auto">
          <div className="w-full max-w-4xl max-h-[96vh] overflow-y-auto bg-zinc-950 border-2 border-yellow-500 shadow-[0_0_60px_rgba(250,204,21,0.35)] rounded-2xl p-5 md:p-8 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-5" aria-label={`Reveal step ${nnRevealStageIndex + 1} of 3`}>
              {['LOCK IN', 'REVEAL', 'MOVE ORDER'].map((label, index) => (
                <div key={label} className={`flex items-center gap-2 ${index <= nnRevealStageIndex ? 'text-yellow-400' : 'text-zinc-600'}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black ${index === nnRevealStageIndex ? 'border-yellow-400 bg-yellow-400 text-black scale-110' : index < nnRevealStageIndex ? 'border-yellow-500 bg-yellow-950' : 'border-zinc-700'}`}>{index + 1}</div>
                  <span className="hidden sm:inline text-[10px] font-black tracking-widest">{label}</span>
                  {index < 2 && <div className={`w-5 md:w-10 h-0.5 ${index < nnRevealStageIndex ? 'bg-yellow-500' : 'bg-zinc-800'}`} />}
                </div>
              ))}
            </div>
            <div className="text-center mb-5">
              <div className="text-xs md:text-sm font-black tracking-[0.35em] text-yellow-500 uppercase mb-2">Neck and Neck</div>
              <h2 className="text-3xl md:text-5xl font-black italic text-white tracking-tight">
                {nnRevealStage === 'faceDown' ? 'CARDS LOCKED IN' : nnRevealStage === 'revealed' ? 'SIMULTANEOUS REVEAL' : 'ACTION ORDER SET'}
              </h2>
              <p className="text-zinc-400 mt-2 text-sm">
                {nnRevealStage === 'faceDown' ? 'Both drivers commit face down.' : nnRevealStage === 'revealed' ? 'Both cards flip together. Comparing pre-effect speed...' : 'The first movement step is decided before card effects resolve.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-5 md:gap-12 items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center">
                <span className="text-red-500 font-black text-lg md:text-xl mb-3">{gameState.players[0].name}</span>
                <div key={`p0-${nnRevealStage}`} className={`nn-card-stage ${nnRevealStage === 'faceDown' ? 'nn-card-deal-left' : nnRevealStage === 'revealed' ? 'nn-card-reveal' : ''}`}>
                  {nnRevealStage === 'faceDown' ? <RenderCardBack playerId={0} /> : gameState.nnSelections[0] ? <RenderCard card={CARDS[gameState.nnSelections[0]]} scale={0.85} /> : <div className="w-48 h-64 border-2 border-dashed border-red-500/50 rounded-xl flex items-center justify-center text-red-500 font-bold bg-black/50">NO CARD</div>}
                </div>
              </div>
              <div className="text-3xl font-black italic text-zinc-600">VS</div>
              <div className="flex flex-col items-center">
                <span className="text-blue-500 font-black text-lg md:text-xl mb-3">{gameState.players[1].name}</span>
                <div key={`p1-${nnRevealStage}`} className={`nn-card-stage ${nnRevealStage === 'faceDown' ? 'nn-card-deal-right' : nnRevealStage === 'revealed' ? 'nn-card-reveal' : ''}`}>
                  {nnRevealStage === 'faceDown' ? <RenderCardBack playerId={1} /> : gameState.nnSelections[1] ? <RenderCard card={CARDS[gameState.nnSelections[1]]} scale={0.85} /> : <div className="w-48 h-64 border-2 border-dashed border-blue-500/50 rounded-xl flex items-center justify-center text-blue-500 font-bold bg-black/50">NO CARD</div>}
                </div>
              </div>
            </div>
            {nnRevealStage === 'decision' && (
              <>
                <div className={`nn-decision-pop mt-5 w-full max-w-xl border-2 rounded-xl px-5 py-3 text-center ${nnFirstMover.id === 0 ? 'border-red-500 bg-red-950/50' : 'border-blue-500 bg-blue-950/50'}`}>
                  <div className="text-xs font-black tracking-[0.3em] text-zinc-400 uppercase">First Movement Step</div>
                  <div className={`text-2xl md:text-3xl font-black italic mt-1 ${nnFirstMover.id === 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {nnFirstMover.name} MOVES FIRST
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">Then movement alternates one point at a time.</div>
                </div>
                <button onClick={resolveNNReveal} className="nn-decision-pop mt-5 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black text-lg font-black uppercase tracking-wider rounded-lg shadow-[0_0_25px_rgba(250,204,21,0.4)] transition-colors">
                  Close Banner & Start Movement
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Prompts Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center no-pan">
        {isAITurn ? (
           <div className="bg-black/80 px-6 py-3 rounded-full border border-zinc-700 flex items-center gap-3 animate-pulse shadow-2xl"><Bot className="text-blue-400" /><span className="font-bold text-lg">AI is thinking...</span></div>
        ) : (
          <>
            {gameState.phase === 'SLIPSTREAM' && (
              <div className="bg-black/90 p-6 rounded-2xl border border-zinc-700 shadow-2xl text-center pointer-events-auto">
                <h3 className="text-xl font-black text-yellow-400 mb-4">SLIPSTREAM AVAILABLE</h3>
                <div className="flex gap-4">
                  <button onClick={() => acceptSlipstream(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">Take (+10 km/h)</button>
                  <button onClick={() => acceptSlipstream(false)} className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold">Refuse</button>
                </div>
              </div>
            )}
            {gameState.phase === 'CARD_CHOICE' && (
              <div className="bg-black/90 p-6 rounded-2xl border border-yellow-500 shadow-2xl text-center pointer-events-auto min-w-[360px]">
                <h3 className="text-xl font-black text-yellow-400 mb-2">
                  {activeChoiceType === 'torque_split' ? 'TORQUE SPLIT' : activeChoiceType === 'micro_correction' ? 'MICRO CORRECTION' : 'CHANGE SHIFT'}
                </h3>
                <p className="mb-4 text-sm font-bold text-zinc-400">
                  {activeChoiceType === 'torque_split' ? 'Choose speed now or corner limit this turn.' : activeChoiceType === 'micro_correction' ? 'Choose speed adjustment after the speed check.' : 'Choose shift direction.'}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {activeChoiceType === 'torque_split' ? (
                    <>
                      <button onClick={() => resolveCardChoice('speed')} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 rounded-lg font-black text-black">Speed +30</button>
                      <button onClick={() => resolveCardChoice('check_bonus')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-black text-white">Check +40</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => resolveCardChoice('speed_up')} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 rounded-lg font-black text-black">Speed +10</button>
                      <button onClick={() => resolveCardChoice('speed_down')} className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-black text-white">Speed -10</button>
                    </>
                  )}
                </div>
              </div>
            )}

          </>
        )}
      </div>

      {/* Fanned Cards UI */}
      {p1HandVisible && (
        <div className={`absolute ${p1HandTucked ? '-bottom-28' : 'bottom-8'} left-[43%] -translate-x-1/2 flex items-end justify-center z-40 w-full no-pan transition-all duration-300`} style={{ perspective: '1200px' }}>
          <div className="relative flex justify-center h-64 items-end w-full max-w-[1200px]">
             <div className={`absolute -top-12 px-6 py-2 rounded-full border text-sm font-bold shadow-2xl ${gameState.phase === 'NN_SELECT_CARD' ? 'bg-yellow-900/90 border-yellow-500 text-yellow-200 animate-pulse' : p1HandTucked ? 'bg-zinc-950/90 border-zinc-700 text-zinc-500' : 'bg-black/80 border-zinc-800 text-zinc-300'}`}>
               {gameState.phase === 'NN_SELECT_CARD' ? 'Lock in 1 Card Face Down!' : p1HandTucked ? 'Hand Locked During Movement' : 'Play 1 Driving Card'}
             </div>
             {p1.hand.map((cardId, idx) => {
               const card = CARDS[cardId];
               const playable = p1HandCanPlay && card.canPlay(p1);
               const offset = idx - (p1.hand.length - 1) / 2;
               const rot = offset * 10;
               const drop = Math.abs(offset) * 12;
               const transX = offset * 110;
               const isHovered = hoveredCardIdx === idx && (playable || p1HandTucked);

               return (
                 <div
                    key={idx}
                    className="absolute bottom-0"
                    onMouseEnter={() => (playable || p1HandTucked) && setHoveredCardIdx(idx)}
                    onMouseLeave={() => setHoveredCardIdx(null)}
                    style={{
                      transform: isHovered
                         ? `translateX(${transX}px) translateY(${p1HandTucked ? -125 : -40}px) scale(1.1) rotate(0deg)`
                         : `translateX(${transX}px) translateY(${drop}px) rotate(${rot}deg)`,
                      zIndex: isHovered ? 100 : 10 + idx,
                      transformOrigin: 'bottom center',
                      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                 >
                   <RenderCard
                     card={card}
                     disabled={!p1HandCanPlay || !playable}
                     onClick={playable ? () => playCard(cardId, idx) : undefined}
                     extraClasses={p1HandTucked ? 'opacity-90 grayscale-[0.15]' : ''}
                   />
                 </div>
               );
             })}
          </div>
          {p1HandCanPlay && <button onClick={skipToDiscard} className="absolute -bottom-2 right-[10%] px-6 py-3 bg-red-950/80 hover:bg-red-900 border border-red-900 rounded-lg text-sm font-bold text-red-200 transition-colors shadow-2xl">Skip Turn</button>}
        </div>
      )}

      {/* Discard Phase UI */}
      {!isAITurn && gameState.phase === 'DISCARD' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-end z-40 w-full no-pan max-w-4xl h-64">
             <div className="absolute -top-16 bg-red-900/90 px-6 py-2 rounded-full border border-red-500 text-sm font-bold text-white shadow-2xl animate-pulse">
                Select cards to discard (Optional)
             </div>
             <div className="flex gap-4 mb-4">
               {activePlayer.hand.map((cardId, idx) => (
                 <RenderCard
                   key={idx}
                   card={CARDS[cardId]}
                   isSelected={discardSelection.includes(idx)}
                   onClick={() => toggleDiscardSelection(idx)}
                 />
               ))}
             </div>
             <button onClick={confirmDiscard} className="px-10 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-black text-white transition-colors shadow-2xl border-2 border-blue-400">
                Confirm Discard
             </button>
        </div>
      )}

      {/* Optional Card Cycling */}
      {!isAITurn && (gameState.phase === 'CARD_CYCLE' || gameState.phase === 'NN_CARD_CYCLE') && (
        <div className="absolute inset-0 z-[110] bg-black/65 backdrop-blur-sm flex items-end justify-center p-6 no-pan">
          <div className="w-full max-w-5xl bg-zinc-950/95 border-2 border-emerald-500 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.25)] p-5 flex flex-col items-center">
            <div className="text-center mb-4">
              <div className="text-xs font-black tracking-[0.3em] text-emerald-400 uppercase">{activeCycleRequired ? 'Required Discard' : 'Optional Hand Cycling'}</div>
              <h3 className="text-xl font-black text-white mt-1">{activePlayer.name}: {activeCycleRequired ? `discard ${activeCycleNeeded} card` : `discard up to ${activeCycleMax} card`}</h3>
              <p className="text-sm text-zinc-400 mt-1">Selected cards go to your discard pile. Your hand refills at turn end.</p>
            </div>
            <div className="flex gap-3 max-w-full overflow-x-auto px-3 pt-2 pb-4">
              {activePlayer.hand.map((cardId, idx) => (
                <RenderCard
                  key={`${cardId}-${idx}`}
                  card={CARDS[cardId]}
                  scale={0.8}
                  isSelected={discardSelection.includes(idx)}
                  onClick={() => toggleCardCycleSelection(idx)}
                />
              ))}
            </div>
            <button onClick={() => confirmCardCycle()} disabled={activeCycleRequired && discardSelection.length < activeCycleNeeded} className={`px-8 py-3 rounded-lg text-base font-black uppercase tracking-wider transition-colors ${activeCycleRequired && discardSelection.length < activeCycleNeeded ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black'}`}>
              {discardSelection.length > 0 ? `Discard ${discardSelection.length} & Continue` : activeCycleRequired ? 'Select Card' : 'Keep Hand & Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Race Radio */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-zinc-950/95 border-l border-zinc-800 shadow-2xl transition-transform duration-300 z-50 flex flex-col no-pan ${isRadioOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setIsRadioOpen(!isRadioOpen)} className="absolute -left-12 top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-700 border-r-0 p-2 py-6 rounded-l-xl text-zinc-400 hover:text-white transition-colors flex items-center shadow-[-5px_0_15px_rgba(0,0,0,0.5)]">
          {isRadioOpen ? <ChevronRight /> : <Radio className="animate-pulse" />}
        </button>
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-zinc-100"><Radio size={20} className="text-green-500" />Race Radio</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {gameState && gameState.logs.map((log, i) => <div key={i} className={`text-sm ${i === 0 ? 'text-white font-bold' : 'text-zinc-500'}`}>{log}</div>)}
        </div>
      </div>

      {appState === 'GAMEOVER' && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center flex-col backdrop-blur-sm no-pan">
          <h1 className="text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]">FINISH - {gameState.winner} WINS!</h1>
          <button onClick={() => setAppState('TITLE')} className="mt-8 px-10 py-4 bg-white text-black text-xl font-black rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.5)]">Back to Title</button>
        </div>
      )}

      {/* Manga Cut-in Overlay */}
      {gameState?.mangaCutin && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden no-pan">
          {/* Burst Background */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-[200vw] h-[25vh] bg-white transform -rotate-12 scale-y-0 animate-[manga-slash_0.2s_ease-out_forwards]"></div>
          </div>
          {/* Action Text */}
          <div className="absolute flex flex-col items-center animate-[manga-pop_1.2s_ease-out_forwards]">
              <div className={`text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter drop-shadow-[0_0_25px_white] ${gameState.mangaCutin.color} mb-12 transform -skew-x-12`}>
                 {gameState.mangaCutin.type === 'Gas' ? 'VROOOOM!!' : gameState.mangaCutin.type === 'Brake' ? 'SKRRRRT!!' : 'DRIFT!!'}
              </div>
              {/* The Card Itself */}
              <RenderCard card={CARDS[gameState.mangaCutin.card]} scale={1.3} extraClasses="rotate-[10deg] shadow-[0_0_60px_rgba(255,255,255,0.8)] border-4 border-white bg-zinc-900" />
          </div>
        </div>
      )}
    </div>
  );
}
