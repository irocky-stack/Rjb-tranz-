export const useNotifications = () => {
  const showTransactionNotification = (type: string, data: any) => {
    console.log('Notification:', type, data);
  };

  return {
    showTransactionNotification
  };
};