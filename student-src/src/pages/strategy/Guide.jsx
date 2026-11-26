// Chiến lược luyện đề — the article (sections I … ⭐), same text and markup as
// the old reading-listening-strategy.html. Pure content: no state.
// Four words are in Vietnamese where the markup had English (Loại, Thời gian,
// Kiểm tra ×2): on the old page js/shared/i18n.js turned them into Vietnamese
// at load, so that is what students saw. English mode translates them back.

// Between the week checklist and the test log (inside 🗓️ Lộ trình 7 tuần)
export function TimetableGuide() {
  return (
    <>
          <div className="st-block">
            <div className="st-block-label"><i className="fas fa-arrows-spin"></i> Weekly Study Cycle</div>
            <p>Lặp lại cùng một chu trình trong cả 7 tuần:</p>
            <div className="st-flow">
              <span className="st-chip">① TEST</span><span className="st-flow-sep">→</span>
              <span className="st-chip">② CHECK</span><span className="st-flow-sep">→</span>
              <span className="st-chip">③ ANALYSE</span><span className="st-flow-sep">→</span>
              <span className="st-chip">④ REWRITE</span><span className="st-flow-sep">→</span>
              <span className="st-chip">⑤ LEARN</span><span className="st-flow-sep">→</span>
              <span className="st-chip">⑥ RETEST</span>
            </div>
          </div>
  
          <div className="st-block">
            <div className="st-block-label"><i className="fas fa-pen-ruler"></i> Writing checklist — 7 tuần</div>
            <p><b>TASK 2</b> — học sinh phải nhận diện và viết được cả 7 dạng:</p>
            <div className="st-table-wrap">
              <table className="st-table">
                {/* "Loại": what the old page showed (i18n.js turned its "Type" into Vietnamese) */}
                <thead><tr><th>Loại</th><th>Dạng bài</th></tr></thead>
                <tbody>
                  <tr><td><b>01</b></td><td>Advantages &amp; Disadvantages</td></tr>
                  <tr><td><b>02</b></td><td>Discuss Both Views</td></tr>
                  <tr><td><b>03</b></td><td>Cause–Solution</td></tr>
                  <tr><td><b>04</b></td><td>Effect–Solution</td></tr>
                  <tr><td><b>05</b></td><td>Cause–Effect</td></tr>
                  <tr><td><b>06</b></td><td>Agree/Disagree</td></tr>
                  <tr><td><b>07</b></td><td>Positive/Negative Development</td></tr>
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 10 }}>Với mỗi body paragraph: <b>IDEA → WHY → HOW/WHO → RESULT → FURTHER RESULT → EXAMPLE</b>{' '}
            (không cần dùng hết — mục tiêu là biết <i>giải thích và phát triển ý</i>, không chỉ nêu ý).</p>
            <p style={{ marginTop: 14 }}><b>TASK 1</b> — cần luyện đủ 4 dạng:</p>
            <div className="tt-t1-grid" style={{ marginTop: 8 }}>
              <div className="tt-t1-card"><h4>① Dynamic Chart</h4><ul><li>Xác định xu hướng</li><li>So sánh</li><li>Gom nhóm số liệu</li><li>Chọn highlights</li><li>Chia Body 1/2</li></ul></div>
              <div className="tt-t1-card"><h4>② Static Chart</h4><ul><li>Tìm số liệu lớn/nhỏ</li><li>So sánh</li><li>Gom nhóm</li><li>Chọn highlights</li><li>Chia body hợp lý</li></ul></div>
              <div className="tt-t1-card"><h4>③ Process</h4><ul><li>Xác định số bước</li><li>Beginning→middle→end</li><li>Gom bước liên quan</li><li>Từ chỉ trình tự</li><li>Viết overview</li></ul></div>
              <div className="tt-t1-card"><h4>④ Map</h4><ul><li>Xác định thay đổi chính</li><li>Gom nhóm khu vực</li><li>So sánh before/after</li><li>Chọn features nổi bật</li><li>Chia Body 1/2</li></ul></div>
            </div>
          </div>
  
          <div className="st-block">
            <div className="st-block-label"><i className="fas fa-headphones-simple"></i> Reading · Listening · Speaking focus</div>
            <p><b>Reading</b> — ưu tiên Passage 1 + 2. Quy trình: <b>Question → Keyword → Paraphrase → Locate → Check → Answer</b>.
            Sau mỗi bài ghi: sai câu nào? vì sao sai? keyword ở đâu? paraphrase là gì? lần sau tránh lỗi thế nào?</p>
            <p><b>Listening</b> — ưu tiên Section 1 → 2 → 4. Luyện: prediction, keyword, paraphrase, distractors, signposting, spelling, singular/plural, number/date/name.
            Sau khi chữa: nghe lại → check transcript → tìm đoạn chứa đáp án → xác định vì sao chưa bắt được đáp án.</p>
            <p><b>Speaking</b> — Part 1 + Part 2 Forecast. Mỗi tuần: học topic → chuẩn bị vocabulary/collocations → luyện trả lời → ghi âm → nghe lại → sửa pronunciation/grammar/fluency → nói lại lần 2.
            Không học thuộc bài mẫu — mục tiêu là có ý tưởng + vocabulary + cách phát triển câu trả lời.</p>
          </div>
  
          <div className="st-callout">
            <div className="st-callout-t"><i className="fas fa-star"></i> Final 7-Week Rule</div>
            <p><b>Tại lớp:</b> Chữa lỗi → Rewrite → Học mới → Mock Test &nbsp;·&nbsp; <b>Ở nhà:</b> Practice → Analyse → Repeat<br />
            Mỗi tuần phải có 3 thứ: <b>① Mock score · ② Error log · ③ Rewritten answers</b>.</p>
          </div>
  
    </>
  );
}

export default function Guide() {
  return (
    <>
            <section className="st-sec" id="sec-read">
        <div className="st-sec-head"><span className="st-sec-num">I</span><h2>Cách luyện đề Reading</h2></div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-stopwatch"></i> Step 1 — Làm full 1 đề Reading trong đúng 1 tiếng</div>
          <ul className="st-ul">
            <li>Làm đủ <b>3 passages / 40 câu / 60 phút</b>.</li>
            <li>Không tra từ điển. Không pause giữa chừng.</li>
            <li>Cố gắng làm như thi thật để quen áp lực thời gian.</li>
            <li>Nếu mới bắt đầu và chưa quen, có thể cho bản thân thêm thời gian → sau đó giảm dần về 60 phút.</li>
            <li>Không nên vừa làm vừa tra từ vì sẽ không phản ánh trình độ thật.</li>
          </ul>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-check-double"></i> Step 2 — Check đáp án &amp; phân loại lỗi</div>
          <p>Check toàn bộ 40 câu. Đừng chỉ nhìn số điểm — quan trọng nhất là xem <b>tại sao mình sai</b>.
          Với mỗi câu sai, cố gắng xác định nguyên nhân:</p>
          <div className="st-step"><span className="st-step-badge">1</span><div className="st-step-body"><div className="st-step-t">Vocab</div><div className="st-step-d">Không biết từ / không hiểu từ.</div></div></div>
          <div className="st-step"><span className="st-step-badge">2</span><div className="st-step-body"><div className="st-step-t">Paraphrase</div><div className="st-step-d">Biết từ nhưng không nhận ra cách diễn đạt khác trong bài.</div></div></div>
          <div className="st-step"><span className="st-step-badge">3</span><div className="st-step-body"><div className="st-step-t">Understanding</div><div className="st-step-d">Đọc được từ nhưng hiểu sai câu / đoạn.</div></div></div>
          <div className="st-step"><span className="st-step-badge">4</span><div className="st-step-body"><div className="st-step-t">Locate</div><div className="st-step-d">Tìm sai vị trí thông tin trong passage.</div></div></div>
          <div className="st-step"><span className="st-step-badge">5</span><div className="st-step-body"><div className="st-step-t">Question type</div><div className="st-step-d">Chưa hiểu bản chất dạng câu hỏi.</div></div></div>
          <div className="st-step"><span className="st-step-badge">6</span><div className="st-step-body"><div className="st-step-t">Careless mistake</div><div className="st-step-d">Đọc sót, chọn nhầm, spelling sai...</div></div></div>
          <div className="st-step"><span className="st-step-badge">7</span><div className="st-step-body"><div className="st-step-t">Time management</div><div className="st-step-d">Không đủ thời gian nên phải chọn đáp án vội.</div></div></div>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-magnifying-glass"></i> Step 3 — Xem thật kỹ các câu sai</div>
          <ul className="st-ul">
            <li>Đọc lại question + passage.</li>
            <li>Tự tìm lại đáp án <b>trước khi</b> xem explanation.</li>
            <li>Xác định <b>evidence</b> trong passage chứng minh đáp án.</li>
            <li>Nếu vẫn không hiểu → mới xem bài giải chi tiết.</li>
          </ul>
          <p style={{ marginTop: 10 }}>Đặc biệt với <b>T/F/NG</b> hoặc <b>Y/N/NG</b>:</p>
          <ul className="st-ul">
            <li><b>TRUE / YES</b> → Passage xác nhận thông tin.</li>
            <li><b>FALSE / NO</b> → Passage đưa thông tin trái ngược.</li>
            <li><b>NOT GIVEN</b> → Passage không đủ thông tin để kết luận.</li>
          </ul>
        </div>
        <div className="st-callout">
          <div className="st-callout-t"><i className="fas fa-triangle-exclamation"></i> Lưu ý</div>
          <p>Không được dùng kiến thức bên ngoài để suy luận đáp án.</p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-right-left"></i> Step 4 — Check paraphrase</div>
          <p>Đây là bước rất quan trọng. Sau mỗi câu sai, hãy nhìn: <b>Question wording → Passage wording</b>.</p>
          <div className="st-pairs">
            <div className="st-pair"><b>increase</b> → rise / grow / climb</div>
            <div className="st-pair"><b>important</b> → significant / crucial</div>
            <div className="st-pair"><b>children</b> → youngsters</div>
            <div className="st-pair"><b>cause</b> → reason / factor</div>
            <div className="st-pair"><b>reduce</b> → decrease / decline / cut</div>
          </div>
          <p style={{ marginTop: 10 }}>Mục tiêu là luyện khả năng nhìn thấy <b>cùng một ý dù dùng từ khác nhau</b>.</p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-book"></i> Step 5 — Tra vocab</div>
          <ul className="st-ul">
            <li>Tra những từ bạn <b>thật sự không biết</b> trong bài. Không nhất thiết phải tra từng từ.</li>
            <li>Những từ quá chuyên ngành (tên hoá chất cực hiếm, tên khoa học của một loài...) có thể bỏ qua.</li>
            <li>Nhưng vocabulary chuyên biệt <b>có khả năng xuất hiện lại</b> trong IELTS thì vẫn nên học:</li>
          </ul>
          <div className="st-pairs">
            <div className="st-pair"><b>astronomy</b> → comet, satellite...</div>
            <div className="st-pair"><b>biology</b> → chlorophyll, cell...</div>
            <div className="st-pair"><b>plants</b> → fern, eucalyptus...</div>
            <div className="st-pair"><b>health</b> → diabetes, asthma...</div>
          </div>
          <p style={{ marginTop: 10 }}>Khi tra từ: xem <b>meaning</b>, <b>part of speech</b>, <b>pronunciation</b> (nếu cần),
          xem thêm nghĩa khác nếu là từ đa nghĩa, và đặc biệt chú ý <b>phrasal verbs / collocations</b>.</p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-pen-nib"></i> Step 6 — Không nhất thiết phải chép toàn bộ vocab</div>
          <p>Nếu bạn lười ghi chép thì đừng biến việc học IELTS thành việc chép từ vựng. Một cách đơn giản hơn:{' '}
          <b>làm nhiều đề + gặp lại từ nhiều lần + học từ trong context</b>.</p>
          <p>IELTS có rất nhiều vocabulary lặp lại. Càng làm nhiều đề: gặp từ → hiểu nghĩa → gặp lại → nhớ lâu hơn.</p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-repeat"></i> Step 7 — Đọc lại những passage khó</div>
          <ul className="st-ul">
            <li>Đọc lại passage một lần. Không cần dịch từng câu.</li>
            <li>Tập hiểu <b>main idea</b> + cách triển khai ý.</li>
            <li>Chú ý những đoạn mình từng đọc nhưng không hiểu.</li>
          </ul>
        </div>
        <div className="st-callout">
          <div className="st-callout-t"><i className="fas fa-triangle-exclamation"></i> Đừng cố hiểu 100% mọi từ</div>
          <p>Mục tiêu của Reading là: <b>Understand enough to locate and confirm the answer.</b></p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-rotate"></i> Step 8 — Re-test câu sai</div>
          <p>Sau khoảng <b>2–3 ngày</b>: không nhìn đáp án, làm lại những câu đã sai, xem mình còn mắc lỗi không.</p>
          <p>Nếu vẫn sai lần 2 → đây là một <b>weakness thực sự</b> và nên luyện riêng dạng câu hỏi đó.</p>
        </div>
      </section>

            <section className="st-sec" id="sec-listen">
        <div className="st-sec-head"><span className="st-sec-num">II</span><h2>Cách luyện đề Listening</h2></div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-headphones"></i> Step 1 — Làm full 1 đề Listening</div>
          <ul className="st-ul">
            <li>Làm đủ <b>4 sections / 40 câu</b>.</li>
            <li>Không pause. Không tua lại. Không xem transcript. Làm liên tục như thi thật.</li>
            <li>Nếu mới bắt đầu: có thể nghe lại giữa chừng để làm quen — nhưng khi đã quen thì phải tập làm một mạch.</li>
          </ul>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-lightbulb"></i> Step 2 — Prediction trước khi nghe</div>
          <p>Trước khi audio chạy: đọc câu hỏi, gạch keywords, dự đoán loại đáp án. Xác định cần nghe:{' '}
          <b>noun / verb / adjective / number / date / place / name...</b></p>
          <div className="st-pairs">
            <div className="st-pair">The museum will be closed on ______. &nbsp;→&nbsp; dự đoán cần <b>day / date</b>.</div>
          </div>
          <p style={{ marginTop: 10 }}>Việc này giúp bạn <b>nghe chủ động</b> thay vì ngồi chờ từng từ.</p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-check-double"></i> Step 3 — Check đáp án</div>
          <ul className="st-ul">
            <li>Check toàn bộ 40 câu. Ghi điểm.</li>
            <li>Không bỏ qua những câu đúng nếu bạn đúng do <b>đoán may</b>.</li>
            <li>Quan trọng nhất vẫn là: <b>tại sao mình sai?</b></li>
          </ul>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-layer-group"></i> Step 4 — Phân loại lỗi</div>
          <div className="st-step"><span className="st-step-badge">1</span><div className="st-step-body"><div className="st-step-t">❌ Didn't hear — nghe không ra từ</div><div className="st-step-d">Check pronunciation trong Cambridge / Oxford. Nghe lại từ đó trong audio. Chú ý: linking sounds, weak forms, connected speech, stress, tốc độ nói.</div></div></div>
          <div className="st-step"><span className="st-step-badge">2</span><div className="st-step-body"><div className="st-step-t">❌ Heard but didn't understand — nghe được từ nhưng không hiểu</div><div className="st-step-d">Tra meaning, xem các nghĩa khác, học thêm collocations / phrasal verbs (vd: come across, go off, work out). Không nên chỉ học một nghĩa duy nhất.</div></div></div>
          <div className="st-step"><span className="st-step-badge">3</span><div className="st-step-body"><div className="st-step-t">❌ Paraphrase</div><div className="st-step-d">Người nói không dùng đúng từ trong câu hỏi. Tìm: Question → Audio và xem họ đã paraphrase như thế nào.</div></div></div>
          <div className="st-step"><span className="st-step-badge">4</span><div className="st-step-body"><div className="st-step-t">❌ Distractor</div><div className="st-step-d">Nghe thấy một đáp án nhưng sau đó người nói sửa lại / phủ định / thay đổi thông tin. Rất phổ biến. Chú ý: <b>actually, but, however, sorry, I mean, rather, instead, no that's..., originally...</b></div></div></div>
          <div className="st-step"><span className="st-step-badge">5</span><div className="st-step-body"><div className="st-step-t">❌ Spelling / Grammar</div><div className="st-step-d">Nghe đúng nhưng viết sai; sai số ít / số nhiều; sai spelling; điền quá số từ quy định. Phải sửa riêng những lỗi này.</div></div></div>
          <div className="st-step"><span className="st-step-badge">6</span><div className="st-step-body"><div className="st-step-t">❌ Concentration</div><div className="st-step-d">Bị mất tập trung; miss một câu rồi hoảng; nghĩ về câu trước nên mất câu tiếp theo. Phải tập kỹ năng <b>bỏ câu vừa miss và tiếp tục nghe</b>.</div></div></div>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-file-lines"></i> Step 5 — Đọc script</div>
          <p>Bước cực kỳ quan trọng với người yếu Listening. Mở transcript, nghe lại audio, <b>vừa nghe vừa nhìn script</b>.
          Đánh dấu những chỗ: lúc đầu không nghe được, nghe nhầm, nối âm, nói lướt, nói nhanh, pronunciation khác với mình tưởng tượng.</p>
          <p>Mục tiêu: <i>"À, hoá ra người ta nói câu này như vậy."</i></p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-volume-high"></i> Step 6 — Nghe lại WITH script</div>
          <ul className="st-ul">
            <li>Nghe nhiều lần nếu cần.</li>
            <li>Tập nhận diện <b>âm thanh ↔ từ vựng</b>.</li>
            <li>Đặc biệt tập trung vào những chỗ mình từng không nghe được. Có thể đọc theo audio nếu cần.</li>
          </ul>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-volume-xmark"></i> Step 7 — Nghe lại WITHOUT script</div>
          <p>Đóng transcript lại. Nghe lại toàn bộ hoặc những section khó, xem mình hiểu được bao nhiêu.
          Nếu vẫn không nghe ra nhiều → quay lại Step 5. Không cần ép bản thân phải hiểu 100%.</p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-clone"></i> Step 8 — Shadowing (optional)</div>
          <p>Phù hợp với người nghe yếu. Bật audio, nói theo người nói, tập <b>rhythm, stress, linking, intonation</b>.
          Không cần shadowing mọi bài — chỉ dùng với những đoạn bạn nghe mãi vẫn không nhận ra âm.</p>
        </div>

        <div className="st-block">
          <div className="st-block-label"><i className="fas fa-couch"></i> Step 9 — Passive / Extensive Listening (optional)</div>
          <p>Tận dụng những file Listening đã làm và đã chữa. Có thể nghe lại khi đi xe bus, đi bộ, làm việc nhà, tắm, nghỉ ngơi... — không cần ngồi làm bài.</p>
          <p>Mục tiêu: <b>cho tai tiếp xúc với tiếng Anh thường xuyên</b>. Sau một thời gian, bạn sẽ nhận ra những cách phát âm và cụm từ quen thuộc nhanh hơn.</p>
        </div>
      </section>

            <section className="st-sec" id="sec-track">
        <div className="st-sec-head"><span className="st-sec-num">III</span><h2>Sau mỗi đề: đừng chỉ ghi điểm</h2></div>
        <div className="st-block">
          <p>Có thể tạo một bảng cực đơn giản:</p>
          <div className="st-table-wrap">
            <table className="st-table">
              <thead><tr><th>Test</th><th>Reading</th><th>Listening</th><th>Main weakness</th></tr></thead>
              <tbody>
                <tr><td>Test 1</td><td>28</td><td>25</td><td>Vocab</td></tr>
                <tr><td>Test 2</td><td>30</td><td>27</td><td>T/F/NG</td></tr>
                <tr><td>Test 3</td><td>31</td><td>29</td><td>Distractors</td></tr>
                <tr><td>Test 4</td><td>32</td><td>30</td><td>Thời gian</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12 }}>Sau khoảng <b>5–10 đề</b>, nhìn lại xem:</p>
          <ul className="st-ul">
            <li>Lỗi nào lặp lại nhiều nhất?</li>
            <li>Dạng câu hỏi nào yếu nhất?</li>
            <li>Vocabulary có phải vấn đề chính không?</li>
            <li>Listening sai vì <b>không nghe được</b> hay vì <b>không hiểu</b>?</li>
            <li>Điểm có thực sự tăng không?</li>
          </ul>
        </div>
      </section>

            <section className="st-sec" id="sec-move">
        <div className="st-sec-head"><span className="st-sec-num">IV</span><h2>Khi nào nên chuyển sang đề mới?</h2></div>
        <div className="st-block">
          <p>Một đề không được tính là "đã làm xong" chỉ vì check đáp án. Nên hoàn thành đủ:</p>
          <div className="st-flow">
            <span className="st-chip">DO</span><span className="st-flow-sep">→</span>
            <span className="st-chip">CHECK</span><span className="st-flow-sep">→</span>
            <span className="st-chip">ANALYSE</span><span className="st-flow-sep">→</span>
            <span className="st-chip">REVIEW</span><span className="st-flow-sep">→</span>
            <span className="st-chip">RETEST</span><span className="st-flow-sep">→</span>
            <span className="st-chip">MOVE ON</span>
          </div>
          <p style={{ marginTop: 12 }}>Nếu sai một dạng quá nhiều:</p>
          <div className="st-flow">
            <span className="st-chip">STOP</span><span className="st-flow-sep">→</span>
            <span className="st-chip">PRACTISE THAT QUESTION TYPE</span><span className="st-flow-sep">→</span>
            <span className="st-chip">RETURN TO FULL TEST</span>
          </div>
          <p style={{ marginTop: 12 }}>Đừng cứ cày Cambridge 18 → 19 → 20 → 21 → 22... mà không chữa lỗi.</p>
        </div>
        <div className="st-callout">
          <div className="st-callout-t"><i className="fas fa-star"></i> Nguyên tắc</div>
          <p><b>10 đề làm kỹ &gt; 30 đề làm cho có.</b></p>
        </div>
      </section>

            <section className="st-sec" id="sec-phase">
        <div className="st-sec-head"><span className="st-sec-num">V</span><h2>Chiến lược theo từng giai đoạn</h2></div>
        <div className="st-phase g">
          <h3>🟢 Giai đoạn 1 — Skill Building</h3>
          <ul className="st-ul">
            <li>Học từng dạng câu hỏi.</li>
            <li>Luyện vocabulary. Luyện paraphrase.</li>
            <li>Listening: tập nghe + transcript.</li>
            <li>Chưa cần ép bản thân làm full test liên tục.</li>
          </ul>
        </div>
        <div className="st-phase y">
          <h3>🟡 Giai đoạn 2 — Timed Practice</h3>
          <ul className="st-ul">
            <li>Bắt đầu làm full test.</li>
            <li>Reading: 60 phút. Listening: làm một mạch.</li>
            <li>Theo dõi điểm và lỗi.</li>
          </ul>
        </div>
        <div className="st-phase r">
          <h3>🔴 Giai đoạn 3 — Mock Test</h3>
          <ul className="st-ul">
            <li>Làm như thi thật: không dictionary, không pause, không xem transcript, không kéo dài thời gian.</li>
            <li>Làm đủ Reading + Listening.</li>
          </ul>
        </div>
        <div className="st-phase b">
          <h3>🔵 Giai đoạn 4 — Final Practice</h3>
          <ul className="st-ul">
            <li>Ưu tiên review lỗi cũ.</li>
            <li>Làm đề mới vừa phải. Không cày đề một cách vô thức.</li>
            <li>Tập trung vào những weakness còn tồn tại.</li>
          </ul>
        </div>
      </section>

            <section className="st-sec" id="sec-principle">
        <div className="st-sec-head"><span className="st-sec-num">VI</span><h2>Một nguyên tắc quan trọng</h2></div>
        <div className="st-block">
          <p>Reading &amp; Listening không phải hai kỹ năng có thể tăng điểm chỉ bằng cách cày thật nhiều đề. Bạn cần:{' '}
          <b>làm đề → phát hiện lỗi → hiểu nguyên nhân → sửa lỗi → gặp lại → kiểm tra lại</b>.</p>
          <p>Đặc biệt:</p>
          <ul className="st-ul">
            <li><b>Reading</b> = Vocabulary + Paraphrase + Question types + Reading strategies</li>
            <li><b>Listening</b> = Pronunciation + Vocabulary + Paraphrase + Prediction + Distractors + Concentration</li>
          </ul>
        </div>
      </section>

            <section className="st-sec" id="sec-tip">
        <div className="st-sec-head"><span className="st-sec-num">VII</span><h2>Một mẹo cuối cùng</h2></div>
        <div className="st-block">
          <p>Theo kinh nghiệm cá nhân, mình thường khuyên học viên <b>đừng quá rush việc đăng ký thi</b>.
          Ít nhất hãy xây được một nền tảng tương đối ổn, chẳng hạn:</p>
          <ul className="st-ul">
            <li>Listening Part 1 thường chỉ sai 0–1 câu.</li>
            <li>Có thể làm 3 Reading passages trong 60 phút mà không bị quá đuối.</li>
            <li>Đã quen với các dạng câu hỏi phổ biến.</li>
            <li>Biết rõ mình thường sai vì vocab, paraphrase, question type hay careless mistakes.</li>
          </ul>
          <p>Khi đó việc luyện full test mới thực sự có giá trị, thay vì chỉ làm đề để nhìn điểm.</p>
        </div>
      </section>

            <section className="st-sec" id="sec-books">
        <div className="st-sec-head"><span className="st-sec-num">VIII</span><h2>Tài liệu tham khảo</h2></div>

        <div className="st-ref">
          <h4>1. Luyện từng dạng Reading + Listening</h4>
          <ul><li>Complete IELTS Band 4.0–5.0</li><li>Complete IELTS Band 5.0–6.5</li></ul>
        </div>
        <div className="st-ref">
          <h4>2. Listening</h4>
          <ul><li>Basic IELTS Listening</li></ul>
          <div className="st-ref-note">Khá cơ bản, dễ tiếp cận, phù hợp với người Listening yếu.</div>
        </div>
        <div className="st-ref">
          <h4>3. Reading</h4>
          <ul><li>Collins – Reading for IELTS</li></ul>
          <div className="st-ref-note">Có vocabulary theo topic, khá hữu ích cho người đang xây nền.</div>
        </div>
        <div className="st-ref">
          <h4>4. Writing</h4>
          <ul><li>IELTS Advantage: Writing Skills</li></ul>
          <div className="st-ref-note">Có thể dùng để bổ trợ vocabulary + writing skills, nhưng không nên chỉ học duy nhất cuốn này vì không cover toàn bộ topic.</div>
        </div>
        <div className="st-ref">
          <h4>5. Full Test</h4>
          <ul><li>Cambridge IELTS</li><li>IELTS Test Builder 1</li><li>IELTS Test Builder 2</li><li>Test Plus 1–3</li></ul>
        </div>

        <div className="st-callout">
          <div className="st-callout-t"><i className="fas fa-triangle-exclamation"></i> Lưu ý</div>
          <p>Sách luyện đề chỉ là tài liệu luyện tập, không phải toàn bộ lộ trình từ mất gốc → IELTS 8.0.
          Nếu nền tảng còn yếu, vẫn cần học grammar, vocabulary, pronunciation và từng skill riêng trước khi cày full test.</p>
        </div>
      </section>

            <section className="st-sec" id="sec-summary">
        <div className="st-sec-head"><span className="st-sec-num">⭐</span><h2>Tóm tắt cực ngắn</h2></div>
        <div className="st-summary">
          <h3>READING</h3>
          <div className="st-flow">
            <span className="st-chip">Do 60'</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Kiểm tra</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Phân loại lỗi</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Tìm evidence</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Check paraphrase</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Học vocab</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Re-test câu sai</span>
          </div>
          <h3 style={{ marginTop: 16 }}>LISTENING</h3>
          <div className="st-flow">
            <span className="st-chip">Predict</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Do full test</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Kiểm tra</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Phân loại lỗi</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Check script</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Nghe WITH script</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Nghe WITHOUT script</span><span className="st-flow-sep">→</span>
            <span className="st-chip">Re-test</span>
          </div>
          <div className="st-final">VÀ QUAN TRỌNG NHẤT:<br />ĐỪNG ĐO HIỆU QUẢ BẰNG SỐ ĐỀ ĐÃ LÀM.<br />HÃY ĐO BẰNG SỐ LỖI LẶP LẠI ĐÃ GIẢM.</div>
        </div>
      </section>
    </>
  );
}
