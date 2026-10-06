export interface InquiryFields {
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
  city: string;
  projectType: string;
  description: string;
}
export interface PhotoFile {
  name: string;
  type: string;
  size: number;
}
export type InquiryErrors = Partial<
  Record<keyof InquiryFields | 'photos', string>
>;
export const photoLimits = {
  count: 5,
  bytesPerFile: 8 * 1024 * 1024,
  totalBytes: 20 * 1024 * 1024,
};
const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
export function validateInquiry(
  fields: InquiryFields,
  photos: PhotoFile[] = [],
): InquiryErrors {
  const errors: InquiryErrors = {};
  if (!fields.name.trim()) errors.name = 'Please enter your name.';
  else if (fields.name.trim().length > 100)
    errors.name = 'Please keep your name to 100 characters or fewer.';
  if (!['email', 'phone'].includes(fields.preferredContact))
    errors.preferredContact =
      'Choose email or phone so Grant knows how to reach you.';
  if (fields.preferredContact === 'email' && !fields.email.trim())
    errors.email = 'Please enter an email address so Grant can reply by email.';
  if (
    fields.email.trim() &&
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) ||
      fields.email.length > 254)
  )
    errors.email = 'Enter a complete email address, such as name@example.com.';
  if (fields.preferredContact === 'phone' && !fields.phone.trim())
    errors.phone = 'Please enter a phone number so Grant can call you.';
  if (
    fields.phone.trim() &&
    (fields.phone.replace(/\D/g, '').length < 10 ||
      fields.phone.replace(/\D/g, '').length > 15 ||
      /[^\d\s+().-]/.test(fields.phone))
  )
    errors.phone =
      'Enter a phone number with 10 to 15 digits. Spaces, parentheses, and dashes are okay.';
  if (!fields.city.trim())
    errors.city = 'Please enter the city where the project is located.';
  else if (fields.city.length > 100)
    errors.city = 'Please keep the city to 100 characters or fewer.';
  if (!['residential', 'commercial', 'not-sure'].includes(fields.projectType))
    errors.projectType = 'Choose residential, commercial, or not sure yet.';
  if (!fields.description.trim())
    errors.description = 'Tell Grant what you would like painted.';
  else if (fields.description.length > 3000)
    errors.description =
      'Please keep your description to 3,000 characters or fewer.';
  if (photos.length > photoLimits.count)
    errors.photos = 'Choose up to 5 photos.';
  else if (photos.some((photo) => !allowedPhotoTypes.has(photo.type)))
    errors.photos = 'Choose JPG, PNG, or WebP photographs.';
  else if (
    photos.some(
      (photo) => photo.size > photoLimits.bytesPerFile || photo.size === 0,
    )
  )
    errors.photos = 'Each photo must contain an image and be 8 MB or smaller.';
  else if (
    photos.reduce((total, photo) => total + photo.size, 0) >
    photoLimits.totalBytes
  )
    errors.photos = 'Keep the combined photo size to 20 MB or less.';
  return errors;
}
export interface DeliveryConfig {
  mode: 'preview' | 'live';
  endpoint: string;
  origin: string;
}
export function resolveEndpoint(config: DeliveryConfig): string | null {
  if (config.mode !== 'live') return null;
  const endpoint = config.endpoint || '/api/contact/';
  if (!/^\/api\/[a-z0-9/_-]+$/i.test(endpoint))
    throw new Error('A same-origin /api/ endpoint is required.');
  const origin = new URL(config.origin);
  const localHttp =
    origin.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
  if (
    origin.origin !== config.origin ||
    (origin.protocol !== 'https:' && !localHttp)
  )
    throw new Error('Live delivery requires HTTPS.');
  return new URL(endpoint, origin).href;
}
export interface DeliveryResult {
  status: 'preview' | 'accepted';
}
const deliveryMessages = {
  honeypot:
    'We couldn’t accept this request. Your details are still here. Please call Grant for help.',
  photos_not_supported:
    'Photos cannot be sent with this form yet. Remove the selected photos and submit again, or call Grant to arrange sharing them. Your details are still here.',
  invalid_request:
    'We couldn’t accept these details. Please check the form and try again, or call Grant. Your details are still here.',
  delivery_unavailable:
    'Online requests are currently unavailable. Your details are still here. Please call Grant, or try again later.',
  rate_limited:
    'Online requests are temporarily limited. Your details are still here. Please try again later, or call Grant.',
  delivery_failed:
    'We couldn’t confirm that your request was received. Your details are still here. Please call Grant, or try again later.',
};
type DeliveryErrorCode = keyof typeof deliveryMessages;
export class InquiryDeliveryError extends Error {
  readonly code: DeliveryErrorCode;
  constructor(code: DeliveryErrorCode) {
    super(deliveryMessages[code]);
    this.name = 'InquiryDeliveryError';
    this.code = code;
  }
}
export function inquiryFailureMessage(error: unknown): string {
  return error instanceof InquiryDeliveryError
    ? deliveryMessages[error.code]
    : deliveryMessages.delivery_failed;
}
function responseError(result: unknown): InquiryDeliveryError {
  if (
    result &&
    typeof result === 'object' &&
    'code' in result &&
    typeof result.code === 'string' &&
    Object.hasOwn(deliveryMessages, result.code)
  )
    return new InquiryDeliveryError(result.code as DeliveryErrorCode);
  return new InquiryDeliveryError('delivery_failed');
}
/** No data is stored locally. Preview exits before calling the network transport. */
export async function deliverInquiry(
  payload: FormData,
  config: DeliveryConfig,
  transport: typeof fetch = fetch,
): Promise<DeliveryResult> {
  if (String(payload.get('website') || ''))
    throw new InquiryDeliveryError('honeypot');
  const endpoint = resolveEndpoint(config);
  if (!endpoint) return { status: 'preview' };
  // Never upload file data, even if a caller bypasses the form's photo check.
  if ([...payload.values()].some((value) => typeof value !== 'string'))
    throw new InquiryDeliveryError('photos_not_supported');
  const response = await transport(endpoint, {
    method: 'POST',
    body: payload,
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
    headers: { Accept: 'application/json' },
  });
  // Host-level limits can return HTML or an empty body before the API runs.
  if (response.status === 429) throw new InquiryDeliveryError('rate_limited');
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) throw responseError(result);
  if (
    !result ||
    typeof result !== 'object' ||
    !('accepted' in result) ||
    result.accepted !== true
  )
    throw responseError(result);
  return { status: 'accepted' };
}
