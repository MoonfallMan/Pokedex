// Cache DOM elements
const pokemonGrid = document.getElementById('pokemon-grid');
const searchInput = document.getElementById('search');
const modal = document.getElementById('pokemon-modal');
const modalContent = document.querySelector('.modal-content');
const pokemonDetail = document.getElementById('pokemon-detail');
const closeButton = document.querySelector('.close-button');
const themeToggle = document.getElementById('theme-toggle');
const typeFilter = document.getElementById('typeFilter');
const soundToggle = document.getElementById('sound-toggle');
const clickSound = document.getElementById('click-sound');
const musicToggle = document.getElementById('music-toggle');
const backgroundMusic = document.getElementById('background-music');

// Global variables
let allPokemon = [];
const POKEMON_LIMIT = 151; // First generation
let isDarkMode = false;
let isSoundEnabled = true;
let isMusicEnabled = false;

// Type effectiveness data
const typeEffectiveness = {
    normal: {
        weakTo: ['fighting'],
        resistantTo: [],
        immuneTo: ['ghost']
    },
    fire: {
        weakTo: ['water', 'ground', 'rock'],
        resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        immuneTo: []
    },
    water: {
        weakTo: ['electric', 'grass'],
        resistantTo: ['fire', 'water', 'ice', 'steel'],
        immuneTo: []
    },
    electric: {
        weakTo: ['ground'],
        resistantTo: ['electric', 'flying', 'steel'],
        immuneTo: []
    },
    grass: {
        weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'],
        resistantTo: ['water', 'electric', 'grass', 'ground'],
        immuneTo: []
    },
    ice: {
        weakTo: ['fire', 'fighting', 'rock', 'steel'],
        resistantTo: ['ice'],
        immuneTo: []
    },
    fighting: {
        weakTo: ['flying', 'psychic', 'fairy'],
        resistantTo: ['bug', 'rock', 'dark'],
        immuneTo: []
    },
    poison: {
        weakTo: ['ground', 'psychic'],
        resistantTo: ['grass', 'fighting', 'poison', 'bug', 'rock', 'fairy'],
        immuneTo: []
    },
    ground: {
        weakTo: ['grass', 'ice'],
        resistantTo: ['poison', 'rock'],
        immuneTo: ['electric']
    },
    flying: {
        weakTo: ['electric', 'ice', 'rock'],
        resistantTo: ['grass', 'fighting', 'bug'],
        immuneTo: ['ground']
    },
    psychic: {
        weakTo: ['bug', 'ghost', 'dark'],
        resistantTo: ['fighting', 'psychic'],
        immuneTo: []
    },
    bug: {
        weakTo: ['fire', 'flying', 'rock'],
        resistantTo: ['grass', 'fighting', 'ground'],
        immuneTo: []
    },
    rock: {
        weakTo: ['water', 'grass'],
        resistantTo: ['normal', 'fire', 'poison', 'flying'],
        immuneTo: []
    },
    ghost: {
        weakTo: ['ghost', 'dark'],
        resistantTo: ['poison', 'bug'],
        immuneTo: ['normal', 'fighting']
    },
    dragon: {
        weakTo: ['ice', 'dragon', 'fairy'],
        resistantTo: ['fire', 'water', 'electric', 'grass'],
        immuneTo: []
    },
    dark: {
        weakTo: ['bug', 'fairy'],
        resistantTo: ['ghost', 'dark'],
        immuneTo: ['psychic']
    },
    steel: {
        weakTo: ['fire', 'water'],
        resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'steel'],
        immuneTo: ['poison']
    },
    fairy: {
        weakTo: ['poison', 'steel'],
        resistantTo: ['fighting', 'bug', 'dark'],
        immuneTo: ['dragon']
    }
};

// Theme toggle functionality
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    html.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Sound functionality
async function loadPokemonCry(pokemonId) {
    try {
        const response = await fetch(`https://pokemoncries.com/cries-old/${pokemonId}.mp3`);
        if (response.ok) {
            return `https://pokemoncries.com/cries-old/${pokemonId}.mp3`;
        }
        return null;
    } catch (error) {
        console.error('Error loading Pokemon cry:', error);
        return null;
    }
}

async function playPokemonCry(pokemonId) {
    if (!isSoundEnabled) return;
    
    const cryUrl = await loadPokemonCry(pokemonId);
    if (cryUrl) {
        const audio = new Audio(cryUrl);
        audio.volume = 0.3; // Reduce volume to 30%
        try {
            await audio.play();
        } catch (error) {
            console.error('Error playing Pokemon cry:', error);
        }
    }
}

function playClickSound() {
    if (!isSoundEnabled) return;
    clickSound.currentTime = 0;
    clickSound.volume = 0.2;
    clickSound.play().catch(error => console.error('Error playing click sound:', error));
}

// Music functionality
function initializeMusic() {
    // Add event listeners for audio loading
    backgroundMusic.addEventListener('loadeddata', () => {
        console.log('Music loaded successfully');
        musicToggle.style.display = 'block'; // Show music toggle only when music is loaded
    });

    backgroundMusic.addEventListener('error', (e) => {
        console.error('Error loading music source:', e);
        // Try next source if available
        if (backgroundMusic.getElementsByTagName('source').length > 0) {
            let sources = backgroundMusic.getElementsByTagName('source');
            let currentSource = sources[0];
            currentSource.remove(); // Remove the failed source
            backgroundMusic.load(); // Try loading the next source
        } else {
            console.error('All music sources failed to load');
            musicToggle.style.display = 'none'; // Hide music toggle if all sources fail
        }
    }, true);

    backgroundMusic.volume = 0.3; // Set initial volume to 30%
    
    // Add music toggle functionality
    musicToggle.style.display = 'none'; // Hide initially until music is loaded
    musicToggle.addEventListener('click', async () => {
        try {
            isMusicEnabled = !isMusicEnabled;
            musicToggle.textContent = isMusicEnabled ? '🎵 Music On' : '🎵 Music Off';
            musicToggle.classList.toggle('muted', !isMusicEnabled);
            
            if (isMusicEnabled) {
                console.log('Attempting to play music...');
                await backgroundMusic.play();
                console.log('Music playing successfully');
            } else {
                backgroundMusic.pause();
                console.log('Music paused');
            }
        } catch (error) {
            console.error('Error with music playback:', error);
            isMusicEnabled = false;
            musicToggle.textContent = '🎵 Music Off';
            musicToggle.classList.add('muted');
        }
    });
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isMusicEnabled) {
            backgroundMusic.pause();
        } else if (!document.hidden && isMusicEnabled) {
            backgroundMusic.play().catch(console.error);
        }
    });

    // Start loading the audio
    backgroundMusic.load();
}

// Fetch Pokemon data
async function fetchPokemon() {
    try {
        showLoader();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_LIMIT}`);
        const data = await response.json();
        
        // Fetch detailed data for each Pokemon
        const detailedPokemon = await Promise.all(
            data.results.map(async (pokemon) => {
                const response = await fetch(pokemon.url);
                return response.json();
            })
        );
        
        allPokemon = detailedPokemon;
        displayPokemon(allPokemon);
        hideLoader();
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        pokemonGrid.innerHTML = '<p class="error">Error loading Pokemon. Please try again later.</p>';
        hideLoader();
    }
}

// Display Pokemon in grid
function displayPokemon(pokemonList) {
    pokemonGrid.innerHTML = '';
    
    pokemonList.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.className = 'pokemon-card';
        pokemonCard.onclick = () => {
            playClickSound();
            showPokemonDetails(pokemon);
            playPokemonCry(pokemon.id);
        };
        
        const types = pokemon.types.map(type => 
            `<span class="type-badge ${type.type.name}">${type.type.name}</span>`
        ).join('');
        
        pokemonCard.innerHTML = `
            <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                 alt="${pokemon.name}">
            <h2>${pokemon.name}</h2>
            <div class="pokemon-number">#${String(pokemon.id).padStart(3, '0')}</div>
            <div class="pokemon-types">${types}</div>
        `;
        
        pokemonGrid.appendChild(pokemonCard);
    });
}

// Show Pokemon details in modal
async function showPokemonDetails(pokemon) {
    const types = pokemon.types.map(type => 
        `<span class="type-badge ${type.type.name}">${type.type.name}</span>`
    ).join('');
    
    // Calculate type effectiveness
    let weakTo = new Set();
    let resistantTo = new Set();
    let immuneTo = new Set();
    
    pokemon.types.forEach(type => {
        const effectiveness = typeEffectiveness[type.type.name];
        if (effectiveness) {
            effectiveness.weakTo.forEach(t => weakTo.add(t));
            effectiveness.resistantTo.forEach(t => resistantTo.add(t));
            effectiveness.immuneTo.forEach(t => immuneTo.add(t));
        }
    });
    
    const typeEffectivenessHTML = `
        <div class="type-effectiveness">
            <h3>Type Effectiveness</h3>
            <div class="effectiveness-group">
                <h4>Weak to (2x damage):</h4>
                <p class="super-effective">${Array.from(weakTo).join(', ') || 'None'}</p>
            </div>
            <div class="effectiveness-group">
                <h4>Resistant to (½x damage):</h4>
                <p class="not-effective">${Array.from(resistantTo).join(', ') || 'None'}</p>
            </div>
            <div class="effectiveness-group">
                <h4>Immune to (0x damage):</h4>
                <p class="no-effect">${Array.from(immuneTo).join(', ') || 'None'}</p>
            </div>
        </div>
    `;
    
    const stats = pokemon.stats.map(stat => `
        <div class="stat">
            <span class="stat-name">${stat.stat.name}</span>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${(stat.base_stat / 255) * 100}%;">
                    ${stat.base_stat}
                </div>
            </div>
        </div>
    `).join('');
    
    const abilities = pokemon.abilities.map(ability => 
        `<span class="ability">${ability.ability.name}</span>`
    ).join(', ');

    pokemonDetail.innerHTML = `
        <div class="pokemon-detail-header">
            <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                 alt="${pokemon.name}">
            <h2>${pokemon.name}</h2>
            <div class="pokemon-number">#${String(pokemon.id).padStart(3, '0')}</div>
            <div class="pokemon-types">${types}</div>
        </div>
        <div class="pokemon-info">
            <div class="pokemon-measurements">
                <p>Height: ${pokemon.height / 10}m</p>
                <p>Weight: ${pokemon.weight / 10}kg</p>
            </div>
            <div class="pokemon-abilities">
                <h3>Abilities</h3>
                <p>${abilities}</p>
            </div>
            <div class="pokemon-stats">
                <h3>Base Stats</h3>
                ${stats}
            </div>
            ${typeEffectivenessHTML}
        </div>
    `;
    
    modal.style.display = 'block';
    playPokemonCry(pokemon.id);
}

// Search functionality
function searchPokemon(searchTerm) {
    const selectedType = typeFilter.value;
    const filteredPokemon = allPokemon.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pokemon.id.toString() === searchTerm;
        const matchesType = !selectedType || 
            pokemon.types.some(type => type.type.name === selectedType);
        return matchesSearch && matchesType;
    });
    displayPokemon(filteredPokemon);
}

// Add type filtering functionality
typeFilter.addEventListener('change', () => {
    playClickSound();
    const selectedType = typeFilter.value;
    const filteredPokemon = selectedType
        ? allPokemon.filter(pokemon => 
            pokemon.types.some(type => type.type.name === selectedType))
        : allPokemon;
    displayPokemon(filteredPokemon);
});

// Utility functions
function showLoader() {
    pokemonGrid.innerHTML = '<div class="loader"></div>';
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

// Event listeners
searchInput.addEventListener('input', (e) => {
    playClickSound();
    searchPokemon(e.target.value);
});

closeButton.addEventListener('click', () => {
    playClickSound();
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Sound toggle functionality
soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.textContent = isSoundEnabled ? '🔊 Sound On' : '🔈 Sound Off';
    soundToggle.classList.toggle('muted', !isSoundEnabled);
    playClickSound();
});

// Initialize
fetchPokemon();
initializeMusic();
