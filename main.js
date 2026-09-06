// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var burger = document.querySelector('.burger');
  var mobileNav = document.querySelector('.mobile-nav');
  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      var expanded = mobileNav.classList.contains('open');
      burger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  // Scroll progress bar
  var progress = document.querySelector('.scroll-progress');
  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + '%';

    var backBtn = document.querySelector('.back-to-top');
    if (backBtn) {
      if (scrollTop > 480) backBtn.classList.add('visible');
      else backBtn.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  var backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Signup form handler
  var signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var successBox = document.getElementById('signup-success');
      if (successBox) {
        successBox.style.display = 'block';
        signupForm.reset();
      }
    });
  }

  // Mobile reviews automatic slideshow & swipe
  var reviewsTrack = document.getElementById('reviews-track');
  var reviewsDotsWrap = document.getElementById('reviews-dots');

  if (reviewsTrack) {
    var reviewCards = reviewsTrack.querySelectorAll('.review-card');
    var reviewDots = reviewsDotsWrap ? reviewsDotsWrap.querySelectorAll('.review-dot') : [];
    var totalSlides = reviewCards.length;
    var currentSlide = 0;
    var autoSlideInterval = null;
    var pauseTimeout = null;
    var isInteracting = false;

    function updateActiveReviewDot(activeIndex) {
      reviewDots.forEach(function (dot, idx) {
        if (idx === activeIndex) {
          dot.classList.add('active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('active');
          dot.setAttribute('aria-selected', 'false');
        }
      });
    }

    function goToSlide(index, smooth) {
      if (totalSlides === 0) return;
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentSlide = index;

      var trackWidth = reviewsTrack.clientWidth;
      reviewsTrack.scrollTo({
        left: currentSlide * trackWidth,
        behavior: smooth !== false ? 'smooth' : 'auto'
      });
      updateActiveReviewDot(currentSlide);
    }

    function startAutoSlide() {
      stopAutoSlide();
      if (window.innerWidth > 768 || totalSlides <= 1) return;
      autoSlideInterval = setInterval(function () {
        if (isInteracting) return;
        goToSlide(currentSlide + 1, true);
      }, 4500);
    }

    function stopAutoSlide() {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    }

    function pauseAndResumeAutoSlide() {
      stopAutoSlide();
      isInteracting = true;
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(function () {
        isInteracting = false;
        startAutoSlide();
      }, 5000);
    }

    // Touch events for manual swipe
    reviewsTrack.addEventListener('touchstart', function () {
      isInteracting = true;
      stopAutoSlide();
    }, { passive: true });

    reviewsTrack.addEventListener('touchend', function () {
      pauseAndResumeAutoSlide();
    }, { passive: true });

    reviewsTrack.addEventListener('touchcancel', function () {
      pauseAndResumeAutoSlide();
    }, { passive: true });

    // Desktop hover pause
    reviewsTrack.addEventListener('mouseenter', function () {
      isInteracting = true;
      stopAutoSlide();
    });

    reviewsTrack.addEventListener('mouseleave', function () {
      isInteracting = false;
      startAutoSlide();
    });

    // Update dots on manual swipe/scroll
    var scrollDebounce;
    reviewsTrack.addEventListener('scroll', function () {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(function () {
        var trackWidth = reviewsTrack.clientWidth || 1;
        var newIndex = Math.round(reviewsTrack.scrollLeft / trackWidth);
        if (newIndex >= 0 && newIndex < totalSlides && newIndex !== currentSlide) {
          currentSlide = newIndex;
          updateActiveReviewDot(currentSlide);
        }
      }, 40);
    }, { passive: true });

    // Dot indicators click
    reviewDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          goToSlide(idx, true);
          pauseAndResumeAutoSlide();
        }
      });
    });

    // Handle tab visibility and resize
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoSlide();
      } else if (window.innerWidth <= 768 && !isInteracting) {
        startAutoSlide();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth <= 768) {
        if (!autoSlideInterval && !isInteracting) {
          startAutoSlide();
        }
      } else {
        stopAutoSlide();
      }
    });

    // Initial setup
    updateActiveReviewDot(0);
    startAutoSlide();
  }
});
