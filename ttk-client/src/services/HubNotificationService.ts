import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState } from 'react';
import Environment from '../static/env';
import { useStore } from '@src/store';

type HubEventListener = {
  route: string;
  method: (...args: any[]) => any;
};

export function useHubNotificationService(...eventListeners: HubEventListener[]) {
  const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);

  const { appUser, accessToken } = useStore('user');

  async function startConnection() {
    if (!accessToken?.content) return;

    const url = Environment.BASE_URI + Environment.SOCKET_URI + '?listener=' + appUser?.username;
    let connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => accessToken?.content!,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    eventListeners.forEach((e) => connection.on(e.route, e.method));

    await connection.start();

    setHubConnection(connection);
  }

  async function stopConnection() {
    await hubConnection?.stop();
    setHubConnection(null);
  }

  return {
    startConnection,
    stopConnection,
  };
}
