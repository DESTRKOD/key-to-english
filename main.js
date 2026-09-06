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
    var sliderWrap = reviewsTrack.parentElement;
    var totalSlides = reviewCards.length;
    var currentSlide = 0;
    var autoSlideInterval = null;
    var pauseTimeout = null;
    var isTouching = false;
    var isMouseDown = false;
    var startX = 0;
    var startY = 0;
    var currentX = 0;
    var isHorizontalSwipe = false;
    var touchStartTime = 0;
    var lastTouchTime = 0;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    function getSlideWidth() {
      if (sliderWrap && sliderWrap.clientWidth > 0) {
        return sliderWrap.clientWidth;
      }
      return reviewsTrack.clientWidth > 0 ? reviewsTrack.clientWidth : window.innerWidth;
    }

    function updateSlidePosition(smooth) {
      if (!isMobile()) {
        reviewsTrack.style.transform = '';
        reviewsTrack.style.transition = '';
        return;
      }
      var width = getSlideWidth();
      if (smooth !== false) {
        reviewsTrack.style.transition = 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
      } else {
        reviewsTrack.style.transition = 'none';
      }
      reviewsTrack.style.transform = 'translate3d(' + (-currentSlide * width) + 'px, 0, 0)';
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
        if (isTouching || isMouseDown) return;
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
        isMouseDown = false;
        startAutoSlide();
      }, 4500);
    }

    // Touch handlers (attached to track and window for 100% gesture capture)
    reviewsTrack.addEventListener('touchstart', function (e) {
      if (!isMobile()) return;
      stopAutoSlide();
      lastTouchTime = Date.now();
      isTouching = true;
      var touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      isHorizontalSwipe = false;
      touchStartTime = Date.now();
      reviewsTrack.style.transition = 'none';
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isTouching || !isMobile() || e.touches.length === 0) return;
      var touch = e.touches[0];
      currentX = touch.clientX;
      var diffX = currentX - startX;
      var diffY = touch.clientY - startY;

      if (!isHorizontalSwipe) {
        if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
          if (Math.abs(diffX) > Math.abs(diffY)) {
            isHorizontalSwipe = true;
          } else {
            // User is scrolling vertically - cancel horizontal swipe
            isTouching = false;
            updateSlidePosition(true);
            return;
          }
        }
      }

      if (isHorizontalSwipe) {
        if (e.cancelable) e.preventDefault();
        var width = getSlideWidth();
        var offsetPx = -currentSlide * width + diffX;
        reviewsTrack.style.transform = 'translate3d(' + offsetPx + 'px, 0, 0)';
      }
    }, { passive: false });

    function handleTouchEnd() {
      if (!isTouching || !isMobile()) return;
      isTouching = false;
      lastTouchTime = Date.now();
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

      isHorizontalSwipe = false;
      pauseAndResumeAutoSlide();
    }

    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Mouse drag support for desktop emulation
    reviewsTrack.addEventListener('mousedown', function (e) {
      if (!isMobile() || Date.now() - lastTouchTime < 600) return;
      stopAutoSlide();
      isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
      currentX = startX;
      isHorizontalSwipe = false;
      touchStartTime = Date.now();
      reviewsTrack.classList.add('grabbing');
      reviewsTrack.style.transition = 'none';
    });

    window.addEventListener('mousemove', function (e) {
      if (!isMouseDown || !isMobile()) return;
      currentX = e.clientX;
      var diffX = currentX - startX;
      var diffY = e.clientY - startY;

      if (!isHorizontalSwipe) {
        if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
          if (Math.abs(diffX) > Math.abs(diffY)) {
            isHorizontalSwipe = true;
          } else {
            isMouseDown = false;
            reviewsTrack.classList.remove('grabbing');
            return;
          }
        }
      }

      if (isHorizontalSwipe) {
        e.preventDefault();
        var width = getSlideWidth();
        var offsetPx = -currentSlide * width + diffX;
        reviewsTrack.style.transform = 'translate3d(' + offsetPx + 'px, 0, 0)';
      }
    });

    window.addEventListener('mouseup', function () {
      if (!isMouseDown) return;
      isMouseDown = false;
      reviewsTrack.classList.remove('grabbing');
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
      isHorizontalSwipe = false;
      pauseAndResumeAutoSlide();
    });

    // Handle tab visibility and window resize
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoSlide();
      } else if (isMobile()) {
        startAutoSlide();
      }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (isMobile()) {
          updateSlidePosition(false);
          if (!autoSlideInterval) startAutoSlide();
        } else {
          stopAutoSlide();
          reviewsTrack.style.transform = '';
          reviewsTrack.style.transition = '';
        }
      }, 100);
    });

    // Initialize
    if (isMobile()) {
      updateSlidePosition(false);
      startAutoSlide();
    }
  }
});
