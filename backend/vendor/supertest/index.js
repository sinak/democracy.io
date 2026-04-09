import { Duplex } from 'node:stream';
import { IncomingMessage, ServerResponse } from 'node:http';

class MockSocket extends Duplex {
  constructor() {
    super();
    this.remoteAddress = '127.0.0.1';
  }

  _read() {}

  _write(_chunk, _encoding, callback) {
    callback();
  }

  setTimeout() {}

  setNoDelay() {}

  setKeepAlive() {}

  destroy(error) {
    if (error) {
      this.emit('error', error);
    }

    this.emit('close');
    return this;
  }
}

class TestRequest {
  constructor(app, method, urlPath) {
    this.app = app;
    this.method = method;
    this.urlPath = urlPath;
    this.headers = {};
    this.body = undefined;
  }

  set(name, value) {
    this.headers[name] = value;
    return this;
  }

  send(body) {
    this.body = body;
    return this;
  }

  async execute() {
    const socket = new MockSocket();
    const req = new IncomingMessage(socket);
    const headers = Object.fromEntries(
      Object.entries(this.headers).map(([key, value]) => [key.toLowerCase(), value])
    );
    let requestBody;

    if (this.body !== undefined) {
      if (
        typeof this.body === 'string' ||
        this.body instanceof ArrayBuffer ||
        ArrayBuffer.isView(this.body) ||
        this.body instanceof URLSearchParams
      ) {
        requestBody = this.body.toString();
      } else {
        requestBody = JSON.stringify(this.body);

        if (!Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
          headers['content-type'] = 'application/json';
        }
      }

      headers['content-length'] = String(Buffer.byteLength(requestBody));
    }

    req.method = this.method;
    req.url = this.urlPath;
    req.headers = headers;
    req.socket = socket;
    req.connection = socket;
    req.httpVersion = '1.1';

    const res = new ServerResponse(req);
    const chunks = [];
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.assignSocket(socket);

    res.write = (chunk, encoding, callback) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }

      return originalWrite(chunk, encoding, callback);
    };

    res.end = (chunk, encoding, callback) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }

      return originalEnd(chunk, encoding, callback);
    };

    await new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);

      process.nextTick(() => {
        if (requestBody !== undefined) {
          req.push(requestBody);
        }

        req.push(null);
      });

      try {
        this.app(req, res);
      } catch (error) {
        reject(error);
      }
    });

    const text = Buffer.concat(chunks).toString('utf8');
    let parsedBody = text;

    try {
      parsedBody = text ? JSON.parse(text) : {};
    } catch {
      parsedBody = text;
    }

    return {
      status: res.statusCode,
      headers: Object.fromEntries(
        Object.entries(res.getHeaders()).map(([key, value]) => [key, value == null ? '' : String(value)])
      ),
      text,
      body: parsedBody,
    };
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.execute().catch(onRejected);
  }

  finally(onFinally) {
    return this.execute().finally(onFinally);
  }
}

class TestAgent {
  constructor(app) {
    this.app = app;
  }

  get(urlPath) {
    return new TestRequest(this.app, 'GET', urlPath);
  }

  post(urlPath) {
    return new TestRequest(this.app, 'POST', urlPath);
  }

  patch(urlPath) {
    return new TestRequest(this.app, 'PATCH', urlPath);
  }
}

export default function request(app) {
  return new TestAgent(app);
}
