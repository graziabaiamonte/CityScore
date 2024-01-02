
 import '../css/styles.css';

 const searchButton = document.getElementById('searchButton');
const summary = document.getElementById('summary');
const cityNameInput = document.getElementById('cityNameInput');
const imageElement = document.getElementById('cityImage');
const body = document.querySelector('body')
const boxInfo = document.getElementById('boxInfo');
const boxGenerale = document.getElementById('box-generale');
const titolo = document.createElement('h2');
const dropdownList = document.getElementById('cityDropdown');
const cityListItems = document.querySelectorAll('#cityDropdown li');
let currentCityName = '';
const boxCategorie = document.querySelector('.box-categorie');


// Function to show city data

function showCityData(cityName) {
  const messageError = document.getElementById('messageError');
  messageError.innerHTML = '';
  messageError.classList.remove('messageError');

  axios.get(`https://api.teleport.org/api/urban_areas/slug:${cityName}/images/`)
      .then(function (response) {
          let cityImage = response.data.photos[0]?.image?.mobile;

          if (cityImage) {
              if (cityName !== currentCityName) {
                  boxGenerale.style.backgroundImage = `url(${cityImage})`;
                  boxGenerale.style.backgroundSize = 'contain';
                  
                  

                  let overlayImage = document.createElement('div');
                  overlayImage.style.backgroundImage = `url(${cityImage})`;
                 
                  
                  overlayImage.classList.add('overlay-image');
          
                  // Aggiungi l'elemento immagine con opacità al box-generale
                  boxGenerale.appendChild(overlayImage)
              }

              axios.get(`https://api.teleport.org/api/urban_areas/slug:${cityName}/scores/`)
                  .then(function (response) {
                      let dati = response.data;

                      titolo.textContent = cityName;
                      let headerElement = document.getElementById('header');
                      headerElement.innerHTML = '';
                      headerElement.appendChild(titolo);
                      titolo.style.textAlign = 'center';
                      titolo.style.fontSize = '36px';
                      titolo.style.fontWeight = '700';
                      summary.innerHTML = response.data.summary;
                      

                      let categnumeri = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                      categnumeri.forEach((number) => {
                          let container = document.createElement('div');
                          let name = document.createElement('h3');
                          let value = document.createElement('p');
                          name.textContent = dati.categories[number].name;
                          value.textContent = dati.categories[number].score_out_of_10.toFixed(2);
                          let progressBar = document.createElement('progress');
                          progressBar.value = dati.categories[number].score_out_of_10;
                          progressBar.max = 10;
                          container.appendChild(name);
                          container.appendChild(value);
                          container.appendChild(progressBar);
                          boxCategorie.appendChild(container);
                          container.classList.add('categories');
                      });
                  })
                  .catch(function (error) {
                      console.log('Error fetching scores: ', error);
                      showNotFoundMessage();
                  });

              boxGenerale.style.height = '80%';
          }
      })
      .catch(function (error) {
          console.log('Error fetching image: ', error);
          showNotFoundMessage();
      });
}


  
  function showNotFoundMessage(){
    const message = document.createElement('p');
    message.innerHTML = 'City not found';
    const messageError = document.getElementById('messageError');
    messageError.innerHTML = '';
    messageError.appendChild(message);
    messageError.classList.add('messageError');

    imageElement.style.visibility = 'hidden';

    
    summary.innerHTML = '';
    titolo.textContent = '';

    // Rimuovi le categorie esistenti
    const existingCategories = document.querySelectorAll('.categories');
    existingCategories.forEach(category => category.remove());
  }
    


// Function to show the list of cities based on the query

async function showCitiesList(query) {
    
  
    try {
      const response = await axios.get(`https://api.teleport.org/api/urban_areas/`);
      const cities = response.data._links['ua:item'];
  
      // Clear the previous content of the dropdown
      dropdownList.innerHTML = '';
  
      // Filtra le città in base al nome inserito nell'input
      const filteredCities = cities.filter(city => city.name.toLowerCase().includes(query.toLowerCase()));
  
      // Show the list of matching cities
      filteredCities.forEach(city => {
        const option = document.createElement('li');
        const cityNameLower = city.name;
        option.textContent = cityNameLower;
  
        option.addEventListener('click', function () {
            const cityName = cityNameLower.toLowerCase();
            cityNameInput.value = cityName;
        
          imageElement.src = '';
          dropdownList.style.display = 'none'
        });
  
        dropdownList.appendChild(option);
      });
  
      // Show the dropdown only if there are search results
      dropdownList.classList.toggle('show', filteredCities.length > 0);
    } catch (error) {
      console.error('Error during API request:', error.message);
    }
  }
  




// Funzione di callback per la selezione di una città dall'elenco
function cityClickHandler(cityName) {
  showCityData(cityName);
  imageElement.src = '';

  const existingCategories = document.querySelectorAll('.categories');
  existingCategories.forEach(category => category.remove());
dropdownList.style.display = 'none';
  
}
  cityListItems.forEach(li => {
    li.addEventListener('click', () => {
      const cityName = li.textContent;
      cityClickHandler(cityName);
      dropdownList.style.display = 'none';
    });
});




cityNameInput.addEventListener('input', function () {
  const query = cityNameInput.value.trim();
  showCitiesList(query);
  boxGenerale.style.height = '100%';
  boxInfo.style.visibility = 'hidden'
  boxCategorie.style.visibility = 'hidden';
  imageElement.style.visibility = 'hidden';
  dropdownList.style.display = 'block';
});



 searchButton.addEventListener('click', function () {
  const cityName = cityNameInput.value;
  showCityData(cityName);
  boxInfo.classList.remove('d-none');
  boxInfo.classList.add('boxInfo');
  boxInfo.style.visibility = 'visible';
  boxCategorie.style.visibility = 'visible';
  boxGenerale.style.height = '50%';
 });

 searchButton.addEventListener('click', function(){
    imageElement.src = '';
    summary.innerHTML = '';

  const existingCategories = document.querySelectorAll('.categories');
  existingCategories.forEach(category => category.remove());

  const cityName = cityNameInput.value;

  titolo.textContent = cityName;
  const headerElement = document.getElementById('header');
  headerElement.appendChild(titolo);

  if (!cityName){
    boxInfo.classList.add('d-none');
  } else{
    boxInfo.classList.remove('d-none');
  boxInfo.classList.add('boxInfo');
  }
 });