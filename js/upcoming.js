const TMDB_API_KEY = 'f535b3af53df71c58b7219a11606a186';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let allUpcomingMovies = [];
let filteredMovies = [];
let currentFilter = 'all';
let currentPage = 1;
let totalPages = 1;

const moviesGrid = document.getElementById('moviesGrid');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const statsEl = document.getElementById('stats');

document.addEventListener('DOMContentLoaded', () => {
  fetchUpcomingMovies();
});

async function fetchUpcomingMovies(page = 1) {
  if (page === 1) {
    moviesGrid.innerHTML = '<div class="loading">Loading upcoming movies...</div>';
    allUpcomingMovies = [];
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=${page}&include_adult=false`);
    if (!response.ok) throw new Error('Failed to fetch movies');
    const data = await response.json();

    totalPages = data.total_pages;
    currentPage = data.page;

    allUpcomingMovies = allUpcomingMovies.concat(data.results);

    updateStats();
    applyFilter(currentFilter);

    if (currentPage < totalPages) {
      loadMoreContainer.style.display = 'block';
    } else {
      loadMoreContainer.style.display = 'none';
    }
  } catch (error) {
    moviesGrid.innerHTML = `<div class="error">Error loading movies. Please try again later.</div>`;
    console.error(error);
  }
}

function updateStats() {
  const now = new Date();
  const thisMonthCount = allUpcomingMovies.filter(movie => {
    if (!movie.release_date) return false;
    const releaseDate = new Date(movie.release_date);
    return releaseDate.getMonth() === now.getMonth() && releaseDate.getFullYear() === now.getFullYear();
  }).length;
}

function applyFilter(filter) {
  currentFilter = filter;

  const now = new Date();
  filteredMovies = allUpcomingMovies.filter(movie => {
    if (!movie.release_date) return false;
    const releaseDate = new Date(movie.release_date);

    switch (filter) {
      case 'this-month':
        return releaseDate.getMonth() === now.getMonth() && releaseDate.getFullYear() === now.getFullYear();
      case 'next-month':
        const nextMonth = (now.getMonth() + 1) % 12;
        const nextMonthYear = nextMonth === 0 ? now.getFullYear() + 1 : now.getFullYear();
        return releaseDate.getMonth() === nextMonth && releaseDate.getFullYear() === nextMonthYear;
      case 'this-year':
        return releaseDate.getFullYear() === now.getFullYear();
      case 'all':
      default:
        return true;
    }
  });

  renderMovies(filteredMovies);
  updateFilterButtons(filter);
  updateStatsDisplay(filter);
}

function renderMovies(movies) {
  if (movies.length === 0) {
    moviesGrid.innerHTML = '<div class="loading">No movies found for this filter.</div>';
    loadMoreContainer.style.display = 'none';
    return;
  }

  // Render movie cards with staggered fade-in / slide-up animation
  moviesGrid.innerHTML = movies.map((movie, index) => {
    const poster = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';
    const overview = movie.overview ? movie.overview : 'No description available.';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return `
      <div class="movie-card" onclick="openModal(${movie.id})" title="Click for details" style="animation-delay: ${index * 0.05}s">
        <div class="movie-poster-container">
          <img class="movie-poster" src="${poster}" alt="${movie.title}" />
          <div class="movie-poster-overlay">
            <div class="overlay-release-date">Releasing: ${releaseDate}</div>
            <div class="overlay-rating">⭐ ${rating}</div>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <p class="movie-overview">${overview}</p>
        </div>
      </div>
    `;
  }).join('');
}

function updateFilterButtons(activeFilter) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(activeFilter.replace('-', '')));
  });
}

function updateStatsDisplay(filter) {
  let text = '';
  switch (filter) {
    case 'all':
      text = `Showing all upcoming movies (${allUpcomingMovies.length})`;
      break;
    case 'this-month':
      text = `Showing movies releasing this month (${filteredMovies.length})`;
      break;
    case 'next-month':
      text = `Showing movies releasing next month (${filteredMovies.length})`;
      break;
    case 'this-year':
      text = `Showing movies releasing this year (${filteredMovies.length})`;
      break;
  }
  statsEl.textContent = text;
}

function filterMovies(filter, event) {
  event.preventDefault();
  applyFilter(filter);
}

function loadMoreMovies() {
  if (currentPage < totalPages) {
    fetchUpcomingMovies(currentPage + 1);
  }
}

// Modal functionality
const modal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');

async function openModal(movieId) {
  modal.style.display = 'block';
  modalBody.innerHTML = '<div class="modal-loading">Loading movie details...</div>';

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&include_adult=false`);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    const movie = await response.json();

    const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://via.placeholder.com/850x400?text=No+Backdrop';
    const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/220x330?text=No+Poster';
    
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const genres = movie.genres.map(g => g.name).join(', ') || 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';

    modalBody.innerHTML = `
      <div class="modal-header" style="background-image: url('${backdropUrl}')">
        <div class="modal-header-content">
          <h2 class="modal-movie-title">${movie.title}</h2>
          <p class="modal-movie-tagline">${movie.tagline || ''}</p>
        </div>
      </div>
      <div class="modal-main-content">
        <div class="modal-poster-column">
          <img src="${posterUrl}" alt="${movie.title}" class="modal-poster" />
        </div>
        <div class="modal-details-column">
          <div class="modal-movie-details-grid">
            <div class="detail-item">
              <strong>Rating</strong>
              <span>⭐ ${rating}</span>
            </div>
            <div class="detail-item">
              <strong>Runtime</strong>
              <span>${runtime}</span>
            </div>
            <div class="detail-item">
              <strong>Release Date</strong>
              <span>${releaseDate}</span>
            </div>
          </div>
          <div class="modal-movie-overview">
            <h4>Overview</h4>
            <p>${movie.overview || 'No description available.'}</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    modalBody.innerHTML = `<div class="error">Failed to load movie details. Please try again later.</div>`;
    console.error(error);
  }
}

function closeModal() {
  modal.style.display = 'none';
}

window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  }
};
