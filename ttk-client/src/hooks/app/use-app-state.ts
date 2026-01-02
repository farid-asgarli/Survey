import useAuthInstance from '@src/configs/auth/AuthInstance';
import { StatusMessages } from '@src/static/messages/statusMessages';
import { useStore } from '@src/store';
import { useEffect, useState } from 'react';

export function useAppState() {
  const {
    user: userStore,
    routing: { reInitializeRouter },
  } = useStore();
  const [appInitialized, setAppInitialized] = useState<boolean>(false);

  const [fetchStatus, setFetchStatus] = useState<{ result: 'success' | 'error'; message: string; retry?: boolean }>({
    message: StatusMessages.Loading,
    result: 'success',
  });

  const signInAsync = useAuthInstance('redirect', {
    onSuccessfulSignIn: async (userDetails, msGraphRefreshDetails) => {
      try {
        await userStore.signIn(userDetails);
        userStore.setGraphRefreshToken(msGraphRefreshDetails.accessToken);
        setFetchStatus({ message: StatusMessages.PreparingApplication, result: 'success' });
        setAppInitialized(true);
        reInitializeRouter();
      } catch (error) {
        console.log(error);
        setFetchStatus({ message: (error as Error).message, result: 'error' });
      }
    },
    onErrorSignIn: (err, _, retry) =>
      setFetchStatus({
        message: err,
        result: 'error',
        retry,
      }),
  });

  async function authenticate() {
    setFetchStatus({
      message: StatusMessages.RetrievingUserInfo,
      result: 'success',
    });
    signInAsync();
  }

  useEffect(() => {
    authenticate();
  }, []);

  return {
    fetchStatus,
    appInitialized,
    authenticate,
  };
}
