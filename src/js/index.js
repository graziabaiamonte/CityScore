
import '../css/style.css'
import axios from "axios";

const searchButton = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const resultsDiv = document.getElementById("results");
const suggestionsDropdown = document.getElementById("suggestionsDropdown");



searchButton.addEventListener("click", () => performSearch());

function setBoxHomeBackground(imageUrl) {
    const boxHome = document.querySelector('.boxHome');
    boxHome.style.backgroundImage = `url('${imageUrl}')`;
}

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        performSearch();
        suggestionsDropdown.style.display = "none";
    }
});


cityInput.addEventListener("input", async () => {
    const cityName = cityInput.value.trim();

    // Esegui una chiamata API per ottenere i suggerimenti di città
    try {
        const suggestions = await fetchCitySuggestions(cityName);
        displaySuggestions(suggestions);
    } catch (error) {
        console.error(error);
    }
});

// Funzione per ottenere i suggerimenti di città
async function fetchCitySuggestions(cityName) {
    const response = await axios.get(`https://api.teleport.org/api/cities/?search=${cityName}`);
    const data = response.data;

    if (data.count === 0) {
        return [];
    }

    return data._embedded["city:search-results"].map(result => result.matching_full_name);
}

// Funzione per visualizzare i suggerimenti nel dropdown
function displaySuggestions(suggestions) {
    // Pulisci il dropdown
    suggestionsDropdown.innerHTML = "";

    // Aggiungi suggerimenti al dropdown
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement("li");
        suggestionItem.textContent = suggestion;
        suggestionItem.addEventListener("click", () => {
            // Quando un suggerimento viene cliccato, imposta l'input della città e esegui la ricerca
            cityInput.value = suggestion;
            suggestionsDropdown.style.display = 'none'
            performSearch(suggestion);
        });
        suggestionsDropdown.appendChild(suggestionItem);
    });
 
   


    // Mostra il dropdown solo se ci sono suggerimenti
    suggestionsDropdown.style.display = suggestions.length > 0 ? "block" : "none";
}







//parametri ricerca
async function performSearch() {
    hideErrorMessage();
    const cityName = cityInput.value.trim();

    if (cityName.length === 0) {
        displayError(`Please, enter a city name.`);
        return;
    }

    try {

        document.getElementById('homeImg').style.display = "block";
        document.querySelector('.box-categorie').style.display = "flex";
        document.getElementById('results').style.display = "block";

        

        document.querySelector('.boxHome').classList.add('boxHome-searching');

        const data = await fetchCityData(cityName);
        displayResults(data);
        setBoxHomeBackground(data.imageUrl);
        cityInput.value = "";
    } catch (error) {
        console.error(error);
        displayError(`City not found.`);
    } 
}

//chiamata API
async function fetchCityData(cityName) {
 try {
    const response = await axios.get(`https://api.teleport.org/api/cities/?search=${cityName}`);
    const data = response.data;

    if (data.count === 0) {
        throw new Error("City not found.");
    }
    //dati città
    const cityId = data._embedded["city:search-results"][0]._links["city:item"].href;
    const cityResponse = await axios.get(cityId);
    const cityData = cityResponse.data;
    //punteggio città
    const urbanAreaId = cityData._links["city:urban_area"].href;
    const urbanAreaScoresResponse = await axios.get(`${urbanAreaId}scores/`);
    const urbanAreaScoresData = urbanAreaScoresResponse.data;
    //img città
    const urbanAreaSlug = cityData._links["city:urban_area"].href.split("/").slice(-2)[0];
    const urbanAreaImagesResponse = await axios.get(`https://api.teleport.org/api/urban_areas/${urbanAreaSlug}/images/`);
    const urbanAreaImagesData = urbanAreaImagesResponse.data;

    //ritorno dei dati
    return {
        teleport_cityName: data._embedded["city:search-results"][0].matching_full_name,
        teleport_city_score: urbanAreaScoresData.teleport_city_score,
        summary: urbanAreaScoresData.summary,
        categories: urbanAreaScoresData.categories,
        imageUrl: urbanAreaImagesData.photos[0].image.web
    };
 }catch(error) {
    throw new Error("error during api call");
 }
}

async function displayResults(data) {
    

    
    const resultsDiv = document.getElementById("results");
   
    const cityImage = document.createElement("img");
    cityImage.src = data.imageUrl;
    cityImage.style.width = "100%";
    cityImage.style.height = "auto";


    const boxCategorie = document.querySelector('.box-categorie');
    let categnumeri = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                      categnumeri.forEach((number) => {
                          let container = document.createElement('div');
                          let name = document.createElement('h3');
                          let value = document.createElement('p');
                          name.textContent = data.categories[number].name;
                          value.textContent = data.categories[number].score_out_of_10.toFixed(2);
                          let progressBar = document.createElement('progress');
                          progressBar.value = data.categories[number].score_out_of_10;
                          progressBar.max = 10;
                          container.appendChild(name);
                          container.appendChild(value);
                          container.appendChild(progressBar);
                          boxCategorie.appendChild(container);
                          container.classList.add('categories');
                      });







                      
    resultsDiv.innerHTML = `
        <h1>${data.teleport_cityName}</h1>
        <h3>Teleport City Score</h3>
        <h2>${data.teleport_city_score.toFixed(2)}</h2>
        <p>${data.summary}</p>
        `;
}
  
function displayError(message) {
    
    document.querySelector('.box-categorie').style.display = "none";
    document.querySelector('.boxHome').style.height = "100vh";
    document.querySelector('.boxHome').style.backgroundImage = "url('https://images.unsplash.com/photo-1588312744377-2adfb7b8578a?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";

    document.getElementById('results').style.display = "none";


    const errorMexBox = document.querySelector('.errorMex');
    errorMexBox.innerHTML = `<p class="error">${message}</p>`;
}


function hideErrorMessage() {
    const errorMexBox = document.querySelector('.errorMex');
    errorMexBox.innerHTML = ""; // Rimuove il contenuto del messaggio di errore
}