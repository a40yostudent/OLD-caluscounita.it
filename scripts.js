/*
 *  LINK IMPORTANTI:
 *  https://dev.socrata.com/
 *  https://www.dati.lombardia.it/Ambiente/Dati-sensori-aria/nicp-bhqi DATI SENSORI ARIA
 *  https://www.dati.lombardia.it/Ambiente/Stazioni-qualit-dell-aria/ib47-atvt STAZIONI QUALITA' ARIA
 */

"use strict";

let menuButton = document.getElementById("menu-button");
let navMenu = document.getElementsByTagName("nav")[0];

// MENU BUTTON AND NAV:
menuButton.addEventListener(
  "click",
  () => openMenu(menuButton, navMenu),
  false
);

function openMenu(button, menu) {
  if (!menu.getAttribute("style")) {
    button.children[0].classList.remove("fa-bars");
    button.children[0].classList.add("fa-chevron-up");

    menu.style.transform = "translateY(0rem)";
  } else {
    button.children[0].classList.remove("fa-chevron-up");
    button.children[0].classList.add("fa-bars");

    menu.removeAttribute("style");
  }
}

// FETCH DATA FROM dati.lombardia.it

const airQualityStations =
  "https://www.dati.lombardia.it/resource/t4f9-i4k5.json";
const airSensorsData = "https://www.dati.lombardia.it/resource/2tw8-h2cp.json";
const onlyCaluscoStations = "685";

// let airSensorsReadingsArray = new Array(9)
//     .fill()
//     .map( () => {
//         return {
//             idsensore: "",
//             nometiposensore: "",
//             unitamisura: "",
//             valore: "",
//             data:""
//         }
//     });

let airSensorsReadingsArray = [];

fetch(airQualityStations + "?idstazione=" + onlyCaluscoStations)
  .then(response => {
    return response.json();
  })
  .catch(error => console.error("Error fetching stations:", error))
  .then(stationsDetailsArray => {
    for (const stationDetails of stationsDetailsArray) {
      downloadData(stationDetails);
    }
  });

function downloadData(stationDetails) {
  // console.log(stationDetails);
  fetch(
    airSensorsData +
      "?" +
      "$order=data%20DESC" +
      "&" +
      "idsensore=" +
      stationDetails.idsensore +
      "&" +
      "$limit=1"
  )
    .then(response => {
      return response.json();
    })
    .catch(error => console.error("Error fetching data from stations:", error))
    .then(sensorReading => {
      if (sensorReading[0].stato == "VA") {
        airSensorsReadingsArray.push({
          idsensore: stationDetails.idsensore,
          nometiposensore: stationDetails.nometiposensore,
          unitamisura: stationDetails.unitamisura,
          data: sensorReading[0].data,
          valore: sensorReading[0].valore,
          stato: sensorReading[0].stato
        });
      }
    })
    .then(() => {
      for (const reading of airSensorsReadingsArray) {
        switch (reading.idsensore) {
          case "10027": // PM10
            document.getElementById("PM10-val").innerHTML = reading.valore;
            document.getElementById("PM10-rem").style.height = `${(40 - reading.valore) / 40 * 4}` + "em";
            document.getElementById("PM10-val").style.height = `${(reading.valore) / 40 * 4}` + "em";
            break;
          case "10023": // Monossido di Carbonio
            break;
          case "10020": // Biossido di Zolfo
            break;
          case "10017": // Ossidi di Azoto
            break;
          case "10018": // Benzene
            break;
          case "10025": // Ozono
            document.getElementById("O3-val").innerHTML = reading.valore;
            document.getElementById("O3-rem").style.height = `${(110 - reading.valore) / 110 * 4}` + "em";
            document.getElementById("O3-val").style.height = `${(reading.valore) / 110 * 4}` + "em";
            break;
          case "10019": // Biossido di Azoto
            document.getElementById("NO2-val").innerHTML = reading.valore;
            document.getElementById("NO2-rem").style.height = `${(50 - reading.valore) / 50 * 4}` + "em";
            document.getElementById("NO2-val").style.height = `${(reading.valore) / 50 * 4}` + "em";
            break;
          case "10028": // PM 2.5
            document.getElementById("PM25-val").innerHTML = reading.valore;
            document.getElementById("PM25-rem").style.height = `${(25 - reading.valore) / 25 * 4}` + "em";
            document.getElementById("PM25-val").style.height = `${(reading.valore) / 25 * 4}` + "em";
            break;
          default:
            break;
        }
      }
      document.getElementById("IQA-val").innerHTML = "ERR";
      document.getElementById("IQA-rem").style.height = "0em"; // `${(25 - reading.valore) / 25 * 4}` + "em";
      document.getElementById("IQA-val").style.height = "4em"; // `${(reading.valore) / 25 * 4}` + "em";
    });
}

console.log(airSensorsReadingsArray);
