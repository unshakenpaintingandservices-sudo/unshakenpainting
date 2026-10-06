import {
  deliverInquiry,
  validateInquiry,
  type InquiryFields,
  type InquiryErrors,
} from '../lib/inquiry';
const form = document.querySelector<HTMLFormElement>('#inquiry-form');
if (form) {
  const submit = form.querySelector<HTMLButtonElement>('#submit-inquiry')!;
  const summary = form.querySelector<HTMLDivElement>('#form-errors')!;
  const result = form.querySelector<HTMLDivElement>('#form-result')!;
  const photos = form.querySelector<HTMLInputElement>('#photos')!;
  const selected =
    form.querySelector<HTMLParagraphElement>('#selected-photos')!;
  const preferred = form.querySelector<HTMLSelectElement>('#preferredContact')!;
  const email = form.querySelector<HTMLInputElement>('#email')!;
  const phone = form.querySelector<HTMLInputElement>('#phone')!;
  const idleLabel = submit.textContent!;
  let pending = false;
  const showErrors = (errors: InquiryErrors) => {
    form
      .querySelectorAll('[aria-invalid]')
      .forEach((field) => field.removeAttribute('aria-invalid'));
    form.querySelectorAll<HTMLElement>('.field-error').forEach((error) => {
      error.hidden = true;
      error.textContent = '';
    });
    const list = summary.querySelector('ul')!;
    list.replaceChildren();
    for (const [field, message] of Object.entries(errors)) {
      const control = form.querySelector<HTMLElement>(`#${field}`)!;
      control.setAttribute('aria-invalid', 'true');
      const error = form.querySelector<HTMLElement>(`#${field}-error`)!;
      error.textContent = message;
      error.hidden = false;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${field}`;
      link.textContent = message;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        control.focus();
      });
      item.append(link);
      list.append(item);
    }
    summary.hidden = !Object.keys(errors).length;
  };
  const updateContact = () => {
    const byEmail = preferred.value === 'email';
    email.required = byEmail;
    phone.required = !byEmail;
    form.querySelector('#email-requirement')!.textContent = byEmail
      ? '(required for email replies)'
      : '(optional)';
    form.querySelector('#phone-requirement')!.textContent = byEmail
      ? '(optional)'
      : '(required for a call)';
  };
  preferred.addEventListener('change', updateContact);
  form.addEventListener('input', () => {
    result.hidden = true;
  });
  photos.addEventListener('change', () => {
    const count = photos.files?.length || 0;
    selected.textContent = count
      ? `${count} photo${count === 1 ? '' : 's'} selected. Nothing has been uploaded.`
      : '';
  });
  form.addEventListener('reset', (event) => {
    if (pending) {
      event.preventDefault();
      return;
    }
    showErrors({});
    result.hidden = true;
    selected.textContent = '';
    setTimeout(updateContact, 0);
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    result.hidden = true;
    const data = new FormData(form);
    const fields = Object.fromEntries(
      [
        'name',
        'email',
        'phone',
        'preferredContact',
        'city',
        'projectType',
        'description',
      ].map((key) => [key, String(data.get(key) || '').trim()]),
    ) as unknown as InquiryFields;
    const errors = validateInquiry(fields, [...(photos.files || [])]);
    showErrors(errors);
    if (Object.keys(errors).length) {
      summary.focus();
      return;
    }
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    data.delete('photos');
    for (const photo of photos.files || []) data.append('photos', photo);
    data.set('source', 'website-estimate');
    data.set('timestamp', new Date().toISOString());
    data.set('status', 'new');
    pending = true;
    submit.disabled = true;
    submit.textContent = 'Checking your request…';
    try {
      const outcome = await deliverInquiry(data, {
        mode:
          import.meta.env.PUBLIC_INQUIRY_MODE === 'live' ? 'live' : 'preview',
        launchReady: import.meta.env.PUBLIC_SITE_LAUNCH_READY === 'true',
        endpoint: import.meta.env.PUBLIC_INQUIRY_ENDPOINT || '',
        origin: window.location.origin,
      });
      result.textContent =
        outcome.status === 'preview'
          ? 'Your request passes the form checks. This is a local preview: no request or photos were sent to Grant, and nothing was saved. You can keep editing or clear the form.'
          : 'Your request was received. Thank you for telling Grant about your project.';
      result.classList.remove('is-error');
    } catch {
      result.textContent =
        'We couldn’t confirm that your request was received. Your details are still here. Please call Grant, or try again later.';
      result.classList.add('is-error');
    } finally {
      pending = false;
      submit.disabled = false;
      submit.textContent = idleLabel;
      result.hidden = false;
      result.focus();
    }
  });
  // Attach the guard before enabling submit; without JS the disabled submit blocks native posting.
  form.noValidate = true;
  updateContact();
  submit.disabled = false;
}
