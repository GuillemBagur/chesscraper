const yottaChessURL = `https://www.yottachess.com/player/`;
const fideURL = `https://ratings.fide.com/profile/`;
let info = {};
const statsNames = {
  rating: ["Elo:", ""],
  maxRating: ["Elo màxim:", ""],
  BYear: ["Any de naixement:", ""],
  Federation: ["País:", ""],
  fideID: ["ID FIDE:", ""],
  numGames: ["Nombre de partides:", ""],
  winGames: ["Percentatge de victòries, empats i derrotes:", ""],
  avgElo: ["Mitjana Elo rivals:", ""],
  maxPerf: ["Torneig amb més performance:", ""],
};

const renderStaticData = (data) => {
  console.log(data);
  let allDataStr = "";
  allDataStr += `<tr>`;
  allDataStr += `<td>Elo</td><td>${data.rating.stdElo}</td>`;
  allDataStr += `</tr>`;
  for (let prop in data.tableData) {
    const stat = data.tableData[prop];
    allDataStr += `<tr>`;
    allDataStr += `<td>${prop}</td><td>${stat}</td>`;
    allDataStr += `</tr>`;
  }
  console.log(allDataStr);

  document.getElementById("data").innerHTML = allDataStr;
};

const scrape = (name) => {
  // First of all, we need to get the url from YottaChess, to get the player's id.
  // Yottachess' URLs work with the name, which is a blessing for us :)
  // Using allorigins.win's API to avoid CORS issues.
  $.getJSON(
    `https://api.allorigins.win/get?url=${yottaChessURL}${encodeURIComponent(
      name
    )}`,
    function (data) {
      let webToScrape = document.createElement("html");
      webToScrape.innerHTML = data.contents;
      // Getting the important thing here: player's ID.
      const id = webToScrape.querySelector("#fideID").innerHTML;

      // Using this ID to scrape in fide.com
      $.getJSON(
        `https://api.allorigins.win/get?url=${fideURL}${id}`,
        function (data) {
          let webToScrape = document.createElement("html");
          webToScrape.innerHTML = data.contents;
          const tableDataHTML = webToScrape.querySelectorAll(
            ".profile-top-info__block__row"
          );
          let tableData = {};
          for (let i = 0; i < tableDataHTML.length; i++) {
            const row = tableDataHTML[i].innerText.split(":");
            const key = row[0].replace(/\W/g, "");
            const value = row[1].replace(/\W/g, "");
            tableData[key] = value;
          }

          let rating = {};
          // Matching only numbers in the whole div.
          rating.stdElo = webToScrape
            .querySelector(
              ".profile-top-rating-data.profile-top-rating-data_gray"
            )
            .innerText.match(/\d{1,}/)[0];
          rating.rapidElo = webToScrape
            .querySelector(
              ".profile-top-rating-data.profile-top-rating-data_red"
            )
            .innerText.match(/\d{1,}/)[0];
          rating.blitzElo = webToScrape
            .querySelector(
              ".profile-top-rating-data.profile-top-rating-data_blue"
            )
            .innerText.match(/\d{1,}/)[0];
          info.tableData = tableData;
          info.rating = rating;

          playerInfo.info = info;
          console.log(info);
          renderStaticData(info);
        }
      );
    }
  );
};
