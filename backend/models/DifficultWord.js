const mongoose = require('mongoose');

const DifficultWordSchema = new mongoose.Schema({
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    word:         { type: String, required: true },
    meaning:      { type: String, default: '' },
    phonetic:     { type: String, default: '' },
    partOfSpeech: { type: String, default: '' },
    example:      { type: String, default: '' },
    wrongCount:   { type: Number, default: 1 },
    source:       { type: String, default: '' },
    addedAt:      { type: Date,   default: Date.now },
    lastWrongAt:  { type: Date,   default: Date.now }
}, { timestamps: false });

DifficultWordSchema.index({ userId: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('DifficultWord', DifficultWordSchema);
