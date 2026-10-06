/* global AbortSignal, Headers, Request, Response, WebSocket, document */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdtemp, readFile, readdir, rm, symlink } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  clearTimeout as clearDeadline,
  setTimeout as setDeadline,
} from 'node:timers';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

// No dotenv file is read or copied. Every build and provider value is synthetic.
// Chrome is the only external prerequisite; no browser npm package is needed.
const repository = fileURLToPath(new URL('../', import.meta.url));
const temporary = await mkdtemp(path.join(tmpdir(), 'unshaken-inquiry-mode-'));
const chromePath =
  process.argv.find((argument) => argument.startsWith('--chrome='))?.slice(9) ||
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const cleanEnvironment = Object.fromEntries(
  ['PATH', 'HOME', 'TMPDIR', 'LANG', 'SYSTEMROOT', 'WINDIR']
    .filter((key) => process.env[key] !== undefined)
    .map((key) => [key, process.env[key]]),
);
const synthetic = {
  RESEND_API_KEY: 'synthetic-inquiry-mode-private-canary',
  CONTACT_FROM_EMAIL: 'mode-sender@example.invalid',
  CONTACT_TO_EMAIL: 'mode-recipient@example.invalid',
  CONTACT_DELIVERY_ENABLED: 'true',
};
const cases = [
  {
    name: 'production-missing-mode',
    environment: { VERCEL_TARGET_ENV: 'production', VERCEL_ENV: 'preview' },
    live: true,
  },
  {
    name: 'production-stale-preview',
    environment: {
      VERCEL_TARGET_ENV: 'production',
      PUBLIC_INQUIRY_MODE: 'preview',
      PUBLIC_INQUIRY_ENDPOINT: '/api/stale/',
    },
    live: true,
  },
  {
    name: 'production-explicit-live',
    environment: {
      VERCEL_TARGET_ENV: 'production',
      PUBLIC_INQUIRY_MODE: 'live',
    },
    live: true,
  },
  {
    name: 'production-metadata-fallback',
    environment: { VERCEL_ENV: 'production', PUBLIC_INQUIRY_MODE: 'preview' },
    live: true,
  },
  { name: 'local-default', environment: {}, live: false },
  {
    name: 'vercel-preview-default',
    environment: { VERCEL_ENV: 'preview' },
    live: false,
  },
  {
    name: 'custom-target-precedence',
    environment: { VERCEL_TARGET_ENV: 'staging', VERCEL_ENV: 'production' },
    live: false,
  },
  {
    name: 'explicit-live-without-metadata',
    environment: { PUBLIC_INQUIRY_MODE: 'live' },
    live: true,
  },
];
let chrome;
let socket;
let server;
let sessionId;
let staticRoot;
let productionStaticRoot;
let handler;
let providerMode = 'accepted';
let infrastructureStatus;
let providerCalls = 0;
let httpPosts = 0;
let interceptedPosts = 0;
let requestId = 0;
let navigationId = 0;
const pendingCommands = new Map();
const asynchronousErrors = [];
const blockedRequests = [];
const responses = [];
const originalFetch = globalThis.fetch;

async function run(command, args, cwd, environment) {
  const child = spawn(command, args, {
    cwd,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => (output += chunk));
  child.stderr.on('data', (chunk) => (output += chunk));
  const [code] = await once(child, 'exit');
  assert.equal(code, 0, `${command} ${args.join(' ')} failed:\n${output}`);
  return output;
}

async function waitFor(check, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await delay(40);
  }
  throw new Error(`Timed out: ${label}`);
}

function cdp(method, params = {}, inPage = true) {
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const deadline = setDeadline(() => {
      pendingCommands.delete(id);
      reject(new Error(`Chrome command timed out: ${method}`));
    }, 15000);
    deadline.unref();
    pendingCommands.set(id, {
      resolve(value) {
        clearDeadline(deadline);
        resolve(value);
      },
      reject(error) {
        clearDeadline(deadline);
        reject(error);
      },
    });
    socket.send(
      JSON.stringify({
        id,
        method,
        params,
        ...(inPage ? { sessionId } : {}),
      }),
    );
  });
}

async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

function snapshot() {
  const form = document.querySelector('#inquiry-form');
  const result = document.querySelector('#form-result');
  const submit = document.querySelector('#submit-inquiry');
  return {
    mode: form.dataset.inquiryMode,
    endpoint: form.getAttribute('action'),
    banner: Boolean(document.querySelector('div.preview-notice')),
    button: submit.textContent.trim(),
    disabled: submit.disabled,
    busy: form.getAttribute('aria-busy'),
    result: result.textContent,
    role: result.getAttribute('role'),
    hidden: result.hidden,
    focused: document.activeElement === result,
    name: document.querySelector('#name').value,
    description: document.querySelector('#description').value,
    phoneAlternative: Boolean(
      document.querySelector('a[href="tel:+17633365174"]'),
    ),
  };
}
const state = () => evaluate(`(${snapshot.toString()})()`);

async function submit() {
  return evaluate(`(() => {
    const fields = ${JSON.stringify({
      name: '[MOCK ONLY] Inquiry mode regression',
      email: 'mode-visitor@example.invalid',
      city: 'Cambridge',
      projectType: 'residential',
      description:
        'Synthetic browser regression; no real email or customer data.',
    })};
    for (const [name, value] of Object.entries(fields)) {
      document.getElementById(name).value = value;
    }
    document.querySelector('#submit-inquiry').click();
    return (${snapshot.toString()})();
  })()`);
}

async function navigate(base) {
  const url = `${base}/contact/?case=${++navigationId}`;
  await cdp('Page.navigate', { url });
  await waitFor(
    () =>
      evaluate(
        `document.URL === ${JSON.stringify(url)} && Boolean(document.querySelector("#submit-inquiry") && !document.querySelector("#submit-inquiry").disabled)`,
      ),
    'new page and form browser handler enabled',
  );
}

async function finished() {
  await waitFor(async () => {
    const current = await state();
    return !current.hidden && !current.busy && !current.disabled;
  }, 'submission settled');
  return state();
}

async function scanPublic(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await scanPublic(file);
    else if (/\.(?:html|js|mjs|json|css|txt|xml)$/.test(entry.name)) {
      const contents = await readFile(file, 'utf8');
      for (const forbidden of [
        ...Object.values(synthetic).filter((value) => value !== 'true'),
        ...Object.keys(synthetic),
        'VERCEL_TARGET_ENV',
        'VERCEL_ENV',
      ]) {
        assert.ok(
          !contents.includes(forbidden),
          `Private configuration in public ${path.relative(directory, file)}`,
        );
      }
    }
  }
}

async function build(testCase) {
  const workspace = path.join(temporary, testCase.name);
  const sources = [
    'src',
    'public',
    'scripts',
    'package.json',
    'package-lock.json',
    'astro.config.mjs',
    'tsconfig.json',
    'vercel.json',
  ];
  for (const source of sources) {
    await cp(path.join(repository, source), path.join(workspace, source), {
      recursive: true,
      filter(sourcePath) {
        const name = path.basename(sourcePath);
        return (
          !name.startsWith('.env') &&
          name !== '.vercel' &&
          name !== 'node_modules'
        );
      },
    });
  }
  await symlink(
    path.join(repository, 'node_modules'),
    path.join(workspace, 'node_modules'),
    'dir',
  );
  const environment = {
    ...cleanEnvironment,
    ...synthetic,
    PUBLIC_SITE_LAUNCH_READY: 'false',
    ...testCase.environment,
  };
  await run(
    process.execPath,
    [path.join(repository, 'node_modules/astro/bin/astro.mjs'), 'build'],
    workspace,
    environment,
  );
  await run(
    process.execPath,
    [
      'scripts/verify-build.mjs',
      '--mode=preview',
      `--inquiry-mode=${testCase.live ? 'live' : 'preview'}`,
    ],
    workspace,
    environment,
  );
  const output = path.join(workspace, '.vercel/output');
  staticRoot = path.join(output, 'static');
  if (testCase.name === 'production-missing-mode')
    productionStaticRoot = staticRoot;
  await scanPublic(staticRoot);
  const html = await readFile(
    path.join(staticRoot, 'contact/index.html'),
    'utf8',
  );
  assert.match(
    html,
    new RegExp(`data-inquiry-mode="${testCase.live ? 'live' : 'preview'}"`),
  );
  assert.equal(html.includes('<div class="preview-notice"'), !testCase.live);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  if (!handler) {
    const routing = JSON.parse(
      await readFile(path.join(output, 'config.json'), 'utf8'),
    );
    const route = routing.routes.find(
      (entry) => entry.src === '^/api/contact/$',
    );
    assert.ok(route?.dest, 'Contact route must be a Vercel function');
    const functionRoot = path.join(output, `functions/${route.dest}.func`);
    const configuration = JSON.parse(
      await readFile(path.join(functionRoot, '.vc-config.json'), 'utf8'),
    );
    handler = (
      await import(
        pathToFileURL(path.join(functionRoot, configuration.handler))
      )
    ).default;
  }
}

try {
  // Overwrite only with known synthetic values; never inspect existing secrets.
  Object.assign(process.env, synthetic);
  globalThis.fetch = async (url, options) => {
    assert.equal(
      String(url),
      'https://api.resend.com/emails',
      'Unexpected outbound transport',
    );
    assert.equal(
      new Headers(options.headers).get('authorization'),
      `Bearer ${synthetic.RESEND_API_KEY}`,
    );
    const email = JSON.parse(options.body);
    assert.equal(
      email.from,
      `Unshaken Painting <${synthetic.CONTACT_FROM_EMAIL}>`,
    );
    assert.deepEqual(email.to, [synthetic.CONTACT_TO_EMAIL]);
    assert.equal(email.reply_to, 'mode-visitor@example.invalid');
    assert.ok(options.signal instanceof AbortSignal);
    providerCalls++;
    await delay(250);
    if (providerMode === 'network-failed')
      throw new Error('Synthetic network failure');
    if (providerMode === 'failed')
      return Response.json({ error: 'synthetic rejection' }, { status: 422 });
    return Response.json({ id: 'synthetic-mode-message-id' });
  };
  server = createServer(async (incoming, outgoing) => {
    try {
      const url = new URL(incoming.url, `http://${incoming.headers.host}`);
      if (incoming.method === 'POST') {
        assert.equal(
          url.pathname,
          '/api/contact/',
          'The actual browser POST must use the contact endpoint',
        );
        httpPosts++;
        if (infrastructureStatus) {
          responses.push(infrastructureStatus);
          outgoing.writeHead(infrastructureStatus, {
            'Content-Type': 'text/html',
          });
          outgoing.end('<h1>Synthetic infrastructure response</h1>');
          return;
        }
        const chunks = [];
        for await (const chunk of incoming) chunks.push(chunk);
        const request = new Request(url, {
          method: 'POST',
          headers: incoming.headers,
          body: Buffer.concat(chunks),
        });
        const response = await handler.fetch(request);
        responses.push(response.status);
        outgoing.writeHead(
          response.status,
          Object.fromEntries(response.headers),
        );
        outgoing.end(Buffer.from(await response.arrayBuffer()));
        return;
      }
      assert.equal(incoming.method, 'GET');
      const filename = path.resolve(
        staticRoot,
        `.${decodeURIComponent(url.pathname)}`,
        url.pathname.endsWith('/') ? 'index.html' : '',
      );
      assert.ok(filename.startsWith(`${staticRoot}${path.sep}`));
      const mime =
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.svg': 'image/svg+xml',
          '.webp': 'image/webp',
          '.avif': 'image/avif',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.woff2': 'font/woff2',
        }[path.extname(filename)] || 'application/octet-stream';
      const content = await readFile(filename);
      outgoing.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-store',
      });
      outgoing.end(content);
    } catch (error) {
      if (error.code !== 'ENOENT') asynchronousErrors.push(error);
      outgoing.writeHead(404);
      outgoing.end();
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const profile = path.join(temporary, 'chrome-profile');
  chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-sync',
      '--disable-extensions',
      '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
      'about:blank',
    ],
    { env: cleanEnvironment, stdio: 'ignore' },
  );
  let chromeError;
  chrome.on('error', (error) => {
    chromeError = error;
  });
  let activePort;
  await waitFor(async () => {
    if (chromeError)
      throw new Error(
        `Cannot launch Chrome. Set CHROME_PATH or --chrome=: ${chromeError.message}`,
      );
    try {
      activePort = await readFile(
        path.join(profile, 'DevToolsActivePort'),
        'utf8',
      );
      return true;
    } catch {
      return false;
    }
  }, 'temporary Chrome debugging port');
  const [port, websocketPath] = activePort.trim().split('\n');
  socket = new WebSocket(`ws://127.0.0.1:${port}${websocketPath}`);
  await once(socket, 'open');
  const rejectPending = () => {
    for (const command of pendingCommands.values())
      command.reject(new Error('Temporary Chrome connection closed'));
    pendingCommands.clear();
  };
  socket.addEventListener('close', rejectPending);
  socket.addEventListener('error', rejectPending);
  socket.addEventListener('message', (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id) {
      const command = pendingCommands.get(payload.id);
      pendingCommands.delete(payload.id);
      if (payload.error)
        command?.reject(new Error(JSON.stringify(payload.error)));
      else command?.resolve(payload.result);
    } else if (payload.method === 'Fetch.requestPaused') {
      const { requestId: paused, request } = payload.params;
      const url = new URL(request.url);
      const allowed = url.origin === base;
      if (allowed && request.method === 'POST') {
        interceptedPosts++;
        if (url.pathname !== '/api/contact/')
          asynchronousErrors.push(
            new Error('Browser selected the wrong endpoint'),
          );
      }
      if (!allowed) blockedRequests.push(request.url);
      void cdp(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', {
        requestId: paused,
        ...(allowed ? {} : { errorReason: 'BlockedByClient' }),
      }).catch((error) => asynchronousErrors.push(error));
    }
  });
  const { targetId } = await cdp(
    'Target.createTarget',
    { url: 'about:blank' },
    false,
  );
  ({ sessionId } = await cdp(
    'Target.attachToTarget',
    { targetId, flatten: true },
    false,
  ));
  await cdp('Page.enable');
  await cdp('Fetch.enable', { patterns: [{ urlPattern: '*' }] });

  for (const testCase of cases) {
    await build(testCase);
    await navigate(base);
    const rendered = await state();
    assert.equal(rendered.mode, testCase.live ? 'live' : 'preview');
    assert.equal(rendered.banner, !testCase.live);
    assert.equal(rendered.endpoint, '/api/contact/');
    assert.equal(
      rendered.button,
      testCase.live ? 'Send estimate request' : 'Check request · preview',
    );
    assert.ok(rendered.phoneAlternative);
    const before = { providerCalls, httpPosts, interceptedPosts };
    const submitting = await submit();
    if (testCase.live) {
      assert.equal(submitting.button, 'Sending your request…');
      assert.equal(submitting.disabled, true);
      assert.equal(submitting.busy, 'true');
    }
    const result = await finished();
    if (testCase.live) {
      assert.equal(result.result, 'Your request was submitted successfully.');
      assert.equal(result.name, '');
      assert.equal(result.role, 'status');
      assert.equal(providerCalls - before.providerCalls, 1);
      assert.equal(httpPosts - before.httpPosts, 1);
      assert.equal(interceptedPosts - before.interceptedPosts, 1);
    } else {
      assert.match(
        result.result,
        /preview mode: no request or photos were sent/,
      );
      assert.notEqual(result.name, '');
      assert.equal(providerCalls, before.providerCalls);
      assert.equal(httpPosts, before.httpPosts);
      assert.equal(interceptedPosts, before.interceptedPosts);
    }
    assert.equal(result.focused, true);
    console.log(
      `PASS ${testCase.name}: rendered ${result.mode}, ${testCase.live ? 'intercepted POST + mocked backend acceptance' : 'zero POSTs'}`,
    );
  }

  // A known production page still rejects safely when its backend cannot send.
  staticRoot = productionStaticRoot;
  for (const failure of [
    { name: 'sending-disabled', enabled: 'false', status: 503, calls: 0 },
    { name: 'missing-backend-configuration', key: '', status: 503, calls: 0 },
    { name: 'provider-rejection', provider: 'failed', status: 502, calls: 1 },
    {
      name: 'provider-network-failure',
      provider: 'network-failed',
      status: 502,
      calls: 1,
    },
    { name: 'non-JSON-429', infrastructure: 429, status: 429, calls: 0 },
    { name: 'non-JSON-503', infrastructure: 503, status: 503, calls: 0 },
  ]) {
    process.env.CONTACT_DELIVERY_ENABLED = failure.enabled ?? 'true';
    process.env.RESEND_API_KEY = failure.key ?? synthetic.RESEND_API_KEY;
    providerMode = failure.provider ?? 'accepted';
    infrastructureStatus = failure.infrastructure;
    await navigate(base);
    const before = { providerCalls, httpPosts, interceptedPosts };
    await submit();
    const result = await finished();
    await delay(300);
    assert.equal(responses.at(-1), failure.status);
    assert.equal(providerCalls - before.providerCalls, failure.calls);
    assert.equal(
      httpPosts - before.httpPosts,
      1,
      'No automatic retry or duplicate handler',
    );
    assert.equal(interceptedPosts - before.interceptedPosts, 1);
    assert.equal(result.role, 'alert');
    assert.match(result.result, /Your details are still here/);
    assert.match(result.result, /call Grant/);
    assert.equal(result.name, '[MOCK ONLY] Inquiry mode regression');
    assert.equal(
      result.description,
      'Synthetic browser regression; no real email or customer data.',
    );
    assert.equal(result.focused, true);
    assert.ok(!result.result.includes('submitted successfully'));
    console.log(
      `PASS ${failure.name}: HTTP ${failure.status}, input retained, ${failure.calls} mocked provider calls`,
    );
  }
  for (const width of [320, 768, 1440]) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: width === 320,
    });
    const geometry = await evaluate(`(() => {
      const fields = [...document.querySelectorAll('#inquiry-form input:not(#website), #inquiry-form select, #inquiry-form textarea, #submit-inquiry')];
      return { width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, fields: fields.map(field => { const rect = field.getBoundingClientRect(); return { left: rect.left, right: rect.right }; }) };
    })()`);
    assert.ok(
      geometry.scroll <= geometry.width + 1,
      `Page overflow at ${width}px`,
    );
    assert.ok(
      geometry.fields.every(
        (field) => field.left >= 0 && field.right <= geometry.width + 1,
      ),
      `Form overflow at ${width}px`,
    );
  }
  assert.equal(
    blockedRequests.length,
    0,
    'Page attempted a non-loopback request',
  );
  assert.equal(
    asynchronousErrors.length,
    0,
    asynchronousErrors.map(String).join('\n'),
  );
  console.log(
    `PASS ${cases.length} isolated builds, 6 failure cases, 3 responsive widths; ${interceptedPosts} intercepted POSTs, ${providerCalls} mocked provider calls, zero real emails.`,
  );
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      await Promise.race([cdp('Browser.close', {}, false), delay(1000)]);
    } catch {
      /* Chrome may close before replying. */
    }
    socket.close();
  }
  if (chrome?.pid && chrome.exitCode === null && chrome.signalCode === null) {
    const exited = once(chrome, 'exit');
    chrome.kill('SIGTERM');
    await exited;
  }
  if (server?.listening) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  globalThis.fetch = originalFetch;
  await rm(temporary, { recursive: true, force: true });
}
