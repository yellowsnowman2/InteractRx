const autoCompleteElement = document.querySelector("#autocomplete-input");

let currentFocus;
let targetDrugList = [];

autoCompleteElement.addEventListener("input", async () => {
  closeAllLists();

  if (!document.querySelector("#autocomplete-input").value) {
    return false;
  }

  currentFocus = -1;

  const list = document.createElement("div");
  list.setAttribute("id", autoCompleteElement.id + "autocomplete-list");
  list.setAttribute("class", "autocomplete-items");

  autoCompleteElement.parentNode.appendChild(list);

  const drugList = await getDrugList(autoCompleteElement.value);

  for (i = 0; i < drugList.length; i++) {
    const drugElementItem = document.createElement("div");
    const targetDrug = drugList[i];

    const template = `
          <div>${targetDrug.name}, ${targetDrug.rxcui}</div>
        `;

    drugElementItem.innerHTML = template;

    drugElementItem.addEventListener("click", function () {
      targetDrugList.push(targetDrug);
      closeAllLists();

      createDrugList();
      console.log(targetDrugList);
    });
    list.appendChild(drugElementItem);
  }
});

document.addEventListener("click", (e) => {
  closeAllLists(e.target);
});

const addActive = (x) => {
  if (!x) return false;
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  x[currentFocus].classList.add("autocomplete-active");
};
const removeActive = (x) => {
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("autocomplete-active");
  }
};
const closeAllLists = (elements) => {
  var x = document.getElementsByClassName("autocomplete-items");
  for (var i = 0; i < x.length; i++) {
    if (elements != x[i] && elements != autoCompleteElement) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
};

const getDrugList = async (value) => {
  const getDrugsRequestString = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${value}`;
  const res = await fetch(getDrugsRequestString);
  const drugData = await res.json();
  const conceptProperties = [];

  console.log(drugData);

  if (drugData.drugGroup.conceptGroup) {
    drugData.drugGroup.conceptGroup.forEach((datum) => {
      const drugData = datum.conceptProperties;
      if (drugData) {
        conceptProperties.push(drugData);
      }
    });
  }

  return conceptProperties.flat();
};

const createDrugList = () => {
  let drugTemplate = "";

  targetDrugList.forEach((drug) => {
    drugTemplate += `
        <li class="list-group-item d-flex justify-content-between align-items-start">
        <style>
          .list-group-item {
            background-color:#251E3E;
            color:#851E3E;
            padding:5px;
            border-width:5px;
            border-color:#451E3E;
            height:75%;
            width:flex;
          }
        </style>
            <div class="ms-2 me-auto">
            <div class="fw-bold">${drug.rxcui} ${drug.name}</div>
                ${drug.synonym}
            </div>
            <button class="delete-btn badge bg-primary rounded-pill" data="${drug.rxcui}">
                <img width="20px" src="./trashcan.svg" alt="trash-icon" />
            </button>
        </li>
    `;
  });

  const template = `
    <ol class="list-group list-group-numbered">
       ${drugTemplate}
    </ol>`;

  const drugListElement = document.querySelector("#selected-drug-list");

  drugListElement.innerHTML = template;

  document.querySelectorAll(".delete-btn").forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", (e) => {
      const rxcui = e.target.getAttribute("data")
        ? e.target.getAttribute("data")
        : e.target.parentElement.getAttribute("data");

      const filteredData = targetDrugList.filter(
        (drug) => rxcui !== drug.rxcui
      );

      targetDrugList = filteredData;

      createDrugList();
    });
  });
};

document
  .querySelector("#generate-interaction")
  .addEventListener("click", async (e) => {
    let drug1Name = "";
    let drug2Name = "";
    let description = "";
    let severity = "";
    let source = "";
    let rxcui1 = "";
    let rxcui2 = "";

    const drugRxcuiArray = targetDrugList.map((drugDatum) => drugDatum.rxcui);

    const stringParam = drugRxcuiArray.join("+");

    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${stringParam}`
    );
    const data = await res.json();

    console.log("data", data);

    drug1Name =
      data.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair[0]
        .interactionConcept[0].sourceConceptItem.name;

    document.querySelector("#drug1-name").innerHTML = drug1Name;

    drug2Name =
      data.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair[0]
        .interactionConcept[1].sourceConceptItem.name;

    document.querySelector("#drug2-name").innerHTML = drug2Name;

    document.querySelector("#drug-names").innerHTML =
      drug1Name + " + " + drug2Name;

    description =
      data.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair[0]
        .description;

    document.querySelector("#description").innerHTML =
      "Description: " + description;

    severity =
      data.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair[0]
        .severity;
    document.querySelector("#severity-info").innerHTML =
      "Severity: " + severity;

    source = data.fullInteractionTypeGroup[0].sourceName;
    document.querySelector("#source-info").innerHTML = "Source: " + source;

    rxcui1 =
      data.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair[0]
        .interactionConcept[0].minConceptItem.rxcui;
    document.querySelector("#drug1-rxcui").innerHTML = "RXCUI: " + rxcui1;

    rxcui2 =
      data.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair[0]
        .interactionConcept[1].minConceptItem.rxcui;
    document.querySelector("#drug2-rxcui").innerHTML = "RXCUI: " + rxcui2;
  });
