'use strict';

// Curated blocklist of well-known disposable / throwaway email providers.
// Purpose: raise the cost of farming the 24h free trial by registering a
// fresh mailbox per account (see authService.registerUser). This is a
// static high-confidence list on purpose — no network lookup, no npm
// dependency, and deliberately conservative so it never rejects a real
// mainstream provider. It is a speed bump, not a wall; a determined
// abuser with their own catch-all domain still gets through.
//
// Keep entries lowercase, bare registrable domain (no leading dot).
const DISPOSABLE_DOMAINS = new Set([
  '0-mail.com', '10minutemail.com', '10minutemail.net', '20minutemail.com',
  '33mail.com', 'anonbox.net', 'anonaddy.com', 'anonaddy.me',
  'burnermail.io', 'byom.de', 'dispostable.com', 'discard.email',
  'disposablemail.com', 'dropmail.me', 'einrot.com', 'emailondeck.com',
  'emailtemporario.com.br', 'fakeinbox.com', 'fakemail.net', 'fakemailgenerator.com',
  'gettempmail.com', 'getairmail.com', 'getnada.com', 'guerrillamail.com',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamailblock.com', 'harakirimail.com', 'inboxbear.com', 'inboxkitten.com',
  'jetable.org', 'mailcatch.com', 'maildrop.cc', 'maileater.com',
  'mailexpire.com', 'mailforspam.com', 'mailinator.com', 'mailinator.net',
  'mailinator.org', 'mailnesia.com', 'mailnull.com', 'mailsac.com',
  'mailtemp.info', 'mail-temp.com', 'mailtothis.com', 'meltmail.com',
  'mintemail.com', 'moakt.com', 'mohmal.com', 'mytemp.email',
  'mytrashmail.com', 'nada.email', 'nowmymail.com', 'objectmail.com',
  'onetimeuse.email', 'owlymail.com', 'pokemail.net', 'rcpt.at',
  'sharklasers.com', 'shortmail.net', 'spam4.me', 'spamgourmet.com',
  'spambox.us', 'spamex.com', 'tempail.com', 'temp-mail.io',
  'temp-mail.org', 'tempemail.com', 'tempinbox.com', 'tempmail.com',
  'tempmail.dev', 'tempmail.plus', 'tempmailaddress.com', 'tempmailo.com',
  'temporary-mail.net', 'throwawaymail.com', 'trashmail.com', 'trashmail.de',
  'trashmail.me', 'trashmail.net', 'trbvm.com', 'wegwerfemail.de',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'zerobounce.net',
  'zetmail.com',
]);

// True when `email`'s domain is a known disposable provider. Anything that
// isn't a plausible "local@domain.tld" string returns false — real input
// validation (the `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` check) lives in the
// register controller and runs first.
function isDisposableEmail(email) {
  const at = String(email || '').toLowerCase().trim().lastIndexOf('@');
  if (at < 0) return false;
  const domain = email.toLowerCase().trim().slice(at + 1);
  return DISPOSABLE_DOMAINS.has(domain);
}

module.exports = { DISPOSABLE_DOMAINS, isDisposableEmail };
