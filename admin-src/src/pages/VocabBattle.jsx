import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch, FRONTEND_URL, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Pagination from '../components/Pagination';
import { ErrorState, EmptyState, TableBody } from '../components/ui/States';

// ⚔️ Đấu trường từ vựng — admin side of /app/vocab-battle
// (backend: routes/admin/vocabBattle.js → services/vocabBattleAdmin.js).
//   ?tab=           Tổng quan: room counts, 14-day chart, every room (stop one = stakes refunded)
//   ?tab=words      Kho từ: size of every word source; the game's own words
//                   (Từ có hình ảnh + Từ điển mở): edit meaning / picture /
//                   example / opposite, hide, add, delete
//   ?tab=chain      Nối chữ: words players got accepted by the online
//                   dictionary; remove = blocked for good; blocked list
//   ?tab=settings   Cài đặt: on/off, question kinds + seconds, word sources,
//                   stakes, friendly-win 🔥, Nối chữ bonuses, Lulu 🤖 difficulty

const TABS = [
  { key: '', label: '📊 Tổng quan & trận đấu' },
  { key: 'words', label: '📚 Kho từ' },
  { key: 'chain', label: '🔗 Nối chữ' },
  { key: 'settings', label: '⚙️ Cài đặt' },
];
const STATUS = {
  open: ['Đang mời', 'badge-yellow'], playing: ['Đang chơi', 'badge-blue'],
  done: ['Đã xong', 'badge-green'], cancelled: ['Đã hủy', 'badge-gray'],
};
const ORIGIN = {
  wiktionary: ['Wiktionary', 'badge-green', 'Nghĩa lấy từ Wiktionary tiếng Việt'],
  ai: ['AI — nên xem', 'badge-yellow', 'Không nghĩa nào trong từ điển khớp nghĩa thông dụng — AI tự viết, nên kiểm tra'],
  fluent: ['Hình', 'badge-blue', 'Từ có hình (Fluent Emoji)'],
  admin: ['Admin thêm', 'badge-purple', 'Thêm trên trang này'],
};
const PAGE = 50;

// State that starts over whenever `key` changes (page number / ticked rows
// go back to the start when a filter changes) — without a setState-in-effect.
function useKeyed(key, init) {
  const [s, setS] = useState(() => ({ key, v: init() }));
  const v = s.key === key ? s.v : init();
  const set = (nv) => setS((cur) => {
    const prev = cur.key === key ? cur.v : init();
    return { key, v: typeof nv === 'function' ? nv(prev) : nv };
  });
  return [v, set];
}

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return v;
}

// ── Tổng quan ─────────────────────────────────────────────────────
function DayChart({ days }) {
  const max = Math.max(1, ...days.map(d => d.quiz + d.chain));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '8px 4px 0' }} aria-label="Số trận 14 ngày qua">
      {days.map(d => (
        <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          title={`${d.day}: ${d.quiz} trận câu hỏi · ${d.chain} Nối chữ`}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', height: 90 }}>
            <div style={{ height: `${(d.quiz / max) * 90}px`, background: 'var(--primary, #4f46e5)', borderRadius: '3px 3px 0 0' }} />
            <div style={{ height: `${(d.chain / max) * 90}px`, background: 'var(--green, #16a34a)', borderRadius: '3px 3px 0 0' }} />
          </div>
          <span className="muted" style={{ fontSize: 10 }}>{d.day.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

function Overview() {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: ov, loading: ovLoading, error: ovError, reload: reloadOv } = useApi('/admin/vocab-battle/overview');
  const [status, setStatus] = useState('all');
  const [kind, setKind] = useState('');
  const [solo, setSolo] = useState('no');
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim());
  const [page, setPage] = useKeyed(`${status}|${kind}|${solo}|${q}`, () => 1);
  const url = useMemo(() => {
    const p = new URLSearchParams({ status, page: String(page), limit: '30' });
    if (kind) p.set('kind', kind);
    if (solo) p.set('solo', solo);
    if (q) p.set('search', q);
    return `/admin/vocab-battle/battles?${p}`;
  }, [status, kind, solo, q, page]);
  const { data, loading, error, reload } = useApi(url, { pollMs: 30000 });

  const stop = (b) => confirm(
    `Dừng trận "${b.game}" (${b.players.map(p => p.name).join(', ')})? Mọi 🔥 cược được hoàn lại ví lửa và người chơi nhận thông báo.`,
    async () => {
      try {
        await apiFetch(`/admin/vocab-battle/battles/${b.id}/cancel`, { method: 'POST', body: JSON.stringify({}) });
        toast('Đã dừng trận, hoàn 🔥 cược');
        reload(); reloadOv();
      } catch (e) { toast(e.message, 'error'); }
    },
  );

  const c = ov?.counts;
  const w = ov?.week;
  return (
    <>
      {ovError && <ErrorState error={ovError} onRetry={reloadOv} />}
      {ov && !ov.enabled && (
        <div className="hint-box" style={{ marginBottom: 12 }}>
          ⛔ Đấu trường đang <b>tạm đóng</b>: học sinh không tạo được trận mới (trận đang chơi vẫn chạy). Mở lại ở tab <Link to="?tab=settings">⚙️ Cài đặt</Link>.
        </div>
      )}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <StatCard label="Đang mời / đang chơi" value={c ? c.open + c.playing : null} icon="⚔️" tone="blue" loading={ovLoading}
          sub={c ? `${c.open} chờ nhận lời · ${c.playing} Nối chữ đang chạy` : null} />
        <StatCard label="Trận 7 ngày qua" value={w ? w.rooms.quiz + w.rooms.chain : null} icon="🎮" tone="purple" loading={ovLoading}
          sub={w ? `${w.rooms.quiz} câu hỏi · ${w.rooms.chain} Nối chữ · ${w.rooms.solo} chơi một mình` : null} />
        <StatCard label="Học sinh đã chơi (7 ngày)" value={w?.players} icon="👥" tone="green" loading={ovLoading}
          sub={w ? `${w.rated} trận tính BXH` : null} />
        <StatCard label="🔥 trong pot (7 ngày)" value={w?.pot} icon="🔥" tone="red" loading={ovLoading}
          sub={w ? `${w.stakedRooms} trận có cược` : null} />
      </div>
      {ov?.days && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head"><div className="panel-title">Số trận mỗi ngày (14 ngày)</div>
            <span className="panel-sub"><span style={{ color: 'var(--primary, #4f46e5)' }}>■</span> câu hỏi · <span style={{ color: 'var(--green, #16a34a)' }}>■</span> Nối chữ</span></div>
          <DayChart days={ov.days} />
        </div>
      )}

      <div className="filter-bar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <select className="form-select" value={status} onChange={e => setStatus(e.target.value)} aria-label="Trạng thái" style={{ maxWidth: 170 }}>
          <option value="all">Mọi trạng thái</option>
          <option value="active">Đang mời / đang chơi</option>
          <option value="open">Đang mời</option>
          <option value="playing">Đang chơi</option>
          <option value="done">Đã xong</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select className="form-select" value={kind} onChange={e => setKind(e.target.value)} aria-label="Loại trận" style={{ maxWidth: 160 }}>
          <option value="">Mọi loại</option><option value="quiz">Câu hỏi</option><option value="chain">Nối chữ</option>
        </select>
        <select className="form-select" value={solo} onChange={e => setSolo(e.target.value)} aria-label="Một mình" style={{ maxWidth: 190 }}>
          <option value="no">Trận thách đấu</option><option value="yes">Chơi một mình</option><option value="">Cả hai</option>
        </select>
        <input type="search" className="form-input search-input" style={{ maxWidth: 240 }} placeholder="Tìm theo tên người chơi…"
          value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm người chơi" />
      </div>
      {error && <ErrorState error={error} onRetry={reload} />}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TẠO LÚC</th><th>TRẬN</th><th>NGƯỜI CHƠI</th><th>CƯỢC</th><th>TRẠNG THÁI</th><th /></tr></thead>
          <TableBody loading={loading} colSpan={6} empty={!loading && !(data?.battles || []).length ? <EmptyState icon="⚔️" title="Chưa có trận nào" /> : null}>
            {(data?.battles || []).map(b => {
              const [label, cls] = STATUS[b.status] || [b.status, 'badge-gray'];
              return (
                <tr key={b.id}>
                  <td style={{ fontSize: 12 }} className="muted">{formatDate(b.createdAt)}</td>
                  <td style={{ fontSize: 13 }}>
                    <b>{b.kind === 'chain' ? '🔗 ' : '❓ '}{b.game}</b>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {b.solo ? 'Chơi một mình · ' : ''}{b.kind === 'quiz' ? `Nguồn: ${b.source}${b.lessonTitle ? ` › ${b.lessonTitle}` : ''}` : `${b.total} từ đã nối`}
                      {b.rated ? ' · tính BXH' : ''}
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {b.players.map(p => (
                      <div key={p.id}>
                        {p.winner ? '🏆 ' : ''}{p.bot ? p.name : <Link to={`/students/${p.id}`}>{p.name}</Link>}
                        <span className="muted"> · {p.state === 'joined' ? `${p.score} điểm${b.kind === 'quiz' ? ` (${p.answered}/${b.total} câu)` : ''}` : p.state === 'invited' ? 'chưa nhận lời' : p.state === 'declined' ? 'từ chối' : 'rời phòng'}
                          {p.reward ? ` · +${p.reward}🔥` : ''}</span>
                      </div>
                    ))}
                  </td>
                  <td>{b.stake ? `${b.stake} 🔥` : <span className="muted">giao hữu</span>}</td>
                  <td><span className={`badge ${cls}`}>{label}</span>{b.endedAt && <div className="muted" style={{ fontSize: 11 }}>{formatDate(b.endedAt)}</div>}</td>
                  <td>{(b.status === 'open' || b.status === 'playing') && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => stop(b)} title="Dừng trận, hoàn 🔥 cược">⛔ Dừng</button>
                  )}</td>
                </tr>
              );
            })}
          </TableBody>
        </table>
      </div>
      {data && <Pagination page={data.page} total={data.total} pageSize={data.limit} onPage={setPage} />}
    </>
  );
}

// ── Kho từ ────────────────────────────────────────────────────────
function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function WordModal({ word, kind, sets, onClose, onSaved }) {
  const toast = useToast();
  const isNew = !word;
  const k = word ? word.kind : kind;
  const [form, setForm] = useState(() => ({
    word: word?.word || '', meaning: word?.meaning || '', pos: word?.pos || (k === 'picture' ? 'n' : ''),
    example: word?.example || '', ant: word?.ant || '', near: (word?.near || []).join(', '),
    setTitle: word?.setTitle || '', imageUrl: word?.imageUrl || '', hidden: !!word?.hidden,
  }));
  const [image, setImage] = useState(null); // data URI of a new upload
  const [saving, setSaving] = useState(false);
  const set = (key, v) => setForm(f => ({ ...f, [key]: v }));
  const titles = sets.filter(s => s.kind === k).map(s => s.title);

  async function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) { toast('Ảnh tối đa 3 MB', 'error'); return; }
    setImage(await readFile(f));
  }
  async function save() {
    setSaving(true);
    const body = { ...form, kind: k };
    if (image) body.imageBase64 = image;
    try {
      const d = await apiFetch(isNew ? '/admin/vocab-battle/words' : `/admin/vocab-battle/words/${word.id}`,
        { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(body) });
      toast(isNew ? 'Đã thêm từ' : 'Đã lưu');
      onSaved(d.word);
      onClose();
    } catch (e) { toast(e.message, 'error'); setSaving(false); }
  }
  const preview = image || form.imageUrl;
  return (
    <Modal title={isNew ? `＋ Thêm ${k === 'picture' ? 'từ có hình' : 'từ vào Từ điển mở'}` : `✏️ ${word.word}`} onClose={onClose} width={640} busy={saving}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Huỷ</button>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !form.word.trim() || !form.meaning.trim()}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
      </>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label className="form-group"><span className="form-label">Từ / cụm tiếng Anh</span>
          <input className="form-input" value={form.word} onChange={e => set('word', e.target.value)} maxLength={80} autoFocus={isNew} /></label>
        <label className="form-group"><span className="form-label">Nghĩa tiếng Việt (ngắn, thông dụng nhất)</span>
          <input className="form-input" value={form.meaning} onChange={e => set('meaning', e.target.value)} maxLength={120} autoFocus={!isNew} /></label>
        <label className="form-group"><span className="form-label">Từ loại</span>
          <select className="form-select" value={form.pos} onChange={e => set('pos', e.target.value)}>
            <option value="">—</option><option value="n">Danh từ</option><option value="v">Động từ</option>
            <option value="adj">Tính từ</option><option value="adv">Trạng từ</option><option value="other">Khác</option>
          </select></label>
        <label className="form-group"><span className="form-label">Bộ từ</span>
          <input className="form-input" list="vb-set-titles" value={form.setTitle} onChange={e => set('setTitle', e.target.value)} maxLength={120}
            placeholder="Chọn bộ có sẵn hoặc gõ tên bộ mới" />
          <datalist id="vb-set-titles">{titles.map(t => <option key={t} value={t} />)}</datalist></label>
        <label className="form-group" style={{ gridColumn: '1 / -1' }}><span className="form-label">Câu ví dụ (dùng cho “Ghép câu”, “Nghe & điền từ” — 5–14 từ, có chứa từ này)</span>
          <input className="form-input" value={form.example} onChange={e => set('example', e.target.value)} maxLength={300} /></label>
        <label className="form-group"><span className="form-label">Từ trái nghĩa (tạo câu “Trái nghĩa”)</span>
          <input className="form-input" value={form.ant} onChange={e => set('ant', e.target.value)} maxLength={60} placeholder="vd. scarce" /></label>
        <label className="form-group"><span className="form-label">Từ dễ nhầm trong bộ (không làm đáp án sai)</span>
          <input className="form-input" value={form.near} onChange={e => set('near', e.target.value)} placeholder="vd. taxi, police car" /></label>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <span className="form-label">Hình {k === 'picture' ? '(bắt buộc — câu “Nhìn hình đoán từ”)' : '(không bắt buộc — có hình thì từ cũng vào “Nhìn hình đoán từ”)'}</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {preview ? <img src={preview} alt="" style={{ width: 96, height: 96, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8, background: '#fff' }} />
              : <div className="muted" style={{ width: 96, height: 96, display: 'grid', placeItems: 'center', border: '1px dashed var(--border)', borderRadius: 8 }}>Chưa có</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 220 }}>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pick} aria-label="Tải ảnh lên" />
              <input className="form-input" value={form.imageUrl} onChange={e => { set('imageUrl', e.target.value); setImage(null); }} placeholder="…hoặc dán link ảnh https://" />
              {preview && <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => { setImage(null); set('imageUrl', ''); }}>Bỏ hình</button>}
            </div>
          </div>
        </div>
        <label className="switch" style={{ gridColumn: '1 / -1' }}>
          <input type="checkbox" checked={form.hidden} onChange={e => set('hidden', e.target.checked)} />
          <span className="switch-track" aria-hidden="true" /> Ẩn từ này khỏi Đấu trường
        </label>
      </div>
    </Modal>
  );
}

function Words({ isAdmin }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: info, reload: reloadInfo } = useApi('/admin/vocab-battle/bank');
  const [kind, setKind] = useState('dict');
  const [set, setSet] = useState('');
  const [origin, setOrigin] = useState('');
  const [hidden, setHidden] = useState('');
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim());
  const filterKey = `${kind}|${set}|${origin}|${hidden}|${q}`;
  const [page, setPage] = useKeyed(filterKey, () => 1);
  const [editing, setEditing] = useState(null); // word | 'new'
  const [picked, setPicked] = useKeyed(filterKey, () => new Set());
  const pickKind = (k) => { setKind(k); setSet(''); };
  const url = useMemo(() => {
    const p = new URLSearchParams({ kind, page: String(page), limit: String(PAGE) });
    if (set) p.set('set', set);
    if (origin) p.set('origin', origin);
    if (hidden) p.set('hidden', hidden);
    if (q) p.set('search', q);
    return `/admin/vocab-battle/words?${p}`;
  }, [kind, set, origin, hidden, q, page]);
  const { data, loading, error, reload } = useApi(url);
  const sets = info?.battleSets || [];
  const rows = data?.words || [];

  async function toggleHidden(w) {
    try {
      await apiFetch(`/admin/vocab-battle/words/${w.id}`, { method: 'PUT', body: JSON.stringify({ hidden: !w.hidden }) });
      toast(w.hidden ? `Đã hiện “${w.word}”` : `Đã ẩn “${w.word}”`);
      reload(); reloadInfo();
    } catch (e) { toast(e.message, 'error'); }
  }
  async function hideMany(h) {
    try {
      const d = await apiFetch('/admin/vocab-battle/words/hide', { method: 'POST', body: JSON.stringify({ ids: [...picked], hidden: h }) });
      toast(`${h ? 'Đã ẩn' : 'Đã hiện'} ${d.modified} từ`);
      setPicked(new Set()); reload(); reloadInfo();
    } catch (e) { toast(e.message, 'error'); }
  }
  const remove = (w) => confirm(`Xoá hẳn “${w.word}” khỏi kho? (Nếu chỉ muốn tạm bỏ, hãy Ẩn.)`, async () => {
    try {
      await apiFetch(`/admin/vocab-battle/words/${w.id}`, { method: 'DELETE' });
      toast('Đã xoá'); reload(); reloadInfo();
    } catch (e) { toast(e.message, 'error'); }
  });
  const togglePick = (id) => setPicked(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head"><div className="panel-title">Nguồn từ của Đấu trường</div>
          <span className="panel-sub">
            {info ? `${info.stats.pictures} từ có hình · ${info.stats.antonyms} cặp trái nghĩa · Nối chữ nhận ${info.stats.chain.accepted.toLocaleString('vi-VN')} từ (Lulu 🤖 dùng ${info.stats.chain.lulu.toLocaleString('vi-VN')})` : '…'}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(info?.sources || []).map(s => (
            <div key={s.key} className="badge badge-gray" style={{ padding: '6px 10px', fontSize: 12 }} title={`Dạng câu: ${s.types.join(', ')}`}>
              <b>{s.label}</b>: {s.words.toLocaleString('vi-VN')} từ
            </div>
          ))}
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          Vocab Topics, Task 2, Học Paraphrase, Listening, Từ điển… lấy trực tiếp từ trang của chúng (sửa ở menu tương ứng).
          Bên dưới là kho từ riêng của Đấu trường: <b>Từ có hình ảnh</b> và <b>Từ điển mở</b> (nghĩa từ Wiktionary tiếng Việt).
        </div>
      </div>

      <div className="inner-tabs-nav" role="tablist" style={{ marginBottom: 12 }}>
        <button type="button" role="tab" aria-selected={kind === 'dict'} className={`inner-tab${kind === 'dict' ? ' active' : ''}`} onClick={() => pickKind('dict')}>📖 Từ điển mở</button>
        <button type="button" role="tab" aria-selected={kind === 'picture'} className={`inner-tab${kind === 'picture' ? ' active' : ''}`} onClick={() => pickKind('picture')}>🖼️ Từ có hình ảnh</button>
      </div>
      <div className="filter-bar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <input type="search" className="form-input search-input" style={{ maxWidth: 240 }} placeholder="Tìm từ hoặc nghĩa…"
          value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm từ" />
        <select className="form-select" value={set} onChange={e => setSet(e.target.value)} aria-label="Bộ từ" style={{ maxWidth: 320 }}>
          <option value="">Mọi bộ từ</option>
          {sets.filter(s => s.kind === kind).map(s => <option key={s.set} value={s.set}>{s.title} ({s.count}{s.hidden ? `, ${s.hidden} ẩn` : ''})</option>)}
        </select>
        {kind === 'dict' && (
          <select className="form-select" value={origin} onChange={e => setOrigin(e.target.value)} aria-label="Nguồn nghĩa" style={{ maxWidth: 200 }}>
            <option value="">Mọi nguồn nghĩa</option><option value="ai">Nghĩa do AI viết — nên xem</option>
            <option value="wiktionary">Nghĩa từ Wiktionary</option><option value="admin">Admin thêm</option>
          </select>
        )}
        <select className="form-select" value={hidden} onChange={e => setHidden(e.target.value)} aria-label="Ẩn/hiện" style={{ maxWidth: 150 }}>
          <option value="">Ẩn & hiện</option><option value="no">Đang hiện</option><option value="yes">Đang ẩn</option>
        </select>
        <button type="button" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setEditing('new')}>＋ Thêm từ</button>
      </div>
      {picked.size > 0 && (
        <div className="hint-box" style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          Đã chọn {picked.size} từ
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => hideMany(true)}>🙈 Ẩn</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => hideMany(false)}>👁 Hiện</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPicked(new Set())}>Bỏ chọn</button>
        </div>
      )}
      {error && <ErrorState error={error} onRetry={reload} />}
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th style={{ width: 30 }}><input type="checkbox" aria-label="Chọn cả trang" checked={rows.length > 0 && rows.every(r => picked.has(r.id))}
              onChange={e => setPicked(e.target.checked ? new Set(rows.map(r => r.id)) : new Set())} /></th>
            {kind === 'picture' && <th style={{ width: 70 }}>HÌNH</th>}
            <th>TỪ</th><th>NGHĨA</th><th>{kind === 'picture' ? 'DỄ NHẦM VỚI' : 'VÍ DỤ / TRÁI NGHĨA'}</th><th>BỘ</th><th />
          </tr></thead>
          <TableBody loading={loading} colSpan={kind === 'picture' ? 7 : 6} empty={!loading && !rows.length
            ? <EmptyState icon="📚" title="Không có từ nào">Chạy scripts/seedBattleWords.js --apply để nạp kho, hoặc bấm ＋ Thêm từ.</EmptyState> : null}>
            {rows.map(w => {
              const [olabel, ocls, otitle] = ORIGIN[w.origin] || [w.origin, 'badge-gray', ''];
              return (
                <tr key={w.id} style={w.hidden ? { opacity: 0.5 } : undefined}>
                  <td><input type="checkbox" checked={picked.has(w.id)} onChange={() => togglePick(w.id)} aria-label={`Chọn ${w.word}`} /></td>
                  {kind === 'picture' && <td>{w.imageUrl ? <img src={w.imageUrl} alt={w.word} loading="lazy" style={{ width: 52, height: 52, objectFit: 'contain' }} /> : '—'}</td>}
                  <td><b>{w.word}</b>{w.pos ? <span className="muted" style={{ fontSize: 11 }}> ({w.pos})</span> : null}
                    <div style={{ marginTop: 2 }}><span className={`badge ${ocls}`} title={otitle} style={{ fontSize: 10 }}>{olabel}</span>
                      {w.edited && <span className="badge badge-gray" style={{ fontSize: 10, marginLeft: 4 }} title="Đã sửa tay — script nạp lại sẽ không ghi đè">đã sửa</span>}
                      {w.hidden && <span className="badge badge-gray" style={{ fontSize: 10, marginLeft: 4 }}>ẩn</span>}</div></td>
                  <td>{w.meaning}</td>
                  <td style={{ fontSize: 12, maxWidth: 360 }}>
                    {kind === 'picture' ? (w.near.join(', ') || <span className="muted">—</span>) : <>
                      {w.example ? <span className="muted">“{w.example}”</span> : <span className="muted">—</span>}
                      {w.ant && <div>↔ <b>{w.ant}</b></div>}
                    </>}
                  </td>
                  <td style={{ fontSize: 11 }} className="muted">{w.setTitle}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(w)} aria-label={`Sửa ${w.word}`}>✏️</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleHidden(w)} title={w.hidden ? 'Hiện lại' : 'Ẩn khỏi Đấu trường'}>{w.hidden ? '👁' : '🙈'}</button>
                    {isAdmin && <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(w)} aria-label={`Xoá ${w.word}`}>🗑</button>}
                  </td>
                </tr>
              );
            })}
          </TableBody>
        </table>
      </div>
      {data && <Pagination page={data.page} total={data.total} pageSize={data.limit} onPage={setPage} />}
      {editing && (
        <WordModal word={editing === 'new' ? null : editing} kind={kind} sets={sets} onClose={() => setEditing(null)}
          onSaved={() => { reload(); reloadInfo(); }} />
      )}
    </>
  );
}

// ── Nối chữ ───────────────────────────────────────────────────────
function Chain() {
  const toast = useToast();
  const confirm = useConfirm();
  const [source, setSource] = useState('player');
  const [search, setSearch] = useState('');
  const [add, setAdd] = useState('');
  const q = useDebounced(search.trim());
  const [page, setPage] = useKeyed(`${source}|${q}`, () => 1);
  const url = `/admin/vocab-battle/chain-words?${new URLSearchParams({ source, page: String(page), limit: String(PAGE), ...(q ? { search: q } : {}) })}`;
  const { data, loading, error, reload } = useApi(url);

  const block = (w) => confirm(`Bỏ “${w}” khỏi Nối chữ? Từ này sẽ bị chặn — học sinh gõ sẽ không được tính, Lulu 🤖 không dùng.`, async () => {
    try {
      await apiFetch('/admin/vocab-battle/chain-words/block', { method: 'POST', body: JSON.stringify({ w }) });
      toast(`Đã chặn “${w}”`); reload();
    } catch (e) { toast(e.message, 'error'); }
  });
  async function unblock(w) {
    try {
      await apiFetch('/admin/vocab-battle/chain-words/unblock', { method: 'POST', body: JSON.stringify({ w }) });
      toast(`Đã bỏ chặn “${w}”`); reload();
    } catch (e) { toast(e.message, 'error'); }
  }
  async function addBlock(e) {
    e.preventDefault();
    const w = add.trim().toLowerCase();
    if (!w) return;
    try {
      await apiFetch('/admin/vocab-battle/chain-words/block', { method: 'POST', body: JSON.stringify({ w }) });
      toast(`Đã chặn “${w}”`); setAdd(''); reload();
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 16, alignItems: 'start' }}>
      <div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Nối chữ nhận một từ khi nó có trong danh sách ENABLE, kho từ đã kiểm tra ({data?.counts?.all?.toLocaleString('vi-VN') || '…'} từ) hoặc từ site dạy.
          Từ lạ được tra Wiktionary trực tuyến — nếu có thì được nhận và lưu lại (“học sinh tìm thấy”). Xem danh sách đó ở đây và chặn từ không phù hợp.
        </div>
        <div className="filter-bar" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select className="form-select" value={source} onChange={e => setSource(e.target.value)} aria-label="Nguồn" style={{ maxWidth: 260 }}>
            <option value="player">Học sinh tìm thấy ({data?.counts?.players ?? '…'})</option>
            <option value="all">Toàn bộ kho Nối chữ</option>
          </select>
          <input type="search" className="form-input search-input" style={{ maxWidth: 220 }} placeholder="Từ bắt đầu bằng…"
            value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm từ" />
        </div>
        {error && <ErrorState error={error} onRetry={reload} />}
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>TỪ</th><th>NGHĨA (WIKTIONARY)</th><th>THÊM LÚC</th><th /></tr></thead>
            <TableBody loading={loading} colSpan={4} empty={!loading && !(data?.words || []).length ? <EmptyState icon="🔗" title="Chưa có từ nào" /> : null}>
              {(data?.words || []).map(w => (
                <tr key={w.w}>
                  <td><b>{w.w}</b>{w.pos ? <span className="muted" style={{ fontSize: 11 }}> ({w.pos})</span> : null}</td>
                  <td style={{ fontSize: 12, maxWidth: 380 }} className="muted">{(w.def || '').slice(0, 160) || '—'}</td>
                  <td style={{ fontSize: 12 }} className="muted">{formatDate(w.createdAt)}</td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => block(w.w)}>🚫 Chặn</button></td>
                </tr>
              ))}
            </TableBody>
          </table>
        </div>
        {data && <Pagination page={data.page} total={data.total} pageSize={data.limit} onPage={setPage} />}
      </div>
      <div className="panel">
        <div className="panel-head"><div className="panel-title">🚫 Từ bị chặn ({data?.blocked?.length ?? 0})</div></div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Ngoài danh sách từ tục có sẵn. Từ bị chặn không được tính khi học sinh gõ và Lulu 🤖 không bao giờ dùng.</div>
        <form onSubmit={addBlock} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <input className="form-input" value={add} onChange={e => setAdd(e.target.value)} placeholder="Thêm từ cần chặn" aria-label="Từ cần chặn" />
          <button className="btn btn-primary btn-sm" disabled={!add.trim()}>Chặn</button>
        </form>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(data?.blocked || []).map(w => (
            <span key={w} className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {w}<button type="button" onClick={() => unblock(w)} aria-label={`Bỏ chặn ${w}`} style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
            </span>
          ))}
          {data && !data.blocked.length && <span className="muted" style={{ fontSize: 12 }}>Chưa chặn từ nào.</span>}
        </div>
      </div>
    </div>
  );
}

// ── Cài đặt ───────────────────────────────────────────────────────
const NUM_FIELDS = [
  ['Cược', [
    ['minStake', 'Cược tối thiểu (🔥)', 'Trận có cược phải từ mức này trở lên (0 = giao hữu luôn được).'],
    ['maxStake', 'Cược tối đa (🔥)', ''],
    ['maxOpen', 'Số trận chưa xong tối đa / học sinh', 'Đủ số này thì phải đánh xong mới tạo thêm.'],
    ['inviteHours', 'Thời hạn lời mời (giờ)', 'Trận câu hỏi: hạn nhận lời VÀ làm bài.'],
  ]],
  ['Thưởng', [
    ['friendlyWinFlames', 'Thắng trận giao hữu được (🔥)', 'Trận không cược: người thắng được thưởng chừng này.'],
    ['friendlyDailyWins', 'Số trận giao hữu được thưởng / ngày', 'Chống 2 bạn “cày” lửa bằng cách thua nhau.'],
    ['speedBonus', 'Điểm thưởng tốc độ / câu', 'Cộng thêm vào 100 điểm mỗi câu đúng hết, trả lời càng nhanh càng nhiều.'],
  ]],
  ['Nối chữ', [
    ['lobbyMinutes', 'Phòng chờ tối đa (phút)', 'Chưa bắt đầu sau bấy lâu thì phòng tự hủy, 🔥 cược trả lại.'],
    ['chainBankBonus', 'Thưởng từ đã học trên site (⭐ điểm)', 'Từ có trong Vocab Topics / Paraphrase… được cộng thêm.'],
    ['chainSurvivorBonus', 'Thưởng người trụ lại cuối (điểm)', ''],
    ['botFailBase', 'Lulu 🤖 bí từ — tỉ lệ ban đầu (%)', 'Càng cao Lulu càng dễ thua.'],
    ['botFailPerWord', 'Lulu 🤖 bí từ — cộng thêm mỗi từ đã nối (%)', 'Ván càng dài Lulu càng dễ bí.'],
  ]],
];

function Settings() {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, error, loading, reload } = useApi('/admin/vocab-battle/settings');
  const [draft, setDraft] = useState(null); // unsaved changes (null = as saved)
  const [saving, setSaving] = useState(false);
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data?.settings) return <div className="skeleton" style={{ height: 300 }} />;
  const form = draft || data.settings;
  const d = data.defaults;
  const set = (k, v) => setDraft(f => ({ ...(f || data.settings), [k]: v }));
  const toggleIn = (k, key) => setDraft(f => {
    const cur = f || data.settings;
    return { ...cur, [k]: cur[k].includes(key) ? cur[k].filter(x => x !== key) : [...cur[k], key] };
  });
  const changed = !!draft && JSON.stringify(draft) !== JSON.stringify(data.settings);

  async function save() {
    setSaving(true);
    const body = { ...form };
    delete body.blockedWords; // edited on the Nối chữ tab
    try {
      await apiFetch('/admin/vocab-battle/settings', { method: 'PUT', body: JSON.stringify(body) });
      toast('Đã lưu cài đặt Đấu trường — áp dụng ngay cho trận mới');
      setDraft(null);
      reload();
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  }
  const reset = () => confirm('Đưa mọi cài đặt về mặc định? (Danh sách từ chặn của Nối chữ giữ nguyên.)', async () => {
    try { await apiFetch('/admin/vocab-battle/settings/reset', { method: 'POST' }); toast('Đã về mặc định'); setDraft(null); reload(); }
    catch (e) { toast(e.message, 'error'); }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 980 }}>
      <div className="panel">
        <label className="switch">
          <input type="checkbox" checked={form.enabled} onChange={e => set('enabled', e.target.checked)} aria-label="Mở Đấu trường" />
          <span className="switch-track" aria-hidden="true" />
          <b style={{ margin: '0 4px' }}>Mở Đấu trường</b> — tắt thì học sinh không tạo được trận mới (kể cả chơi một mình); trận đang chơi vẫn chạy tiếp.
        </label>
      </div>

      <div className="panel">
        <div className="panel-head"><div className="panel-title">❓ Dạng câu hỏi & thời gian mỗi câu</div>
          <span className="panel-sub">Bỏ tick = học sinh không chọn được dạng đó. {data.limitRange[0]}–{data.limitRange[1]} giây.</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {data.types.map(t => {
            const on = !form.disabledTypes.includes(t.key);
            return (
              <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 8, opacity: on ? 1 : 0.55 }}>
                <input type="checkbox" checked={on} onChange={() => toggleIn('disabledTypes', t.key)} aria-label={`Bật ${t.label}`} />
                <span style={{ flex: 1, fontSize: 13 }}>{t.label}</span>
                <input type="number" className="form-input" style={{ width: 70 }} min={data.limitRange[0]} max={data.limitRange[1]}
                  value={form.limits[t.key]} onChange={e => set('limits', { ...form.limits, [t.key]: Number(e.target.value) })}
                  aria-label={`Giây cho ${t.label}`} title={`Mặc định ${d.limits[t.key]} giây`} />
                <span className="muted" style={{ fontSize: 11 }}>giây</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><div className="panel-title">📚 Nguồn từ học sinh được chọn</div>
          <span className="panel-sub">“Tất cả” luôn có. Tắt một nguồn = không hiện trong ô chọn nguồn (từ của nó vẫn nằm trong “Tất cả”).</span></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {data.sources.map(s => (
            <label key={s.key} className="switch" style={{ fontSize: 13 }}>
              <input type="checkbox" checked={!form.disabledSources.includes(s.key)} onChange={() => toggleIn('disabledSources', s.key)} />
              <span className="switch-track" aria-hidden="true" /> {s.label}
            </label>
          ))}
        </div>
      </div>

      {NUM_FIELDS.map(([title, fields]) => (
        <div key={title} className="panel">
          <div className="panel-head"><div className="panel-title">{title}</div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {fields.map(([k, label, hint]) => (
              <label key={k} className="form-group">
                <span className="form-label">{label}</span>
                <input type="number" className="form-input" min={data.ranges[k]?.[0]} max={data.ranges[k]?.[1]} value={form[k]}
                  onChange={e => set(k, Number(e.target.value))} />
                <span className="muted" style={{ fontSize: 11 }}>{hint ? `${hint} ` : ''}Mặc định {d[k]} · {data.ranges[k][0]}–{data.ranges[k][1]}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 0, padding: '10px 0', background: 'var(--bg, #fff)' }}>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !changed}>{saving ? 'Đang lưu…' : 'Lưu cài đặt'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)} disabled={saving || !changed}>Hoàn tác</button>
        <button type="button" className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={reset} disabled={saving}>Về mặc định</button>
      </div>
    </div>
  );
}

export default function VocabBattle() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(t => t.key === params.get('tab')) ? params.get('tab') : '';
  return (
    <>
      <PageHeader
        title="⚔️ Đấu trường từ vựng"
        subtitle="Thách đấu từ vựng & Nối chữ của học sinh: theo dõi trận, kho từ (từ có hình, Từ điển mở), từ Nối chữ và luật chơi."
        actions={<a className="btn btn-ghost btn-sm" href={`${FRONTEND_URL}/app/vocab-battle`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>}
      />
      <div className="inner-tabs-nav" role="tablist" style={{ marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.key || 'overview'} type="button" role="tab" aria-selected={tab === t.key} className={`inner-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setParams(t.key ? { tab: t.key } : {}, { replace: true })}>{t.label}</button>
        ))}
      </div>
      {tab === '' && <Overview />}
      {tab === 'words' && <Words isAdmin={user?.role === 'admin'} />}
      {tab === 'chain' && <Chain />}
      {tab === 'settings' && <Settings />}
    </>
  );
}
