'use strict';

// The neural voices students can pick as their Speaking examiner. `id` is what
// the browser sends and stores; `azure` stays server-side, so a voice can be
// swapped here without touching saved preferences. Only standard Azure neural
// voices: they are the ones the free tier covers (HD voices are billed extra).
const ACCENTS = {
  'en-GB': 'Giọng Anh',
  'en-US': 'Giọng Mỹ',
  'en-AU': 'Giọng Úc',
  'en-IN': 'Giọng Ấn Độ',
};

const VOICES = [
  { id: 'alice',  name: 'Alice',  gender: 'Nữ',  locale: 'en-GB', azure: 'en-GB-SoniaNeural' },
  { id: 'emily',  name: 'Emily',  gender: 'Nữ',  locale: 'en-GB', azure: 'en-GB-LibbyNeural' },
  { id: 'tony',   name: 'Tony',   gender: 'Nam', locale: 'en-GB', azure: 'en-GB-RyanNeural' },
  { id: 'oliver', name: 'Oliver', gender: 'Nam', locale: 'en-GB', azure: 'en-GB-OliverNeural' },

  { id: 'sophia', name: 'Sophia', gender: 'Nữ',  locale: 'en-US', azure: 'en-US-AvaNeural' },
  { id: 'grace',  name: 'Grace',  gender: 'Nữ',  locale: 'en-US', azure: 'en-US-EmmaNeural' },
  { id: 'daniel', name: 'Daniel', gender: 'Nam', locale: 'en-US', azure: 'en-US-AndrewNeural' },
  { id: 'ethan',  name: 'Ethan',  gender: 'Nam', locale: 'en-US', azure: 'en-US-BrianNeural' },

  { id: 'chloe',  name: 'Chloe',  gender: 'Nữ',  locale: 'en-AU', azure: 'en-AU-NatashaNeural' },
  { id: 'mia',    name: 'Mia',    gender: 'Nữ',  locale: 'en-AU', azure: 'en-AU-FreyaNeural' },
  { id: 'jack',   name: 'Jack',   gender: 'Nam', locale: 'en-AU', azure: 'en-AU-WilliamNeural' },
  { id: 'liam',   name: 'Liam',   gender: 'Nam', locale: 'en-AU', azure: 'en-AU-DarrenNeural' },

  { id: 'priya',  name: 'Priya',  gender: 'Nữ',  locale: 'en-IN', azure: 'en-IN-NeerjaNeural' },
  { id: 'anika',  name: 'Anika',  gender: 'Nữ',  locale: 'en-IN', azure: 'en-IN-AartiNeural' },
  { id: 'rahul',  name: 'Rahul',  gender: 'Nam', locale: 'en-IN', azure: 'en-IN-PrabhatNeural' },
  { id: 'arjun',  name: 'Arjun',  gender: 'Nam', locale: 'en-IN', azure: 'en-IN-ArjunNeural' },
];

const DEFAULT_EXAMINER_VOICE = 'tony';
// Vocabulary with no dictionary recording (phrases, inflected forms). American,
// because the recordings it sits next to are tried US first.
const WORD_VOICE = 'sophia';

const byId = new Map(VOICES.map((v) => [v.id, v]));
const getVoice = (id) => byId.get(id) || null;

// What the browser may see (never the Azure names).
const publicVoices = () => VOICES.map(({ id, name, gender, locale }) => ({
  id, name, gender, accent: ACCENTS[locale],
}));

module.exports = { VOICES, DEFAULT_EXAMINER_VOICE, WORD_VOICE, getVoice, publicVoices };
