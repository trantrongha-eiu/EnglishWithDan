(function () {
  'use strict';
  var API = 'https://englishwithdan.onrender.com/api';

  var css = document.createElement('style');
  css.textContent = `
    #_cmOverlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;align-items:center;justify-content:center;padding:20px;}
    #_cmOverlay.open{display:flex;}
    #_cmCard{background:#fff;border-radius:16px;width:100%;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:_cmSlide .3s ease-out;max-height:90vh;overflow-y:auto;}
    @keyframes _cmSlide{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
    ._cm-header{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #f3f4f6;}
    ._cm-header h3{font-size:17px;font-weight:700;color:#1f2937;margin:0;}
    ._cm-close{background:none;border:none;font-size:20px;cursor:pointer;color:#9ca3af;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;}
    ._cm-close:hover{background:#f3f4f6;color:#374151;}
    ._cm-body{padding:18px 24px;display:flex;flex-direction:column;gap:12px;}
    ._cm-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    ._cm-group{display:flex;flex-direction:column;gap:5px;}
    ._cm-group label{font-size:13px;font-weight:600;color:#374151;}
    ._cm-group input,._cm-group select,._cm-group textarea{padding:10px 13px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:14px;font-family:inherit;outline:none;transition:border .2s;width:100%;box-sizing:border-box;}
    ._cm-group input:focus,._cm-group select:focus,._cm-group textarea:focus{border-color:#3b82f6;}
    ._cm-group textarea{resize:vertical;min-height:75px;}
    ._cm-submit{width:100%;padding:12px;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-size:15px;font-weight:700;font-family:inherit;transition:opacity .2s;}
    ._cm-submit:hover{opacity:.9;}
    ._cm-submit:disabled{opacity:.6;cursor:default;}
    ._cm-msg{padding:10px 13px;border-radius:8px;font-size:14px;margin-top:4px;display:none;}
    ._cm-msg.success{background:#ecfdf5;color:#065f46;border:1px solid #6ee7b7;display:block;}
    ._cm-msg.error{background:#fef2f2;color:#991b1b;border:1px solid #fca5a5;display:block;}
    @media(max-width:520px){._cm-row{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(css);

  var overlay = document.createElement('div');
  overlay.id = '_cmOverlay';
  overlay.innerHTML =
    '<div id="_cmCard">' +
      '<div class="_cm-header">' +
        '<h3><i class="fas fa-paper-plane" style="color:#3b82f6;margin-right:8px"></i>Đăng ký tư vấn miễn phí</h3>' +
        '<button class="_cm-close" onclick="closeConsultModal()" title="Đóng">✕</button>' +
      '</div>' +
      '<div class="_cm-body">' +
        '<p style="font-size:13px;color:#6b7280;margin:0">Để lại thông tin, thầy Daniel Hà sẽ liên hệ tư vấn lộ trình học phù hợp — hoàn toàn miễn phí, không áp lực.</p>' +
        '<form id="_cmForm">' +
          '<div style="display:flex;flex-direction:column;gap:12px">' +
            '<div class="_cm-row">' +
              '<div class="_cm-group">' +
                '<label>Họ &amp; tên <span style="color:#ef4444">*</span></label>' +
                '<input type="text" id="_cmName" placeholder="Nguyễn Văn A" required />' +
              '</div>' +
              '<div class="_cm-group">' +
                '<label>Số điện thoại <span style="color:#ef4444">*</span></label>' +
                '<input type="tel" id="_cmPhone" placeholder="0912 345 678" required />' +
              '</div>' +
            '</div>' +
            '<div class="_cm-group">' +
              '<label>Email</label>' +
              '<input type="email" id="_cmEmail" placeholder="example@gmail.com" />' +
            '</div>' +
            '<div class="_cm-group">' +
              '<label>Khóa học quan tâm</label>' +
              '<select id="_cmCourse">' +
                '<option value="">-- Chọn khóa học --</option>' +
                '<option>IELTS Mất Gốc → 6.0+</option>' +
                '<option>IELTS 3.0 → 6.0+</option>' +
                '<option>IELTS 6.0 → 7.0+</option>' +
                '<option>IELTS Speaking Chuyên Sâu</option>' +
                '<option>Giao Tiếp Tiếng Anh Cơ Bản</option>' +
                '<option>Tiếng Anh Giao Tiếp Văn Phòng</option>' +
                '<option>Chưa biết – cần tư vấn</option>' +
              '</select>' +
            '</div>' +
            '<div class="_cm-group">' +
              '<label>Tin nhắn thêm</label>' +
              '<textarea id="_cmMsg" placeholder="Trình độ hiện tại, mục tiêu, thời gian học..."></textarea>' +
            '</div>' +
            '<button type="submit" class="_cm-submit" id="_cmSubmit"><i class="fas fa-paper-plane"></i> Gửi đăng ký tư vấn</button>' +
            '<div class="_cm-msg" id="_cmResult"></div>' +
          '</div>' +
        '</form>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeConsultModal();
  });

  document.getElementById('_cmForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = document.getElementById('_cmSubmit');
    var result = document.getElementById('_cmResult');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    result.className = '_cm-msg';
    try {
      var res = await fetch(API + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    document.getElementById('_cmName').value.trim(),
          phone:   document.getElementById('_cmPhone').value.trim(),
          email:   document.getElementById('_cmEmail').value.trim(),
          course:  document.getElementById('_cmCourse').value,
          message: document.getElementById('_cmMsg').value.trim()
        })
      });
      var data = await res.json();
      if (data.success) {
        result.textContent = '✅ ' + (data.message || 'Gửi thành công! Thầy sẽ liên hệ bạn sớm.');
        result.className = '_cm-msg success';
        document.getElementById('_cmForm').reset();
        setTimeout(closeConsultModal, 3000);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      result.textContent = '❌ ' + (err.message || 'Lỗi gửi form, vui lòng thử lại.');
      result.className = '_cm-msg error';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đăng ký tư vấn';
    }
  });

  window.openConsultModal = function () {
    overlay.classList.add('open');
    setTimeout(function () { document.getElementById('_cmName').focus(); }, 50);
  };
  window.closeConsultModal = function () {
    overlay.classList.remove('open');
    document.getElementById('_cmResult').className = '_cm-msg';
  };
})();
