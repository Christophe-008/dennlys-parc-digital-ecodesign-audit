import { urlLink, dialog } from "./answers.js";

const apiKey = "0a023285b89104b62d53d5e1166678ad";
const latLon = [50.570559, 2.1551699];
const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latLon[0]}&lon=${latLon[1]}&appid=${apiKey}&lang=fr&units=metric`;
const inputDialog = document.getElementById("inputAnswer");
const dataList = document.getElementById("choice");
const response = document.getElementById("responseBot");
const answer = document.getElementById("answer");
const dennoDialog = document.getElementById("dennoDialog");
const formFAQ = document.getElementById("formFAQ");

const dennoBot = document.getElementById("dennoBot");
const closeBot = document.getElementById("closeBot");
const btnDenno = document.getElementById("btnDenno");
const dennoClose = document.getElementById("dennoClose");

const inputAnswerBis = document.getElementById("inputAnswerBis");

if (btnDenno) {
  closeBot.addEventListener("click", () => {
    dennoBot.classList.add("hide");
    btnDenno.classList.remove("hide");
  });

  btnDenno.addEventListener("click", function () {
    this.classList.add("hide");
    dennoBot.classList.remove("hide");
    inputAnswer.focus();
  });

  dennoClose.addEventListener("click", () => {
    dennoBot.classList.add("hide");
    btnDenno.classList.remove("hide");
  });
}

const getWeather = async () => {
  const result = await fetch(url);
  const data = await result.json();
  const temp = Math.round(data.main.temp).toString();
  const desc = data.weather[0].description;
  const humidity = data.main.humidity;
  const windSpeed = Math.round(data.wind.speed);
  const response = {
    response: `Il fait actuellment <b>${temp}°,</b><br>${desc}.<br>Humidité : <b>${humidity}%</b><br>Vent : <b>${windSpeed}km/h</b>`,
    picture: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
  };
  return response;
  // dialog.push({
  //   id: dialog.length + 1,
  //   answer: "Quel temps fait-il à Dennlys Parc ?",
  //   response: `Il fait actuellment <b>${temp}°,</b><br>${desc}.<br>Humidité : <b>${humidity}%</b><br>Vent : <b>${windSpeed}km/h</b>`,
  //   picture: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
  //   keywords: ["météo", "meteo", "temps"],
  // });
  // return data;
};
dialog.push({
  id: dialog.length + 1,
  answer: "Quel temps fait-il à Dennlys Parc ?",
  response: getWeather,
  keywords: ["météo", "meteo", "temps"],
});
// getWeather();

// const clearDom = () => {
//   answer.innerHTML = "";
//   response.innerHTML = "";
//   dataList.innerHTML = "";
//   response.classList.add("hide");
//   answer.classList.add("hide");
//   dennoDialog.classList.add("hide");
// };

if (formFAQ) {
  formFAQ.addEventListener("submit", (e) => {
    e.preventDefault();
  });
}

inputDialog.addEventListener("input", (e) => {
  //   clearDom();
  dataList.innerHTML = "";
  const input = e.target.value.toLowerCase().split(" ");
  const filteredDialog = dialog.filter((row) => {
    return row.keywords.some((keywords) =>
      input.includes(keywords.toLowerCase())
    );
  });
  if (input.length > 5 && filteredDialog.length === 0) {
    const message = [
      {
        id: dialog.length + 1,
        answer: `${e.target.value}...`,
        response: `Je ne trouve pas de réponse à votre question, soyez plus précis ou veuillez nous contacter via le formulaire de contact.`,
        link: `<a href="${urlLink}contact.php">contactez-nous</a>`,
        // picture: `https://content.quizzclub.com/trivia/2020-03/quelle-question-n-a-pas-besoin-de-reponse.jpg`,
      },
    ];
    inputDialog.value = "";
    answer.innerHTML = message[0].answer;
    typeWriter(message, response);
  }
  if (filteredDialog.length > 0) {
    console.log(
      `il y a ${filteredDialog.length} ${
        filteredDialog.length > 1 ? "propositions" : "proposition"
      }`
    );
    filteredDialog.forEach((row) => {
      dataList.innerHTML += `<div><div class="suggestion answerType bgYellow" data-id="${row.id}"><small>${row.answer}</small></div></div>`;
      const allBtnAnswer = document.querySelectorAll(".suggestion");
      allBtnAnswer.forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = Number(this.dataset.id);
          const result = dialog.filter((row) => row.id === id);
          dataList.innerHTML = "";
          answer.innerHTML = result[0].answer;
          typeWriter(result, response);
        });
      });
    });
  }
});

async function typeWriter(row, cible) {
  let string = row[0].response;

  if (typeof string === "function") {
    const result = await eval(string());
    string = result.response;
    if (result.picture) {
      row[0].picture = result.picture;
    }
  }

  inputDialog.disabled = true;
  if (inputAnswerBis) {
    inputAnswerBis.disabled = true;
    inputAnswerBis.value = "";
  }
  let count = 0;
  response.classList.remove("hide");
  answer.classList.remove("hide");
  dennoDialog.classList.remove("hide");
  const timer = setInterval(() => {
    /* permet d'interpreter les tags HTML */
    const char = string[count];
    if (char === "<") {
      count = string.indexOf(">", count); // skip to greater-than
    }
    cible.innerHTML = string.slice(0, count);

    if (++count === string.length + 1) {
      clearInterval(timer);
      inputDialog.disabled = false;
      if (inputAnswerBis) {
        inputAnswerBis.disabled = false;
      }
      inputDialog.focus();
      if (row && row[0].picture) {
        cible.innerHTML += `<div><img src="${row[0].picture}"/></div>`;
      }
      if (row && row[0].link) {
        cible.innerHTML += `<div>${row[0].link}</div>`;
      }
      const date = new Date();
      const frenchDateTime = `${date.toLocaleDateString(
        "fr-FR"
      )} ${date.toLocaleTimeString("fr-FR")}`;
      cible.innerHTML += `<p class="text-right"><small>${frenchDateTime}</small></p>`;
    }
  }, 100);
}

if (inputAnswerBis) {
  dialog.forEach((item) => {
    answers_bis.innerHTML += `<option value="${item.answer}">`;
  });
  inputAnswerBis.addEventListener("change", (e) => {
    e.preventDefault();
    const answerChoice = e.target.value;
    dialog.forEach((item) => {
      if (item.answer === answerChoice) {
        response.classList.remove("hide");
        answer.classList.remove("hide");
        dennoDialog.classList.remove("hide");
        answer.innerText = answerChoice;
        response.innerText = item.response;
      }
    });
  });
}
