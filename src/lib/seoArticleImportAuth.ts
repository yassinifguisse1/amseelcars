import { createHmac, timingSafeEqual } from 'crypto';

const IMAGE_UPLOAD_TOKEN_TTL_MS = 10 * 60 * 1000;

export interface SeoArticleImageUploadTokenPayload {
  fileName: string;
  contentType: string;
  maxBytes: number;
  origin: string;
  expiresAt: number;
}

function getImportToken() {
  const token = process.env.SEO_ARTICLE_IMPORT_TOKEN?.trim();
  if (!token) {
    throw new Error('SEO_ARTICLE_IMPORT_TOKEN is not configured.');
  }
  return token;
}

function signaturesMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function signEncodedPayload(encodedPayload: string) {
  return createHmac('sha256', getImportToken()).update(encodedPayload).digest('base64url');
}

export function isValidSeoArticleImportAuthorization(authorization: string | null) {
  const match = (authorization ?? '').match(/^Bearer\s+(.+)$/i);
  return !!match && signaturesMatch(match[1], getImportToken());
}

export function createSeoArticleImageUploadToken(
  input: Omit<SeoArticleImageUploadTokenPayload, 'expiresAt'>,
) {
  const payload: SeoArticleImageUploadTokenPayload = {
    ...input,
    expiresAt: Date.now() + IMAGE_UPLOAD_TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encodedPayload}.${signEncodedPayload(encodedPayload)}`;
}

export function parseSeoArticleImageUploadToken(token: string) {
  const [encodedPayload, signature, ...rest] = token.split('.');
  if (!encodedPayload || !signature || rest.length > 0 || !signaturesMatch(signature, signEncodedPayload(encodedPayload))) {
    throw new Error('Invalid image upload token.');
  }

  let payload: SeoArticleImageUploadTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SeoArticleImageUploadTokenPayload;
  } catch {
    throw new Error('Invalid image upload token.');
  }

  if (
    !payload ||
    typeof payload.fileName !== 'string' ||
    typeof payload.contentType !== 'string' ||
    typeof payload.maxBytes !== 'number' ||
    typeof payload.origin !== 'string' ||
    typeof payload.expiresAt !== 'number' ||
    payload.expiresAt < Date.now()
  ) {
    throw new Error('Image upload token is invalid or expired.');
  }

  return payload;
}
