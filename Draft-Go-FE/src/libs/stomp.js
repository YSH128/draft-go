import SockJS from "sockjs-client";

const OPEN_STATE = typeof WebSocket !== "undefined" ? WebSocket.OPEN : 1;

const addListener = (socket, event, handler) => {
  if (typeof socket.addEventListener === "function") {
    socket.addEventListener(event, handler);
    return;
  }
  const prop = `on${event}`;
  socket[prop] = handler;
};

const parseFrame = (rawFrame) => {
  const splitIndex = rawFrame.indexOf("\n\n");
  const head = splitIndex === -1 ? rawFrame : rawFrame.slice(0, splitIndex);
  const body = splitIndex === -1 ? "" : rawFrame.slice(splitIndex + 2);

  const lines = head.split("\n");
  const command = lines[0]?.trim();
  const headers = {};

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const sepIndex = line.indexOf(":");
    if (sepIndex === -1) continue;
    const key = line.slice(0, sepIndex);
    const value = line.slice(sepIndex + 1);
    headers[key] = value;
  }

  return { command, headers, body };
};

const encodeFrame = (command, headers = {}, body = "") => {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return `${command}\n${headerLines.join("\n")}\n\n${body}\u0000`;
};

export const createStompClient = ({ url, onConnect, onError }) => {
  const socket = url.startsWith("http") ? new SockJS(url) : new WebSocket(url);
  const subscriptions = new Map();
  let connected = false;
  let subId = 0;

  const sendFrame = (command, headers, body) => {
    if (socket.readyState !== OPEN_STATE) return;
    socket.send(encodeFrame(command, headers, body));
  };

  const subscribe = (destination, callback) => {
    const id = `sub-${subId++}`;
    subscriptions.set(id, { destination, callback });
    if (connected) {
      sendFrame("SUBSCRIBE", { id, destination });
    }
    return id;
  };

  const unsubscribe = (id) => {
    if (!subscriptions.has(id)) return;
    if (connected) {
      sendFrame("UNSUBSCRIBE", { id });
    }
    subscriptions.delete(id);
  };

  addListener(socket, "open", () => {
    sendFrame("CONNECT", {
      "accept-version": "1.2",
      "heart-beat": "0,0",
    });
  });

  addListener(socket, "message", (event) => {
    const frames = event.data
      .split("\u0000")
      .map((frame) => frame.trim())
      .filter(Boolean);

    frames.forEach((frameText) => {
      const frame = parseFrame(frameText);

      if (frame.command === "CONNECTED") {
        connected = true;
        subscriptions.forEach((sub, id) => {
          sendFrame("SUBSCRIBE", { id, destination: sub.destination });
        });
        if (onConnect) onConnect();
        return;
      }

      if (frame.command === "MESSAGE") {
        const subscriptionId = frame.headers.subscription;
        const destination = frame.headers.destination;
        const subscription =
          subscriptions.get(subscriptionId) ||
          [...subscriptions.values()].find((sub) => sub.destination === destination);

        if (subscription && subscription.callback) {
          subscription.callback(frame.body, frame.headers);
        }
      }
    });
  });

  addListener(socket, "error", (event) => {
    if (onError) onError(event);
  });

  const disconnect = () => {
    if (socket.readyState === OPEN_STATE) {
      sendFrame("DISCONNECT");
    }
    socket.close();
    subscriptions.clear();
  };

  return { subscribe, unsubscribe, disconnect };
};

export const buildWsUrl = (baseUrl) => {
  if (!baseUrl) return null;
  try {
    const proxyTarget = import.meta.env?.VITE_PROXY_TARGET;
    const resolvedBase =
      baseUrl.startsWith("/") && proxyTarget ? proxyTarget : baseUrl;
    const url = new URL(resolvedBase, window.location.origin);
    const isSecure = url.protocol === "https:" || url.protocol === "wss:";
    const protocol = isSecure ? "https:" : "http:";
    return `${protocol}//${url.host}/ws`;
  } catch (error) {
    console.error("Failed to build websocket url:", error);
    return null;
  }
};
