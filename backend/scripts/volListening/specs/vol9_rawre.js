// rawRe shared by Vol 9 specs: drop the key block before "Section 1", and the inline "(m:ss - m:ss)" timestamps
module.exports = [['^[\\s\\S]*?\\n(?=Section 1\\n)', ''], ['\\(\\d+:\\d+(?::\\d+)?\\s*-\\s*\\d+:\\d+(?::\\d+)?\\)\\s*', ' ']];
