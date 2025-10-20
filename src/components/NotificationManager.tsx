 import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface NotificationManagerProps {
  transactions: any[];
}

interface NotificationSettings {
  newTransactions: boolean;
  statusUpdates: boolean;
  failedTransactions: boolean;
  soundEnabled: boolean;
}

export default function NotificationManager({ transactions }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [previousTransactions, setPreviousTransactions] = useState<any[]>([]);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useKV<NotificationSettings>('notification-settings', {
    newTransactions: true,
    statusUpdates: true,
    failedTransactions: true,
    soundEnabled: true
  });

  useEffect(() => {
    // Check if push notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Register service worker
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setSwRegistration(registration);
      
      console.log('Service Worker registered successfully:', registration);
      
      // Update service worker if needed
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.success('App updated! Refresh to see new features.');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  useEffect(() => {
    // Check for transaction updates
    if (previousTransactions.length > 0 && transactions.length > 0) {
      transactions.forEach((transaction) => {
        const prevTransaction = previousTransactions.find(
          (prev) => prev.id === transaction.id
        );
        
        // New transaction
        if (!prevTransaction && notificationSettings?.newTransactions) {
          showNotification(
            'New Transaction',
            `New transaction from ${transaction.clientName || transaction.client_name}`,
            'new',
            transaction
          );
        }
        // Status change
        else if (prevTransaction && prevTransaction.status !== transaction.status) {
          const shouldNotify = 
            (notificationSettings?.statusUpdates && transaction.status !== 'failed') ||
            (notificationSettings?.failedTransactions && transaction.status === 'failed');
            
          if (shouldNotify) {
            const statusMessages = {
              completed: 'Transaction completed successfully',
              failed: 'Transaction failed - Action required',
              pending: 'Transaction is now pending'
            };
            
            showNotification(
              'Transaction Update',
              statusMessages[transaction.status as keyof typeof statusMessages] || 'Transaction status updated',
              transaction.status,
              transaction
            );
          }
        }
      });
    }
    
    setPreviousTransactions(transactions);
  }, [transactions, previousTransactions, notificationSettings]);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Push notifications enabled');
        
        // Show a test notification
        showNotification(
          'RJB TRANZ Notifications',
          'You will now receive transaction updates',
          'test'
        );
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Please enable in browser settings.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
    }
  };

  const showNotification = (title: string, body: string, type: string, transaction?: any) => {
    if (permission !== 'granted') return;

    const baseOptions: NotificationOptions = {
      body,
      icon: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
      badge: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
      tag: `rjb-tranz-${type}-${transaction?.id || 'general'}`,
      requireInteraction: type === 'failed',
      silent: !notificationSettings?.soundEnabled,
      data: {
        type,
        url: window.location.origin,
        transactionId: transaction?.id,
        clientName: transaction?.clientName
      }
    };

    try {
      // Use service worker notification if available (supports more features)
      if (swRegistration) {
        const swOptions = {
          ...baseOptions,
          actions: transaction ? [
            { action: 'view', title: 'View Transaction', icon: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg' },
            { action: 'dismiss', title: 'Dismiss' }
          ] : undefined
        };
        swRegistration.showNotification(title, swOptions);
      } else {
        // Fallback to basic notification
        const notification = new Notification(title, baseOptions);
        
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Navigate to transactions tab if transaction-related
          if (transaction) {
            // You could emit a custom event here to change tabs
            const event = new CustomEvent('switchToTransactions', { 
              detail: { transactionId: transaction.id } 
            });
            window.dispatchEvent(event);
          }
        };

        // Auto close after 5 seconds for non-critical notifications
        if (type !== 'failed') {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback to toast notification
      toast.success(`${title}: ${body}`);
    }
  };

  const getNotificationStatus = () => {
    switch (permission) {
      case 'granted':
        return { 
          text: 'Push notifications enabled', 
          color: 'text-green-600',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'denied':
        return { 
          text: 'Push notifications blocked', 
          color: 'text-red-600',
          icon: <XCircle className="h-4 w-4" />
        };
      default:
        return { 
          text: 'Push notifications disabled', 
          color: 'text-yellow-600',
          icon: <AlertTriangle className="h-4 w-4" />
        };
    }
  };

  const status = getNotificationStatus();

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 relative">
      <div className={`flex items-center space-x-1 ${status.color}`}>
        {status.icon}
        <span className="text-xs md:text-sm hidden md:inline">
          {status.text}
        </span>
      </div>
      
      {permission === 'granted' && (
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-1 px-2 py-1 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          title="Notification settings"
        >
          <Settings className="h-3 w-3 md:h-4 md:w-4" />
        </button>
      )}
      
      {permission !== 'granted' && (
        <button
          onClick={requestPermission}
          className="flex items-center space-x-1 px-2 py-1 text-xs md:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          title="Enable push notifications"
        >
          <Bell className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Enable</span>
        </button>
      )}
      
      {/* Notification Settings Dropdown */}
      {showSettings && permission === 'granted' && (
        <div className="absolute top-12 right-0 bg-white border rounded-lg shadow-lg p-4 z-50 w-64">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Notification Settings</h4>
            
            <label className="flex items-center justify-between">
              <span className="text-sm">New Transactions</span>
              <input
                type="checkbox"
                checked={notificationSettings?.newTransactions || false}
                onChange={(e) => setNotificationSettings((prev) => ({ 
                  newTransactions: e.target.checked,
                  statusUpdates: prev?.statusUpdates || false,
                  failedTransactions: prev?.failedTransactions || false,
                  soundEnabled: prev?.soundEnabled || false
                }))}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm">Status Updates</span>
              <input
                type="checkbox"
                checked={notificationSettings?.statusUpdates || false}
                onChange={(e) => setNotificationSettings((prev) => ({ 
                  newTransactions: prev?.newTransactions || false,
                  statusUpdates: e.target.checked,
                  failedTransactions: prev?.failedTransactions || false,
                  soundEnabled: prev?.soundEnabled || false
                }))}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm">Failed Transactions</span>
              <input
                type="checkbox"
                checked={notificationSettings?.failedTransactions || false}
                onChange={(e) => setNotificationSettings((prev) => ({ 
                  newTransactions: prev?.newTransactions || false,
                  statusUpdates: prev?.statusUpdates || false,
                  failedTransactions: e.target.checked,
                  soundEnabled: prev?.soundEnabled || false
                }))}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm">Sound Notifications</span>
              <input
                type="checkbox"
                checked={notificationSettings?.soundEnabled || false}
                onChange={(e) => setNotificationSettings((prev) => ({ 
                  newTransactions: prev?.newTransactions || false,
                  statusUpdates: prev?.statusUpdates || false,
                  failedTransactions: prev?.failedTransactions || false,
                  soundEnabled: e.target.checked
                }))}
                className="rounded"
              />
            </label>
            
            <div className="pt-2 border-t">
              <button
                onClick={() => {
                  showNotification(
                    'Test Notification',
                    'This is how transaction updates will appear',
                    'test'
                  );
                  setShowSettings(false);
                }}
                className="w-full text-xs bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Test Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}