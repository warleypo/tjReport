let anoAtual = new Date().getFullYear();
let mesAtual = new Date().getMonth() + 1;
let timerInterval;
let segundos = 0;
const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const config = {
  publicador: {
    nome: "",
  },
  pioneiro: {
    horas: 0,
    tipo: "",
  },
  programacao: {
    dias: [],
  },
  envio: {
    whatsapp: "",
  },
};

function setText(campo, texto, isInput = false) {
  if (isInput) {
    document.getElementById(campo).value = texto;
  } else {
    document.getElementById(campo).innerText = texto;
  }
}

function getStorageKey(ano, mes) {
  return `report-${ano}-${String(mes).padStart(2, "0")}`;
}

function getConfigData() {
  const key = "report-config";
  const data = JSON.parse(localStorage.getItem(key));
  if (data) {
    Object.assign(config, data);
  }

  if (document.getElementById("publicador")) {
    setText("publicador", config.publicador.nome, true);
    setText("horas", config.pioneiro.horas, true);
    setText("whatsapp", config.envio.whatsapp, true);

    document.getElementById("inlineRadio1").checked =
      config.pioneiro.tipo === "publicador";

    document.getElementById("inlineRadio2").checked =
      config.pioneiro.tipo === "auxiliar";

    document.getElementById("inlineRadio3").checked =
      config.pioneiro.tipo === "promoção";

    document.getElementById("inlineRadio4").checked =
      config.pioneiro.tipo === "regular";

    document.getElementById("inlineRadio5").checked =
      config.pioneiro.tipo === "especial";

    document.getElementById("inlineCheckbox1").checked =
      config.programacao.dias.includes("0");

    document.getElementById("inlineCheckbox2").checked =
      config.programacao.dias.includes("1");

    document.getElementById("inlineCheckbox3").checked =
      config.programacao.dias.includes("2");

    document.getElementById("inlineCheckbox4").checked =
      config.programacao.dias.includes("3");

    document.getElementById("inlineCheckbox5").checked =
      config.programacao.dias.includes("4");

    document.getElementById("inlineCheckbox6").checked =
      config.programacao.dias.includes("5");

    document.getElementById("inlineCheckbox7").checked =
      config.programacao.dias.includes("6");
  }
}

function getReportData(ano, mes) {
  const key = getStorageKey(ano, mes);
  const data = JSON.parse(localStorage.getItem(key));
  return data || [];
}

function saveConfig() {
  const key = "report-config";
  config.publicador.nome = document.getElementById("publicador").value || "";
  config.pioneiro.horas = document.getElementById("horas").value || 0;
  config.pioneiro.tipo =
    document.querySelector("input[name='inlineRadioOptions']:checked")?.value ||
    "";
  config.programacao.dias = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((cb) => cb.value);
  config.envio.whatsapp = document.getElementById("whatsapp").value || "";

  localStorage.setItem(key, JSON.stringify(config));
  console.log("Configurações salvas:", config);
  location.assign("index.html");
}

function saveReport(report) {
  const ano = report.data.split("-")[0];
  const mes = report.data.split("-")[1];
  const key = getStorageKey(ano, mes);
  console.log(key, ano, mes);

  //recupera registros
  const registros = getReportData(ano, mes);

  //adiciona novos registros
  registros.push(report);

  localStorage.setItem(key, JSON.stringify(registros));
}

function sendReport() {
  const totais = getTotais();
  const mensagem =
    `Prezado irmão, envio-lhe o meu relatório:\n\n` +
    `*Nome: ${config.publicador.nome}*\r\n` +
    `*Mês: ${meses[mesAtual - 1]}/${anoAtual}*\r\n` +
    `Participou no ministério: ${
      totais.horas_trabalhadas === "00:00" ? "Não" : "Sim"
    }\r\n` +
    `Estudos: ${totais.estudos}\r\n\r\n` +
    "Atenciosamente.";
  shareWhatsapp(config.envio.whatsapp.replace(/[^\d]/g, ""), mensagem);
}

function getTotais() {
  const registros = getReportData(anoAtual, mesAtual);
  const totais = {
    horas_trabalhadas: "00:00",
    horas_restantes: "00:00",
    dias_atividade: 0,
    estudos: 0,
    objetivo_diario: "00:00",
  };

  registros.forEach((reg) => {
    totais.horas_trabalhadas = somarHoras(totais.horas_trabalhadas, reg.tempo);
    totais.estudos += parseInt(reg.estudos) || 0;
  });

  config.programacao.dias.forEach((dia) => {
    totais.dias_atividade += diasRestantes(parseInt(dia));
    console.log(
      `Dias restantes para o dia ${dia}: ${diasRestantes(parseInt(dia))}`
    );
  });

  totais.horas_restantes = subtrairHoras(
    `${String(config.pioneiro.horas).padStart(2, "0")}:00`,
    totais.horas_trabalhadas
  );
  totais.objetivo_diario = calcularObjetivoDiario(
    totais.horas_restantes,
    totais.dias_atividade
  );

  setText("horas_trabalhadas", totais.horas_trabalhadas);
  setText("horas_restantes", totais.horas_restantes);
  setText("dias_atividade", totais.dias_atividade);
  setText("objetivo_diario", totais.objetivo_diario);
  setText("meta_horas", config.pioneiro.horas + "h");

  return totais;
}

function somarHoras(hora1, hora2) {
  // hora1 e hora2 no formato "HH:MM"
  const [h1, m1] = hora1.split(":").map(Number);
  const [h2, m2] = hora2.split(":").map(Number);

  let totalMin = h1 * 60 + m1 + (h2 * 60 + m2);

  const horas = Math.floor(totalMin / 60);
  const minutos = totalMin % 60;

  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(
    2,
    "0"
  )}`;
}

function subtrairHoras(hora1, hora2) {
  // hora1 e hora2 no formato "HH:MM:SS"
  const [h1, m1] = hora1.split(":").map(Number);
  const [h2, m2] = hora2.split(":").map(Number);

  const t1 = h1 * 3600 + m1 * 60;
  const t2 = h2 * 3600 + m2 * 60;

  let diff = t1 - t2;
  if (diff < 0) diff += 24 * 3600; // caso passe da meia-noite

  const horas = Math.floor(diff / 3600)
    .toString()
    .padStart(2, "0");
  const minutos = Math.floor((diff % 3600) / 60)
    .toString()
    .padStart(2, "0");

  return `${horas}:${minutos}`;
}

function calcularObjetivoDiario(horasRestantes, diasAtividade) {
  console.log("objetivo", horasRestantes, diasAtividade);
  if (diasAtividade === 0) return horasRestantes;
  const [hr, mr] = horasRestantes.split(":").map(Number);
  const totalMinutos = hr * 60 + mr;
  const objetivoMinutos = Math.ceil(totalMinutos / diasAtividade);
  return `${Math.floor(objetivoMinutos / 60)}:${String(
    objetivoMinutos % 60
  ).padStart(2, "0")}`;
}

function showReport(ano, mes) {
  const mesReport = document.getElementById("mesReport");
  mesReport &&
    (mesReport.textContent = `${String(mes).padStart(2, "0")}/${ano}`);
  const registros = getReportData(ano, mes);
  console.log(registros);

  const lista = document.getElementById("lista");
  lista && (lista.innerHTML = "");

  function mostrarDetalhes(reg, i) {
    let url = `cadastro.html?id=${i}&mes=${reg.data.substr(0, 7)}`;
    location.assign(url);
  }

  registros.forEach((reg, i) => {
    const li = document.createElement("li");
    li.addEventListener("click", (e) => {
      mostrarDetalhes(reg, i);
    });
    li.classList.add("row");
    li.classList.add("mb-2");
    li.classList.add("bg-light");
    li.classList.add("rounded");
    li.classList.add("rounded-lg");

    const div = document.createElement("div");
    div.classList.add("col-6");
    div.classList.add("mb-4");
    div.classList.add("p-4");

    const strong = document.createElement("strong");
    strong.innerHTML = `${reg.data.split("-").reverse().join("/")}<br>`;
    div.appendChild(strong);

    const spanTempo = document.createElement("span");
    spanTempo.innerHTML = `${reg.tempo}<br>`;
    div.appendChild(spanTempo);

    const spanObs = document.createElement("span");
    spanObs.innerHTML = `${reg.obs.replace(/\r?\n/g, "<br>")}`;
    spanObs.classList.add("text-info");

    div.appendChild(spanObs);

    li.appendChild(div);

    const divClone = div.cloneNode();
    divClone.innerHTML = `Estudos: ${String(reg.estudos).padStart(1, "0")}`;
    divClone.classList.add("text-right");

    li.appendChild(divClone);

    lista?.appendChild(li);
  });
}

function nextReport() {
  mesAtual++;
  if (mesAtual > 12) {
    mesAtual = 1;
    anoAtual++;
  }
  showReport(anoAtual, mesAtual);
}

function previousReport() {
  mesAtual--;
  if (mesAtual < 1) {
    mesAtual = 12;
    anoAtual--;
  }
  showReport(anoAtual, mesAtual);
}

showReport(anoAtual, mesAtual);

function getInputData(id) {
  const inputData = document.getElementById(id).value;
  return inputData;
}

function toggleButton() {
  const aux = document.getElementById("btnStart").style.display;
  document.getElementById("btnStart").style.display =
    document.getElementById("btnStop").style.display;
  document.getElementById("btnStop").style.display = aux;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    segundos++;
    let h = String(Math.floor(segundos / 3600)).padStart(2, "0");
    let m = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
    let s = String(segundos % 60).padStart(2, "0");
    setText("tempo", `${h}:${m}`, true);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function getEditData() {
  const id = new URLSearchParams(window.location.search).get("id");
  const mes = new URLSearchParams(window.location.search)
    .get("mes")
    ?.split("-");
  if (id && mes) {
    const registro = getReportData(mes[0], mes[1])[id];
    if (registro) {
      document.getElementById("data").value = registro.data;
      document.getElementById("tempo").value = registro.tempo;
      document.getElementById("estudos").value = registro.estudos;
      document.getElementById("estudantes").value = registro.estudantes;
      document.getElementById("obs").value = registro.obs;
    }
  }
}

function saveEditData() {
  const id = new URLSearchParams(window.location.search).get("id");
  const mes = new URLSearchParams(window.location.search).get("mes").split("-");
  if (id && mes) {
    const registro = getReportData(mes[0], mes[1]);
    if (registro) {
      registro[id].data = document.getElementById("data").value;
      registro[id].tempo = document.getElementById("tempo").value;
      registro[id].estudos = document.getElementById("estudos").value;
      registro[id].estudantes = document.getElementById("estudantes").value;
      registro[id].obs = document.getElementById("obs").value;
      localStorage.setItem(
        `report-${mes[0]}-${mes[1]}`,
        JSON.stringify(registro)
      );
    }
  }
  location.assign("index.html");
}

function diasRestantes(diaSemana) {
  const hoje = new Date();
  const ultimoDia = new Date(
    hoje.getFullYear(),
    hoje.getMonth() + 1,
    0
  ).getDate();

  let contagem = 0;
  for (let i = hoje.getDate(); i <= ultimoDia; i++) {
    const dia = new Date(hoje.getFullYear(), hoje.getMonth(), i);
    if (dia.getDay() === diaSemana) contagem++;
  }
  return contagem;
}

window.onload = () => {
  if (document.getElementById("data")) {
    document.getElementById("data").value = new Date()
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");
    const update = new URLSearchParams(window.location.search).get("id");
    if (update) {
      document.getElementById("btnSalvar").style.display = "none";
      document.getElementById("btnAlterar").style.display = "inline";
    } else {
      document.getElementById("btnSalvar").style.display = "inline";
      document.getElementById("btnAlterar").style.display = "none";
    }
  }

  getConfigData();
  if (document.getElementById("meta_horas")) getTotais();

  getEditData();
};

//funções dos botões
function salvar(update = false) {
  // const update = new URLSearchParams(window.location.search).get("id");
  if (update) {
    saveEditData();
    return;
  }
  const report = {
    data: getInputData("data"),
    tempo: getInputData("tempo"),
    estudos: getInputData("estudos"),
    estudantes: getInputData("estudantes"),
    obs: getInputData("obs"),
  };
  if (!isNaN(new Date(report.data).getTime())) {
    saveReport(report);
    location.assign("index.html");
  } else {
    console.log("Insira uma data válida");
  }
}

function addEstudo(valor) {
  const estudosInput = document.getElementById("estudos");
  let estudos = parseInt(estudosInput.value) || 0;
  estudos += valor;
  estudosInput.value = estudos >= 0 ? estudos : 0;
}

function pioneiroHoras(horas) {
  setText("horas", horas, true);
}

function shareWhatsapp(fone = "", text = "") {
  const url = `https://wa.me/${fone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
