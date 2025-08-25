let timerInterval, segundos = 0;

function setNow(campo) {
  document.getElementById(campo).value = new Date().toLocaleDateString().split('/').reverse().join('-');
}

function setText(campo, texto, isInput = false) {
  if (isInput) {
    document.getElementById(campo).value = texto;
  } else {
    document.getElementById(campo).innerText = texto;
  }
}

function toggleButton() {
  const aux = document.getElementById("btnStart").style.display;
  document.getElementById("btnStart").style.display = document.getElementById("btnStop").style.display;
  document.getElementById("btnStop").style.display = aux;
}

function reverseDate(data) {
    return data.indexOf('-') !== -1 ? data.split('-').reverse().join('/') : data.split('/').reverse().join('-');
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    segundos++;
    let h = String(Math.floor(segundos/3600)).padStart(2,"0");
    let m = String(Math.floor((segundos%3600)/60)).padStart(2,"0");
    let s = String(segundos%60).padStart(2,"0");
    setText('timer', `${h}:${m}`, true);
    setText('segundos', `${s}`);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  setText('segundos', '');
}

function salvar() {
  stopTimer();
  segundos = 0;
  setNow('data');
  const data = document.getElementById("data").value;
  const tempo = document.getElementById("timer").value;
  const obs = document.getElementById("obs").value;

  const registro = `${reverseDate(data)} | ${tempo} | ${obs}`;

  let li = document.createElement("li");
  li.textContent = registro;
  li.addEventListener('click', function(e) {
    console.log(e.currentTarget);
  });
  document.getElementById("lista").appendChild(li);
  
  const mes = data.substring(0, 7);
  localStorage.setItem("registros_" + mes, document.getElementById("lista").innerHTML);
  
  setText('timer', '00:00', true);
}

window.onload = () => {
  setNow('data');
  if(localStorage.getItem("registros")){
    document.getElementById("lista").innerHTML = localStorage.getItem("registros_2025-08");
    Array.from(document.querySelectorAll('#lista li')).forEach((item) => {
      item.addEventListener('click', function(e) {
        console.log(e.currentTarget);
      });
    });
  }
};

// Registrar service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
