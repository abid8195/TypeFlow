// Word lists for different difficulty levels
export const easyWords = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
  'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
  'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
  'its', 'let', 'may', 'put', 'say', 'she', 'too', 'use', 'dog', 'cat',
  'run', 'sit', 'top', 'big', 'hot', 'sun', 'set', 'net', 'wet', 'let',
  'fast', 'slow', 'good', 'best', 'time', 'jump', 'play', 'work', 'home', 'love',
]

export const mediumWords = [
  'about', 'after', 'always', 'before', 'being', 'between', 'could', 'during', 'every', 'first',
  'found', 'given', 'going', 'great', 'group', 'house', 'large', 'later', 'little', 'means',
  'might', 'never', 'other', 'place', 'right', 'should', 'small', 'sound', 'still', 'taken',
  'their', 'there', 'these', 'thing', 'think', 'three', 'through', 'under', 'until', 'where',
  'which', 'while', 'world', 'would', 'write', 'young', 'achieve', 'attempt', 'believe', 'change',
  'character', 'compare', 'complete', 'consider', 'continue', 'control', 'develop', 'discover', 'discuss', 'display',
]

export const hardWords = [
  'absolutely', 'acceleration', 'acknowledge', 'achievement', 'administration', 'adolescence', 'advancement', 'adversity', 'aesthetic', 'affiliation',
  'algorithm', 'alternative', 'anniversary', 'anticipation', 'apocalypse', 'architecture', 'argument', 'arrangement', 'assassination', 'atmosphere',
  'authentication', 'authorization', 'automobile', 'auxiliary', 'availability', 'awkwardness', 'background', 'bankruptcy', 'bibliography', 'biodiversity',
  'biohazard', 'blasphemy', 'blockchain', 'bombardment', 'bureaucracy', 'calcification', 'calibration', 'calligraphy', 'cannibalism', 'capitalism',
  'catastrophe', 'categorization', 'celebration', 'cellophane', 'centrifugal', 'ceremony', 'certificate', 'certification', 'challenging', 'championship',
  'characteristic', 'chauffeur', 'chivalry', 'choreography', 'chronological', 'civilization', 'classification', 'claustrophobia', 'coagulation', 'coalition',
]

export const sentences = [
  'The quick brown fox jumps over the lazy dog.',
  'Programming requires patience and practice.',
  'Type faster to improve your skills.',
  'Consistency is the key to success.',
  'Every word you type counts towards your progress.',
  'Focus on accuracy before worrying about speed.',
  'The journey of a thousand miles begins with a single keystroke.',
  'Typing tests help you measure your productivity.',
  'Challenge yourself with harder difficulty levels.',
  'Save your best scores and track your improvement.',
]

export interface DifficultyConfig {
  level: 'easy' | 'medium' | 'hard'
  label: string
  wordPool: string[]
  description: string
}

export const difficulties: Record<string, DifficultyConfig> = {
  easy: {
    level: 'easy',
    label: 'Easy',
    wordPool: easyWords,
    description: 'Common simple words',
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
}

export const testDurations = [
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 120, label: '2m' },
]
