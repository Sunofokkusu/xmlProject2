/**
 * Fetch pour récupérer l'IP de l'utilisateur
 */
fetch("https://ipapi.co/json/")
  .then((response) => response.json())
  .then((data) => {
    let dataIp = data;
    addMap(data);
    fetch(
      "https://www.data.gouv.fr/fr/datasets/r/5c4e1452-3850-4b59-b11c-3dd51d7fb8b5" //récupère les cas de COVID
    )
      .then((response) => response.text())
      .then((data) => {
        getCovid(data, dataIp);
      })
      .catch((error) => {
        let chart = document.getElementById("chart");
        chart.innerHTML = "Erreur lors de la récupération des informations COVID. Veuillez réessayer."
        chart.style.textAlign = "center";
        chart.style.height = "100%";
        let myChart = document.getElementById("myChart");
        myChart.height = "0px";
      });
  })
  .catch((error) => {
    let map = document.getElementById("map");
    map.innerHTML = "Erreur lors de la récupération de l'adresse IP. Veuillez réessayer."
    map.style.textAlign = "center";
    map.style.height = "100%";
    let chart = document.getElementById("chart");
    chart.innerHTML = "Erreur lors de la récupération de l'adresse IP. Veuillez réessayer."
    chart.style.textAlign = "center";
    chart.style.height = "100%";
    let myChart = document.getElementById("myChart");
    myChart.height = "0px";
  });

/**
 * Fetch pour récupérer la qualité de l'air
 */
fetch(
  "https://services3.arcgis.com/Is0UwT37raQYl9Jj/arcgis/rest/services/ind_grandest/FeatureServer/0/query?where=lib_zone%3D%27Nancy%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token="
)
  .then((response) => response.json())
  .then((data) => {
    airQuality(data.features);
  })
  .catch((error) => {
    let air = document.getElementById("qlt");
    air.innerHTML = "Erreur lors de la récupération de la qualité de l'air. Veuillez réessayer."
    air.style.width = "450px";
  });

/**
 * Fonction qui créer une map, ajoute un point de position dessus ainsi que le trafic
 * @param {*} data, les données récupérées du fetch
 */
function addMap(data) {
  let lat = "";
  let long = "";
  let msg = "";
  if (data.city !== "Nancy") {
    lat = 48.682965256259365;
    long = 6.1611124847675915;
    msg = "<b>IUT Charlemagne</b>";
  } else {
    lat = data.latitude;
    long = data.longitude;
    msg = "<b>Vous êtes ici</b>";
  }
  var map = L.map("map").setView([lat, long], 15);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 100,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  var marker = L.marker([lat, long]).addTo(map);
  marker.bindPopup(msg).openPopup();
  fetch(
    "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=" +
      lat +
      "%2C" +
      long +
      "&unit=KMPH&key=3AJRJdi9uWQLLHGQpYVmrGylsIBtqBHN"
  )
    .then((response) => response.json())
    .then((data) => {
      var latlngs = [];
      data.flowSegmentData.coordinates.coordinate.forEach((coo) => {
        latlngs.push([coo.latitude, coo.longitude]);
      });
      var polyline = L.polyline(latlngs, { color: "red" }).addTo(map);
    })
    .catch((error) => {
      let circ = document.getElementById("circulation");
      circ.innerHTML = "Erreur lors de la récupération du trafic. Veuillez réessayer.";
      circ.style.textAlign = "center";
    });
}

/**
 * Fonction qui affiche les données COVID et les affiche sous forme de graphiques
 * @param {*} data, les données récupérées du fetch
 */
function getCovid(data, dataIp) {
  let dep = dataIp.postal.substring(0, 2);
  let split = data.split("\n");
  split.shift();
  let final = [];
  split.forEach((elem) => {
    let element = elem.split(",");
    if (element[0] == dep) {
      final.push({
        dep: element[0],
        date: element[1],
        reg: element[2],
        lib_dep: element[3],
        tx_pos: element[4],
        tx_incident: element[5],
        TO: element[6],
        R: element[7],
        hosp: element[8],
        rea: element[9],
        rad: element[10],
        dchosp: element[11],
        reg_rea: element[12],
        incid_rea: element[13],
        incid_rad: element[14],
        incid_dchosp: element[15],
        reg_incid_rea: element[16],
        pos: element[17],
        pos_7j: element[18],
        cv_dose1: element[19],
      });
    }
  });
  let cas = document.querySelector(".cas");
  cas.innerHTML = "Info COVID dans le département " + dep;

  addChart(final);
}

function addChart(final){
  if(final.length === 0){
    let chart = document.getElementById("chart");
    chart.innerHTML = "Erreur lors de la récupération des informations COVID. Veuillez réessayer."
    chart.style.textAlign = "center";
    chart.style.height = "100%";
    let myChart = document.getElementById("myChart");
    myChart.height = "0px";
  }else{
    const ctx = document.getElementById('myChart');
    let data = [];
    let labels = [];
    final.forEach(elem => {
      data.push(elem.incid_rea);
      labels.push(elem.date)
    });
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de personnes en réanimation',
          data: data
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

/**
 * Fonction qui affiche la qualité de l'air sous forme d'un rond coloré
 * @param {*} data, les données récupérées du fetch
 */
function airQuality(data) {
  let color = data[0].attributes.coul_qual;
  let air = document.getElementById("qlt");
  air.style.backgroundColor = color;
}
