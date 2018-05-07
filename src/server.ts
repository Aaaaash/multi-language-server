import * as express from 'express';
import * as ws from 'ws';
import * as http from 'http';
import * as url from 'url';
import { Socket } from 'net';

const app = express();

app.use('/', (req, res) => {
  res.send('hello world');
});

const server = app.listen(4000);

const wss = new ws.Server({ server });

server.on('upgrade', handleUpgrade);

function handleUpgrade(request: express.Request, socket: Socket, head) {
  const pathname = request.url ? url.parse(request.url).pathname : undefined;
  wss.handleUpgrade(request, socket, head, (webSocket) => {
    const socketConnect = {
      send: content =>
          webSocket.send(content, (error) => {
            if (error) {
              throw error;
            }
          }),
      onMessage: cb => webSocket.on('message', cb),
      onError: cb => webSocket.on('error', cb),
      onClose: cb => webSocket.on('close', cb),
      dispose: () => webSocket.close(),
    }

    if (webSocket.readyState === webSocket.OPEN) {
      console.log(pathname);
      // [`${pathname}Launch`](socketconnect);
    } else {
      webSocket.on('open', () => {
        console.log(pathname);
      });
    }
  });
}
