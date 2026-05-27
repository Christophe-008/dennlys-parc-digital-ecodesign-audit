import { urlLink, dialog } from "./answers.js";

const apiKey = "0a023285b89104b62d53d5e1166678ad";
const latLon = [50.570559, 2.1551699];
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latLon[0]}&lon=${latLon[1]}&appid=${apiKey}&lang=fr&units=metric`;

const inputDialog = document.getElementById("inputAnswer");
const dataList = document.getElementById("choice");
const responseBox = document.getElementById("responseBot");
const answerBox = document.getElementById("answer");
const dennoDialog = document.getElementById("dennoDialog");
const formFAQ = document.getElementById("formFAQ");

const dennoBot = document.getElementById("dennoBot");
const closeBot = document.getElementById("closeBot");
const btnDenno = document.getElementById("btnDenno");
const dennoClose = document.getElementById("dennoClose");

const inputAnswerBis = document.getElementById("inputAnswerBis");
const answersBis = document.getElementById("answers_bis");

const TYPEWRITER_DELAY_MS = 100;

function isSafeUrl(value) {
  if (!value || typeof value !== "string") return false;

  try {
    const parsed = new URL(value, window.location.origin);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function setBotVisibility(isVisible) {
  if (!dennoBot || !btnDenno) return;

  dennoBot.classList.toggle("hide", !isVisible);
  btnDenno.classList.toggle("hide", isVisible);

  if (isVisible) {
    inputDialog?.focus();
  }
}

function setInputState(disabled) {
  if (inputDialog) {
    inputDialog.disabled = disabled;
  }

  if (inputAnswerBis) {
    inputAnswerBis.disabled = disabled;
    if (disabled) inputAnswerBis.value = "";
  }
}

function clearSuggestions() {
  if (dataList) dataList.innerHTML = "";
}

function ensureVisibleAnswerArea() {
  responseBox?.classList.remove("hide");
  answerBox?.classList.remove("hide");
  dennoDialog?.classList.remove("hide");
}

async function getWeather() {
  try {
    const result = await fetch(weatherUrl, { method: "GET" });
    if (!result.ok) {
      throw new Error(`Weather API error: ${result.status}`);
    }

    const data = await result.json();
    const temp = Math.round(data.main?.temp ?? 0).toString();
    const desc = data.weather?.[0]?.description ?? "indisponible";
    const humidity = data.main?.humidity ?? "?";
    const windSpeed = Math.round(data.wind?.speed ?? 0);
    const icon = data.weather?.[0]?.icon;

    return {
      response: `Il fait actuellment <b>${temp}°,</b><br>${desc}.<br>Humidité : <b>${humidity}%</b><br>Vent : <b>${windSpeed}km/h</b>`,
      picture: icon
        ? `https://openweathermap.org/img/wn/${icon}@2x.png`
        : undefined,
    };
  } catch {
    return {
      response:
        "La météo est temporairement indisponible. Réessayez dans quelques instants.",
    };
  }
}

function normalizeKeywords(value) {
  return value
    .toLowerCase()
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getSuggestions(rawInput) {
  const tokens = normalizeKeywords(rawInput);
  return dialog.filter((row) =>
    row.keywords?.some((keyword) => tokens.includes(keyword.toLowerCase()))
  );
}

function buildFallbackMessage(rawQuestion) {
  return [
    {
      id: dialog.length + 1,
      answer: `${rawQuestion}...`,
      response:
        "Je ne trouve pas de réponse à votre question, soyez plus précis ou veuillez nous contacter via le formulaire de contact.",
      link: {
        href: `${urlLink}contact.php`,
        text: "contactez-nous",
      },
    },
  ];
}

function appendSuggestion(row) {
  if (!dataList) return;

  const wrapper = document.createElement("div");
  const button = document.createElement("button");
  const text = document.createElement("small");

  button.type = "button";
  button.className = "suggestion answerType bgYellow";
  button.dataset.id = String(row.id);

  text.textContent = row.answer;
  button.appendChild(text);
  wrapper.appendChild(button);
  dataList.appendChild(wrapper);
}

function appendOptionalPicture(target, pictureUrl) {
  if (!target || !isSafeUrl(pictureUrl)) return;

  const wrapper = document.createElement("div");
  const img = document.createElement("img");
  img.src = pictureUrl;
  img.alt = "Illustration";
  wrapper.appendChild(img);
  target.appendChild(wrapper);
}

function appendOptionalLink(target, linkValue) {
  if (!target || !linkValue) return;

  let href = null;
  let text = "Voir";

  if (typeof linkValue === "object") {
    href = linkValue.href;
    text = linkValue.text || text;
  } else if (typeof linkValue === "string") {
    const temp = document.createElement("template");
    temp.innerHTML = linkValue;
    const anchor = temp.content.querySelector("a");
    href = anchor?.getAttribute("href");
    text = anchor?.textContent?.trim() || text;
  }

  if (!isSafeUrl(href)) return;

  const wrapper = document.createElement("div");
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.textContent = text;
  wrapper.appendChild(anchor);
  target.appendChild(wrapper);
}

function appendTimestamp(target) {
  if (!target) return;

  const p = document.createElement("p");
  p.className = "text-right";
  const small = document.createElement("small");
  const date = new Date();
  small.textContent = `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR")}`;
  p.appendChild(small);
  target.appendChild(p);
}

async function resolveResponseRow(row) {
  const responseValue = row?.response;

  if (typeof responseValue === "function") {
    const dynamicResponse = await responseValue();
    return {
      ...row,
      response: dynamicResponse?.response || "",
      picture: dynamicResponse?.picture || row.picture,
      link: dynamicResponse?.link || row.link,
    };
  }

  return row;
}

async function typeWriter(rows, target) {
  if (!rows?.length || !target) return;

  const resolvedRow = await resolveResponseRow(rows[0]);
  const responseText = String(resolvedRow?.response || "");

  setInputState(true);
  ensureVisibleAnswerArea();

  let count = 0;

  const timer = setInterval(() => {
    const char = responseText[count];
    if (char === "<") {
      const nextTagEnd = responseText.indexOf(">", count);
      count = nextTagEnd > -1 ? nextTagEnd : count;
    }

    target.innerHTML = responseText.slice(0, count);

    if (++count === responseText.length + 1) {
      clearInterval(timer);
      setInputState(false);
      inputDialog?.focus();

      appendOptionalPicture(target, resolvedRow?.picture);
      appendOptionalLink(target, resolvedRow?.link);
      appendTimestamp(target);
    }
  }, TYPEWRITER_DELAY_MS);
}

function handleSuggestionsInput(event) {
  const rawInput = event.target.value || "";
  clearSuggestions();

  const suggestions = getSuggestions(rawInput);

  if (normalizeKeywords(rawInput).length > 5 && suggestions.length === 0) {
    const message = buildFallbackMessage(rawInput);
    if (inputDialog) inputDialog.value = "";
    if (answerBox) answerBox.textContent = message[0].answer;
    typeWriter(message, responseBox);
    return;
  }

  suggestions.forEach((row) => appendSuggestion(row));
}

function handleSuggestionClick(event) {
  const button = event.target.closest(".suggestion");
  if (!button) return;

  const id = Number(button.dataset.id);
  const selected = dialog.find((row) => row.id === id);
  if (!selected) return;

  clearSuggestions();
  if (answerBox) answerBox.textContent = selected.answer;
  typeWriter([selected], responseBox);
}

function initBotToggleEvents() {
  if (!btnDenno || !closeBot || !dennoClose) return;

  closeBot.addEventListener("click", () => setBotVisibility(false));
  dennoClose.addEventListener("click", () => setBotVisibility(false));
  btnDenno.addEventListener("click", () => setBotVisibility(true));
}

function initFormEvents() {
  if (formFAQ) {
    formFAQ.addEventListener("submit", (event) => event.preventDefault());
  }

  if (inputDialog) {
    inputDialog.addEventListener("input", handleSuggestionsInput);
  }

  if (dataList) {
    dataList.addEventListener("click", handleSuggestionClick);
  }
}

function initAnswerBis() {
  if (!inputAnswerBis || !answersBis) return;

  dialog.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.answer;
    answersBis.appendChild(option);
  });

  inputAnswerBis.addEventListener("change", (event) => {
    event.preventDefault();
    const answerChoice = event.target.value;
    const selected = dialog.find((item) => item.answer === answerChoice);
    if (!selected) return;

    ensureVisibleAnswerArea();
    if (answerBox) answerBox.textContent = answerChoice;
    void typeWriter([selected], responseBox);
  });
}

function registerDynamicWeatherAnswer() {
  dialog.push({
    id: dialog.length + 1,
    answer: "Quel temps fait-il à Dennlys Parc ?",
    response: getWeather,
    keywords: ["météo", "meteo", "temps"],
  });
}

function initDialog() {
  registerDynamicWeatherAnswer();
  initBotToggleEvents();
  initFormEvents();
  initAnswerBis();
}

initDialog();
