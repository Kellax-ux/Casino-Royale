document.addEventListener('DOMContentLoaded', () => {
    const currentAvatar = document.getElementById('current-avatar');
    const avatarSlider = document.getElementById('avatar-slider');
    const avatarForm = document.getElementById('avatar-form');
    const selectedAvatarInput = document.getElementById('selected-avatar');
    const defaultAvatarSrc = 'static/default-avatar.jpg'; // Path to the default avatar image

    // Ensure default avatar for non-logged-in users
    const username = document.getElementById('username-display').textContent.trim();
    const isLoggedIn = username !== "Player"; // Check if the user is logged in
    console.log("Login Status:", isLoggedIn);

    if (currentAvatar && !isLoggedIn) {
        currentAvatar.src = defaultAvatarSrc;
    }

    // Show or hide the avatar slider when clicking on the current avatar
    currentAvatar.addEventListener('click', () => {
        if (isLoggedIn) {
            avatarSlider.classList.toggle('active'); // Toggle visibility
            avatarSlider.classList.toggle('hidden');
            // avatarSlider.style.display = avatarSlider.style.display === 'flex' ? 'none' : 'flex'; // Ensure horizontal layout
            
            // avatarSlider.style.transform = avatarSlider.style.transform === 'translateX(0)' ? 'translateX(-100%)' : 'translateX(0)';
            // avatarSlider.style.transition = 'transform 0.3s ease'; // Smooth transition effect
            
        } else {
            alert('Please log in to change your avatar.');
        }
    });

    
    // Handle avatar selection
    avatarSlider.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG') { // Ensure the clicked element is an avatar image
            const selectedAvatarSrc = event.target.src;
            currentAvatar.src = selectedAvatarSrc;
            selectedAvatarInput.value = selectedAvatarSrc;

            const radioInput = event.target.closest('label').querySelector('input');
            if (radioInput) {
                radioInput.checked = true;
                avatarForm.submit();
            // alert('Avatar updated successfully!');
            }
        }
    });

    // Handle "Play Now" button clicks
    document.querySelectorAll('.play-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            if (!isLoggedIn) {
                event.preventDefault(); // Prevent navigation
                alert('Please log in to play games.');
                
            } else {
                const gameName = button.parentElement.querySelector('h3').textContent;
                alert(`Starting game: ${gameName}`);
            }
        });
    });
});
