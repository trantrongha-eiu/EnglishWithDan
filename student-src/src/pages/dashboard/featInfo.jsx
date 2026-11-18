// "Feature chip" popups on the welcome screen — same text as FEAT_INFO in
// frontend/js/dashboard.js.
export const FEAT_INFO = {
  'bulk-import': {
    icon: 'fa-file-import',
    title: 'Nhập hàng loạt',
    body: <>Dán danh sách từ (định dạng <code>word: nghĩa</code>) — hệ thống tự tra ví dụ và phát âm từ từ điển, thêm vào sổ chỉ một click.</>,
  },
  streak: {
    icon: 'fa-fire-alt',
    title: 'Cách tính lửa 🔥',
    wide: true,
    body: (
      <div className="flame-rules">
        <p>Mỗi <b>phiên luyện tập</b> được cộng 🔥 theo tỉ lệ làm đúng. Tối đa <b>10 🔥/ngày</b>, tính chung cho mọi kỹ năng.</p>
        <table className="flame-rules-table">
          <thead><tr><th>Bài luyện</th><th>+1 🔥</th><th>+2 🔥</th><th>+3 🔥</th></tr></thead>
          <tbody>
            <tr><td><b>Từ vựng</b><small>Sổ từ, Paraphrase, Vocab Topics</small></td><td>≥ 70%</td><td>≥ 80%</td><td>≥ 90%</td></tr>
            <tr><td><b>Reading / Listening</b><small>Đề full và bài lẻ</small></td><td>≥ 50%</td><td>≥ 70%</td><td>≥ 90%</td></tr>
            <tr><td><b>Bài luyện khác</b><small>Gap-fill, Dictation, Shadowing, Essential Grammar, Advanced Sentences, luyện Writing Task 1/2</small></td><td>≥ 70%</td><td>≥ 90%</td><td>—</td></tr>
            <tr><td><b>Writing (bài luận)</b><small>Task 1 từ 100 từ, Task 2 từ 150 từ</small></td><td>—</td><td>1 task</td><td>2 task</td></tr>
            <tr><td><b>Speaking</b><small>Mỗi câu trả lời được AI chấm</small></td><td>✔</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
        <ul>
          <li>Từ vựng chỉ bắt đầu tính 🔥 khi hôm nay bạn đã học đủ <b>số từ mục tiêu</b> (35–80 từ, theo band mục tiêu).</li>
          <li>Làm lại <b>cùng một bài</b> trong ngày chỉ được cộng thêm phần chênh lệch nếu đạt mốc cao hơn.</li>
          <li>Làm dưới mốc vẫn được tính là <b>có học hôm nay</b> — chuỗi không bị mất.</li>
          <li>Đã đập <b>Búa Hi Vọng</b>: mọi 🔥 kiếm được trong ngày ×2.</li>
          <li>Bỏ học trọn 1 ngày sẽ mất streak (trừ khi có <b>Khiên Băng</b>).</li>
        </ul>
      </div>
    ),
  },
  paraphrase: {
    icon: 'fa-book-open',
    title: 'Cụm từ Paraphrase Cambridge',
    body: <>Học các cụm paraphrase thường gặp trong bộ đề <strong>Cambridge IELTS 15–20</strong> — từ vựng huyền thoại xuất hiện trực tiếp trong đề thi thật. Chọn Paraphrase Unit ở sidebar để bắt đầu!</>,
  },
  hammer: {
    icon: 'fa-hammer',
    title: 'Búa Daniel',
    body: <>Học trọn 1 Paraphrase Unit đúng <strong>≥ 90%</strong> để nhận <strong>1 búa Daniel</strong> (mỗi unit chỉ 1 lần). Nếu lỡ bỏ học và mất streak, dùng búa trong vòng <strong>3 ngày</strong> để khôi phục lại đúng số ngày đã mất!</>,
  },
};
