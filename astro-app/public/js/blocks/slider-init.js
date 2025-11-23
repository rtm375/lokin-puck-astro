// This script runs only if a HeroSlider component is present on the page
document.addEventListener('DOMContentLoaded', function() {
  // Look for the specific class we added in render()
  const sliderElements = document.querySelectorAll('.js-hero-slider');
  
  if (sliderElements.length > 0 && typeof Swiper !== 'undefined') {
    sliderElements.forEach(el => {
      new Swiper(el, {
        loop: true,
        autoplay: {
          delay: 5000,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
      });
    });
  }
});