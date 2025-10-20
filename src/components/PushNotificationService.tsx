 import React, { useEffect, useState } from 'react';
import { Bell, X, Check, AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  receiptPrinted: boolean;
  phoneNumber: string;
  transactionType: 'send' | 'receive';
  uniqueId: string;
  formatId: string;
}

interface PushNotificationServiceProps {
  transactions: Transaction[];
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
  transactionId?: string;
  read: boolean;
  persistent?: boolean;
}

export default function PushNotificationService({ transactions }: PushNotificationServiceProps) {
  const [permission, setPermission] = useState(Notification.permission);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [lastTransactionCount, setLastTransactionCount] = useState(0);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize service worker and push notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        setIsSupported(false);
        console.warn('Push notifications not supported in this browser');
        return;
      }

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers not supported');
        return;
      }

      try {
        // Register service worker for push notifications
        const registration = await navigator.serviceWorker.register('/sw.js');
        setServiceWorkerRegistration(registration);
        console.log('Service Worker registered:', registration);

        // Request notification permission
        if (permission === 'default') {
          const result = await Notification.requestPermission();
          setPermission(result);
        }

        // Handle background notifications
        if ('onmessage' in navigator.serviceWorker) {
          navigator.serviceWorker.onmessage = (event) => {
            if (event.data.type === 'NOTIFICATION_CLICK') {
              handleNotificationClick(event.data.notificationData);
            }
          };
        }

        // Send welcome notification
        if (permission === 'granted') {
          sendLocalNotification(
            'RJB TRANZ CRM Ready! 🚀',
            'Push notifications are now active. You\'ll receive updates on transactions and system events.',
            'success'
          );
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  // Monitor transaction changes
  useEffect(() => {
    if (transactions.length > lastTransactionCount) {
      // New transaction added
      const newTransactions = transactions.slice(lastTransactionCount);
      newTransactions.forEach(transaction => {
        sendTransactionNotification(transaction, 'created');
      });
    } else if (transactions.length === lastTransactionCount) {
      // Check for status changes in existing transactions
      transactions.forEach(transaction => {
        const existingNotification = notifications.find(n => n.transactionId === transaction.id);
        if (!existingNotification && transaction.status !== 'pending') {
          sendTransactionNotification(transaction, 'updated');
        }
      });
    }
    
    setLastTransactionCount(transactions.length);
  }, [transactions, lastTransactionCount, notifications]);

  // Send transaction-specific notifications
  const sendTransactionNotification = async (transaction: Transaction, action: 'created' | 'updated') => {
    let title: string;
    let body: string;
    let type: 'success' | 'warning' | 'error' | 'info';
    let icon = '💰';

    switch (action) {
      case 'created':
        title = 'New Transaction Created! 📝';
        body = `Transaction for ${transaction.clientName} - $${transaction.amount} ${transaction.fromCurrency}`;
        type = 'info';
        icon = '📝';
        break;
      case 'updated':
        switch (transaction.status) {
          case 'completed':
            title = 'Transaction Completed! ✅';
            body = `$${transaction.amount} sent to ${transaction.clientName} successfully`;
            type = 'success';
            icon = '✅';
            break;
          case 'failed':
            title = 'Transaction Failed! ❌';
            body = `Transaction for ${transaction.clientName} needs attention`;
            type = 'error';
            icon = '❌';
            break;
          default:
            title = 'Transaction Updated 🔄';
            body = `Status changed for ${transaction.clientName}`;
            type = 'info';
            icon = '🔄';
        }
        break;
    }

    // Send native notification safely
    if (permission === 'granted') {
      try {
        if (serviceWorkerRegistration && serviceWorkerRegistration.showNotification) {
          // Use Service Worker registration for better notification support
          await serviceWorkerRegistration.showNotification(title, {
            body,
            icon: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
            badge: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
            tag: `transaction-${transaction.id}`,
            requireInteraction: transaction.status === 'failed',
            silent: false,
            data: {
              transactionId: transaction.id,
              url: `/transactions/${transaction.id}`,
              action: action,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          // Fallback to regular Notification constructor - wrap in try/catch
          try {
            const notification = new Notification(title, {
              body,
              icon: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
              tag: `transaction-${transaction.id}`,
              silent: false
            });

            notification.onclick = () => {
              handleNotificationClick({
                transactionId: transaction.id,
                action: 'view'
              });
              notification.close();
            };

            // Auto-close after 10 seconds for non-critical notifications
            if (transaction.status !== 'failed') {
              setTimeout(() => notification.close(), 10000);
            }
          } catch (notificationError) {
            console.warn('Failed to create Notification:', notificationError);
            // Continue with just the internal notification and toast
          }
        }
      } catch (error) {
        console.warn('Failed to send push notification:', error);
        // Continue with internal notification and toast as fallback
      }
    }

    // Add to internal notification list
    const internalNotification: NotificationItem = {
      id: `${transaction.id}-${action}-${Date.now()}`,
      title,
      body,
      type,
      timestamp: new Date(),
      transactionId: transaction.id,
      read: false,
      persistent: transaction.status === 'failed'
    };

    setNotifications(prev => [internalNotification, ...prev.slice(0, 19)]); // Keep last 20
    
    // Show toast notification as fallback
    toast[type](title, {
      description: body,
      action: {
        label: 'View',
        onClick: () => handleNotificationClick({ transactionId: transaction.id, action: 'view' })
      }
    });
  };

  // Send local notification
  const sendLocalNotification = async (title: string, body: string, type: 'success' | 'warning' | 'error' | 'info', persistent = false) => {
    const notification: NotificationItem = {
      id: `local-${Date.now()}`,
      title,
      body,
      type,
      timestamp: new Date(),
      read: false,
      persistent
    };

    setNotifications(prev => [notification, ...prev.slice(0, 19)]);

    if (permission === 'granted') {
      try {
        if (serviceWorkerRegistration && serviceWorkerRegistration.showNotification) {
          await serviceWorkerRegistration.showNotification(title, {
            body,
            icon: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
            badge: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
            tag: notification.id,
            silent: false
          });
        } else {
          // Fallback to regular Notification constructor - wrap in try/catch
          try {
            new Notification(title, {
              body,
              icon: 'https://i.ibb.co/6LY7bxR/rjb-logo.jpg',
              tag: notification.id,
              silent: false
            });
          } catch (notificationError) {
            console.warn('Failed to create local notification:', notificationError);
            // Continue with toast only
          }
        }
      } catch (error) {
        console.warn('Failed to send local notification:', error);
        // Continue with toast as fallback
      }
    }

    toast[type](title, { description: body });
  };

  // Handle notification clicks
  const handleNotificationClick = (data: any) => {
    if (data.transactionId) {
      // Navigate to transaction or trigger action
      const customEvent = new CustomEvent('switchToTransactions', {
        detail: { transactionId: data.transactionId }
      });
      window.dispatchEvent(customEvent);
    }
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.transactionId === data.transactionId ? { ...n, read: true } : n
      )
    );
  };

  // Request permission handler
  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        sendLocalNotification(
          'Notifications Enabled! 🔔',
          'You\'ll now receive real-time updates on your transactions.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      default: return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPanel(!showPanel)}
          className="relative h-8 w-8 p-0"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Panel */}
        {showPanel && (
          <Card className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-96 overflow-y-auto z-50 shadow-xl border-2 
                          max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:right-auto max-sm:w-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-montserrat">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {permission !== 'granted' && (
                    <Button size="sm" variant="outline" onClick={requestPermission} className="text-xs">
                      Enable
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={clearAll} className="text-xs">
                      Clear All
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setShowPanel(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {permission !== 'granted' && (
                <div className="p-4 border-b bg-yellow-50">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium font-montserrat">Notifications Disabled</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1 font-montserrat">
                    Enable notifications to receive real-time transaction updates
                  </p>
                  <Button size="sm" className="mt-2 font-montserrat" onClick={requestPermission}>
                    Enable Notifications
                  </Button>
                </div>
              )}

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-montserrat">No notifications yet</p>
                  <p className="text-xs text-gray-400 font-montserrat">Transaction updates will appear here</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.transactionId) {
                          handleNotificationClick({ transactionId: notification.transactionId });
                          setShowPanel(false);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate font-montserrat">
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2 font-montserrat">
                              {notification.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 font-montserrat">
                            {notification.body}
                          </p>
                          {notification.transactionId && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              <CreditCard className="h-3 w-3 mr-1" />
                              Transaction
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Background click to close panel */}
      {showPanel && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowPanel(false)}
        />
      )}
    </>
  );
}