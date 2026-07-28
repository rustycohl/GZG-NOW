import { cloneCanonical, digestObject } from "./core.mjs";

export const GALAXY_MESSAGE_VERSION = "1.0";
export const GALAXY_MESSAGE_MAJOR = 1;

const TYPE_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)+$/;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requireText(value, path, maxLength = 256) {
  if (typeof value !== "string" || value.length < 1 || value.length > maxLength) {
    throw new TypeError(`${path} must be non-empty text no longer than ${maxLength} characters.`);
  }
}

function requireCapability(value, path) {
  requireText(value, path, 256);
  if (!TYPE_PATTERN.test(value)) {
    throw new TypeError(`${path} must be a lowercase dotted capability name.`);
  }
}

function requireEndpoint(endpoint, path) {
  if (!isPlainObject(endpoint)) {
    throw new TypeError(`${path} must be an object.`);
  }
  requireText(endpoint.galaxy, `${path}.galaxy`, 128);
  requireText(endpoint.version, `${path}.version`, 64);
  requireText(endpoint.instance, `${path}.instance`, 256);
}

export function validateGalaxyMessage(message, { supportedMajor = GALAXY_MESSAGE_MAJOR } = {}) {
  if (!isPlainObject(message)) {
    throw new TypeError("Galaxy message must be an object.");
  }
  if (message.gzg !== "galaxy-message") {
    throw new TypeError("gzg must be galaxy-message.");
  }

  requireText(message.version, "version", 32);
  const versionMatch = /^([0-9]+)\.([0-9]+)$/.exec(message.version);
  if (!versionMatch) {
    throw new TypeError("version must use major.minor numeric form.");
  }
  if (Number(versionMatch[1]) !== supportedMajor) {
    throw new RangeError(`Unsupported galaxy-message major version: ${versionMatch[1]}.`);
  }

  requireText(message.id, "id");
  requireCapability(message.type, "type");
  requireEndpoint(message.source, "source");

  if (!isPlainObject(message.target)) {
    throw new TypeError("target must be an object.");
  }
  requireText(message.target.galaxy, "target.galaxy", 128);
  requireCapability(message.target.capability, "target.capability");

  requireText(message.created_at, "created_at", 64);
  const date = new Date(message.created_at);
  if (Number.isNaN(date.valueOf()) || date.toISOString() !== message.created_at) {
    throw new TypeError("created_at must be an exact UTC ISO-8601 timestamp.");
  }

  if (message.correlation_id !== undefined) {
    requireText(message.correlation_id, "correlation_id");
  }
  if (!isPlainObject(message.payload)) {
    throw new TypeError("payload must be an object.");
  }

  if (message.proof !== undefined) {
    if (!isPlainObject(message.proof)) {
      throw new TypeError("proof must be an object.");
    }
    if (message.proof.algorithm !== "sha-256") {
      throw new TypeError("proof.algorithm must be sha-256.");
    }
    if (typeof message.proof.digest !== "string" || !DIGEST_PATTERN.test(message.proof.digest)) {
      throw new TypeError("proof.digest must be a lowercase SHA-256 digest.");
    }
  }

  return cloneCanonical(message);
}

export function createGalaxyMessage({
  id,
  type,
  source,
  target,
  created_at,
  payload,
  correlation_id,
  gzg: _ignoredDiscriminator,
  version: _ignoredVersion,
  proof: _ignoredProof,
  ...extensions
}) {
  const message = {
    ...extensions,
    gzg: "galaxy-message",
    version: GALAXY_MESSAGE_VERSION,
    id,
    type,
    source,
    target,
    created_at,
    payload,
  };
  if (correlation_id !== undefined) {
    message.correlation_id = correlation_id;
  }
  return validateGalaxyMessage(message);
}

export function messageWithoutProof(message) {
  const validated = validateGalaxyMessage(message);
  const { proof: _proof, ...unsigned } = validated;
  return unsigned;
}

export async function sealGalaxyMessage(message) {
  const unsigned = messageWithoutProof(message);
  return {
    ...unsigned,
    proof: {
      algorithm: "sha-256",
      digest: await digestObject(unsigned),
    },
  };
}

export async function verifyGalaxyMessage(message) {
  const validated = validateGalaxyMessage(message);
  if (!validated.proof) {
    return {
      ok: false,
      error: "Message has no proof.",
      message: validated,
    };
  }
  const expected = await digestObject(messageWithoutProof(validated));
  return {
    ok: expected === validated.proof.digest,
    error: expected === validated.proof.digest ? null : "Proof digest does not match the message.",
    expected,
    message: validated,
  };
}
