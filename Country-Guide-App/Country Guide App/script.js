document.addEventListener("DOMContentLoaded", () => {
  const countryInp = document.getElementById("country-inp");
  const searchBtn = document.getElementById("search-btn");
  const clearBtn = document.getElementById("clear-btn");
  const resultDiv = document.getElementById("result");
  const loadingIndicator = document.getElementById("loading-indicator");
  const autocompleteSuggestions = document.getElementById("autocomplete-suggestions");
  const paginationDiv = document.getElementById("pagination");

  const apiUrl = 'https://restcountries.com/v3.1/all';
  let countries = [];
  let currentPage = 1;
  const resultsPerPage = 10;

  async function fetchCountries() {
    try {
      const response = await fetch(apiUrl);
      countries = await response.json();
    } catch (error) {
      displayError("Failed to fetch countries.");
    }
  }

  function displayError(message) {
    resultDiv.innerHTML = `<p class="error">${message}</p>`;
  }

  function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
  }

  function clearSearch() {
    countryInp.value = '';
    resultDiv.innerHTML = '';
    autocompleteSuggestions.innerHTML = '';
  }

  function displayAutocompleteSuggestions(suggestions) {
    autocompleteSuggestions.innerHTML = '';
    suggestions.forEach(country => {
      const div = document.createElement("div");
      div.textContent = country.name.common;
      div.addEventListener("click", () => {
        countryInp.value = country.name.common;
        autocompleteSuggestions.innerHTML = '';
      });
      autocompleteSuggestions.appendChild(div);
    });
  }

  function searchCountries(query) {
    const filteredCountries = countries.filter(country => 
      country.name.common.toLowerCase().includes(query.toLowerCase())
    );
    return filteredCountries;
  }

  function paginateResults(results) {
    const totalPages = Math.ceil(results.length / resultsPerPage);
    paginationDiv.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.className = 'pagination-button';
      button.textContent = i;
      button.addEventListener('click', () => {
        currentPage = i;
        displayResults(results);
      });
      paginationDiv.appendChild(button);
    }
  }

  function displayResults(results) {
    resultDiv.innerHTML = '';
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedResults = results.slice(startIndex, endIndex);

    paginatedResults.forEach(country => {
      const countryDiv = document.createElement("div");
      countryDiv.innerHTML = `
        <h3>${country.name.common}</h3>
        <p>Population: ${country.population.toLocaleString()}</p>
        <p>Region: ${country.region}</p>
        <p>Capital: ${country.capital ? country.capital[0] : 'N/A'}</p>
      `;
      resultDiv.appendChild(countryDiv);
    });
  }

  countryInp.addEventListener("input", () => {
    const query = countryInp.value;
    if (query.length > 0) {
      const suggestions = searchCountries(query).slice(0, 5);
      displayAutocompleteSuggestions(suggestions);
    } else {
      autocompleteSuggestions.innerHTML = '';
    }
  });

  searchBtn.addEventListener("click", () => {
    const countryName = countryInp.value;
    if (countryName.length > 0) {
      const finalURL = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
      showLoading(true);
      fetch(finalURL)
        .then((response) => response.json())
        .then((data) => {
          resultDiv.innerHTML = `
            <img src="${data[0].flags.svg}" class="flag-img">
            <h2>${data[0].name.common}</h2>
            <div class="wrapper">
                <div class="data-wrapper">
                    <h4>Capital:</h4>
                    <span>${data[0].capital[0]}</span>
                </div>
            </div>
            <div class="wrapper">
                <div class="data-wrapper">
                    <h4>Continent:</h4>
                    <span>${data[0].continents[0]}</span>
                </div>
            </div>
             <div class="wrapper">
                <div class="data-wrapper">
                    <h4>Population:</h4>
                    <span>${data[0].population}</span>
                </div>
            </div>
            <div class="wrapper">
                <div class="data-wrapper">
                    <h4>Currency:</h4>
                    <span>${
                      data[0].currencies[Object.keys(data[0].currencies)].name
                    } - ${Object.keys(data[0].currencies)[0]}</span>
                </div>
            </div>
             <div class="wrapper">
                <div class="data-wrapper">
                    <h4>Common Languages:</h4>
                    <span>${Object.values(data[0].languages)
                      .toString()
                      .split(",")
                      .join(", ")}</span>
                </div>
            </div>
          `;
          showLoading(false);
        })
        .catch(() => {
          showLoading(false);
          if (countryName.length == 0) {
            resultDiv.innerHTML = `<h3>The input field cannot be empty</h3>`;
          } else {
            resultDiv.innerHTML = `<h3>Please enter a valid country name.</h3>`;
          }
        });
    } else {
      displayError("Please enter a country name.");
    }
  });

  clearBtn.addEventListener("click", clearSearch);

  fetchCountries();
});
