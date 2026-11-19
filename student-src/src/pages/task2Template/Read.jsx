import { useState } from 'react';
import { shortTitle } from '../../utils/task2Template';
import { ActivityHeader, En, LuluSays, NextStepButton, RoleTag } from './Parts';
import { speak, stopSpeak } from './tts';

// ② Đọc & nghe — every line of the full template with its meaning and audio.
// "Hiện / Ẩn tiếng Việt" is kept while the page is open (as before).
let viShown = true;

export default function Read({ ctx }) {
  const [showVi, setShowVi] = useState(viShown);
  const [done, setDone] = useState(false);
  const toggle = () => { viShown = !showVi; setShowVi(viShown); };
  function finish() {
    stopSpeak();
    setDone(true);
    ctx.completeStep('read');
  }
  return (
    <>
      <ActivityHeader step={1} onBack={ctx.onBack}
        right={<button className="pth-icon-btn" onClick={toggle}>🇻🇳 {showVi ? 'Ẩn tiếng Việt' : 'Hiện tiếng Việt'}</button>} />
      <div className="pth-wrap">
        <div className="pth-card">
          <LuluSays mood="wink" text="Mẹo của tớ: đọc to từng câu 2 lần, rồi che tiếng Anh đi và thử nói lại từ câu tiếng Việt. Phần trong ngoặc là chỗ cậu tự điền theo đề, không cần học thuộc đâu!" />
          <p className="pth-muted"><span className="pth-anchor">Gạch chân</span> = từ khoá sẽ bị ẩn trước ở bước sau. <span className="pth-ph">(…)</span> = chỗ bạn tự điền nội dung theo đề. <span className="pth-or">/</span> = chọn một trong hai.</p>
          {ctx.tpl.paras.map((p) => (
            <div className="pth-read-para" key={p.si}>
              <div className="pth-read-hdr">
                <span>{shortTitle(p.title)} <span className="pth-chip">{p.sentences.length} câu</span></span>
                <button className="pth-icon-btn" onClick={() => speak(p.sentences.map((s) => s.en).join(' '))} title="Nghe cả đoạn"><i className="fas fa-volume-high" /> Cả đoạn</button>
              </div>
              {p.sentences.map((s) => (
                <div className="pth-read-sent" key={s.key}>
                  <button className="pth-icon-btn pth-icon-btn--sm" onClick={() => speak(s.en)} title="Nghe câu này"><i className="fas fa-volume-high" /></button>
                  <div>
                    <div className="pth-read-role"><RoleTag s={s} /></div>
                    <div className="pth-read-en"><En s={s} /></div>
                    <div className="pth-read-vi" style={showVi ? undefined : { display: 'none' }}>{s.vi}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="pth-actions">
            {done ? <NextStepButton stepKey="read" onStep={ctx.onStep} onBack={ctx.onBack} />
              : <button className="pth-btn pth-btn--primary" onClick={finish}><i className="fas fa-check" /> Tôi đã đọc xong</button>}
          </div>
        </div>
      </div>
    </>
  );
}
