// FarmTech UP - Showcase Scripts

document.addEventListener('DOMContentLoaded', function() {
    // Add animation on scroll
    const cards = document.querySelectorAll('.tool-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(card);
    });

    // Handle image loading errors
    document.querySelectorAll('.tool-image img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'assets/placeholder.svg';
        });
    });

    console.log('FarmTech UP - Loaded successfully');
});