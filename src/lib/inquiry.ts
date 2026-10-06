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
  launchReady: boolean;
  endpoint: string;
  origin: string;
}
export function resolveEndpoint(config: DeliveryConfig): string | null {
  if (config.mode !== 'live' || !config.launchReady) return null;
  if (!/^\/api\/[a-z0-9/_-]+$/i.test(config.endpoint))
    throw new Error('A same-origin /api/ endpoint is required.');
  const origin = new URL(config.origin);
  if (origin.protocol !== 'https:')
    throw new Error('Live delivery requires HTTPS.');
  return new URL(config.endpoint, origin).href;
}
export interface DeliveryResult {
  status: 'preview' | 'accepted';
}
/** No data is stored locally. Preview exits before calling the network transport. */
export async function deliverInquiry(
  payload: FormData,
  config: DeliveryConfig,
  transport: typeof fetch = fetch,
): Promise<DeliveryResult> {
  const endpoint = resolveEndpoint(config);
  if (!endpoint) return { status: 'preview' };
  const response = await transport(endpoint, {
    method: 'POST',
    body: payload,
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('The request could not be accepted.');
  const result: unknown = await response.json();
  if (
    !result ||
    typeof result !== 'object' ||
    !('accepted' in result) ||
    result.accepted !== true
  )
    throw new Error('The server did not confirm acceptance.');
  return { status: 'accepted' };
}
