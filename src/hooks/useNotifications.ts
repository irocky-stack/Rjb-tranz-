export const useNotifications = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const showTransactionNotification = (type: string, data: any) => {
    console.log('Notification:', type, data);
  };

  return {
    showTransactionNotification
  };
};