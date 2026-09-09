import{_ as e,c as t,i as n,l as r,p as i,s as a,v as o}from"./index-DFhRllsY.js";import{t as s}from"./ImportStatusBox-CiNYVJpQ.js";var c=o(e(),1),l=r(),u=`Bạn là trợ lý biên soạn đề IELTS Speaking cho học sinh luyện thi.

Hãy tạo bộ đề Speaking theo ĐÚNG định dạng văn bản dưới đây — KHÔNG dùng JSON, KHÔNG dùng Markdown hay bảng biểu, chỉ dùng đúng cú pháp như ví dụ:

@topic
topic=<tên chủ đề, VD: A TV/online programme you enjoy>

@part1
<câu hỏi Part 1 số 1>
<câu hỏi Part 1 số 2>
<... mỗi câu 1 dòng>

@part2
cue=<gạch đầu dòng cue card 1> | <gạch đầu dòng 2> | <gạch đầu dòng 3> | and explain ...
<câu đề bài Part 2, VD: Describe a TV or online programme that you enjoy watching>

@part3
<câu hỏi Part 3 số 1>
<câu hỏi Part 3 số 2>
<...>

Lặp lại khối @topic cho mỗi chủ đề. Một khối @topic chứa cả 3 part; part nào không có thì bỏ qua.

Yêu cầu bắt buộc:
- Mỗi @topic phải có dòng "topic=".
- @part1 / @part3: mỗi dòng là 1 câu hỏi. @part1 nên 4–11 câu, @part3 nên 4–6 câu.
- @part2: đúng 1 dòng câu đề bài; các gạch đầu dòng cue card để ở dòng "cue=", cách nhau bằng dấu "|".
- Không lặp lại cùng 1 câu hỏi trong cùng 1 part của cùng 1 topic.
- Chỉ trả lời đúng nội dung theo định dạng trên. Không thêm lời giải thích, không bọc trong code block.

Chủ đề / bộ đề quý cần tạo: [DÁN CHỦ ĐỀ HOẶC DANH SÁCH ĐỀ VÀO ĐÂY]`,d=`@topic
topic=A TV/online programme you enjoy

@part1
What kinds of TV programmes do you like to watch?
How often do you watch television?
Do you prefer watching TV alone or with other people?

@part2
cue=what it is about | how often you watch it | who you watch it with | and explain why you enjoy it
Describe a TV or online programme that you enjoy watching

@part3
Why do some people spend so much time watching TV and online programmes?
Do younger and older people enjoy watching similar programmes?`;function f({n:e,items:t}){return t?.length?(0,l.jsxs)(`div`,{style:{marginTop:8},children:[(0,l.jsxs)(`div`,{style:{fontSize:11,fontWeight:700,color:`var(--text3,#888)`,textTransform:`uppercase`,letterSpacing:`.05em`},children:[`Part `,e,` · `,t.length,` câu`]}),(0,l.jsx)(`ul`,{style:{margin:`4px 0 0`,paddingLeft:18,fontSize:12.5,lineHeight:1.6},children:t.map((e,t)=>(0,l.jsx)(`li`,{children:e},t))})]}):null}function p(){let e=t(),r=a(),o=i(),[p,m]=(0,c.useState)(``),[h,g]=(0,c.useState)(!1),[_,v]=(0,c.useState)(!1),[y,b]=(0,c.useState)(null);async function x(){if(!p.trim()){e(`Chưa có nội dung để kiểm tra`,`warn`);return}g(!0);try{let t=await n(`/admin/speaking/questions/parse`,{method:`POST`,body:JSON.stringify({text:p})});b(t),t.valid?e(`✓ Hợp lệ — ${t.counts.topics} topic, ${t.counts.total} câu`+(t.warnings?.length?` (${t.warnings.length} cảnh báo)`:``)):e(`✗ ${t.errors.length} lỗi`,`error`)}catch(t){e(t.message,`error`)}finally{g(!1)}}async function S(){if(!y?.valid){e(`Hãy Validate trước khi import`,`warn`);return}r(`Import ${y.counts.topics} topic (${y.counts.total} câu) vào ngân hàng câu hỏi Speaking?`,async()=>{v(!0);try{let t=await n(`/admin/speaking/questions/import`,{method:`POST`,body:JSON.stringify({text:p})});e(t.message),o(`/speaking`)}catch(t){e(t.message,`error`),t.body?.errors&&b({valid:!1,errors:t.body.errors,warnings:[],topics:[],counts:{}})}finally{v(!1)}})}function C(){p.trim()&&r(`Xoá toàn bộ nội dung đang nhập?`,()=>{m(``),b(null)})}function w(){navigator.clipboard.writeText(u).then(()=>e(`Đã copy prompt — dán vào ChatGPT/Gemini`)).catch(()=>e(`Không copy được, trình duyệt chặn clipboard`,`error`))}return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsxs)(`div`,{className:`section-header`,children:[(0,l.jsx)(`h2`,{className:`section-title`,children:`Import đề Speaking`}),(0,l.jsx)(`button`,{className:`btn btn-ghost`,onClick:()=>o(`/speaking`),children:`← Quay lại Speaking`})]}),(0,l.jsx)(`div`,{style:{display:`flex`,gap:8,marginBottom:10},children:(0,l.jsx)(`button`,{className:`btn btn-ghost btn-sm`,onClick:w,children:`🤖 Copy AI Prompt`})}),(0,l.jsxs)(`div`,{className:`form-group`,children:[(0,l.jsx)(`label`,{className:`form-label`,children:`Paste bộ đề (định dạng EnglishWithDan Speaking Format — cả Part 1, 2, 3)`}),(0,l.jsx)(`textarea`,{className:`form-input`,rows:18,value:p,onChange:e=>{m(e.target.value),b(null)},placeholder:d,style:{fontFamily:`var(--mono)`,fontSize:12.5,lineHeight:1.6}})]}),(0,l.jsxs)(`div`,{style:{display:`flex`,gap:8,marginBottom:20,flexWrap:`wrap`},children:[(0,l.jsx)(`button`,{className:`btn btn-ghost`,onClick:x,disabled:h,children:h?`Đang kiểm tra...`:`✓ Validate / Preview`}),(0,l.jsx)(`button`,{className:`btn btn-primary`,onClick:S,disabled:_||!y?.valid,children:_?`Đang import...`:`📥 Import`}),(0,l.jsx)(`button`,{className:`btn btn-ghost`,onClick:C,children:`🗑 Clear`})]}),y&&!y.valid&&(0,l.jsx)(`div`,{style:{marginBottom:20},children:(0,l.jsx)(s,{tone:`error`,title:`✗ ${y.errors.length} lỗi — chưa thể import:`,items:y.errors})}),y?.valid&&y.warnings?.length>0&&(0,l.jsx)(`div`,{style:{marginBottom:20},children:(0,l.jsx)(s,{tone:`warning`,title:`⚠ ${y.warnings.length} cảnh báo — vẫn import được:`,items:y.warnings})}),y?.valid&&(0,l.jsxs)(`div`,{style:{border:`1px solid var(--border)`,borderRadius:`var(--radius)`,padding:20},children:[(0,l.jsxs)(`div`,{style:{fontSize:12,fontWeight:700,color:`var(--green)`,textTransform:`uppercase`,letterSpacing:`.05em`,marginBottom:14},children:[`✓ Preview — `,y.counts.topics,` topic · `,y.counts.part1,` câu P1 · `,y.counts.part2,` cue card P2 · `,y.counts.part3,` câu P3`]}),y.topics.map((e,t)=>(0,l.jsxs)(`div`,{style:{padding:`12px 0`,borderTop:t?`1px solid var(--border)`:`none`},children:[(0,l.jsx)(`div`,{style:{fontWeight:700,fontSize:14},children:e.topic}),(0,l.jsx)(f,{n:1,items:e.part1}),e.part2&&(0,l.jsxs)(`div`,{style:{marginTop:8},children:[(0,l.jsx)(`div`,{style:{fontSize:11,fontWeight:700,color:`var(--text3,#888)`,textTransform:`uppercase`,letterSpacing:`.05em`},children:`Part 2`}),(0,l.jsx)(`div`,{style:{fontSize:12.5,marginTop:4},children:e.part2.question}),e.part2.cueCard&&(0,l.jsx)(`pre`,{style:{fontSize:11.5,color:`var(--text2,#555)`,margin:`4px 0 0`,whiteSpace:`pre-wrap`,fontFamily:`inherit`},children:e.part2.cueCard})]}),(0,l.jsx)(f,{n:3,items:e.part3})]},t))]})]})}export{p as default};