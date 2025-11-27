const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Generate self-signed certificate
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const httpsOptions = {
  key: pems.private,
  cert: pems.cert,
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).once('error', (err) => {
    console.error(err);
    process.exit(1);
  }).listen(port, () => {
    console.log(`> Ready on https://${hostname}:${port}`);
  });
});

