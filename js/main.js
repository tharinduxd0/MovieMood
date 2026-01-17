document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.querySelector('.profile-icon');
    const dropdown = document.querySelector('.profile-dropdown');

    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged((user) => {
            updateProfileUI(user);
        });
    }

    if (profileIcon) {
        profileIcon.addEventListener('click', function(event) {
            event.stopPropagation();
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });

        document.addEventListener('click', function(event) {
            if (dropdown && !profileIcon.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
});

function updateProfileUI(user) {
    const dropdown = document.querySelector('.profile-dropdown');
    if (!dropdown) {
        console.warn('Profile dropdown element not found');
        return;
    }

    const isPagesDir = window.location.pathname.includes('/pages/');
    const signInPath = isPagesDir ? 'signIn.html' : 'pages/signIn.html';
    const signUpPath = isPagesDir ? 'signUp.html' : 'pages/signUp.html';
    const profilePath = isPagesDir ? 'profile.html' : 'pages/profile.html';
    const indexPath = isPagesDir ? '../index.html' : 'index.html';

    if (user) {
        dropdown.innerHTML = `
            <a href="${profilePath}">Profile</a>
            <a href="#" id="logout-link">Logout</a>
        `;
        
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                firebase.auth().signOut().then(() => {
                    window.location.href = indexPath;
                }).catch((error) => {
                    console.error("Sign out error:", error);
                });
            });
        }
    } else {
        dropdown.innerHTML = `
            <a href="${signInPath}">Sign In</a>
            <a href="${signUpPath}">Sign Up</a>
        `;
    }
}