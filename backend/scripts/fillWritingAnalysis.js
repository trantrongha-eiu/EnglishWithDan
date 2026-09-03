/**
 * fillWritingAnalysis.js — give every ACTIVE Writing Task 1 / Task 2 task
 * that has no "Phân tích đề" an analysisSections block: dạng bài + cách
 * làm, từ khóa cần paraphrase, GỢI Ý CHIA 2 THÂN BÀI, ngôn ngữ + mẫu kết
 * bài (see scripts/data/writingAnalysisGeneric.js). A per-_id OVERRIDE
 * below supplies the specific Body 1 / Body 2 split for known prompts;
 * others fall back to a type-generic split.
 *
 *   node backend/scripts/fillWritingAnalysis.js           # dry run
 *   node backend/scripts/fillWritingAnalysis.js --apply   # write
 *
 * Only fills tasks where analysisSections is empty — never overwrites an
 * existing (hand-written) analysis. Scoped updateOne by _id.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const WritingTask1 = require('../models/WritingTask1');
const WritingTask2 = require('../models/WritingTask2');
const { buildTask1Analysis, buildTask2Analysis } = require('./data/writingAnalysisGeneric');

const APPLY = process.argv.includes('--apply');
const has = (a) => Array.isArray(a) && a.some((s) => (s.content || '').trim());

// Per-_id specific body split (keyed by WritingTask1/2 _id). `type` forces
// the Task 2 essay type when the heuristic would get it wrong.
const OVERRIDE = {
  // ── Task 1 ──
  '6a8e5b9dbc78d7b28ea1d9df': { kind: 'tròn (pie chart) × 2',
    b1: 'Biểu đồ 1 — cơ cấu SỬ DỤNG NĂNG LƯỢNG trong hộ gia đình: xếp các hạng mục từ tỉ trọng cao xuống thấp (vd sưởi, đun nước nóng, thiết bị...), kèm % và so sánh.',
    b2: 'Biểu đồ 2 — cơ cấu PHÁT THẢI KHÍ NHÀ KÍNH: nhấn mạnh chỗ tỉ trọng LỆCH so với biểu đồ 1 (hạng mục dùng nhiều năng lượng nhưng phát thải ít, hoặc ngược lại).' },
  '6a991c890bed325d94ba2030': { kind: 'mixed: đường (line graph) + bảng (table)',
    b1: 'NHIỆT ĐỘ trung bình theo tháng của 3 thành phố (line graph): mô tả hình dạng đường — đỉnh/đáy vào tháng nào, biên độ dao động, thành phố nào ấm nhất / lạnh nhất.',
    b2: 'SỐ GIỜ NẮNG trung bình cả năm (bảng): so sánh 3 thành phố, chỉ ra chênh lệch lớn nhất; liên hệ (nếu có) giữa thành phố nhiều nắng và thành phố ấm.' },
  '6a991cf50bed325d94ba2031': { kind: 'mixed: đường (line graph) + cột (bar chart)',
    b1: 'XU HƯỚNG số lượt đi/đến UK theo thời gian: tăng hay giảm, giai đoạn thay đổi mạnh nhất, chênh lệch giữa lượt đến (inbound) và lượt đi (outbound).',
    b2: 'CÁC NƯỚC ĐIỂM ĐẾN phổ biến nhất của người UK (bar chart): xếp hạng, nước dẫn đầu, khoảng cách giữa các nước top đầu.' },

  // ── Task 2 (work-themed cluster + 1 discuss-both-views) ──
  '6a8e8a43756b6bc7a0ce2397': { type: 'cause_solution',
    b1: 'Nguyên nhân: công việc văn phòng ngồi lâu trước màn hình; đô thị thiếu vỉa hè / công viên / làn xe đạp an toàn; phụ thuộc xe cá nhân và giải trí thụ động tại nhà.',
    b2: 'Giải pháp: quy hoạch ưu tiên đi bộ & xe đạp; doanh nghiệp bố trí giờ nghỉ vận động, bàn đứng, ưu đãi phòng gym; truyền thông về mục tiêu WHO 150 phút/tuần.' },
  '6a910c61fd0973a6cd2b3a06': { type: 'cause_solution',
    b1: 'Nguyên nhân: chi phí sinh hoạt (nhất là nhà ở) tăng nhanh hơn lương; văn hóa coi trọng làm thêm giờ; bất ổn việc làm khiến người lao động không dám từ chối.',
    b2: 'Giải pháp: luật giới hạn giờ làm & lương tối thiểu đủ sống; nhà nước hỗ trợ nhà ở và chi phí chăm trẻ; doanh nghiệp cho làm linh hoạt / 4 ngày/tuần.' },
  '6a910c6bfd0973a6cd2b3a07': { type: 'cause_solution',
    b1: 'Nguyên nhân: định kiến tuổi tác trong tuyển dụng; kỹ năng số bị cho là lạc hậu; kỳ vọng lương cao hơn ứng viên trẻ.',
    b2: 'Giải pháp: luật chống phân biệt tuổi & tuyển dụng ẩn danh; chương trình đào tạo lại kỹ năng cho lao động lớn tuổi; ưu đãi thuế cho công ty tuyển họ.' },
  '6a910c76fd0973a6cd2b3a08': { type: 'cause_solution',
    b1: 'Nguyên nhân: việc làm tập trung ở đô thị lớn; lương và cơ hội thăng tiến chênh lệch vùng miền; nhiều ngành chuyên biệt chỉ có ở vài thành phố.',
    b2: 'Giảm tác động tiêu cực: hỗ trợ chi phí đi lại / về thăm nhà; phát triển kinh tế vùng để tạo việc tại chỗ; công ty cho làm từ xa hoặc về nhà định kỳ.' },
  '6a910c82fd0973a6cd2b3a09': { type: 'cause_solution',
    b1: 'Nguyên nhân: gánh nặng chăm sóc gia đình phân bổ không đều; thiếu hình mẫu và mạng lưới cố vấn nữ; thiên kiến vô thức khi tuyển dụng / thăng chức.',
    b2: 'Giải pháp: nghỉ thai sản chia sẻ và hỗ trợ chăm trẻ; đặt mục tiêu & minh bạch tỉ lệ nữ lãnh đạo; đào tạo về thiên kiến, chương trình cố vấn cho nữ nhân sự tiềm năng.' },
  '6a910c8efd0973a6cd2b3a0a': { type: 'cause_solution',
    b1: 'Nguyên nhân thất nghiệp ở cử nhân: chương trình đại học nặng lý thuyết, lệch nhu cầu thị trường; quá nhiều cử nhân cùng ngành; thiếu kinh nghiệm và kỹ năng mềm.',
    b2: 'Cách sinh viên tăng cơ hội: thực tập & dự án thực tế từ sớm; bổ sung kỹ năng số / ngoại ngữ; xây portfolio và mạng lưới nghề nghiệp; cân nhắc ngành đang thiếu nhân lực.' },
  '6a910c98fd0973a6cd2b3a0b': { type: 'effect_solution',
    b1: 'Hệ quả: với CÁ NHÂN — kiệt sức, lo âu/trầm cảm, sức khỏe thể chất suy giảm; với CÔNG TY — năng suất giảm, nghỉ việc nhiều, chi phí tuyển và đào tạo lại tăng.',
    b2: 'Giải pháp: giới hạn giờ làm và "quyền ngắt kết nối"; doanh nghiệp có chương trình sức khỏe tinh thần và khối lượng việc hợp lý; nhà nước quy định và giám sát.' },
  '6a910cb4fd0973a6cd2b3a0c': { type: 'effect_solution',
    b1: 'Tác động: với NHÂN VIÊN — tiết kiệm thời gian đi lại, linh hoạt, nhưng dễ cô lập và khó tách việc khỏi đời sống; với VĂN HÓA CÔNG TY — khó gắn kết, khó đào tạo nhân viên mới, giao tiếp nội bộ yếu đi.',
    b2: 'Khắc phục nhược điểm: lịch lên văn phòng chung vài buổi mỗi tuần (hybrid); công cụ và quy tắc giao tiếp rõ ràng; hoạt động gắn kết định kỳ; hỗ trợ thiết bị và sức khỏe tinh thần.' },
  '6a9313479ca5a616963131a1': { type: 'discuss_both_views',
    b1: 'Quan điểm ỦNG HỘ tài trợ: thư viện là không gian học tập miễn phí, hỗ trợ người không có internet, trẻ em, người tìm việc; bảo tồn văn hóa và gắn kết cộng đồng.',
    b2: 'Quan điểm PHẢN ĐỐI: ngân sách hạn hẹp nên ưu tiên y tế / giáo dục; thông tin đã sẵn trên mạng; thư viện có thể tự huy động tài trợ. Câu cuối: nêu ý kiến riêng của bạn.' },
};

const cleanPrompt = (p) => (p || '').replace(/\s*Chế độ\s*$/i, '').trim();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let filled = 0, promptFix = 0;

  for (const [tag, Model, build] of [
    ['Task1', WritingTask1, buildTask1Analysis],
    ['Task2', WritingTask2, buildTask2Analysis],
  ]) {
    const docs = await Model.find({ isActive: true }).select('prompt analysisSections').lean();
    for (const d of docs) {
      const fixedPrompt = cleanPrompt(d.prompt);
      const set = {};
      if (fixedPrompt !== (d.prompt || '')) { set.prompt = fixedPrompt; promptFix++; }
      if (!has(d.analysisSections)) {
        set.analysisSections = build(fixedPrompt, OVERRIDE[String(d._id)] || {});
        filled++;
      }
      if (!Object.keys(set).length) continue;
      console.log(`${APPLY ? 'WRITE' : 'PLAN '}  ${tag} ${d._id}` +
        `${set.prompt ? ' [prompt cleaned]' : ''}${set.analysisSections ? ' [+analysis: ' + (OVERRIDE[String(d._id)] ? 'specific' : 'generic') + ']' : ''}` +
        `  "${fixedPrompt.replace(/\s+/g, ' ').slice(0, 70)}..."`);
      if (APPLY) await Model.updateOne({ _id: d._id }, { $set: set });
    }
  }

  console.log(`\n${APPLY ? 'Applied' : 'Dry run'} — analysis filled: ${filled} | prompts cleaned: ${promptFix}`);
  if (!APPLY) console.log('Re-run with --apply to write.');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
