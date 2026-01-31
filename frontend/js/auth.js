async function login(){
  const res = await fetch('http://localhost:5000/api/auth/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();

  if(data.token){
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href="index.html";
  }else{
    msg.innerText = data;
  }
}

async function register(){
  const res = await fetch('http://localhost:5000/api/auth/register',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value
    })
  });
  const data = await res.json();
  msg.innerText = data;
}
