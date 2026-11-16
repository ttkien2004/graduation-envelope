import { MASCOT_CONFIG, MASCOT_PRESETS, getMascotId } from './mascot.config.js';

// Core user-facing interactions use vanilla JavaScript. They keep working even
// if WebGL is unsupported or the Three.js / GSAP packages cannot be loaded.
(() => {
  'use strict';

  const config = window.GRADUATION_CONFIG || {};
  const invitation = document.getElementById('invitation-dialog');
  const wish = document.getElementById('wish-dialog');
  const toast = document.getElementById('toast');
  const heroStatus = document.getElementById('hero-status-text');
  let currentMascotId = getMascotId(MASCOT_CONFIG.selected);
  const mascot = () => MASCOT_PRESETS[currentMascotId];
  const mascotPicker = document.getElementById('mascot-picker');
  const mascotButtons = document.getElementById('mascot-options');
  window.GRADUATION_SELECTED_MASCOT = currentMascotId;

  function updateMascotUI() {
    const data = mascot();
    document.body.dataset.mascot = currentMascotId;
    document.getElementById('mascot-name-hero').textContent = data.greeting;
    document.getElementById('mascot-name-gate').textContent = data.kind.toLowerCase();
    document.getElementById('cover-mascot-symbol').textContent = data.emoji;
    document.getElementById('mascot-stage').setAttribute('aria-label',
      `Hoạt ảnh 3D: ${data.kind} bước đến và trao thiệp mời`);
    mascotButtons.querySelectorAll('[data-mascot]').forEach((button) => {
      const active = button.dataset.mascot === currentMascotId;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  mascotPicker.hidden = MASCOT_CONFIG.showPicker === false;
  for (const [id, data] of Object.entries(MASCOT_PRESETS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mascot-choice';
    button.dataset.mascot = id;
    button.setAttribute('aria-label', `Chọn linh vật ${data.label}`);
    const emoji = document.createElement('span');
    emoji.className = 'mascot-choice__emoji';
    emoji.textContent = data.emoji;
    const name = document.createElement('span');
    name.textContent = data.label;
    button.append(emoji, name);
    button.addEventListener('click', () => {
      if (currentMascotId === id) return;
      currentMascotId = getMascotId(id);
      window.GRADUATION_SELECTED_MASCOT = currentMascotId;
      updateMascotUI();
      document.body.classList.remove('letter-ready');
      heroStatus.textContent = `${mascot().greeting} đang mang thư tới...`;
      if (sceneLoaded) window.dispatchEvent(new CustomEvent('mascot:change', {detail:{id:currentMascotId}}));
      else if (sceneLoading) replayWhenLoaded = true;
    });
    mascotButtons.append(button);
  }
  updateMascotUI();
  const gate = document.getElementById('guest-gate');
  const siteShell = document.getElementById('site-shell');
  const guestForm = document.getElementById('guest-form');
  const guestInput = document.getElementById('guest-name');
  const guestError = document.getElementById('guest-error');
  let guestName = '';
  let sceneLoaded = false;
  let sceneLoading = false;
  let replayWhenLoaded = false;
  let toastTimer;

  // Do not initialize Three.js until the guest has entered their name.
  // Names exist only in this page's memory: no cookie, storage, URL parameter
  // or network request is needed for the personalized invitation.
  const cleanName = (raw) => String(raw)
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, 60);

  function personalizeInvitation(name) {
    // textContent (never innerHTML) prevents names from being interpreted as markup.
    for (const id of ['hero-guest-name', 'cover-guest-name', 'invited-guest-name']) {
      document.getElementById(id).textContent = name;
    }
    document.getElementById('wish-name').value = name;
    document.title = `Lời mời tốt nghiệp gửi ${name} ♡`;
  }

  function showGate() {
    closeDialog(invitation);
    closeDialog(wish);
    guestInput.value = guestName;
    guestError.hidden = true;
    guestInput.removeAttribute('aria-invalid');
    gate.classList.remove('is-leaving');
    gate.hidden = false;
    siteShell.inert = true;
    document.body.classList.remove('guest-entered', 'letter-ready');
    document.body.classList.add('guest-pending');
    window.scrollTo(0, 0);
    if (window.innerWidth >= 800) window.setTimeout(() => guestInput.focus(), 60);
  }

  function revealExperience(name) {
    const isFirstVisit = !guestName;
    guestName = name;
    personalizeInvitation(name);
    gate.classList.add('is-leaving');
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 530;
    window.setTimeout(() => {
      gate.hidden = true;
      gate.classList.remove('is-leaving');
      document.body.classList.remove('guest-pending');
      document.body.classList.add('guest-entered');
      siteShell.inert = false;
      heroStatus.textContent = `${mascot().greeting} đang mang thư cho ${name}...`;
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event('resize'));
      document.getElementById('hero-title').setAttribute('tabindex', '-1');
      document.getElementById('hero-title').focus({preventScroll: true});

      if (sceneLoaded) {
        // Revisit the gate to rename the recipient, then replay the delivery.
        document.body.classList.remove('letter-ready');
        window.dispatchEvent(new Event('mascot:replay'));
      } else if (!sceneLoading) {
        sceneLoading = true;
        import('./scene.js').then(() => {
          sceneLoaded = true;
          sceneLoading = false;
          if (replayWhenLoaded && !document.body.classList.contains('guest-pending')) {
            replayWhenLoaded = false;
            window.dispatchEvent(new Event('mascot:replay'));
          }
        }).catch((error) => {
          sceneLoading = false;
          console.warn('3D scene unavailable; CSS mascot fallback is active.', error);
          heroStatus.textContent = `${mascot().greeting} đã sẵn sàng! Nhấn “Nhận thiệp mời” nhé ♡`;
        });
      } else {
        // If a visitor changes names during the module download, replay once loaded.
        replayWhenLoaded = true;
      }
      if (isFirstVisit) window.dispatchEvent(new Event('guest:entered'));
      window.setTimeout(() => {
        if (!document.body.classList.contains('is-three-ready') && !document.body.classList.contains('guest-pending')) {
          heroStatus.textContent = 'Nhấn “Nhận thiệp mời” để mở thư nhé ♡';
        }
      }, 5500);
    }, delay);
  }

  guestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (gate.classList.contains('is-leaving')) return;
    const name = cleanName(guestInput.value);
    if (!name) {
      guestError.hidden = false;
      guestInput.setAttribute('aria-invalid', 'true');
      guestInput.focus();
      return;
    }
    guestError.hidden = true;
    guestInput.removeAttribute('aria-invalid');
    guestInput.value = name;
    revealExperience(name);
  });
  guestInput.addEventListener('input', () => {
    if (guestInput.value.trim()) {
      guestError.hidden = true;
      guestInput.removeAttribute('aria-invalid');
    }
  });
  document.getElementById('change-guest').addEventListener('click', showGate);

  const field = (value) => value == null ? '' : String(value);
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const key = el.dataset.bind;
    if (config[key] != null) el.textContent = field(config[key]);
  });

  document.getElementById('demo-note').hidden = !config.isDemo;
  if (config.contactEmail) {
    document.getElementById('wish-privacy').textContent = 'Nút gửi sẽ mở ứng dụng email trên thiết bị của bạn. Không có dữ liệu nào được lưu trên website.';
  }

  let parsedDate = new Date(`${config.date || '2026-12-20'}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) parsedDate = new Date('2026-12-20T00:00:00');
  document.getElementById('display-date').textContent = new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(parsedDate);
  document.getElementById('display-time').textContent = `${config.startTime || '09:00'} – ${config.endTime || '11:30'}`;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 4200);
  };

  const scrollLock = () => document.body.classList.toggle('modal-open', invitation.open || wish.open);
  const showDialog = (dialog) => {
    if (!dialog.open) dialog.showModal();
    scrollLock();
  };
  const closeDialog = (dialog) => {
    if (dialog.open) dialog.close();
    scrollLock();
  };
  const openInvitation = () => {
    if (!guestName || document.body.classList.contains('guest-pending')) return;
    if (wish.open) closeDialog(wish);
    showDialog(invitation);
    window.dispatchEvent(new Event('invitation:opened'));
  };

  for (const id of ['open-invite', 'open-invite-bottom']) {
    document.getElementById(id).addEventListener('click', openInvitation);
  }
  document.getElementById('close-dialog').addEventListener('click', () => closeDialog(invitation));
  invitation.addEventListener('click', (event) => {
    if (event.target === invitation) closeDialog(invitation);
  });
  invitation.addEventListener('close', scrollLock);
  wish.addEventListener('close', scrollLock);
  wish.addEventListener('click', (event) => {
    if (event.target === wish) closeDialog(wish);
  });
  document.getElementById('wish-close').addEventListener('click', () => closeDialog(wish));
  window.addEventListener('mascot-envelope-click', openInvitation);

  document.getElementById('replay-intro').addEventListener('click', () => {
    closeDialog(invitation);
    closeDialog(wish);
    document.body.classList.remove('letter-ready');
    heroStatus.textContent = `${mascot().greeting} đang mang thư cho ${guestName}...`;
    window.dispatchEvent(new Event('mascot:replay'));
    if (!document.body.classList.contains('is-three-ready')) {
      showToast('Chế độ 3D chưa tải. Bạn vẫn có thể nhấn “Nhận thiệp mời” để mở thư nhé!');
    }
  });
  window.addEventListener('mascot:ready', () => {
    document.body.classList.add('letter-ready');
    heroStatus.textContent = `${mascot().greeting} đã tới rồi! Nhấn vào phong bì để nhận thiệp ♡`;
  });

  // Calendar export; times are floating local times (not UTC) for easy
  // compatibility with calendar apps. For events outside Vietnam, adjust as needed.
  function icsEscape(value) {
    return field(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }
  function makeICSTime(date, time) {
    const d = field(date).replaceAll('-', '');
    const t = field(time).replace(':', '');
    return `${d}T${t.padEnd(4, '0')}00`;
  }
  document.getElementById('calendar-btn').addEventListener('click', () => {
    const start = makeICSTime(config.date || '2026-12-20', config.startTime || '09:00');
    const end = makeICSTime(config.date || '2026-12-20', config.endTime || '11:30');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Little Milestone//Graduation Invite//VI',
      'BEGIN:VEVENT',
      `UID:graduation-${field(config.date)}-${encodeURIComponent(field(config.graduate))}@littlemilestone`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTSTART:${start}`, `DTEND:${end}`,
      `SUMMARY:${icsEscape(`Lễ tốt nghiệp - ${config.graduate || 'Graduation'}`)}`,
      `DESCRIPTION:${icsEscape(config.invitationMessage)}`,
      `LOCATION:${icsEscape(`${config.venue || ''}, ${config.address || ''}`)}`,
      'END:VEVENT', 'END:VCALENDAR', '',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], {type: 'text/calendar;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'loi-moi-tot-nghiep.ics';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('Đã tạo tệp lịch hẹn! Hãy kiểm tra ngày, giờ trước khi lưu nhé.');
  });

  document.getElementById('map-btn').addEventListener('click', () => {
    if (config.isDemo && !config.mapsUrl) {
      showToast('Đây là dữ liệu mẫu. Hãy cập nhật địa chỉ hoặc mapsUrl trong src/config.js nhé!');
      return;
    }
    const address = `${config.venue || ''}, ${config.address || ''}`.trim();
    const url = config.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  document.getElementById('share-btn').addEventListener('click', async () => {
    const link = window.location.href.split('#')[0];
    const ok = await copyText(link);
    if (!ok) { showToast('Chưa thể sao chép tự động. Bạn hãy sao chép URL trong thanh địa chỉ nhé!'); return; }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      showToast('Đã sao chép link! Lưu ý: hãy triển khai website lên hosting trước khi gửi cho mọi người.');
    } else {
      showToast('Đã sao chép liên kết thiệp mời! ♡');
    }
  });

  document.getElementById('rsvp-btn').addEventListener('click', () => {
    if (config.rsvpFormUrl) {
      window.open(config.rsvpFormUrl, '_blank', 'noopener,noreferrer');
    } else {
      closeDialog(invitation);
      showDialog(wish);
    }
  });

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(value); return true; } catch { /* fallback */ }
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.cssText = 'position:fixed;opacity:0;left:-9999px';
    document.body.append(textarea);
    textarea.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* no clipboard available */ }
    textarea.remove();
    return ok;
  }

  document.getElementById('wish-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('wish-name').value.trim();
    const message = document.getElementById('wish-message').value.trim();
    if (!name || !message) { showToast('Bạn hãy điền tên và lời chúc nhé!'); return; }
    const letter = `Lời chúc tốt nghiệp dành cho ${config.graduate || 'bạn'}\n\nTừ: ${name}\n\n${message}`;
    if (config.contactEmail) {
      const subject = encodeURIComponent(`Lời chúc tốt nghiệp từ ${name}`);
      const body = encodeURIComponent(letter);
      window.location.href = `mailto:${config.contactEmail}?subject=${subject}&body=${body}`;
      showToast('Đã mở ứng dụng email. Hãy nhấn Gửi trong ứng dụng để hoàn tất nhé!');
    } else {
      const ok = await copyText(letter);
      showToast(ok ? 'Đã sao chép lời chúc! Bạn có thể dán và gửi cho chủ lễ ♡' : 'Chưa thể sao chép tự động. Bạn hãy chọn và sao chép lời nhắn nhé!');
    }
    closeDialog(wish);
  });
})();
