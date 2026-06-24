import jwt from 'jsonwebtoken';

const MESSAGE_LINK_TYPE = 'admin-message-link';
const FALLBACK_FRONTEND_URL = 'http://localhost:5173';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

export const getFrontendBaseUrl = () =>
  trimTrailingSlash(process.env.FRONTEND_URL || process.env.CLIENT_URL || FALLBACK_FRONTEND_URL);

const getBackendBaseUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return trimTrailingSlash(process.env.BACKEND_URL);
  }

  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol || 'http';
  const host = forwardedHost || req.get('host');

  return trimTrailingSlash(`${protocol}://${host}`);
};

export const getAdminMessageUrl = (messageId) => {
  const url = new URL('/admin/messages', getFrontendBaseUrl());

  if (messageId) {
    url.searchParams.set('message', String(messageId));
  }

  return url.toString();
};

export const createAdminMessageMagicLink = (req, messageId) => {
  if (!process.env.JWT_SECRET) {
    return getAdminMessageUrl(messageId);
  }

  const token = jwt.sign(
    {
      type: MESSAGE_LINK_TYPE,
      messageId: String(messageId),
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return `${getBackendBaseUrl(req)}/api/admin/messages/open/${token}`;
};

export const resolveAdminMessageMagicLink = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.type !== MESSAGE_LINK_TYPE || !decoded.messageId) {
    throw new Error('Invalid message link');
  }

  return getAdminMessageUrl(decoded.messageId);
};

export const getAdminLoginUrl = (reason = '') => {
  const url = new URL('/admin/login', getFrontendBaseUrl());

  if (reason) {
    url.searchParams.set('reason', reason);
  }

  return url.toString();
};
