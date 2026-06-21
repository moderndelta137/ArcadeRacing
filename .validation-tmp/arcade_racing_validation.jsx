
const { useState, useEffect, useRef, useMemo } = React;

const Icon = ({ children, size = 24, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Play = (p) => <Icon {...p}><polygon points="6 3 20 12 6 21 6 3" /></Icon>;
const Users = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const Bot = (p) => <Icon {...p}><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 4v4M8 12h.01M16 12h.01M8 16h8"/></Icon>;
const ChevronRight = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const ChevronLeft = (p) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>;
const Radio = (p) => <Icon {...p}><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/></Icon>;
const FastForward = (p) => <Icon {...p}><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></Icon>;
const Crosshair = (p) => <Icon {...p}><circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></Icon>;

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

function generateTrack() {
  let cx = 0, cy = 0, dir = 0; // dir 0 = UP
  let globalDistance = 0;
  const LANE_W = 70;
  const R_CENTER = 350;
  const SPACE_LEN = 140;

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

  function addNodesCurve(turnRight, angleDeg, inSpaces, outSpaces, inLimit, outLimit, guardrail) {
    const sign = turnRight ? 1 : -1;
    const rCenterOffset = sign * R_CENTER;
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
    const curveLenCenter = R_CENTER * (angleDeg * Math.PI / 180);

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

    const l_r1 = turnRight ? R_CENTER : R_CENTER - LANE_W;
    const l_r2 = turnRight ? R_CENTER + LANE_W : R_CENTER;

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

    const r_r1 = turnRight ? R_CENTER - LANE_W : R_CENTER;
    const r_r2 = turnRight ? R_CENTER : R_CENTER + LANE_W;
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
    cx = rotCx + R_CENTER * Math.cos(newCenterA * Math.PI / 180);
    cy = rotCy + R_CENTER * Math.sin(newCenterA * Math.PI / 180);
    globalDistance += curveLenCenter;
  }

  const DEFINITIONS = [
    { type: 'straight', len: 2, limitL: null, limitR: null },
    { type: 'curve', turnRight: true, angle: 90, inSpaces: 2, outSpaces: 3, limitIn: 60, limitOut: 60, guardrail: 'outer' },
    { type: 'straight', len: 1, limitL: null, limitR: null },
    { type: 'curve', turnRight: false, angle: 180, inSpaces: 4, outSpaces: 6, limitIn: 40, limitOut: 40, guardrail: 'outer' },
    { type: 'straight', len: 2, limitL: null, limitR: null },
    { type: 'curve', turnRight: true, angle: 90, inSpaces: 2, outSpaces: 3, limitIn: 50, limitOut: 50, guardrail: 'outer' },
    { type: 'straight', len: 4, limitL: null, limitR: null, goal: true }
  ];

  for (let def of DEFINITIONS) {
    if (def.type === 'straight') addNodesStraight(def.len, def.limitL, def.limitR, def.goal);
    else if (def.type === 'curve') addNodesCurve(def.turnRight, def.angle, def.inSpaces, def.outSpaces, def.limitIn, def.limitOut, def.guardrail);
  }

  return { 0: leftTrack, 1: rightTrack };
}

const CARDS = {
  'accelerate': {
    id: 'accelerate', name: 'Accelerate', type: 'Gas', timing: 'Before', req: 'None',
    desc: 'Speed +40 km/h.',
    canPlay: () => true,
    play: (p) => ({ ...p, speed: Math.min(MAX_SPEED, p.speed + 40) })
  },
  'hard_brake': {
    id: 'hard_brake', name: 'Hard Brake', type: 'Brake', timing: 'Before', req: 'Min 50 km/h',
    desc: 'Speed -50 km/h.',
    canPlay: (p) => p.speed >= 50,
    play: (p) => ({ ...p, speed: Math.max(0, p.speed - 50) })
  },
  'change_lane': {
    id: 'change_lane', name: 'Change Lane', type: 'Turn', timing: 'Before', req: 'None',
    desc: 'Move to the other lane immediately.',
    canPlay: () => true,
    play: (p, track, otherPlayer) => {
      const current = track[p.lane][p.idx];
      const newLane = 1 - p.lane;
      const newIdx = current.adj[current.adj.length - 1] || 0;
      if (otherPlayer.lane === newLane && otherPlayer.idx === newIdx) return p;
      return { ...p, lane: newLane, idx: newIdx, distance: track[newLane][newIdx].distance };
    }
  },
  'drift': {
    id: 'drift', name: 'Drift', type: 'Turn', timing: 'Drive', req: 'Max 80 km/h',
    desc: 'Treat corner speed limits as +40 km/h this turn.',
    canPlay: (p) => p.speed <= 80,
    play: (p) => ({ ...p, modifiers: { ...p.modifiers, drift: true } })
  },
  'rocket_start': {
    id: 'rocket_start', name: 'Rocket Start', type: 'Gas', timing: 'After', req: 'Max 40 km/h',
    desc: 'Speed +60 km/h after moving.',
    canPlay: (p) => p.speed <= 40,
    play: (p) => ({ ...p, modifiers: { ...p.modifiers, rocket: true } })
  }
};

const INITIAL_DECK = [
  'accelerate', 'accelerate', 'accelerate', 'accelerate',
  'hard_brake', 'hard_brake', 'hard_brake',
  'change_lane', 'change_lane', 'change_lane',
  'drift', 'rocket_start'
];

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
      <div className={`mt-auto text-right text-xs font-black uppercase tracking-widest ${typeColor}`}>{card.type}</div>
      {isSelected && <div className="absolute inset-0 bg-red-500/20 rounded-xl pointer-events-none mix-blend-overlay"></div>}
    </button>
  );
};

function ArcadeRacingGame() {
  const [appState, setAppState] = useState('TITLE'); 
  const [gameMode, setGameMode] = useState('PvE'); 
  const [gameState, setGameState] = useState(null);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [winSize, setWinSize] = useState({ w: 1000, h: 800 });
  const [hoveredCardIdx, setHoveredCardIdx] = useState(null);
  const [discardSelection, setDiscardSelection] = useState([]);
  
  // Panning & Zoom State
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.65);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const TRACK = useMemo(() => generateTrack(), []);

  useEffect(() => {
    const updateSize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const initGame = (mode) => {
    const p1Draw = drawCards(shuffle(INITIAL_DECK), [], [], 4);
    const p2Draw = drawCards(shuffle(INITIAL_DECK), [], [], 4);

    setGameMode(mode);
    setGameState({
      players: [
        { id: 0, name: 'Player 1', color: 'red', speed: 20, lane: 0, idx: 0, distance: TRACK[0][0].distance, ...p1Draw, modifiers: {}, lastPlayed: null },
        { id: 1, name: mode === 'PvE' ? 'AI Racer' : 'Player 2', color: 'blue', speed: 20, lane: 1, idx: 0, distance: TRACK[1][0].distance, ...p2Draw, modifiers: {}, lastPlayed: null }
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
      isNNRound: false
    });
    setPanOffset({ x: 0, y: 0 });
    setZoom(0.65);
    setAppState('PLAYING');
  };

  const addLog = (msg) => {
    setGameState(prev => ({ ...prev, logs: [msg, ...prev.logs].slice(0, 20) }));
  };

  useEffect(() => {
    if (gameState?.overtakeEvent) {
      const timer = setTimeout(() => setGameState(prev => prev ? { ...prev, overtakeEvent: null } : prev), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.overtakeEvent]);

  useEffect(() => {
    if (gameState?.crashEvent) {
      const timer = setTimeout(() => setGameState(prev => prev ? { ...prev, crashEvent: null } : prev), 3000);
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
    if (gameState?.phase === 'NN_REVEAL') {
      const timer = setTimeout(() => resolveNNReveal(), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase]);

  const resolveNNReveal = () => {
    setGameState(prev => {
      let newPlayers = [...prev.players];
      let p1 = { ...newPlayers[0] };
      let p2 = { ...newPlayers[1] };
      
      let order = [];
      if (p1.speed > p2.speed) order = [0, 1];
      else if (p2.speed > p1.speed) order = [1, 0];
      else {
        const p1Outer = TRACK[p1.lane][p1.idx].isOuter;
        const p2Outer = TRACK[p2.lane][p2.idx].isOuter;
        if (!p1Outer && p2Outer) order = [0, 1];
        else if (!p2Outer && p1Outer) order = [1, 0];
        else order = prev.turnOrder;
      }

      let logs = [`笞｡ N&N Reveal! Order: ${newPlayers[order[0]].name} then ${newPlayers[order[1]].name}`];

      order.forEach(pid => {
        const cardId = prev.nnSelections[pid];
        if (cardId) {
          const card = CARDS[cardId];
          logs.unshift(`${newPlayers[pid].name} revealed ${card.name}!`);
          let p = { ...newPlayers[pid] };
          p.discard.push(cardId);
          p.lastPlayed = cardId;
          p = card.play(p, TRACK, newPlayers[1 - pid]);
          newPlayers[pid] = p;
        } else {
          logs.unshift(`${newPlayers[pid].name} revealed no card.`);
        }
      });

      const nnMpLeft = {
        0: getGear(newPlayers[0].speed).mp,
        1: getGear(newPlayers[1].speed).mp
      };

      return {
        ...prev,
        players: newPlayers,
        phase: 'NN_MOVE',
        nnActionOrder: order,
        nnActiveTurnIdx: 0,
        nnMpLeft,
        logs: [...logs, ...prev.logs].slice(0, 20)
      };
    });
  };

  const activePlayerId = gameState?.phase === 'NN_MOVE' ? gameState.nnActionOrder[gameState.nnActiveTurnIdx] : gameState?.turnOrder[gameState?.activePlayerIdx];
  const activePlayer = gameState?.players[activePlayerId];
  const otherPlayer = gameState?.players[1 - activePlayerId];
  const isLead = gameState?.activePlayerIdx === 0 && !gameState?.isNNRound;

  const getValidMoves = (p) => {
    let moves = [];
    const current = TRACK[p.lane][p.idx];
    if (p.idx + 1 < TRACK[p.lane].length) moves.push({ lane: p.lane, idx: p.idx + 1 });
    current.adj.forEach(adjIdx => moves.push({ lane: 1 - p.lane, idx: adjIdx }));
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
    if (appState !== 'PLAYING' || gameMode !== 'PvE' || !gameState || gameState.winner || activePlayerId !== 1) return;

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
    let mp = getGear(p.speed).mp;

    if (!isLead && p.lane === otherPlayer.lane && p.distance < otherPlayer.distance) nextPhase = 'SLIPSTREAM';

    setGameState(prev => ({ 
      ...prev, 
      players: newPlayers, 
      phase: nextPhase, 
      mpLeft: mp,
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
    setGameState(prev => ({ ...prev, players: newPlayers, phase: 'MOVE', mpLeft: getGear(p.speed).mp }));
  };

  const attemptMove = (targetLane, targetIdx) => {
    const isNN = gameState.phase === 'NN_MOVE';
    const mpAvail = isNN ? gameState.nnMpLeft[activePlayerId] : gameState.mpLeft;
    if (mpAvail <= 0) return;
    
    let p = { ...activePlayer };
    let op = { ...otherPlayer };
    let newPlayers = [...gameState.players];
    let triggeredCrash = null;
    
    if (targetLane === op.lane && targetIdx === op.idx) {
      addLog(`${p.name} is blocked by ${op.name}!`);
      if (p.speed > op.speed) {
        p.speed = op.speed;
        addLog(`${p.name} matches speed to ${op.speed}.`);
      }
      newPlayers[activePlayerId] = p;
      if (isNN) advanceNNTurn(newPlayers, mpAvail - 1, triggeredCrash || gameState.crashEvent);
      else setGameState(prev => ({ ...prev, players: newPlayers, mpLeft: prev.mpLeft - 1 }));
      return; 
    }

    p.lane = targetLane;
    p.idx = targetIdx;
    p.distance = TRACK[targetLane][targetIdx].distance;
    
    let currentMp = mpAvail - 1;
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
      if (effLimit !== null && p.modifiers.drift) effLimit += 40;

      if (effLimit !== null && p.speed > effLimit) {
        addLog(`笞 ${p.name} UNDERSTEERS! Speed ${p.speed} > Limit ${effLimit}`);

        if (space.isOuter) {
          const pGear = getGear(p.speed).gear;
          if (space.guardrail) {
            triggeredCrash = { name: p.name, type: 'GUARDRAIL', penalty: '-1 Gear' };
            addLog(`徴 ${p.name} hits GUARDRAIL! (-1 Gear)`);
            p.speed = getPenaltySpeed(pGear - 1);
          } else {
            triggeredCrash = { name: p.name, type: 'SPIN OFF', penalty: '-2 Gears' };
            addLog(`謙 ${p.name} SPINS OFF! (-2 Gears)`);
            p.speed = getPenaltySpeed(pGear - 2);
          }
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
            addLog(`徴 ${p.name} side-swipes ${op.name}!`);
            p.speed = getPenaltySpeed(getGear(p.speed).gear - 1);
            op.speed = getPenaltySpeed(getGear(op.speed).gear - 1);
            understeering = false;
          }
        }
      } else {
        understeering = false; 
      }
    }

    newPlayers[activePlayerId] = p;
    newPlayers[1 - activePlayerId] = op;
    
    if (isNN) advanceNNTurn(newPlayers, currentMp, triggeredCrash || gameState.crashEvent);
    else setGameState(prev => ({ ...prev, players: newPlayers, mpLeft: currentMp, crashEvent: triggeredCrash || prev.crashEvent }));
  };

  const advanceNNTurn = (newPlayers, currentMp, crashEvent) => {
    setGameState(prev => {
      let newNnMpLeft = { ...prev.nnMpLeft, [activePlayerId]: currentMp };
      let nextTurnIdx = 1 - prev.nnActiveTurnIdx;
      let nextActiveId = prev.nnActionOrder[nextTurnIdx];
      
      if (newNnMpLeft[nextActiveId] <= 0) {
        nextTurnIdx = prev.nnActiveTurnIdx; // Stay on current if other is 0
      }
      
      if (newNnMpLeft[0] <= 0 && newNnMpLeft[1] <= 0) {
        setTimeout(() => finalizeNNRound(), 400); 
        return { ...prev, players: newPlayers, nnMpLeft: newNnMpLeft, crashEvent };
      }

      return { ...prev, players: newPlayers, nnMpLeft: newNnMpLeft, nnActiveTurnIdx: nextTurnIdx, crashEvent };
    });
  };

  const finalizeNNRound = () => {
    setGameState(prev => {
      if (!prev) return prev;
      let newPlayers = [...prev.players];
      let newLogs = [...prev.logs];
      
      [0, 1].forEach(pid => {
         let p = { ...newPlayers[pid] };
         if (p.modifiers.rocket) {
           p.speed = Math.min(MAX_SPEED, p.speed + 60);
           newLogs.unshift(`噫 ${p.name} uses Rocket Start! (+60 km/h)`);
         }
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
        newLogs.unshift(`櫨 OVERTAKE! ${newPlayers[newTurnOrder[0]].name} takes the lead!`);
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

      if (p.modifiers.rocket) {
        p.speed = Math.min(MAX_SPEED, p.speed + 60);
        newLogs.unshift(`噫 ${p.name} uses Rocket Start! (+60 km/h)`);
      }

      p.modifiers = {};
      const drawn = drawCards(p.deck, p.discard, p.hand, 4);
      p.deck = drawn.deck;
      p.discard = drawn.discard;
      p.hand = drawn.hand;

      newPlayers[p.id] = p;

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
          newLogs.unshift(`櫨 OVERTAKE! ${newPlayers[newTurnOrder[0]].name} takes the lead!`);
        }
        
        newLogs.unshift(`-- Round End. ${newPlayers[newTurnOrder[0]].name} is Lead. --`);

        isNN = p1.lane !== p2.lane && TRACK[p1.lane][p1.idx].adj.includes(p2.idx);
        if (isNN) {
           nextPhase = 'NN_SELECT_CARD';
           newLogs.unshift(`笞｡ NECK AND NECK ENGAGED! 笞｡`);
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
    
    return (
      <div className={`fixed top-12 ${position === 'left' ? 'left-4' : 'right-4'} z-40 flex flex-col items-center bg-zinc-900/90 backdrop-blur p-4 rounded-2xl border border-zinc-700 shadow-2xl w-64 no-pan pointer-events-none`}>
        
        {/* Lead / Following Badge */}
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border ${isLeadStatus ? 'bg-yellow-400 text-black border-yellow-500 whitespace-nowrap' : 'bg-zinc-800 text-zinc-400 border-zinc-600 whitespace-nowrap'}`}>
          {isLeadStatus ? '潤 Leading' : 'Following'}
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

        {/* Full Played Card Display rendered cleanly to the inner side of the speedometer */}
        {lastCard && (
          <div className={`absolute top-0 ${position === 'left' ? '-right-52' : '-left-52'} z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300 shadow-xl z-10 whitespace-nowrap">
              Played Card
            </div>
            <RenderCard card={lastCard} scale={0.8} extraClasses="opacity-90 grayscale-[0.2]" />
          </div>
        )}
      </div>
    );
  };

  if (appState === 'TITLE') {
    return (
      <div className="flex h-screen w-full text-white flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2d3725] via-[#1a1f14] to-black">
        <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">ARCADE RACING</h1>
        <p className="text-zinc-400 font-mono tracking-widest mb-12">TACTICAL CARD BATTLES</p>
        <div className="flex gap-6">
          <button onClick={() => initGame('PvE')} className="group relative px-8 py-4 bg-zinc-900 border-2 border-zinc-700 rounded-xl hover:border-red-500 hover:bg-zinc-800 transition-all shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <div className="relative flex items-center gap-3 text-xl font-bold"><Bot className="text-zinc-400 group-hover:text-red-400" /><span>VS AI Racers</span></div>
          </button>
          <button onClick={() => initGame('PvP')} className="group relative px-8 py-4 bg-zinc-900 border-2 border-zinc-700 rounded-xl hover:border-blue-500 hover:bg-zinc-800 transition-all shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <div className="relative flex items-center gap-3 text-xl font-bold"><Users className="text-zinc-400 group-hover:text-blue-400" /><span>VS Player 2</span></div>
          </button>
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

        <g transform={`translate(${winSize.w/2}, ${winSize.h/2}) scale(${zoom}) translate(${-cameraTarget.x + panOffset.x}, ${-cameraTarget.y + panOffset.y})`} style={{ transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }}>
          
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
                <text fill="#fff" fontSize="40" textAnchor="middle" dy="14" opacity="0.8">潤</text>
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
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none w-full flex flex-col items-center animate-in zoom-in-50 duration-200">
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
            player={gameState.players[0]} position="left" 
            projectedSpeed={activePlayerId === 0 ? activeProjectedSpeed : null} 
            isTurn={activePlayerId === 0} phase={gameState.phase} 
            mpLeft={gameState.phase === 'NN_MOVE' ? gameState.nnMpLeft[0] : gameState.mpLeft} 
            isLeadStatus={gameState.turnOrder[0] === 0}
          />
          <Speedometer 
            player={gameState.players[1]} position="right" 
            projectedSpeed={activePlayerId === 1 ? activeProjectedSpeed : null} 
            isTurn={activePlayerId === 1} phase={gameState.phase} 
            mpLeft={gameState.phase === 'NN_MOVE' ? gameState.nnMpLeft[1] : gameState.mpLeft} 
            isLeadStatus={gameState.turnOrder[0] === 1}
          />
        </>
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

            {gameState.phase === 'NN_REVEAL' && (
              <div className="flex flex-col items-center">
                <div className="bg-black/90 px-8 py-4 rounded-full border border-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse mb-8 z-50">
                   <h2 className="text-3xl font-black text-yellow-400 italic">CARDS REVEALED!</h2>
                </div>
                <div className="flex gap-12 pointer-events-auto">
                   <div className="flex flex-col items-center">
                      <span className="text-red-500 font-black text-xl mb-4 drop-shadow-md">{gameState.players[0].name}</span>
                      {gameState.nnSelections[0] ? <RenderCard card={CARDS[gameState.nnSelections[0]]} scale={1.1} /> : <div className="w-48 h-64 border-2 border-dashed border-red-500/50 rounded-xl flex items-center justify-center text-red-500 font-bold bg-black/50">NO CARD</div>}
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-blue-500 font-black text-xl mb-4 drop-shadow-md">{gameState.players[1].name}</span>
                      {gameState.nnSelections[1] ? <RenderCard card={CARDS[gameState.nnSelections[1]]} scale={1.1} /> : <div className="w-48 h-64 border-2 border-dashed border-blue-500/50 rounded-xl flex items-center justify-center text-blue-500 font-bold bg-black/50">NO CARD</div>}
                   </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fanned Cards UI */}
      {!isAITurn && (gameState.phase === 'PLAY_CARD' || gameState.phase === 'NN_SELECT_CARD') && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end justify-center z-40 w-full no-pan" style={{ perspective: '1200px' }}>
          <div className="relative flex justify-center h-64 items-end w-full max-w-[1200px]">
             <div className={`absolute -top-12 px-6 py-2 rounded-full border text-sm font-bold shadow-2xl ${gameState.phase === 'NN_SELECT_CARD' ? 'bg-yellow-900/90 border-yellow-500 text-yellow-200 animate-pulse' : 'bg-black/80 border-zinc-800 text-zinc-300'}`}>
               {gameState.phase === 'NN_SELECT_CARD' ? 'Lock in 1 Card Face Down!' : 'Play 1 Driving Card'}
             </div>
             {activePlayer.hand.map((cardId, idx) => {
               const card = CARDS[cardId];
               const playable = card.canPlay(activePlayer);
               const offset = idx - (activePlayer.hand.length - 1) / 2;
               const rot = offset * 10;
               const drop = Math.abs(offset) * 12;
               const transX = offset * 110; 
               const isHovered = hoveredCardIdx === idx && playable;

               return (
                 <div 
                    key={idx} 
                    className="absolute bottom-0"
                    style={{
                      transform: isHovered 
                         ? `translateX(${transX}px) translateY(-40px) scale(1.1) rotate(0deg)` 
                         : `translateX(${transX}px) translateY(${drop}px) rotate(${rot}deg)`,
                      zIndex: isHovered ? 100 : 10 + idx,
                      transformOrigin: 'bottom center',
                      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                 >
                   <RenderCard 
                     card={card} 
                     disabled={!playable}
                     onClick={() => playCard(cardId, idx)}
                     onMouseEnter={() => playable && setHoveredCardIdx(idx)}
                     onMouseLeave={() => setHoveredCardIdx(null)}
                   />
                 </div>
               );
             })}
          </div>
          <button onClick={skipToDiscard} className="absolute -bottom-2 right-[10%] px-6 py-3 bg-red-950/80 hover:bg-red-900 border border-red-900 rounded-lg text-sm font-bold text-red-200 transition-colors shadow-2xl">Skip Turn</button>
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
          <h1 className="text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]">潤 {gameState.winner} WINS! 潤</h1>
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
ReactDOM.createRoot(document.getElementById('root')).render(<ArcadeRacingGame />);
  