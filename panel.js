const port = chrome.runtime.connect({name: "listener"});
const container = document.querySelector(".log-container");
const form = document.querySelector(".filter-container");
const repository = new Set();
const filter = {
  text: "",
  lang: "en"
};

function LogModel(log, el, textEls) {
  this.log = log;
  this.el = el;
  this.textEls = textEls;
  this.comment = log.comment;
}

function filterModel(model) {
  if (filter.lang === "ja") {
    model.textEls.en.style.display = "none";
    model.textEls.ja.style.display = "block";
  } else {
    model.textEls.en.style.display = "block";
    model.textEls.ja.style.display = "none";
  }

  var shouldDisplay = true;
  if (filter.text.length > 0) {
    const text = filter.text.toLowerCase().trim();
    const comment = model.comment[filter.lang || "en"].toLowerCase();
    shouldDisplay = comment.indexOf(text) > -1;
  }
  model.el.style.display = shouldDisplay ? "block" : "none";
}

function updateFilter() {
  filter.text = form.elements["filter"].value;
  filter.lang = form.elements["lang"].value;
  repository.forEach(filterModel);
}

function clearLog() {
  repository.clear();
  container.innerHTML = "";
}

port.onMessage.addListener(function(msg) {
  msg.log.forEach(function(log) {
    const el = document.createElement("div");
    el.className = "log-comment";

    const enText = document.createElement("pre");
    enText.innerHTML = log.comment.en;
    el.appendChild(enText);

    const jaText = document.createElement("pre");
    jaText.innerHTML = log.comment.ja;
    el.appendChild(jaText);

    const model = new LogModel(log, el, {
      en: enText,
      ja: jaText
    });
    filterModel(model);

    repository.add(model);
    container.appendChild(el);
  });
  window.scrollTo(0, document.body.scrollHeight);
});

form.addEventListener("submit", function(evt) {
  evt.preventDefault();
  evt.stopImmediatePropagation();
  updateFilter();
});
form.elements["filter"].addEventListener("keyup", updateFilter);
//form.elements["reset"].addEventListener("click", updateFilter);
form.elements["clear"].addEventListener("click", clearLog);
