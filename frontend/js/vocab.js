async function loadUnits(){
  const res = await fetch('http://localhost:5000/api/vocab');
  const data = await res.json();

  units.innerHTML = data.map(u=>`
    <div>
      <h3>Unit ${u.unit}: ${u.title}</h3>
      ${u.words.map(w=>`
        <p><b>${w.word}</b> - ${w.meaning}</p>
      `).join("")}
    </div>
  `).join("");
}

loadUnits();
