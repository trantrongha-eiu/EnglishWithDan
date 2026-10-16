// courses.html — Khóa Học
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
const LEVEL_COLOR = { red: 'lv-red', blue: 'lv-blue', green: 'lv-green', purple: 'lv-purple' };
const yrEl = document.getElementById('footer-year');
if (yrEl) yrEl.textContent = new Date().getFullYear();

/* ── Static fallback courses (used when API returns empty or fails) ── */
const STATIC_COURSES = [
  { title: 'IELTS Mất Gốc → 6.0+', subtitle: 'Học viên chưa có nền tảng', description: 'Bắt đầu từ phát âm, ngữ pháp cơ bản đến 4 kỹ năng IELTS. Lộ trình 6–8 tháng để đạt band 6.0 từ con số 0.', price: '7.200.000đ / giai đoạn 3 tháng · ưu đãi ĐK sớm 6.480.000đ', imageUrl: 'img/course-starter.jpg', placeholder: '🌱', category: 'ielts', level: 'Mất gốc', levelColor: 'red', duration: '6–8 tháng', classSize: 'Nhóm ≤ 8 người', isActive: true },
  { title: 'IELTS 3.0 → 6.0+', subtitle: 'Band 3.0–4.5', description: 'Củng cố ngữ pháp, mở rộng từ vựng học thuật, luyện kỹ năng thi theo chuẩn IDP/BC. Mục tiêu band 6.0–6.5.', price: '7.200.000đ / giai đoạn 3 tháng · ưu đãi ĐK sớm 6.480.000đ', imageUrl: 'img/course-3to6.jpg', placeholder: '📈', category: 'ielts', level: 'Cơ bản → Nâng cao', levelColor: 'blue', duration: '4–5 tháng', classSize: 'Nhóm ≤ 8 người', isActive: true },
  { title: 'IELTS 6.0 → 7.0+', subtitle: 'Band 5.5–6.5', description: 'Chuyên sâu Writing Task 2, Speaking Band 7, kỹ thuật Skimming/Scanning cho Reading và dự đoán Listening. Mục tiêu 7.0–7.5.', price: '9.000.000đ / giai đoạn 3 tháng · ưu đãi ĐK sớm 8.100.000đ', imageUrl: 'img/course-6to7.jpg', placeholder: '🚀', category: 'ielts', level: 'Nâng cao', levelColor: 'green', duration: '3–4 tháng', classSize: '1–1 hoặc nhóm nhỏ', isActive: true },
  { title: 'IELTS Speaking Chuyên Sâu', subtitle: 'Học viên muốn đột phá Speaking', description: 'Phát âm chuẩn, fluency, từ vựng band 7+, chiến lược trả lời Part 1–3. Luyện mock test 1–1 với giáo viên.', price: '300.000đ / giờ (lớp 1–1)', imageUrl: 'img/course-speaking.jpg', placeholder: '🎤', category: 'speaking ielts', level: 'Speaking chuyên sâu', levelColor: 'purple', duration: '6–8 tuần', classSize: '1–1 hoặc nhóm 4', isActive: true },
  { title: 'Giao Tiếp Tiếng Anh Cơ Bản', subtitle: 'Người mất gốc hoặc mới bắt đầu', description: 'Phát âm, hội thoại thực tế hàng ngày, tự tin giao tiếp với người nước ngoài. Không cần nền tảng trước.', price: '990.000đ / tháng', imageUrl: 'img/course-comm.jpg', placeholder: '💬', category: 'comm', level: 'Giao tiếp', levelColor: 'blue', duration: '3 tháng', classSize: 'Nhóm ≤ 10', isActive: true },
  { title: 'Tiếng Anh Giao Tiếp Văn Phòng', subtitle: 'Người đi làm, dân văn phòng', description: 'Email chuyên nghiệp, meeting, thuyết trình, đàm phán bằng tiếng Anh. Từ vựng Business English thực chiến.', price: 'Liên hệ tư vấn', imageUrl: 'img/course-business.jpg', placeholder: '💼', category: 'comm', level: 'Business', levelColor: 'green', duration: '2–3 tháng', classSize: 'Nhóm hoặc 1–1', isActive: true },
];

function buildCourseCard(c) {
  const lvClass = LEVEL_COLOR[c.levelColor] || 'lv-blue';
  // Course content is admin/teacher-editable and this page is public —
  // every field must be escaped before reaching innerHTML (security audit finding).
  const category = escHtml(c.category || '');
  const imageUrl = escHtml(c.imageUrl || '');
  const title = escHtml(c.title || '');
  const placeholder = escHtml(c.placeholder || '📚');
  const level = escHtml(c.level || '');
  const subtitle = escHtml(c.subtitle || '');
  const description = escHtml(c.description || '');
  const duration = escHtml(c.duration || '');
  const classSize = escHtml(c.classSize || '');
  const price = escHtml(c.price || 'Liên hệ tư vấn');
  return `<div class="course-card" data-category="${category}">
    <div class="course-thumb">
      ${c.imageUrl ? `<img src="${imageUrl}" alt="${title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>` : ''}
      <span class="course-placeholder" style="${c.imageUrl ? 'display:none' : ''}">${placeholder}</span>
      <span class="course-level ${lvClass}">${level}</span>
    </div>
    <div class="course-body">
      <h3>${title}</h3>
      <div class="course-target">Dành cho: ${subtitle}</div>
      <p>${description}</p>
      <div class="course-meta">
        ${c.duration ? `<span><i class="fas fa-clock"></i> ${duration}</span>` : ''}
        ${c.classSize ? `<span><i class="fas fa-users"></i> ${classSize}</span>` : ''}
        <span><i class="fas fa-chalkboard-teacher"></i> Thầy Daniel</span>
      </div>
      <div class="course-price">${price}</div>
      <div class="course-cta">
        <a href="contact.html?course=${encodeURIComponent(c.title || '')}" class="btn btn-primary"><i class="fas fa-phone-alt"></i> Tư vấn ngay</a>
        <a href="https://zalo.me/0914769618" target="_blank" class="btn btn-outline">Zalo</a>
      </div>
    </div>
  </div>`;
}

let _courses = [];

async function loadCoursesFromAPI() {
  const grid = document.getElementById('courses-grid');
  const tag = document.getElementById('course-count-tag');
  try {
    const res = await fetch(`${API}/courses`);
    const data = await res.json();
    if (data.success && data.courses.length > 0) {
      _courses = data.courses;
    } else {
      _courses = STATIC_COURSES;
    }
  } catch {
    _courses = STATIC_COURSES;
  }
  grid.innerHTML = _courses.map(buildCourseCard).join('');
  tag.textContent = `${_courses.length} Khóa học`;
  grid.style.display = '';
  initFilter();
}

function initFilter() {
  document.querySelectorAll('.subnav-list a').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.subnav-list a').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      let visible = 0;
      document.querySelectorAll('.course-card').forEach(card => {
        const cats = card.dataset.category || '';
        const show = filter === 'all' || cats.includes(filter);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      document.getElementById('no-results').style.display = visible === 0 ? 'block' : 'none';
    });
  });
}

/* ── Mobile menu ── */
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('ham-icon');
  const open = menu.classList.toggle('open');
  icon.className = open ? 'fas fa-times' : 'fas fa-bars';
}

loadCoursesFromAPI();
