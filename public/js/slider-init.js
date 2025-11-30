document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('.js-hero-slider');
  
  if (sliders.length > 0 && typeof Swiper !== 'undefined') {
    sliders.forEach(sliderEl => {
      new Swiper(sliderEl, {
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        autoplay: {
          delay: 5000,
        },
      });
    });
  }
});