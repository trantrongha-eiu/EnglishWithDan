import{i as e,n as t,t as n}from"./jsx-runtime-bzQ4Vb5N.js";import{r}from"./api-YbGjtXtc.js";import{B as i,F as a,I as o}from"./index-yBHXuc-l.js";import{t as s}from"./ImportStatusBox-jqPZ3AQp.js";var c=e(t(),1),l=n(),u=`Bạn là trợ lý chuyển bộ đề IELTS Speaking sang định dạng import của website EnglishWithDan.

ĐỊNH DẠNG (văn bản thuần — KHÔNG JSON, KHÔNG Markdown, KHÔNG bảng):

@topic
topic=<tên chủ đề>
group=<mã nhóm — chỉ cho topic Part 2/3>

@part1
<câu hỏi Part 1, mỗi câu 1 dòng>

@part2
cue=<gạch đầu dòng 1> | <gạch đầu dòng 2> | <gạch đầu dòng 3> | And explain ...
Describe <đề bài Part 2 — đúng 1 dòng>

@part3
<câu hỏi Part 3, mỗi câu 1 dòng>

CÁCH CHIA TOPIC (giống đề thi thật):
- Mỗi chủ đề Part 1 là 1 khối @topic riêng, CHỈ có @part1. topic= là tên chủ đề như trong đề (VD: topic=Street market).
- Mỗi cue card Part 2 là 1 khối @topic riêng, gồm @part2 và các câu Part 3 đi kèm cue card đó. topic= là tên ngắn bằng tiếng Anh (VD: topic=A person you only met once).
- KHÔNG gộp chủ đề Part 1 với cue card Part 2.

group= (chỉ topic Part 2/3) — chọn đúng 1 mã:
people (người) · places (địa điểm) · objects (đồ vật) · events (sự kiện / trải nghiệm / quyết định) · activities_skills (hoạt động, kỹ năng, mục tiêu, thói quen) · nature_science (thiên nhiên, động vật, môi trường, công nghệ, luật môi trường) · culture_media (phim, sách, quảng cáo, tin tức, video, âm nhạc, món ăn truyền thống)

QUY TẮC KHI CÓ ĐỀ GỐC (PDF / văn bản dán bên dưới):
- Chép ĐỦ và ĐÚNG mọi câu hỏi trong đề gốc. KHÔNG tự thêm câu, KHÔNG bỏ câu, KHÔNG diễn đạt lại.
- Chỉ được sửa: lỗi chính tả / ngữ pháp hiển nhiên (VD: "Do you often dinner" → "Do you often have dinner"), ký tự lỗi như \\' → ', bỏ số thứ tự / dấu gạch đầu dòng ở đầu câu, bỏ gợi ý trong ngoặc như "(Why?)", "(Why/Why not?)".
- 1 dòng chứa 2 câu hỏi (VD: "Have you ever bought shoes online? How often do you buy shoes?") → tách thành 2 dòng.
- Đề bài Part 2 luôn bắt đầu bằng "Describe" (thêm vào nếu đề gốc thiếu, VD: "A friend from your childhood" → "Describe a friend from your childhood").
- Bỏ phần quảng cáo, số trang, hotline, link, tiêu đề "You should say:", "Part 3".
- Topic có ít câu thì giữ nguyên ít câu — đừng bù thêm.
- Nếu đề gốc có lỗi (cue card thiếu gạch đầu dòng, câu Part 3 rõ ràng bị chép nhầm từ cue card khác, thiếu Part 3...) thì KHÔNG đoán; bỏ phần lỗi đó và ghi 1 dòng chú thích ngay trong khối topic: # Ghi chú: <mô tả lỗi>

QUY TẮC KHI CHỈ CÓ TÊN CHỦ ĐỀ (không có đề gốc):
- Tự soạn câu hỏi sát đề thi thật: @part1 khoảng 4–6 câu, cue card 4 gạch đầu dòng (dòng cuối bắt đầu bằng "And explain"), @part3 khoảng 4–6 câu.

ĐỊNH DẠNG TRẢ LỜI:
- Chỉ trả về nội dung theo định dạng trên, không lời dẫn, không giải thích, không bọc trong code block.
- Bộ đề dài: trả lời theo từng lượt, mỗi lượt tối đa khoảng 20 khối @topic (Part 1 trước, rồi Part 2/3 theo thứ tự trong đề). Cuối mỗi lượt chưa xong ghi đúng 1 dòng: # CÒN TIẾP — và dừng lại chờ tôi gõ "tiếp". Không được rút gọn hay bỏ bớt topic để kịp trả lời.

ĐỀ GỐC / CHỦ ĐỀ CẦN CHUYỂN:
[DÁN NỘI DUNG ĐỀ VÀO ĐÂY]`,d=`@topic
topic=A TV/online programme you enjoy
group=culture_media

@part1
What kinds of TV programmes do you like to watch?
How often do you watch television?
Do you prefer watching TV alone or with other people?

@part2
cue=what it is about | how often you watch it | who you watch it with | and explain why you enjoy it
Describe a TV or online programme that you enjoy watching

@part3
Why do some people spend so much time watching TV and online programmes?
Do younger and older people enjoy watching similar programmes?`;function f({n:e,items:t}){return t?.length?(0,l.jsxs)(`div`,{style:{marginTop:8},children:[(0,l.jsxs)(`div`,{style:{fontSize:11,fontWeight:700,color:`var(--text3,#888)`,textTransform:`uppercase`,letterSpacing:`.05em`},children:[`Part `,e,` · `,t.length,` câu`]}),(0,l.jsx)(`ul`,{style:{margin:`4px 0 0`,paddingLeft:18,fontSize:12.5,lineHeight:1.6},children:t.map((e,t)=>(0,l.jsx)(`li`,{children:e},t))})]}):null}function p(){let e=o(),t=a(),n=i(),[p,m]=(0,c.useState)(``),[h,g]=(0,c.useState)(!1),[_,v]=(0,c.useState)(!1),[y,b]=(0,c.useState)(null);async function x(){if(!p.trim()){e(`Chưa có nội dung để kiểm tra`,`warn`);return}g(!0);try{let t=await r(`/admin/speaking/questions/parse`,{method:`POST`,body:JSON.stringify({text:p})});b(t),t.valid?e(`✓ Hợp lệ — ${t.counts.topics} topic, ${t.counts.total} câu`+(t.warnings?.length?` (${t.warnings.length} cảnh báo)`:``)):e(`✗ ${t.errors.length} lỗi`,`error`)}catch(t){e(t.message,`error`)}finally{g(!1)}}async function S(){if(!y?.valid){e(`Hãy Validate trước khi import`,`warn`);return}t(`Import ${y.counts.topics} topic (${y.counts.total} câu) vào ngân hàng câu hỏi Speaking?`,async()=>{v(!0);try{let t=await r(`/admin/speaking/questions/import`,{method:`POST`,body:JSON.stringify({text:p})});e(t.message),n(`/speaking`)}catch(t){e(t.message,`error`),t.body?.errors&&b({valid:!1,errors:t.body.errors,warnings:[],topics:[],counts:{}})}finally{v(!1)}})}function C(){p.trim()&&t(`Xoá toàn bộ nội dung đang nhập?`,()=>{m(``),b(null)})}function w(){let t=()=>e(`Đã copy prompt — dán vào ChatGPT/Gemini, rồi dán đề vào cuối prompt`),n=()=>{let n=document.createElement(`textarea`);n.value=u,n.style.position=`fixed`,n.style.opacity=`0`,document.body.appendChild(n),n.select();let r=document.execCommand(`copy`);n.remove(),r?t():e(`Không copy được, trình duyệt chặn clipboard`,`error`)};navigator.clipboard?.writeText?navigator.clipboard.writeText(u).then(t).catch(n):n()}return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsxs)(`div`,{className:`section-header`,children:[(0,l.jsx)(`h2`,{className:`section-title`,children:`Import đề Speaking`}),(0,l.jsx)(`button`,{className:`btn btn-ghost`,onClick:()=>n(`/speaking`),children:`← Quay lại Speaking`})]}),(0,l.jsx)(`div`,{style:{display:`flex`,gap:8,marginBottom:10},children:(0,l.jsx)(`button`,{className:`btn btn-ghost btn-sm`,onClick:w,children:`🤖 Copy AI Prompt`})}),(0,l.jsxs)(`div`,{className:`form-group`,children:[(0,l.jsx)(`label`,{className:`form-label`,children:`Paste bộ đề (định dạng EnglishWithDan Speaking Format — cả Part 1, 2, 3)`}),(0,l.jsx)(`textarea`,{className:`form-input`,rows:18,value:p,onChange:e=>{m(e.target.value),b(null)},placeholder:d,style:{fontFamily:`var(--mono)`,fontSize:12.5,lineHeight:1.6}})]}),(0,l.jsxs)(`div`,{style:{display:`flex`,gap:8,marginBottom:20,flexWrap:`wrap`},children:[(0,l.jsx)(`button`,{className:`btn btn-ghost`,onClick:x,disabled:h,children:h?`Đang kiểm tra...`:`✓ Validate / Preview`}),(0,l.jsx)(`button`,{className:`btn btn-primary`,onClick:S,disabled:_||!y?.valid,children:_?`Đang import...`:`📥 Import`}),(0,l.jsx)(`button`,{className:`btn btn-ghost`,onClick:C,children:`🗑 Clear`})]}),y&&!y.valid&&(0,l.jsx)(`div`,{style:{marginBottom:20},children:(0,l.jsx)(s,{tone:`error`,title:`✗ ${y.errors.length} lỗi — chưa thể import:`,items:y.errors})}),y?.valid&&y.warnings?.length>0&&(0,l.jsx)(`div`,{style:{marginBottom:20},children:(0,l.jsx)(s,{tone:`warning`,title:`⚠ ${y.warnings.length} cảnh báo — vẫn import được:`,items:y.warnings})}),y?.valid&&(0,l.jsxs)(`div`,{style:{border:`1px solid var(--border)`,borderRadius:`var(--radius)`,padding:20},children:[(0,l.jsxs)(`div`,{style:{fontSize:12,fontWeight:700,color:`var(--green)`,textTransform:`uppercase`,letterSpacing:`.05em`,marginBottom:14},children:[`✓ Preview — `,y.counts.topics,` topic · `,y.counts.part1,` câu P1 · `,y.counts.part2,` cue card P2 · `,y.counts.part3,` câu P3`]}),y.topics.map((e,t)=>(0,l.jsxs)(`div`,{style:{padding:`12px 0`,borderTop:t?`1px solid var(--border)`:`none`},children:[(0,l.jsxs)(`div`,{style:{fontWeight:700,fontSize:14},children:[e.topic,e.group&&(0,l.jsx)(`span`,{className:`badge badge-blue`,style:{marginLeft:8,fontSize:11},children:e.group}),!e.group&&(e.part2||e.part3?.length>0)&&(0,l.jsx)(`span`,{style:{marginLeft:8,fontSize:11,color:`var(--text3,#888)`,fontWeight:400},children:`chưa có group → nhóm "Khác"`})]}),(0,l.jsx)(f,{n:1,items:e.part1}),e.part2&&(0,l.jsxs)(`div`,{style:{marginTop:8},children:[(0,l.jsx)(`div`,{style:{fontSize:11,fontWeight:700,color:`var(--text3,#888)`,textTransform:`uppercase`,letterSpacing:`.05em`},children:`Part 2`}),(0,l.jsx)(`div`,{style:{fontSize:12.5,marginTop:4},children:e.part2.question}),e.part2.cueCard&&(0,l.jsx)(`pre`,{style:{fontSize:11.5,color:`var(--text2,#555)`,margin:`4px 0 0`,whiteSpace:`pre-wrap`,fontFamily:`inherit`},children:e.part2.cueCard})]}),(0,l.jsx)(f,{n:3,items:e.part3})]},t))]})]})}export{p as default};