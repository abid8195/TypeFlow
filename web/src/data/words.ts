// ─── Word pools ──────────────────────────────────────────────────────────────

export const easyWords = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
  'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
  'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
  'its', 'let', 'may', 'put', 'say', 'she', 'too', 'use', 'dog', 'cat',
  'run', 'sit', 'top', 'big', 'hot', 'sun', 'set', 'net', 'wet', 'fast',
  'slow', 'good', 'best', 'time', 'jump', 'play', 'work', 'home', 'love', 'life',
  'food', 'door', 'hand', 'head', 'keep', 'last', 'left', 'long', 'look', 'made',
  'most', 'move', 'much', 'name', 'next', 'over', 'same', 'side', 'some', 'then',
]

export const mediumWords = [
  'about', 'after', 'always', 'before', 'being', 'between', 'could', 'during', 'every', 'first',
  'found', 'given', 'going', 'great', 'group', 'house', 'large', 'later', 'little', 'means',
  'might', 'never', 'other', 'place', 'right', 'should', 'small', 'sound', 'still', 'taken',
  'their', 'there', 'these', 'thing', 'think', 'three', 'through', 'under', 'until', 'where',
  'which', 'while', 'world', 'would', 'write', 'young', 'achieve', 'attempt', 'believe', 'change',
  'character', 'compare', 'complete', 'consider', 'continue', 'control', 'develop', 'discover',
  'discuss', 'display', 'effort', 'example', 'explain', 'follow', 'forward', 'future', 'happen',
  'important', 'include', 'increase', 'knowledge', 'language', 'learning', 'measure', 'memory',
]

export const hardWords = [
  'absolutely', 'acceleration', 'acknowledge', 'achievement', 'administration', 'adolescence',
  'advancement', 'adversity', 'aesthetic', 'affiliation', 'algorithm', 'alternative',
  'anniversary', 'anticipation', 'apocalypse', 'architecture', 'arrangement', 'assassination',
  'atmosphere', 'authentication', 'authorization', 'automobile', 'auxiliary', 'availability',
  'awkwardness', 'background', 'bankruptcy', 'bibliography', 'biodiversity', 'biohazard',
  'blasphemy', 'blockchain', 'bombardment', 'bureaucracy', 'calcification', 'calibration',
  'calligraphy', 'capitalism', 'catastrophe', 'categorization', 'celebration', 'certificate',
  'certification', 'challenging', 'championship', 'characteristic', 'choreography',
  'chronological', 'civilization', 'classification', 'claustrophobia', 'cryptocurrency',
  'decentralization', 'decomposition', 'deliberation', 'demystification', 'differentiation',
  'disappearance', 'disqualification', 'electromagnetic', 'entrepreneurship', 'environmental',
]

// Famous programming and literature quotes — each is an array of words (pre-split)
// so the generator can stitch them together in order.
export const quotesPool: string[][] = [
  'first solve the problem then write the code'.split(' '),
  'simplicity is the soul of efficiency'.split(' '),
  'make it work make it right make it fast'.split(' '),
  'code is read more often than it is written'.split(' '),
  'the best code is no code at all'.split(' '),
  'programs must be written for people to read'.split(' '),
  'debugging is twice as hard as writing the code'.split(' '),
  'any fool can write code that a computer can understand'.split(' '),
  'talk is cheap show me the code'.split(' '),
  'the function of good software is to make the complex appear simple'.split(' '),
  'experience is the name everyone gives to their mistakes'.split(' '),
  'the only way to go fast is to go well'.split(' '),
  'clean code always looks like it was written by someone who cares'.split(' '),
  'every great developer you know got there by solving problems they were unqualified to solve'.split(' '),
  'it always seems impossible until it is done'.split(' '),
  'the secret of getting ahead is getting started'.split(' '),
  'perfection is achieved not when there is nothing more to add but when there is nothing left to take away'.split(' '),
  'in order to be irreplaceable one must always be different'.split(' '),
  'a ship in harbor is safe but that is not what ships are built for'.split(' '),
  'the best time to plant a tree was twenty years ago the second best time is now'.split(' '),
]

// ─── Types ───────────────────────────────────────────────────────────────────

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'quotes'

export interface DifficultyConfig {
  level: DifficultyLevel
  label: string
  wordPool: string[]
  description: string
}

// ─── Difficulty configs ───────────────────────────────────────────────────────

export const difficulties: Record<string, DifficultyConfig> = {
  easy: {
    level: 'easy',
    label: 'Easy',
    wordPool: easyWords,
    description: 'Common short words',
  },
  medium: {
    level: 'medium',
    label: 'Medium',
    wordPool: mediumWords,
    description: 'Everyday vocabulary',
  },
  hard: {
    level: 'hard',
    label: 'Hard',
    wordPool: hardWords,
    description: 'Complex challenging words',
  },
  quotes: {
    level: 'quotes',
    label: 'Quotes',
    wordPool: [],   // not used — generateQuoteWords handles this
    description: 'Famous programming and literature quotes',
  },
}

// ─── Duration options ─────────────────────────────────────────────────────────

export const testDurations = [
  { value: 15,  label: '15s' },
  { value: 30,  label: '30s' },
  { value: 60,  label: '1m' },
  { value: 120, label: '2m' },
]
