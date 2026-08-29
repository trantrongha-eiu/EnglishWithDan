import{_ as e,c as t,h as n,i as r,l as i,p as a,s as o,v as s}from"./index-ZJfFSMIO.js";import{t as c}from"./ImportStatusBox-CjFJNYbo.js";import{t as l}from"./LessonPreview-DLwZOd2u.js";var u=s(e(),1),d=i(),f=`Bạn là trợ lý biên soạn nội dung từ vựng tiếng Anh cho học sinh luyện thi IELTS.

Hãy tạo một bài học từ vựng theo ĐÚNG định dạng văn bản dưới đây — KHÔNG dùng JSON, KHÔNG dùng YAML, KHÔNG dùng Markdown hay bảng biểu, chỉ dùng đúng cú pháp key=value như ví dụ:

@lesson
title=<tên bài học>
description=<mô tả ngắn>
difficulty=<A1|A2|B1|B2|C1|C2>
order=<số thứ tự buổi học>

@word
word=<từ vựng tiếng Anh>
meaning=<nghĩa tiếng Việt>
ipa=<phiên âm IPA>
pos=<từ loại: noun/verb/adjective/adverb...>
example=<1 câu ví dụ tiếng Anh sử dụng từ này>
definition=<định nghĩa tiếng Anh ngắn gọn, dễ hiểu>
collocations=<cụm từ đi kèm 1>|<cụm từ đi kèm 2>
distractors=<đáp án nhiễu 1>|<đáp án nhiễu 2>|<đáp án nhiễu 3>

Lặp lại khối @word cho mỗi từ vựng cần tạo.

Yêu cầu bắt buộc:
- Mỗi từ phải có đủ tất cả field: word, meaning, ipa, pos, example, definition, collocations, distractors.
- distractors phải là từ dễ gây nhầm lẫn với từ chính (dùng cho câu hỏi trắc nghiệm), tối thiểu 3 từ, cách nhau bằng dấu "|".
- collocations tối thiểu 2 cụm, cách nhau bằng dấu "|".
- Không được lặp lại cùng 1 "word" trong cùng một lesson.
- difficulty chỉ được là một trong: A1, A2, B1, B2, C1, C2.
- Chỉ trả lời đúng nội dung theo định dạng trên. Không thêm lời giải thích, không bọc trong code block, không thêm ký tự thừa.

Chủ đề / danh sách từ vựng cần tạo: [DÁN CHỦ ĐỀ HOẶC DANH SÁCH TỪ VÀO ĐÂY]
Số lượng từ mong muốn: [DÁN SỐ LƯỢNG VÀO ĐÂY]`,p=`vocabLessonImportPrefill`;function m(){let e=t(),i=o(),s=a(),[m]=n(),h=m.get(`lessonId`),[g,_]=(0,u.useState)(()=>{if(h)return``;let e=sessionStorage.getItem(p);return e&&sessionStorage.removeItem(p),e||``}),[v,y]=(0,u.useState)(``),[b,x]=(0,u.useState)(!!h),[S,C]=(0,u.useState)(!1),[w,T]=(0,u.useState)(!1),[E,D]=(0,u.useState)(null);(0,u.useEffect)(()=>{h&&r(`/vocabulary-lessons/admin/${h}`).then(e=>{_(e.lesson.rawImport||``),y(e.lesson.title)}).catch(t=>e(t.message,`error`)).finally(()=>x(!1))},[h]);async function O(){if(!g.trim()){e(`Chưa có nội dung để kiểm tra`,`warn`);return}C(!0);try{let t=await r(`/vocabulary-lessons/admin/parse`,{method:`POST`,body:JSON.stringify({text:g})});D(t),t.valid?e(`✓ Hợp lệ — ${t.words.length} từ`+(t.warnings?.length?` (${t.warnings.length} cảnh báo)`:``)):e(`✗ ${t.errors.length} lỗi`,`error`)}catch(t){e(t.message,`error`)}finally{C(!1)}}async function k(){if(!g.trim()){e(`Chưa có nội dung để import`,`warn`);return}T(!0);try{let t=await r(h?`/vocabulary-lessons/admin/${h}/reimport`:`/vocabulary-lessons/admin/import`,{method:h?`PUT`:`POST`,body:JSON.stringify({text:g})});e(t.message),s(`/vocabulary-lessons`)}catch(t){e(t.message,`error`),t.body?.errors&&D({valid:!1,errors:t.body.errors,lesson:null,words:[]})}finally{T(!1)}}function A(){g.trim()&&i(`Xoá toàn bộ nội dung đang nhập?`,()=>{_(``),D(null)})}function j(){navigator.clipboard.writeText(f).then(()=>e(`Đã copy prompt — dán vào ChatGPT/Gemini`)).catch(()=>e(`Không copy được, trình duyệt chặn clipboard`,`error`))}return b?(0,d.jsx)(`div`,{style:{padding:40,color:`var(--text2)`},children:`Đang tải...`}):(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)(`div`,{className:`section-header`,children:[(0,d.jsx)(`h2`,{className:`section-title`,children:h?`Sửa nội dung: ${v}`:`Import Lesson`}),(0,d.jsx)(`button`,{className:`btn btn-ghost`,onClick:()=>s(`/vocabulary-lessons`),children:`← Quay lại danh sách`})]}),(0,d.jsx)(`div`,{style:{display:`flex`,gap:8,marginBottom:10},children:(0,d.jsx)(`button`,{className:`btn btn-ghost btn-sm`,onClick:j,children:`🤖 Copy AI Prompt`})}),(0,d.jsxs)(`div`,{className:`form-group`,children:[(0,d.jsx)(`label`,{className:`form-label`,children:`Paste Lesson (định dạng EnglishWithDan Lesson Format)`}),(0,d.jsx)(`textarea`,{className:`form-input`,rows:18,value:g,onChange:e=>{_(e.target.value),D(null)},placeholder:`@lesson
title=Week 12 - Environment
description=Environment Vocabulary
difficulty=B1
order=12

@word
word=sustainable
meaning=bền vững
ipa=/səˈsteɪnəbl/
pos=adjective
example=Solar energy is a sustainable source of power.
definition=Able to continue without harming the environment.
collocations=sustainable development|sustainable energy
distractors=renewable|temporary|harmful`,style:{fontFamily:`var(--mono)`,fontSize:12.5,lineHeight:1.6}})]}),(0,d.jsxs)(`div`,{style:{display:`flex`,gap:8,marginBottom:20,flexWrap:`wrap`},children:[(0,d.jsx)(`button`,{className:`btn btn-ghost`,onClick:O,disabled:S,children:S?`Đang kiểm tra...`:`✓ Validate`}),(0,d.jsx)(`button`,{className:`btn btn-ghost`,onClick:O,disabled:S,children:`👁 Preview`}),(0,d.jsx)(`button`,{className:`btn btn-primary`,onClick:k,disabled:w||!E?.valid,children:w?`Đang lưu...`:h?`💾 Lưu thay đổi`:`📥 Import`}),(0,d.jsx)(`button`,{className:`btn btn-ghost`,onClick:A,children:`🗑 Clear`})]}),E&&!E.valid&&(0,d.jsx)(`div`,{style:{marginBottom:20},children:(0,d.jsx)(c,{tone:`error`,title:`✗ ${E.errors.length} lỗi — chưa thể import:`,items:E.errors})}),E?.valid&&E.warnings?.length>0&&(0,d.jsx)(`div`,{style:{marginBottom:20},children:(0,d.jsx)(c,{tone:`warning`,title:`⚠ ${E.warnings.length} cảnh báo — vẫn import được:`,items:E.warnings})}),E?.valid&&(0,d.jsxs)(`div`,{style:{border:`1px solid var(--border)`,borderRadius:`var(--radius)`,padding:20},children:[(0,d.jsx)(`div`,{style:{fontSize:12,fontWeight:700,color:`var(--green)`,textTransform:`uppercase`,letterSpacing:`.05em`,marginBottom:14},children:`✓ Preview — sẵn sàng import`}),(0,d.jsx)(l,{lesson:E.lesson,words:E.words})]})]})}export{m as default};