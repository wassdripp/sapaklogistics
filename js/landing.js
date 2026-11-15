'use strict';
const trackingForm = document.getElementById('landing-tracking-form');
trackingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('landing-tracking-number');
  const trackingNumber = input.value.trim();
  if (!trackingNumber) {
    input.setCustomValidity('Enter your tracking number.');
    input.reportValidity();
    return;
  }
  window.location.href = 'portal.html#track/' + encodeURIComponent(trackingNumber);
});
document.getElementById('landing-tracking-number').addEventListener('input', (event) => event.target.setCustomValidity(''));
