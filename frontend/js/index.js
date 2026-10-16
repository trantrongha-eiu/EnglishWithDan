// index.html — EnglishWithDan – Luyện IELTS & Giao Tiếp Tiếng Anh
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';

/* ── Mobile menu ── */
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('ham-icon');
  const open = menu.classList.toggle('open');
  icon.className = open ? 'fas fa-times' : 'fas fa-bars';
}
const yrEl = document.getElementById('footer-year');
if (yrEl) yrEl.textContent = new Date().getFullYear();

/* ── Contact form submit ── */
async function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const msg = document.getElementById('form-msg');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
  msg.textContent = '';
  msg.className = '';

  const body = {
    name: document.getElementById('f-name').value.trim(),
    phone: document.getElementById('f-phone').value.trim(),
    email: document.getElementById('f-email').value.trim(),
    course: document.getElementById('f-course').value,
    message: document.getElementById('f-msg').value.trim(),
    hp_check: document.getElementById('f-hp').value
  };

  try {
    const res = await fetch(`${API}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      msg.textContent = '✅ ' + data.message;
      msg.className = 'success';
      document.getElementById('consultForm').reset();
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    msg.textContent = '❌ ' + (err.message || 'Lỗi gửi form, thử lại sau.');
    msg.className = 'error';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đăng ký tư vấn';
  }
}

/* ── Smooth active nav on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) cur = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--blue)' : '';
  });
}, { passive: true });

/* ── Courses — admin-editable via /api/courses (Courses.jsx), same
     data source and pattern as courses.html's loadCoursesFromAPI().
     STATIC_COURSES is only the offline/API-failure fallback — keep it
     in sync with backend/scripts/seedCourses.js's seed content. ── */
const STATIC_COURSES = [
  { title: 'IELTS Mất Gốc → 6.0+', subtitle: 'Học viên chưa có nền tảng', description: 'Bắt đầu từ phát âm, ngữ pháp cơ bản đến 4 kỹ năng IELTS. Lộ trình 6–8 tháng để đạt band 6.0 từ con số 0.', imageUrl: 'img/course-starter.jpg', placeholder: '🌱', level: 'Mất gốc', levelColor: 'red', duration: '6–8 tháng', classSize: 'Nhóm nhỏ ≤ 8 người', price: '7.200.000đ / giai đoạn 3 tháng · ưu đãi ĐK sớm 6.480.000đ' },
  { title: 'IELTS 3.0 → 6.0+', subtitle: 'Band 3.0–4.5', description: 'Củng cố ngữ pháp, mở rộng từ vựng học thuật, luyện kỹ năng thi theo chuẩn IDP/BC. Mục tiêu band 6.0–6.5.', imageUrl: 'img/course-3to6.jpg', placeholder: '📈', level: 'Cơ bản → Nâng cao', levelColor: 'blue', duration: '4–5 tháng', classSize: 'Nhóm nhỏ ≤ 8 người', price: '7.200.000đ / giai đoạn 3 tháng · ưu đãi ĐK sớm 6.480.000đ' },
  { title: 'IELTS 6.0 → 7.0+', subtitle: 'Band 5.5–6.5', description: 'Chuyên sâu Writing Task 2, Speaking Band 7, kỹ thuật Skimming/Scanning cho Reading và dự đoán Listening. Mục tiêu 7.0–7.5.', imageUrl: 'img/course-6to7.jpg', placeholder: '🚀', level: 'Nâng cao', levelColor: 'green', duration: '3–4 tháng', classSize: '1–1 hoặc nhóm nhỏ', price: '9.000.000đ / giai đoạn 3 tháng · ưu đãi ĐK sớm 8.100.000đ' },
  { title: 'IELTS Speaking Chuyên Sâu', subtitle: 'Học viên muốn đột phá Speaking', description: 'Phát âm chuẩn, fluency, từ vựng band 7+, chiến lược trả lời Part 1–3. Luyện mock test 1–1 với giáo viên.', imageUrl: 'img/course-speaking.jpg', placeholder: '🎤', level: 'Chuyên sâu', levelColor: 'purple', duration: '6–8 tuần', classSize: '1–1 hoặc nhóm 4', price: '300.000đ / giờ (lớp 1–1)' },
  { title: 'Giao Tiếp Tiếng Anh Cơ Bản', subtitle: 'Người mất gốc hoặc mới bắt đầu', description: 'Phát âm, hội thoại thực tế hàng ngày, tự tin giao tiếp với người nước ngoài. Không cần nền tảng trước.', imageUrl: 'img/course-comm.jpg', placeholder: '💬', level: 'Giao tiếp', levelColor: 'blue', duration: '3 tháng', classSize: 'Nhóm nhỏ ≤ 10', price: '990.000đ / tháng' },
  { title: 'Tiếng Anh Giao Tiếp Văn Phòng', subtitle: 'Người đi làm, dân văn phòng', description: 'Email chuyên nghiệp, meeting, thuyết trình, đàm phán bằng tiếng Anh. Từ vựng Business English thực chiến.', imageUrl: 'img/course-business.jpg', placeholder: '💼', level: 'Business', levelColor: 'green', duration: '2–3 tháng', classSize: 'Nhóm hoặc 1–1', price: 'Liên hệ tư vấn' },
];
const COURSE_CIRCLE_BG = { red: 'rgba(220,38,38,.13)', blue: 'rgba(37,99,235,.13)', green: 'rgba(22,163,74,.13)', purple: 'rgba(124,58,237,.13)' };

function buildCourseCard(c) {
  // Course content is admin/teacher-editable and this is a public page —
  // every field must be escaped before reaching innerHTML (same rule
  // courses.html's buildCourseCard() already follows).
  const title       = escHtml(c.title || '');
  const subtitle    = escHtml(c.subtitle || '');
  const description = escHtml(c.description || '');
  const duration    = escHtml(c.duration || '');
  const classSize   = escHtml(c.classSize || '');
  const level       = escHtml(c.level || '');
  const placeholder = escHtml(c.placeholder || '📚');
  const imageUrl    = escHtml(c.imageUrl || '');
  const price       = escHtml(c.price || 'Liên hệ tư vấn');
  const lvClass     = 'lv-' + (['red', 'blue', 'green', 'purple'].includes(c.levelColor) ? c.levelColor : 'blue');
  const circleBg    = COURSE_CIRCLE_BG[c.levelColor] || COURSE_CIRCLE_BG.blue;
  return `<div class="course-card">
        <div class="course-thumb">
          ${c.imageUrl ? `<img src="${imageUrl}" alt="${title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>` : ''}
          <span class="course-placeholder" style="${c.imageUrl ? 'display:none' : 'display:flex'}"><span style="display:inline-flex;align-items:center;justify-content:center;width:88px;height:88px;border-radius:22px;background:${circleBg};font-size:40px;">${placeholder}</span></span>
          <span class="course-level ${lvClass}">${level}</span>
        </div>
        <div class="course-body">
          <h3>${title}</h3>
          <div class="course-target">Dành cho: ${subtitle}</div>
          <p>${description}</p>
          <div class="course-meta">
            ${c.duration ? `<span><i class="fas fa-clock"></i> ${duration}</span>` : ''}
            ${c.classSize ? `<span><i class="fas fa-users"></i> ${classSize}</span>` : ''}
          </div>
          <div class="course-price">${price}</div>
          <div class="course-cta">
            <a href="#contact" class="btn btn-primary" style="width:100%;justify-content:center">Tư vấn ngay</a>
          </div>
        </div>
      </div>`;
}

async function loadCoursesFromAPI() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  let list = STATIC_COURSES;
  try {
    const res = await fetch(`${API}/courses`);
    const data = await res.json();
    if (data.success && data.courses && data.courses.length > 0) list = data.courses;
  } catch {}
  grid.innerHTML = list.map(buildCourseCard).join('');
}
loadCoursesFromAPI();

/* ── Student result lightbox ── */
function openResultLightbox(src, caption) {
  const box = document.getElementById('result-lightbox');
  document.getElementById('result-lightbox-img').src = src;
  document.getElementById('result-lightbox-caption').textContent = caption || '';
  box.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeResultLightbox() {
  document.getElementById('result-lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeResultLightbox();
});
