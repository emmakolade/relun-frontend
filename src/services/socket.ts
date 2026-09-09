import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import { getValidAccessToken, subscribeToAuthState } from './auth.service';

let socket: Socket | null = null;
let pendingConnection: Promise<Socket> | null = null;

const createConnection = async (): Promise<Socket> => {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error('Not authenticated. Please log in again.');
  }

  const instance = io(API_BASE_URL, {
    // React Native has no reliable XHR long-polling, and websocket-only also
    // removes the need for sticky sessions once the backend runs more than
    // one instance.
    transports: ['websocket'],
    auth: { token },
  });

  // Socket.IO replays `auth` on every reconnect attempt, so refresh the token
  // here or a long-lived session eventually reconnects with an expired one.
  instance.on('connect_error', () => {
    void getValidAccessToken().then((refreshedToken) => {
      if (refreshedToken) {
        instance.auth = { token: refreshedToken };
      }
    });
  });

  return new Promise<Socket>((resolve, reject) => {
    const cleanup = () => {
      instance.off('connect', onConnect);
      instance.off('connect_error', onConnectError);
    };

    const onConnect = () => {
      cleanup();
      resolve(instance);
    };

    const onConnectError = (error: Error) => {
      cleanup();
      instance.close();
      reject(error);
    };

    instance.once('connect', onConnect);
    instance.once('connect_error', onConnectError);
  });
};

/**
 * One shared connection for the whole app. Socket.IO handles reconnection
 * internally, so an existing instance is reused even while it is down.
 */
export const getSocket = async (): Promise<Socket> => {
  if (socket) {
    return socket;
  }

  if (!pendingConnection) {
    pendingConnection = createConnection()
      .then((instance) => {
        socket = instance;
        return instance;
      })
      .finally(() => {
        pendingConnection = null;
      });
  }

  return pendingConnection;
};

export const disconnectSocket = () => {
  socket?.close();
  socket = null;
};

// The token dies with the session, so drop the connection rather than let it
// retry with credentials the server will reject.
subscribeToAuthState((isLoggedIn) => {
  if (!isLoggedIn) {
    disconnectSocket();
  }
});
