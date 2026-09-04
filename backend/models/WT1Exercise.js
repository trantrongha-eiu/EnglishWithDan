const mongoose = require('mongoose');
const { Schema } = mongoose;

// WT1 course exercise — the block a student clicks to do, with its own
// score + progress. `type` selects a frontend component + a grading path;
// `autoGrade:true` grades in JS on the server, `autoGrade:false` calls the
// AI (geminiService) using `rubric`. `code`-keyed for idempotent re-seed.
// See docs/EXERCISE_SYSTEMS.md and README_SEED.md for the full contract.
const EXERCISE_TYPES = [
  'mcq',
  'gap_fill',
  'error_correction',
  'sentence_transform',
  'word_form',
  'categorize',
  'matching',
  'ordering',
  'sentence_writing',
  'paragraph_writing',
  'full_task1',
];

// Item = câu hỏi con (chỉ dùng cho các dạng chấm tự động). Dùng chung cho
// mọi type — các trường không liên quan để trống. strict:false để không
// phải sửa schema khi thêm type mới.
const ItemSchema = new Schema(
  {
    id: String,
    prompt: String,

    // mcq
    options: [{ id: String, text: String }],
    answer: Schema.Types.Mixed, // string | string[] (ordering)

    // gap_fill: mỗi phần tử ứng với một marker "____" trong prompt
    blanks: [{ accept: [String] }],

    // error_correction / word_form
    errorSpan: String,
    accept: [String],

    // sentence_transform
    cue: String,
    starter: String,
    sampleAnswers: [String],

    // categorize
    text: String,
    category: String,

    // matching
    left: String,
    right: String,

    // ordering
    tokens: [String],

    explanation: String,
  },
  { _id: false, strict: false }
);

const RubricSchema = new Schema(
  {
    minWords: Number,
    maxWords: Number,
    targetStructures: [String],
    targetVocab: [String],
    mustUse: Number,
    bandFocus: [String],
    scoring: [{ criterion: String, points: Number }],
    checklist: [String],
    sampleAnswer: String,
    commonErrors: [String],
  },
  { _id: false }
);

const WT1ExerciseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    lessonCode: { type: String, required: true, index: true },
    order: { type: Number, default: 0 },

    type: { type: String, enum: EXERCISE_TYPES, required: true },
    title: String,
    titleEn: String,
    instruction: String,

    source: { type: String, enum: ['original', 'added'], default: 'original' },
    skillTags: [String],
    difficulty: { type: Number, min: 1, max: 3, default: 1 },
    estimatedMinutes: Number,
    points: { type: Number, default: 0 },
    autoGrade: { type: Boolean, default: true },
    timerMinutes: Number,

    // true = còn thiếu ảnh biểu đồ, chưa nên publish
    needsAsset: { type: Boolean, default: false },

    stimulus: {
      kind: { type: String, enum: ['table', 'image', 'text', null], default: null },
      caption: String,
      headers: [String],
      rows: [[String]],
      imageUrl: String,
      note: String,
    },

    wordBank: [String],
    categories: [{ id: String, label: String }],
    responseSlots: Number, // số ô textarea cho bài viết nhiều câu

    items: [ItemSchema],
    rubric: RubricSchema,

    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WT1ExerciseSchema.index({ lessonCode: 1, order: 1 });

module.exports = mongoose.model('WT1Exercise', WT1ExerciseSchema);
module.exports.EXERCISE_TYPES = EXERCISE_TYPES;
