const form = document.querySelector('.bo-public-contact-form');

if (form) {
  const submitButton = form.querySelector('.bo-contact-submit');
  const status = form.querySelector('.bo-contact-form-status');

  form.addEventListener('submit', event => {
    event.preventDefault();
    status.textContent = document.documentElement.lang === 'es'
      ? 'Este formulario es una vista previa. No se envió ningún mensaje.'
      : 'This form is a preview. No message was sent.';
  });

  submitButton.disabled = false;
}
