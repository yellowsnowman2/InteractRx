const autocomplete = (inp) => {
    var currentFocus;

    inp.addEventListener("input", async function (e) {
        closeAllLists();
        
        console.log("****************", this.value);
        if (!this.value) { return false; }
        currentFocus = -1;

        const list = document.createElement("div");
        list.setAttribute("id", this.id + "autocomplete-list");
        list.setAttribute("class", "autocomplete-items");

        this.parentNode.appendChild(list);

        const drugList = await getDrugList();

        for (i = 0; i < drugList.length; i++) {

                const drugElementItem = document.createElement("div");
                const targetDrug = drugList[i];
                const template = `
                    <div>${targetDrug.name}</div>
                `;

                drugElementItem.innerHTML = template

                drugElementItem.addEventListener("click", function (e) {

                    inp.value = this.getElementsByTagName("input")[0].value;


                    closeAllLists();
                });
                list.appendChild(drugElementItem);
        }
    });

    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {

            currentFocus++;

            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;

            addActive(x);
        } else if (e.keyCode == 13) {

            e.preventDefault();
            if (currentFocus > -1) {

                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {

        if (!x) return false;

        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);

        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {

        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {

        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}


const drugs = ["Advil", "Aspirin", "Cocaine", "Simvastatin", "Bosentan", "Benedryl", "Oxycotin"];

const getInteractionsRequestString = "https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis="

const getDrugList = async () => {
    const getDrugsRequestString = "https://rxnav.nlm.nih.gov/REST/drugs.json?name=";
    
    const res = await fetch(`${getDrugsRequestString}${"Bosentan"}`);
    const drugData = await res.json();

    const conceptProperties = [];

    //drugGroup.conceptGroup[2].conceptProperties

    drugData.drugGroup.conceptGroup.forEach((datum) => {
        const drugData = datum.conceptProperties;

        if (drugData) {
            conceptProperties.push(drugData);
        }
    });
    console.log(drugData);

    return conceptProperties.flat();
}



autocomplete(document.querySelector("#myInput"));