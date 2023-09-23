console.log("Hello world!");

let drugList = [];

const getDrugData = async () => {
  const res = await fetch(
    `https://rxnav.nlm.nih.gov/REST/drugs.json?name=cymbalta`
  );
  const drugSearchData = await res.json();

  const targetDrugList = drugSearchData.drugGroup.conceptGroup
    .map((conceptGroup) => {
      if (conceptGroup.conceptProperties) {
        return conceptGroup.conceptProperties;
      } else {
        return [];
      }
    })
    .flat();

  return targetDrugList;
};

const createDrugList = () => {
  let drugTemplate = "";

  drugList.forEach((drug) => {
    drugTemplate += `
        <li class="list-group-item d-flex justify-content-between align-items-start">
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

      console.log(drugList);

      const filteredData = drugList.filter((drug) => rxcui !== drug.rxcui);

      drugList = filteredData;

      createDrugList();
    });
  });
};

const main = async () => {
  drugList = await getDrugData();

  createDrugList();
};

main();
