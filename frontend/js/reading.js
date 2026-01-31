let currentTest;

async function loadTest(){
  const res = await fetch('http://localhost:5000/api/reading');
  const tests = await res.json();
  currentTest = tests[0]; // lấy bài đầu

  test.innerHTML = `
    <h3>${currentTest.title}</h3>
    <p>${currentTest.passage}</p>
    ${currentTest.questions.map((q,i)=>`
      <p>${q.question}</p>
      ${q.options.map(op=>`
        <label>
          <input type="radio" name="q${i}" value="${op}"> ${op}
        </label>
      `).join("<br>")}
      <hr>
    `).join("")}
  `;
}

function submitTest(){
  let score = 0;
  const answers = [];

  currentTest.questions.forEach((q,i)=>{
    const chosen = document.querySelector(`input[name="q${i}"]:checked`);
    const ans = chosen ? chosen.value : "";
    answers.push(ans);
    if(ans === q.correctAnswer) score++;
  });

  result.innerText = `Score: ${score}/${currentTest.questions.length}`;

  // save history
  const user = JSON.parse(localStorage.getItem("user"));

  fetch('http://localhost:5000/api/history/save',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      userId:user._id,
      type:"reading",
      referenceId:currentTest._id,
      score:score,
      answers:answers
    })
  });
}

loadTest();
