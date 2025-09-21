const TMDB_API_KEY = 'f535b3af53df71c58b7219a11606a186';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let allUpcomingMovies = [];
let filteredMovies = [];
let currentFilter = 'all';
let currentPage = 1;
let totalPages = 1;

const moviesGrid = document.getElementById('moviesGrid');
const totalMoviesEl = document.getElementById('totalMovies');
const thisMonthEl = document.getElementById('thisMonth');
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
    const response = await fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
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
  totalMoviesEl.textContent = allUpcomingMovies.length;

  const now = new Date();
  const thisMonthCount = allUpcomingMovies.filter(movie => {
    if (!movie.release_date) return false;
    const releaseDate = new Date(movie.release_date);
    return releaseDate.getMonth() === now.getMonth() && releaseDate.getFullYear() === now.getFullYear();
  }).length;

  thisMonthEl.textContent = thisMonthCount;
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

  moviesGrid.innerHTML = movies.map(movie => {
    const poster = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown';
    const overview = movie.overview ? movie.overview : 'No description available.';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return `
      <div class="movie-card" onclick="openModal(${movie.id})" title="Click for details">
        <div class="movie-poster-container">
          <img class="movie-poster" src="${poster}" alt="${movie.title}" />
          <div class="release-date-badge">${releaseDate}</div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <p class="movie-overview">${overview}</p>
          <div class="movie-details">
            <div class="movie-rating">
              <span class="rating-star">⭐</span>
              <span class="rating-text">${rating}</span>
            </div>
          </div>
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
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    const movie = await response.json();

    const poster = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown';
    const genres = movie.genres.map(g => g.name).join(', ') || 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    modalBody.innerHTML = `
      <div class="modal-movie-details">
        <img src="${poster}" alt="${movie.title}" class="modal-poster" />
        <div class="modal-info">
          <h2>${movie.title}</h2>
          <p><strong>Release Date:</strong> ${releaseDate}</p>
          <p><strong>Genres:</strong> ${genres}</p>
          <p><strong>Rating:</strong> ⭐ ${rating}</p>
          <p><strong>Overview:</strong> ${movie.overview || 'No description available.'}</p>
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