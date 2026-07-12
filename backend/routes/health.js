'use strict';

// Health/readiness/liveness endpoints (Phase 11 — production readiness).
// Unauthenticated by design (load balancers/uptime monitors/Render's own
// health-check probe need to reach these without credentials) — every
// response only reports presence/boolean status of config, never actual
// secret values or business data.
const express = require('express');
const mongoose = require('mongoose');
const cloudinaryService = require('../services/cloudinaryService');
const logger = require('../utils/logger');

const router = express.Router();
const startTime = Date.now();
const DEPENDENCY_CHECK_TIMEOUT_MS = 4000;

// Bounds each live dependency ping — without this, a "black hole" DB/
// Cloudinary connection (TCP accepted, no response) could hang this
// endpoint for tens of seconds instead of failing fast, which is exactly
// the wrong behavior for a diagnostic endpoint during an incident
// (production-readiness audit finding).
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
  });
  // Clear the timer once the race settles either way — otherwise it stays
  // scheduled for the full duration even after a fast success, which is
  // harmless in production but leaves a dangling timer in tests.
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// ── Liveness: "is the process up and able to respond at all" ──────────
// No dependency checks — cheap and fast, safe to poll frequently (e.g.
// every few seconds by a container orchestrator).
//
// Do NOT configure this as Render's "Health Check Path" — server.js
// starts accepting connections (app.listen()) without waiting for the
// initial mongoose.connect() to resolve, so a totally broken MONGO_URI
// (e.g. a bad copy-paste during rotation) would still report this
// endpoint as healthy forever, and Render would never know to restart
// or roll back the deploy (production-readiness audit finding). Use
// GET /health/ready below instead — it actually reflects whether the
// instance can serve real traffic.
router.get('/live', (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.floor((Date.now() - startTime) / 1000) });
});

// ── Readiness: "is the process ready to serve real traffic" ───────────
// Checks only the one dependency every request actually needs (the DB
// connection) — cheap enough to poll on the same cadence as liveness.
// Returns 503 (not 200) when not ready, so a load balancer correctly
// routes traffic away during startup or a DB outage instead of sending
// requests that would just fail.
//
// This IS the endpoint to configure as Render's "Health Check Path" —
// see the note on GET /live above for why liveness alone is the wrong
// choice for this app.
router.get('/ready', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1; // 1 = connected
  if (!dbReady) {
    return res.status(503).json({ status: 'not_ready', database: 'disconnected' });
  }
  res.json({ status: 'ready', database: 'connected' });
});

// ── Detailed status: uptime, memory, and live third-party connectivity
// checks. Deliberately NOT hit on a tight liveness/readiness loop —
// meant for manual operator checks or an infrequent (e.g. every few
// minutes) monitoring poll, since it makes real network calls (DB ping,
// Cloudinary ping) that a load balancer shouldn't be firing constantly.
// Gemini is checked by API-key presence only, never a live generateContent
// call — that costs real money per call and would make this endpoint an
// unbounded-cost target if polled by anything automated.
router.get('/', async (_req, res) => {
  const mem = process.memoryUsage();
  const result = {
    status: 'ok', // flipped to 'degraded' below if any dependency check fails
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    },
    dependencies: {},
  };

  // Database — a real ping, not just readyState, to catch a connection
  // that reports "connected" but is actually unresponsive.
  try {
    if (mongoose.connection.readyState !== 1) throw new Error('not connected');
    await withTimeout(mongoose.connection.db.admin().ping(), DEPENDENCY_CHECK_TIMEOUT_MS);
    result.dependencies.database = { status: 'ok' };
  } catch (err) {
    result.status = 'degraded';
    result.dependencies.database = { status: 'error', message: err.message };
    // "not connected" (readyState guard) isn't a ping failure — it never
    // attempted one — log accordingly so the log message doesn't
    // overstate what actually happened (production-readiness audit finding).
    logger.dbError(
      err.message === 'not connected' ? 'Health check: database not connected' : 'Health check: database ping failed',
      { errorMessage: err.message }
    );
  }

  // Cloudinary — only attempted if all three credentials are configured;
  // an unconfigured optional integration isn't a "degraded" condition.
  // (Checking all three, not just cloud name + key, avoids attempting a
  // live ping — and reporting a confusing "error" — when only the secret
  // is missing; production-readiness audit finding.)
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      await withTimeout(cloudinaryService.ping(), DEPENDENCY_CHECK_TIMEOUT_MS);
      result.dependencies.cloudinary = { status: 'ok' };
    } catch (err) {
      result.status = 'degraded';
      result.dependencies.cloudinary = { status: 'error', message: err.message };
    }
  } else {
    result.dependencies.cloudinary = { status: 'not_configured' };
  }

  // Gemini — key-presence only (see file header comment for why no live call).
  result.dependencies.gemini = { status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured' };

  // Other optional integrations — presence-only, matching the app's own
  // existing graceful-degradation pattern (server.js startup log already
  // reports these the same way).
  result.dependencies.googleOAuth = { status: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not_configured' };
  result.dependencies.email = { status: (process.env.EMAIL_USER || process.env.RESEND_API_KEY) ? 'configured' : 'not_configured' };

  res.status(result.status === 'ok' ? 200 : 503).json(result);
});

module.exports = router;
