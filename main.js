(function () {
  var form = document.querySelector('form.search');
  if (!form) return;
  var button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function () {
    if (!form.checkValidity()) return;
    button.disabled = true;
    button.textContent = 'Looking up...';
  });

  window.addEventListener('pageshow', function () {
    button.disabled = false;
    button.textContent = 'Look up listener';
  });
})();
