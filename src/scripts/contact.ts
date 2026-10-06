import {
  deliverInquiry,
  inquiryFailureMessage,
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
  const clear = form.querySelector<HTMLButtonElement>('button[type="reset"]')!;
  const live = form.dataset.inquiryMode === 'live';
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
    if (live && photos.files?.length)
      errors.photos =
        'Photos cannot be sent with this form yet. Remove the selected photos and submit again, or call Grant to arrange sharing them.';
    showErrors(errors);
    if (Object.keys(errors).length) {
      summary.focus();
      return;
    }
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    data.delete('photos');
    data.set('source', 'website-estimate');
    data.set('timestamp', new Date().toISOString());
    data.set('status', 'new');
    const controls = [
      ...form.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('input, select, textarea'),
    ].map((control) => ({ control, disabled: control.disabled }));
    for (const { control } of controls) control.disabled = true;
    pending = true;
    submit.disabled = true;
    clear.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.textContent = live
      ? 'Sending your request…'
      : 'Checking your request…';
    result.setAttribute('role', 'status');
    result.textContent = submit.textContent;
    result.classList.remove('is-error');
    result.hidden = false;
    let accepted = false;
    try {
      const outcome = await deliverInquiry(data, {
        mode: live ? 'live' : 'preview',
        endpoint: form.getAttribute('action') || '/api/contact/',
        origin: window.location.origin,
      });
      accepted = outcome.status === 'accepted';
      result.textContent =
        outcome.status === 'preview'
          ? 'Your request passes the form checks. This is preview mode: no request or photos were sent to Grant, and nothing was saved. You can keep editing or clear the form.'
          : 'Your request was submitted successfully.';
      result.classList.remove('is-error');
    } catch (error) {
      result.setAttribute('role', 'alert');
      result.textContent = inquiryFailureMessage(error);
      result.classList.add('is-error');
    } finally {
      pending = false;
      for (const { control, disabled } of controls) control.disabled = disabled;
      // The reset guard permits this only after acceptance; then restore the result.
      if (accepted) form.reset();
      form.removeAttribute('aria-busy');
      submit.disabled = false;
      clear.disabled = false;
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
