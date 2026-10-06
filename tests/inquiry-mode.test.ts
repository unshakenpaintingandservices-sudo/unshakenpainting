import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveInquiryConfig } from '../src/lib/inquiry-mode.ts';

test('a production target uses live submission regardless of the public mode', () => {
  for (const explicitMode of [undefined, 'preview', 'live']) {
    assert.equal(
      resolveInquiryConfig({ targetEnvironment: 'production', explicitMode })
        .mode,
      'live',
    );
  }
});

test('the legacy environment identifies production only when the target is absent', () => {
  for (const explicitMode of [undefined, 'preview', 'live']) {
    assert.equal(
      resolveInquiryConfig({ environment: 'production', explicitMode }).mode,
      'live',
    );
  }
});

test('the target takes precedence over a conflicting legacy environment', () => {
  assert.equal(
    resolveInquiryConfig({
      targetEnvironment: 'production',
      environment: 'preview',
      explicitMode: 'preview',
    }).mode,
    'live',
  );
  for (const targetEnvironment of ['', 'preview', 'development', 'staging']) {
    assert.equal(
      resolveInquiryConfig({ targetEnvironment, environment: 'production' })
        .mode,
      'preview',
      `The present target ${JSON.stringify(targetEnvironment)} must win.`,
    );
  }
});

test('only the exact production target automatically enables live mode', () => {
  for (const value of [
    'Production',
    'PRODUCTION',
    'production ',
    ' production',
    'production-custom',
    'custom',
  ]) {
    assert.equal(
      resolveInquiryConfig({ targetEnvironment: value }).mode,
      'preview',
    );
    assert.equal(resolveInquiryConfig({ environment: value }).mode, 'preview');
  }
});

test('local development and non-production deployments default to preview', () => {
  assert.equal(resolveInquiryConfig({}).mode, 'preview');
  assert.equal(
    resolveInquiryConfig({ explicitMode: 'preview' }).mode,
    'preview',
  );
  for (const value of ['development', 'preview', 'staging', 'custom']) {
    assert.equal(
      resolveInquiryConfig({ targetEnvironment: value }).mode,
      'preview',
    );
    assert.equal(resolveInquiryConfig({ environment: value }).mode, 'preview');
  }
});

test('explicit live mode preserves deliberate local and non-production testing', () => {
  assert.equal(resolveInquiryConfig({ explicitMode: 'live' }).mode, 'live');
  for (const value of ['', 'development', 'preview', 'staging', 'custom']) {
    assert.equal(
      resolveInquiryConfig({ targetEnvironment: value, explicitMode: 'live' })
        .mode,
      'live',
    );
    assert.equal(
      resolveInquiryConfig({ environment: value, explicitMode: 'live' }).mode,
      'live',
    );
  }
});

test('an absent or invalid explicit mode keeps the fallback safe', () => {
  for (const explicitMode of [undefined, '', 'LIVE', 'Live', 'live ', 'true']) {
    assert.equal(resolveInquiryConfig({ explicitMode }).mode, 'preview');
    assert.equal(
      resolveInquiryConfig({ targetEnvironment: 'preview', explicitMode }).mode,
      'preview',
    );
  }
});

test('production always uses the canonical contact endpoint', () => {
  for (const explicitEndpoint of [
    undefined,
    '',
    '/api/mock-contact/',
    'https://obsolete.example.invalid/api/contact/',
  ]) {
    for (const deployment of [
      { targetEnvironment: 'production' },
      { environment: 'production' },
    ]) {
      assert.deepEqual(
        resolveInquiryConfig({
          ...deployment,
          explicitMode: 'preview',
          explicitEndpoint,
        }),
        { mode: 'live', endpoint: '/api/contact/' },
      );
    }
  }
});

test('the fallback retains explicit endpoints for intentional testing', () => {
  for (const deployment of [{}, { targetEnvironment: 'preview' }]) {
    assert.deepEqual(
      resolveInquiryConfig({
        ...deployment,
        explicitMode: 'live',
        explicitEndpoint: '/api/mock-contact/',
      }),
      { mode: 'live', endpoint: '/api/mock-contact/' },
    );
    assert.deepEqual(resolveInquiryConfig(deployment), {
      mode: 'preview',
      endpoint: '/api/contact/',
    });
  }
});
