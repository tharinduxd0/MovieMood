document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.querySelector('.profile-icon');
    const dropdown = document.querySelector('.profile-dropdown');

    profileIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function(event) {
        if (!profileIcon.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
});
