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

  // Mobile reviews automatic slideshow & touch swipe
  var reviewsTrack = document.getElementById('reviews-track');

  if (reviewsTrack) {
    var reviewCards = reviewsTrack.querySelectorAll('.review-card');
    var totalSlides = reviewCards.length;
    var currentSlide = 0;
    var autoSlideInterval = null;
    var pauseTimeout = null;
    var isTouching = false;
    var startX = 0;
    var startY = 0;
    var currentX = 0;
    var isHorizontalSwipe = false;
    var touchStartTime = 0;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    function updateSlidePosition(smooth) {
      if (!isMobile()) {
        reviewsTrack.style.transform = '';
        reviewsTrack.style.transition = '';
        return;
      }
      if (smooth !== false) {
        reviewsTrack.style.transition = 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
      } else {
        reviewsTrack.style.transition = 'none';
      }
      reviewsTrack.style.transform = 'translate3d(' + (-currentSlide * 100) + '%, 0, 0)';
    }

    function goToSlide(index, smooth) {
      if (totalSlides === 0) return;
      if (index < 0) {
        index = totalSlides - 1;
      } else if (index >= totalSlides) {
        index = 0;
      }
      currentSlide = index;
      updateSlidePosition(smooth);
    }

    function nextSlide() {
      goToSlide(currentSlide + 1, true);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1, true);
    }

    function startAutoSlide() {
      stopAutoSlide();
      if (!isMobile() || totalSlides <= 1) return;
      autoSlideInterval = setInterval(function () {
        if (isTouching) return;
        nextSlide();
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
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(function () {
        isTouching = false;
        startAutoSlide();
      }, 4500);
    }

    // Touch events for mobile swipe
    reviewsTrack.addEventListener('touchstart', function (e) {
      if (!isMobile()) return;
      stopAutoSlide();
      isTouching = true;
      var touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      isHorizontalSwipe = false;
      touchStartTime = Date.now();
      reviewsTrack.style.transition = 'none';
    }, { passive: true });

    reviewsTrack.addEventListener('touchmove', function (e) {
      if (!isTouching || !isMobile()) return;
      var touch = e.touches[0];
      currentX = touch.clientX;
      var diffX = currentX - startX;
      var diffY = touch.clientY - startY;

      if (!isHorizontalSwipe) {
        if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
          if (Math.abs(diffX) > Math.abs(diffY)) {
            isHorizontalSwipe = true;
          } else {
            isTouching = false;
            return;
          }
        }
      }

      if (isHorizontalSwipe) {
        if (e.cancelable) e.preventDefault();
        var trackWidth = reviewsTrack.clientWidth || 300;
        var offsetPx = -currentSlide * trackWidth + diffX;
        reviewsTrack.style.transform = 'translate3d(' + offsetPx + 'px, 0, 0)';
      }
    }, { passive: false });

    function handleTouchEnd() {
      if (!isTouching || !isMobile()) return;
      isTouching = false;
      var diffX = currentX - startX;
      var elapsed = Date.now() - touchStartTime;
      var threshold = 35;
      var isFastFlick = elapsed < 280 && Math.abs(diffX) > 15;

      if (isHorizontalSwipe) {
        if (diffX < -threshold || (diffX < 0 && isFastFlick)) {
          nextSlide();
        } else if (diffX > threshold || (diffX > 0 && isFastFlick)) {
          prevSlide();
        } else {
          goToSlide(currentSlide, true);
        }
      } else {
        goToSlide(currentSlide, true);
      }

      pauseAndResumeAutoSlide();
    }

    reviewsTrack.addEventListener('touchend', handleTouchEnd, { passive: true });
    reviewsTrack.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Mouse drag support for mobile preview/testing
    var isMouseDown = false;
    reviewsTrack.addEventListener('mousedown', function (e) {
      if (!isMobile()) return;
      stopAutoSlide();
      isMouseDown = true;
      isTouching = true;
      startX = e.clientX;
      startY = e.clientY;
      currentX = startX;
      isHorizontalSwipe = false;
      touchStartTime = Date.now();
      reviewsTrack.classList.add('grabbing');
      reviewsTrack.style.transition = 'none';
    });

    window.addEventListener('mousemove', function (e) {
      if (!isMouseDown || !isTouching || !isMobile()) return;
      currentX = e.clientX;
      var diffX = currentX - startX;
      var diffY = e.clientY - startY;

      if (!isHorizontalSwipe) {
        if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
          if (Math.abs(diffX) > Math.abs(diffY)) {
            isHorizontalSwipe = true;
          } else {
            isMouseDown = false;
            isTouching = false;
            reviewsTrack.classList.remove('grabbing');
            return;
          }
        }
      }

      if (isHorizontalSwipe) {
        e.preventDefault();
        var trackWidth = reviewsTrack.clientWidth || 300;
        var offsetPx = -currentSlide * trackWidth + diffX;
        reviewsTrack.style.transform = 'translate3d(' + offsetPx + 'px, 0, 0)';
      }
    });

    window.addEventListener('mouseup', function () {
      if (!isMouseDown) return;
      isMouseDown = false;
      reviewsTrack.classList.remove('grabbing');
      handleTouchEnd();
    });

    // Handle tab visibility and window resize
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoSlide();
      } else if (isMobile()) {
        startAutoSlide();
      }
    });

    window.addEventListener('resize', function () {
      if (isMobile()) {
        updateSlidePosition(false);
        if (!autoSlideInterval) startAutoSlide();
      } else {
        stopAutoSlide();
        reviewsTrack.style.transform = '';
        reviewsTrack.style.transition = '';
      }
    });

    // Initialize
    if (isMobile()) {
      updateSlidePosition(false);
      startAutoSlide();
    }
  }
});
