// Everything about Dilyor lives here. Source: my-info/profile.md and dilyor.dev.

export const ME = {
  name: 'Dilyorbek Muhammadjonov',
  short: 'Dilyor',
  nick: 'kyosan',
  role: 'Machine learning engineer',
  city: 'Tashkent',
  email: 'd.muhammadjonov@newuu.uz',
  links: [
    { label: 'Telegram', href: 'https://t.me/dilyor_m' },
    { label: 'GitHub', href: 'https://github.com/dilyorm' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dilyor/' },
    { label: 'Kaggle', href: 'https://www.kaggle.com/dilyorbek' },
  ],
}

export const FACTS = [
  { k: 'Now', v: 'ML engineer at SQB' },
  { k: 'Studying', v: 'AI & Robotics at New Uzbekistan University, plus Yandex ML School' },
  { k: 'Speaks', v: 'Uzbek, English, Russian' },
  { k: 'Writes', v: 'Python, C++, SQL' },
]

// Career route, newest first. It is a real sequence, so the page numbers the stops.
export const ROUTE = [
  {
    when: '2026 – now',
    where: 'SQB',
    what: 'Machine learning engineer',
    notes: [
      'Fine-tunes and ships speech-to-text for Uzbek and Russian',
      'Runs the GPU servers that host local models',
      'Builds agent tooling: harnesses, MCP servers, skills',
    ],
  },
  {
    when: '2026 – now',
    where: 'Yandex ML School',
    what: 'Student, evening track in Tashkent',
    notes: [
      'Math for ML, then classical ML, then deep learning: vision, NLP, LLMs',
      'Alongside the SQB job and NewUU',
    ],
  },
  {
    when: '2025 – 2026',
    where: 'SATashkent',
    what: 'AI/ML developer',
    notes: [
      'SAT tutor chatbot with Desmos graphs and animated step-by-step answers',
      'Narrated video explanations and a RAG stack over SAT content',
      'Similar-question search with embeddings',
      'Sales automation from first message to payment',
    ],
  },
  {
    when: '2024',
    where: 'Mutolaa',
    what: 'AI/ML developer',
    notes: ['Cleaned and aligned audio to train Uzbek text-to-speech (Fairseq, PyTorch)'],
  },
  {
    when: '2021 – 2024',
    where: 'Samarkand Presidential School',
    what: 'Mathematics & computer science',
    notes: [],
  },
]

// Projects live in the admin panel (server/); server/seed_projects.json is the starting set.

export const TROPHIES = [
  { rank: '#1', title: 'CTF team in Uzbekistan', detail: 'Team XYLO on CTFtime' },
  { rank: '1st', title: 'Urban.Tech Hackathon', detail: 'CCTV productivity analytics with YOLO and OpenCV' },
  { rank: '3rd', title: 'CBU Coding Challenge', detail: 'Loan default scoring model' },
  { rank: '12th', title: 'ICPC Uzbekistan', detail: 'Team FemSezuko, semifinals in Kazakhstan' },
  { rank: 'Bronze', title: 'International Youth Math Challenge', detail: 'Two international stages' },
]

// Hobby stats. `sample` numbers are stand-ins until a handle is filled in below;
// with a handle set, the page fetches live numbers and drops the "sample" tag.
export const HANDLES = {
  chessCom: 'dilyorbekmuhammadjonov',
  openDotaId: 1507943254, // steam id/dilyor_m; OpenDota shows no matches until "Expose Public Match Data" is on
  codeforces: 'dilyorbek',
  monkeytype: 'kyosand',
}

export const STEAM = {
  dota: 'https://steamcommunity.com/id/dilyor_m',
  cs2: 'https://steamcommunity.com/profiles/76561199744640101',
}

export const HOBBIES = {
  // Real numbers from chess.com on 2026-11-14; refreshed live on load.
  chess: {
    sample: false,
    stats: [
      { k: 'Rapid', v: '1418' },
      { k: 'Blitz', v: '1375' },
      { k: 'Bullet', v: '1151' },
      { k: 'Puzzles peak', v: '2000' },
    ],
  },
  dota: {
    sample: true,
    rank: 'Legend',
    stats: [
      { k: 'Matches', v: '2,310' },
      { k: 'Win rate', v: '51.8%' },
      { k: 'Main', v: 'Invoker' },
    ],
  },
  // From the public Steam profile on 2026-11-15. Valve has no public API for
  // Premier rating or K/D, so those get typed in here when known.
  cs2: {
    sample: false,
    stats: [
      { k: 'Hours played', v: '1,146' },
      { k: 'Past 2 weeks', v: '9.8 h' },
    ],
  },
  // FACEIT, through the site API (/api/faceit). Snapshot from 2026-11-15.
  faceit: {
    nickname: 'kyosan',
    elo: 1622,
    level: 8,
    url: 'https://www.faceit.com/en/players/kyosan',
    stats: null,
  },
  // Never competed; this is the home timer best.
  cube: {
    sample: false,
    stats: [
      { k: 'Personal best', v: '28 s' },
      { k: 'Competitions', v: 'None yet' },
    ],
  },
  // monkeytype.com/profile/kyosand on 2026-11-15; refreshed live on load.
  typing: {
    pbs: [
      { mode: '15 s', wpm: 111.93, acc: 99.29 },
      { mode: '30 s', wpm: 97.63, acc: 98.81 },
      { mode: '60 s', wpm: 93.82, acc: 98.54 },
      { mode: '120 s', wpm: 79.31, acc: 92.47 },
      { mode: '10 words', wpm: 126.51, acc: 100 },
    ],
    tests: 197,
    seconds: 6318.68,
  },
  // avj (avj.dilyor.dev) through the site API (/api/music). Nothing until it answers.
  music: null,
}
