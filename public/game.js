// Country nicknames/aliases mapping
const countryAliases = {
    'usa': 'united states of america',
    'us': 'united states of america',
    'america': 'united states of america',
    'uk': 'united kingdom',
    'uae': 'united arab emirates',
    'drc': 'democratic republic of the congo',
    'dr congo': 'democratic republic of the congo',
    'dem rep congo': 'democratic republic of the congo',
    'congo-kinshasa': 'democratic republic of the congo',
    'congo': 'republic of the congo',
    'congo-brazzaville': 'republic of the congo',
    'russia': 'russian federation',
    'south korea': 'republic of korea',
    'north korea': "democratic people's republic of korea",
    'czech republic': 'czechia',
    'holland': 'netherlands',
    'burma': 'myanmar',
    'ivory coast': "côte d'ivoire",
    'cape verde': 'cabo verde',
    'east timor': 'timor-leste',
    'swaziland': 'eswatini',
    'macedonia': 'north macedonia',
    'vatican': 'vatican city',
    'vatican city state': 'vatican city'
};

// Game State
const mainState = {
    map: null,
    countriesData: null,
    foundCountries: new Set(),
    countryLayers: new Map(),
    countryAliasMap: new Map(), // Maps aliases to canonical names
    timerInterval: null,
    timeRemaining: 1200, // 20 minutes in seconds
    defaultTime: 1200,
    isRunning: false,
    isPaused: false,
    gameOver: false
};

// DOM Elements
const elements = {
    map: document.getElementById('map'),
    searchInput: document.getElementById('country-search'),
    searchFeedback: document.getElementById('search-feedback'),
    autocompleteList: document.getElementById('autocomplete-list'),
    countriesList: document.getElementById('countries-list'),
    foundCount: document.getElementById('found-count'),
    totalCount: document.getElementById('total-count'),
    timerDisplay: document.getElementById('timer-display'),
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    resetBtn: document.getElementById('reset-btn'),
    timeInput: document.getElementById('time-input'),
    setTimeBtn: document.getElementById('set-time-btn'),
    gameOverModal: document.getElementById('game-over-modal'),
    gameOverTitle: document.getElementById('game-over-title'),
    finalCount: document.getElementById('final-count'),
    finalTotal: document.getElementById('final-total'),
    finalPercentage: document.getElementById('final-percentage'),
    playAgainBtn: document.getElementById('play-again-btn')
};

// Initialize the game
async function initGame() {
    initMap();
    await loadCountriesData();
    setupEventListeners();
    updateDisplay();
}

// Initialize Leaflet map
function initMap() {
    mainState.map = L.map('map', {
        zoomControl: true,
        attributionControl: false,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0,
        minZoom: 2,
        worldCopyJump: false
    }).setView([20, 0], 2);

    // Add tile layer with dark theme (no labels)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        noWrap: true,
        bounds: [[-90, -180], [90, 180]]
    }).addTo(mainState.map);
}

// Load countries GeoJSON data
async function loadCountriesData() {
    try {
        // Using a public GeoJSON source for world countries
        const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        mainState.countriesData = await response.json();
        
        // Add countries to map
        mainState.countriesData.features.forEach(feature => {
            const countryName = feature.properties.ADMIN || feature.properties.name;
            const canonicalName = countryName.toLowerCase();
            
            const layer = L.geoJSON(feature, {
                style: {
                    fillColor: '#1e3a8a',
                    fillOpacity: 0.5,
                    color: '#3b82f6',
                    weight: 1
                }
            }).addTo(mainState.map);
            
            mainState.countryLayers.set(canonicalName, {
                layer: layer,
                feature: feature,
                name: countryName
            });
            
            // Map aliases to canonical name
            for (const [alias, target] of Object.entries(countryAliases)) {
                if (target === canonicalName) {
                    mainState.countryAliasMap.set(alias, canonicalName);
                }
            }
        });
        
        elements.totalCount.textContent = mainState.countryLayers.size;
        
    } catch (error) {
        console.error('Error loading countries data:', error);
        elements.searchFeedback.textContent = 'Error loading map data. Please refresh the page.';
        elements.searchFeedback.className = 'incorrect';
    }
}

// Setup event listeners
function setupEventListeners() {
    elements.searchInput.addEventListener('input', handleSearchInput);
    elements.searchInput.addEventListener('keypress', handleSearchKeypress);
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.setTimeBtn.addEventListener('click', setCustomTime);
    elements.playAgainBtn.addEventListener('click', resetGame);
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.searchInput.contains(e.target)) {
            elements.autocompleteList.innerHTML = '';
        }
    });
}

// Handle search input
function handleSearchInput(e) {
    const query = e.target.value.trim().toLowerCase();
    
    // Clear autocomplete - no suggestions shown
    elements.autocompleteList.innerHTML = '';
    
    if (query.length < 2) {
        elements.searchFeedback.textContent = '';
        return;
    }
    
    // Resolve alias to canonical name
    const canonicalName = mainState.countryAliasMap.get(query) || query;
    
    // Auto-submit if exact match found (either by canonical name or alias)
    if (mainState.countryLayers.has(canonicalName) && !mainState.foundCountries.has(canonicalName)) {
        // Clear input immediately
        e.target.value = '';
        // Check country
        checkCountry(canonicalName);
        // Refocus on input
        e.target.focus();
    }
}

// Handle search keypress (Enter key)
function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim().toLowerCase();
        // Resolve alias to canonical name
        const canonicalName = mainState.countryAliasMap.get(query) || query;
        checkCountry(canonicalName);
    }
}

// Check if country name is correct
function checkCountry(query) {
    if (!query || mainState.gameOver) return;
    
    // Check if country exists
    const countryData = mainState.countryLayers.get(query);
    
    if (!countryData) {
        showFeedback('Country not found. Try again!', 'incorrect');
        return;
    }
    
    // Check if already found
    if (mainState.foundCountries.has(query)) {
        showFeedback('Already found this country!', 'duplicate');
        return;
    }
    
    // Country found!
    mainState.foundCountries.add(query);
    highlightCountry(countryData);
    addToFoundList(countryData.name);
    updateDisplay();
    showFeedback(`✓ Correct! ${countryData.name}`, 'correct');
    
    // Clear input
    elements.searchInput.value = '';
    elements.autocompleteList.innerHTML = '';
    
    // Check if all countries found
    if (mainState.foundCountries.size === mainState.countryLayers.size) {
        endGame(true);
    }
}

// Highlight country on map
function highlightCountry(countryData) {
    countryData.layer.setStyle({
        fillColor: '#4ade80',
        fillOpacity: 0.7,
        color: '#22c55e',
        weight: 2
    });
    
    // Zoom to country with bounds checking
    const bounds = countryData.layer.getBounds();
    const mapBounds = mainState.map.options.maxBounds;
    
    // Constrain the bounds to stay within map limits
    const constrainedBounds = L.latLngBounds(
        L.latLng(
            Math.max(bounds.getSouth(), mapBounds.getSouth()),
            Math.max(bounds.getWest(), mapBounds.getWest())
        ),
        L.latLng(
            Math.min(bounds.getNorth(), mapBounds.getNorth()),
            Math.min(bounds.getEast(), mapBounds.getEast())
        )
    );
    
    mainState.map.flyToBounds(constrainedBounds, {
        padding: [50, 50],
        duration: 0.5,
        maxZoom: 4
    });
}

// Add country to found list
function addToFoundList(countryName) {
    console.log('Adding country to list:', countryName);
    console.log('Countries list element:', elements.countriesList);
    const item = document.createElement('div');
    item.className = 'country-item';
    item.textContent = countryName;
    elements.countriesList.appendChild(item);
    console.log('Country added successfully');
}

// Show feedback message
function showFeedback(message, type) {
    elements.searchFeedback.textContent = message;
    elements.searchFeedback.className = type;
    
    setTimeout(() => {
        elements.searchFeedback.textContent = '';
        elements.searchFeedback.className = '';
    }, 3000);
}

// Update display
function updateDisplay() {
    elements.foundCount.textContent = mainState.foundCountries.size;
}

// Timer functions
function startGame() {
    if (mainState.isRunning) return;
    
    mainState.isRunning = true;
    mainState.isPaused = false;
    mainState.gameOver = false;
    
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.searchInput.disabled = false;
    elements.timeInput.disabled = true;
    elements.setTimeBtn.disabled = true;
    
    elements.searchInput.focus();
    
    startTimer();
}

function startTimer() {
    mainState.timerInterval = setInterval(() => {
        if (!mainState.isPaused && mainState.timeRemaining > 0) {
            mainState.timeRemaining--;
            updateTimerDisplay();
            
            // Warning at 5 minutes
            if (mainState.timeRemaining === 300) {
                elements.timerDisplay.classList.add('warning');
            }
            
            // Danger at 1 minute
            if (mainState.timeRemaining === 60) {
                elements.timerDisplay.classList.remove('warning');
                elements.timerDisplay.classList.add('danger');
            }
            
            if (mainState.timeRemaining === 0) {
                endGame(false);
            }
        }
    }, 1000);
}

function togglePause() {
    mainState.isPaused = !mainState.isPaused;
    elements.pauseBtn.textContent = mainState.isPaused ? 'Resume' : 'Pause';
    elements.searchInput.disabled = mainState.isPaused;
}

function updateTimerDisplay() {
    const minutes = Math.floor(mainState.timeRemaining / 60);
    const seconds = mainState.timeRemaining % 60;
    elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function setCustomTime() {
    const minutes = parseInt(elements.timeInput.value);
    if (minutes > 0 && minutes <= 120) {
        mainState.defaultTime = minutes * 60;
        mainState.timeRemaining = mainState.defaultTime;
        updateTimerDisplay();
    }
}

function resetGame() {
    // Clear timer
    if (mainState.timerInterval) {
        clearInterval(mainState.timerInterval);
        mainState.timerInterval = null;
    }
    
    // Reset state
    mainState.isRunning = false;
    mainState.isPaused = false;
    mainState.gameOver = false;
    mainState.foundCountries.clear();
    mainState.timeRemaining = mainState.defaultTime;
    
    // Reset UI
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';
    elements.searchInput.disabled = true;
    elements.searchInput.value = '';
    elements.timeInput.disabled = false;
    elements.setTimeBtn.disabled = false;
    elements.countriesList.innerHTML = '';
    elements.searchFeedback.textContent = '';
    elements.timerDisplay.classList.remove('warning', 'danger');
    elements.gameOverModal.classList.add('hidden');
    
    // Reset map colors
    mainState.countryLayers.forEach(countryData => {
        countryData.layer.setStyle({
            fillColor: '#1e3a8a',
            fillOpacity: 0.5,
            color: '#3b82f6',
            weight: 1
        });
    });
    
    // Reset map view
    mainState.map.setView([20, 0], 2);
    
    updateDisplay();
    updateTimerDisplay();
}

function endGame(completed) {
    mainState.gameOver = true;
    mainState.isRunning = false;
    
    if (mainState.timerInterval) {
        clearInterval(mainState.timerInterval);
    }
    
    elements.searchInput.disabled = true;
    elements.pauseBtn.disabled = true;
    
    // Show game over modal
    const percentage = Math.round((mainState.foundCountries.size / mainState.countryLayers.size) * 100);
    
    if (completed) {
        elements.gameOverTitle.textContent = '🎉 Congratulations!';
    } else {
        elements.gameOverTitle.textContent = "⏰ Time's Up!";
    }
    
    elements.finalCount.textContent = mainState.foundCountries.size;
    elements.finalTotal.textContent = mainState.countryLayers.size;
    elements.finalPercentage.textContent = percentage;
    
    elements.gameOverModal.classList.remove('hidden');
}

// Initialize game when page loads
window.addEventListener('load', initGame);

// Made with Bob
