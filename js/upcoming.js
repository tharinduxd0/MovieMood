const TMDB_API_KEY = 'f535b3af53df71c58b7219a11606a186';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesGrid = document.getElementById('moviesGrid');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const statsEl = document.getElementById('stats');
const heroTitle = document.getElementById('heroTitle');
const heroRelease = document.getElementById('heroRelease');

document.addEventListener('DOMContentLoaded', () => {
  fetchUpcomingMovies();
});

async function fetchUpcomingMovies(page=1) {
  if(page===1) { moviesGrid.innerHTML='<div class="loading">Loading upcoming movies...</div>'; allUpcomingMovies=[]; }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
    if(!res.ok) throw new Error('Failed');
    const data = await res.json();

    totalPages=data.total_pages; currentPage=data.page;
    allUpcomingMovies=allUpcomingMovies.concat(data.results);
    applyFilter(currentFilter);

    if(currentPage<totalPages) loadMoreContainer.style.display='block';
    else loadMoreContainer.style.display='none';

    highlightHeroMovie();
  } catch(err) {
    moviesGrid.innerHTML='<div class="error">Error loading movies</div>';
    console.error(err);
  }
}

function applyFilter(filter) {
  currentFilter=filter;
  const now=new Date();
  filteredMovies=allUpcomingMovies.filter(movie=>{
    if(!movie.release_date) return false;
    const rd=new Date(movie.release_date);
    switch(filter){
      case 'this-month': return rd.getMonth()===now.getMonth() && rd.getFullYear()===now.getFullYear();
      case 'next-month':
        const nm=(now.getMonth()+1)%12;
        const ny=nm===0?now.getFullYear()+1:now.getFullYear();
        return rd.getMonth()===nm && rd.getFullYear()===ny;
      case 'this-year': return rd.getFullYear()===now.getFullYear();
      default: return true;
    }
  });
  renderMovies(filteredMovies);
  updateFilterButtons(filter);
  updateStatsDisplay(filter);
}

function renderMovies(movies) {
  if(movies.length===0){ moviesGrid.innerHTML='<div class="loading">No movies found</div>'; loadMoreContainer.style.display='none'; return; }

  moviesGrid.innerHTML=movies.map(movie=>{
    const poster=movie.poster_path?`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`:'https://via.placeholder.com/500x750?text=No+Image';
    const releaseDate=movie.release_date?new Date(movie.release_date).toLocaleDateString():'Unknown';
    const overview=movie.overview || 'No description';
    const rating=movie.vote_average?movie.vote_average.toFixed(1):'N/A';

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

function updateFilterButtons(active) {
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(active.replace('-','')));
  });
}

function updateStatsDisplay(filter){
  let text='';
  switch(filter){
    case 'all': text=`Showing all upcoming movies (${allUpcomingMovies.length})`; break;
    case 'this-month': text=`Showing movies releasing this month (${filteredMovies.length})`; break;
    case 'next-month': text=`Showing movies releasing next month (${filteredMovies.length})`; break;
    case 'this-year': text=`Showing movies releasing this year (${filteredMovies.length})`; break;
  }
  statsEl.textContent=text;
}

function filterMovies(filter,e){ e.preventDefault(); applyFilter(filter); }
function loadMoreMovies(){ if(currentPage<totalPages) fetchUpcomingMovies(currentPage+1); }

// Hero Highlight
function highlightHeroMovie(){
  if(allUpcomingMovies.length===0) return;
  const sorted=allUpcomingMovies.sort((a,b)=>new Date(a.release_date)-new Date(b.release_date));
  const hero=sorted[0];
  heroTitle.textContent=hero.title;
  heroRelease.textContent=`Releasing: ${new Date(hero.release_date).toLocaleDateString()}`;
  document.getElementById('heroBanner').style.backgroundImage=`url(${hero.poster_path?TMDB_IMAGE_BASE_URL+hero.poster_path:'https://via.placeholder.com/1920x400'})`;
}

// Modal
const modal=document.getElementById('movieModal')
