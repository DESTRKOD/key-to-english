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
});
