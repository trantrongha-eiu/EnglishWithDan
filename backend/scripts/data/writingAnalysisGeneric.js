'use strict';

// Generic "Phân tích đề" (analysisSections) builder for Writing Task 1 & 2
// tasks that have no hand-written analysis. Produces the 4-section breakdown
// the frontend already renders (writing.js "Phân tích đề" toggle):
// dạng bài + cách làm, từ khóa cần paraphrase, GỢI Ý CHIA 2 THÂN BÀI,
// ngôn ngữ + mẫu kết bài. A per-_id `override` supplies the specific body
// split for a given prompt; without one, a type-generic split is used.

// ── Task 2 ──────────────────────────────────────────────────────────────
const T2_TYPE = {
  cause_solution: {
    label: 'Cause & Solution (Nguyên nhân – Giải pháp)',
    req: 'Thân bài 1 nêu 2 nguyên nhân chính; thân bài 2 nêu 2 giải pháp, mỗi giải pháp khớp trực tiếp với một nguyên nhân đã nêu.',
    b1: 'Nguyên nhân — 2 ý mạnh nhất; mỗi ý: câu chủ đề → giải thích cơ chế → hệ quả/ví dụ ngắn.',
    b2: 'Giải pháp — 2 biện pháp cụ thể (AI làm, LÀM GÌ); nói rõ nó xử lý nguyên nhân nào và vì sao khả thi.',
  },
  effect_solution: {
    label: 'Effect & Solution (Hệ quả – Giải pháp)',
    req: 'Thân bài 1 nêu 2 hệ quả (tác động); thân bài 2 nêu 2 giải pháp — thường của chính phủ / doanh nghiệp.',
    b1: 'Hệ quả — chia theo đối tượng chịu tác động (cá nhân / xã hội / kinh tế); mỗi ý có giải thích + ví dụ.',
    b2: 'Giải pháp — 2 biện pháp cụ thể, gắn với hệ quả vừa nêu; nêu ai thực hiện và cơ chế tác động.',
  },
  cause_effect: {
    label: 'Cause & Effect (Nguyên nhân – Hệ quả)',
    req: 'Thân bài 1 nêu nguyên nhân; thân bài 2 nêu hệ quả. Không đề xuất giải pháp trừ khi đề hỏi.',
    b1: 'Nguyên nhân — 2 ý chính, mỗi ý giải thích rõ vì sao dẫn tới hiện tượng.',
    b2: 'Hệ quả — chia theo đối tượng (cá nhân / xã hội); nêu tác động cụ thể + ví dụ.',
  },
  agree_disagree: {
    label: 'Agree or Disagree (Đồng ý / Không đồng ý)',
    req: 'Chọn RÕ một lập trường ở mở bài và giữ nhất quán. Nêu 2 lý do bảo vệ lập trường; có thể dành 1 đoạn cho ý phản biện rồi bác lại.',
    b1: 'Lý do 1 ủng hộ lập trường của bạn — luận điểm + giải thích + ví dụ.',
    b2: 'Lý do 2 (hoặc: nêu ý phản biện phổ biến rồi phản bác nó) — kết đoạn khẳng định lại lập trường.',
  },
  discuss_both_views: {
    label: 'Discuss Both Views (Thảo luận hai quan điểm + nêu ý kiến)',
    req: 'Trình bày công bằng cả hai quan điểm — mỗi quan điểm 1 thân bài — rồi nêu ý kiến RIÊNG (ở kết bài hoặc câu cuối thân bài 2).',
    b1: 'Quan điểm 1 — trình bày như thể bạn ủng hộ nó: lý do mạnh nhất + ví dụ.',
    b2: 'Quan điểm 2 — tương tự; câu cuối/kết bài nêu rõ bạn nghiêng về bên nào và VÌ SAO.',
  },
  advantages_disadvantages: {
    label: 'Advantages & Disadvantages (Lợi ích – Bất lợi)',
    req: 'Phân tích CÂN BẰNG. Nếu đề hỏi "outweigh / benefits greater than drawbacks" thì bắt buộc chốt bên nào nặng hơn ở kết bài.',
    b1: 'Lợi ích — 1–2 ý mạnh nhất, có giải thích + ví dụ.',
    b2: 'Bất lợi — 1–2 ý; nếu đề hỏi "outweigh" thì câu cuối cân đo và chốt.',
  },
  positive_or_negative_development: {
    label: 'Positive or Negative Development (Tích cực hay tiêu cực)',
    req: 'Nêu rõ đánh giá tổng thể ở mở bài. Thường 1 đoạn mặt tích cực, 1 đoạn mặt tiêu cực, rồi chốt "on balance...".',
    b1: 'Mặt tích cực của xu hướng — 1–2 ý + ví dụ.',
    b2: 'Mặt tiêu cực — 1–2 ý; câu cuối cân nhắc và chốt tích cực hay tiêu cực hơn.',
  },
};

function inferTask2Type(prompt) {
  const s = (prompt || '').toLowerCase();
  if (/discuss both view|both these view|discuss both this|consider both (viewpoint|argument)/.test(s)) return 'discuss_both_views';
  if (/positive or negative development|positive or a negative|beneficial or harmful/.test(s)) return 'positive_or_negative_development';
  if (/advantages and disadvantages|advantages outweigh|benefits.*outweigh|benefits.*greater than the drawbacks|do the advantages/.test(s)) return 'advantages_disadvantages';
  if (/agree or disagree|to what extent do you agree|do you agree with (this|the)/.test(s)) return 'agree_disagree';
  const cause = /causes?|reasons?|why (is|are|do|does|has|have)|what (are|is) the (main )?(causes?|reasons?)/.test(s);
  const solution = /solutions?|measures?|steps?|what can be done|what should be done|how can .*(be )?(solved|addressed|reduced|improved|tackled|prevented)|what .* can .*(do|implement)/.test(s);
  const effect = /effects?|impacts?|consequences?|how does this affect|what effect/.test(s);
  if (cause && solution) return 'cause_solution';
  if (effect && solution) return 'effect_solution';
  if (cause && effect) return 'cause_effect';
  if (solution || effect) return 'effect_solution';
  return 'discuss_both_views';
}

function firstStatement(prompt) {
  const clean = (prompt || '').replace(/\s+/g, ' ').trim();
  const m = clean.match(/^(.*?[.!?])\s/);
  return (m ? m[1] : clean).slice(0, 240);
}

function buildTask2Analysis(prompt, override = {}) {
  const type = override.type || inferTask2Type(prompt);
  const g = T2_TYPE[type] || T2_TYPE.discuss_both_views;
  return [
    {
      title: '1. Dạng bài & cách làm',
      content:
        `Dạng: ${g.label}.\n${g.req}\n` +
        `Bố cục 4 đoạn (~250–280 từ, ~40 phút): Mở bài (paraphrase đề + nêu lập trường/định hướng) → Thân bài 1 → Thân bài 2 → Kết bài (tóm 2 luận điểm chính, KHÔNG thêm ý mới).`,
    },
    {
      title: '2. Từ khóa trong đề cần paraphrase',
      content: `Câu cần viết lại ở mở bài:\n"${firstStatement(prompt)}"\n→ Đổi sang cách diễn đạt khác (đồng nghĩa, đổi cấu trúc); KHÔNG chép nguyên đề.`,
    },
    {
      title: '3. Gợi ý chia 2 thân bài',
      content:
        `THÂN BÀI 1 — ${override.b1 || g.b1}\n\n` +
        `THÂN BÀI 2 — ${override.b2 || g.b2}\n\n` +
        `Mỗi thân bài: 1 câu chủ đề → giải thích → 1 ví dụ cụ thể (số liệu / quốc gia / nghiên cứu có thật) → 1 câu chốt.`,
    },
    {
      title: '4. Ngôn ngữ & mẫu kết bài',
      content:
        `Cụm nối: Firstly / Secondly / For example / As a result / To address this / However / On balance / In contrast.\n` +
        `Mẫu kết bài: "In conclusion, + [tóm tắt 2 luận điểm chính] + [khẳng định lại quan điểm / đánh giá tổng thể]."`,
    },
  ];
}

// ── Task 1 ──────────────────────────────────────────────────────────────
function inferTask1Kind(prompt) {
  const s = (prompt || '').toLowerCase();
  if (/\bmaps?\b|\bplans?\b/.test(s) && !/planning/.test(s)) return 'map';
  if (/process|life ?cycle|how .* (is|are) (made|produced|manufactured)|stages|diagram .* (below|shows).*(process|cycle)/.test(s)) return 'process';
  const kinds = [];
  if (/line graphs?|\bgraphs?\b/.test(s)) kinds.push('đường (line graph)');
  if (/bar charts?|\bbars?\b/.test(s)) kinds.push('cột (bar chart)');
  if (/pie charts?|\bpie\b/.test(s)) kinds.push('tròn (pie chart)');
  if (/\btables?\b/.test(s)) kinds.push('bảng (table)');
  if (kinds.length >= 2) return 'mixed:' + kinds.join(' + ');
  return kinds[0] || 'biểu đồ';
}

function buildTask1Analysis(prompt, override = {}) {
  const kind = override.kind || inferTask1Kind(prompt);
  const dynamic = /\bover (the )?(period|years?|time)|from \d{4}|between \d{4}|\bin \d{4}\b|per (year|month|decade)|monthly|annual|trend/.test((prompt || '').toLowerCase());
  const isMapProcess = kind === 'map' || kind === 'process';
  return [
    {
      title: '1. Dạng bài & cách làm',
      content:
        (isMapProcess
          ? `Dạng: ${kind === 'map' ? 'MAP (bản đồ) — mô tả các thay đổi/khác biệt theo không gian.' : 'PROCESS (quy trình) — mô tả các bước theo trình tự.'}\n`
          : `Loại biểu đồ: ${kind}.\n${dynamic ? 'Có mốc thời gian → mô tả XU HƯỚNG (tăng/giảm/ổn định), dùng thì quá khứ/hiện tại tùy đề.' : 'Không có mốc thời gian → SO SÁNH giữa các hạng mục tại một thời điểm.'}\n`) +
        `Bố cục 4 đoạn (~160–190 từ, ~20 phút): Mở bài (paraphrase đề) → Overview → Thân bài 1 → Thân bài 2. KHÔNG nêu ý kiến cá nhân, KHÔNG giải thích nguyên nhân.`,
    },
    {
      title: '2. Overview (đoạn quan trọng nhất)',
      content:
        `2–3 câu nêu ĐẶC ĐIỂM NỔI BẬT NHẤT, KHÔNG kèm số liệu:\n` +
        (isMapProcess
          ? (kind === 'map'
            ? `• Nhìn tổng thể khu vực thay đổi nhiều hay ít; những công trình chính được thêm/bỏ/dời.\n• Xu hướng chung: đô thị hóa hơn / xanh hơn / hiện đại hơn...`
            : `• Tổng số bước; quy trình tự nhiên hay nhân tạo; có tuần hoàn (cyclical) hay tuyến tính (linear); điểm bắt đầu và kết thúc.`)
          : `• Hạng mục/đối tượng cao nhất và thấp nhất tổng thể.\n• ${dynamic ? 'Xu hướng chung: đa số tăng hay giảm; thay đổi mạnh nhất ở đâu.' : 'Chênh lệch lớn nhất giữa các nhóm; nhóm nào áp đảo.'}`),
    },
    {
      title: '3. Gợi ý chia 2 thân bài',
      content:
        `THÂN BÀI 1 — ${override.b1 || (isMapProcess
          ? (kind === 'map' ? 'Nửa bản đồ / nhóm thay đổi thứ nhất (vd khu dân cư, hoặc phần phía Bắc): mô tả cái gì được thêm/bỏ, ở vị trí nào.' : 'Nhóm bước đầu (mở đầu → giữa quy trình): dùng "First, ... Next, ... After that, ...".')
          : (dynamic ? 'Nhóm 1–2 đối tượng có xu hướng GIỐNG nhau (vd cùng tăng): mô tả điểm đầu, điểm cuối, mốc thay đổi, kèm số liệu.' : 'Nhóm hạng mục LỚN / chiếm tỉ trọng cao: xếp từ cao xuống thấp, kèm số liệu và so sánh.'))}\n\n` +
        `THÂN BÀI 2 — ${override.b2 || (isMapProcess
          ? (kind === 'map' ? 'Phần bản đồ / nhóm thay đổi còn lại; nêu thêm điểm giữ nguyên (unchanged).' : 'Nhóm bước cuối (giữa → kết thúc); nếu cyclical thì nối lại điểm đầu.')
          : (dynamic ? 'Các đối tượng còn lại (xu hướng KHÁC: giảm / dao động / ổn định); so sánh chéo với nhóm ở thân bài 1.' : 'Nhóm hạng mục NHỎ / tỉ trọng thấp; hoặc: đối tượng thứ hai nếu đề có 2 biểu đồ — so sánh chéo hai biểu đồ, chỉ ra chỗ LỆCH.'))}\n\n` +
        `Mỗi thân bài: nhóm dữ liệu hợp lý, luôn kèm số liệu cụ thể và ít nhất 1 phép so sánh.`,
    },
    {
      title: '4. Ngôn ngữ mô tả',
      content:
        (isMapProcess
          ? `Bị động + vị trí: "A new car park was built in the north-east.", "The forest was replaced by housing.", "is located / lies to the west of...".\nTrình tự (process): First / Then / Subsequently / Once ... / Finally.`
          : `Xu hướng: rose / fell / increased sharply / declined gradually / remained stable / peaked at / dipped to.\nSo sánh: twice as high as / slightly more than / the highest figure / compared with / whereas.\nĐừng lặp "increase" — đổi: climb, surge, grow, go up.`),
    },
  ];
}

module.exports = { inferTask2Type, buildTask2Analysis, inferTask1Kind, buildTask1Analysis };
