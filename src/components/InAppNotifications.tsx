 import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CurrencyDollar, 
  Printer, 
  User, 
  X,
  Bell
} from '@phosphor-icons/react';
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

interface InAppNotification {
  id: string;
  type: 'transaction_created' | 'transaction_completed' | 'transaction_printed' | 'system_alert';
  title: string;
  message: string;
  user: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

interface InAppNotificationsProps {
  transactions: Transaction[];
  currentUser: string;
}

// Simulate other users in the system
const SYSTEM_USERS = [
  { id: 'user1', name: 'Alice Johnson', initials: 'AJ' },
  { id: 'user2', name: 'Bob Smith', initials: 'BS' },
  { id: 'user3', name: 'Carol Davis', initials: 'CD' },
  { id: 'admin', name: 'System Admin', initials: 'SA' }
];

const InAppNotifications: React.FC<InAppNotificationsProps> = ({ 
  transactions, 
  currentUser 
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate receiving notifications from other users
  useEffect(() => {
    const generateRandomNotification = () => {
      const notificationTypes = [
        'transaction_created',
        'transaction_completed', 
        'transaction_printed'
      ] as const;
      
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const randomUser = SYSTEM_USERS[Math.floor(Math.random() * SYSTEM_USERS.length)];
      const randomAmount = Math.floor(Math.random() * 5000) + 100;
      const currencies = ['USD', 'GHS', 'NGN', 'EUR', 'GBP'];
      const fromCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      const toCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      
      let title = '';
      let message = '';
      
      switch (randomType) {
        case 'transaction_created':
          title = 'New Transaction Created';
          message = `${randomUser.name} created a transaction for $${randomAmount.toLocaleString()} (${fromCurrency} → ${toCurrency})`;
          break;
        case 'transaction_completed':
          title = 'Transaction Completed';
          message = `${randomUser.name} completed a transaction for $${randomAmount.toLocaleString()}`;
          break;
        case 'transaction_printed':
          title = 'Receipt Printed';
          message = `${randomUser.name} printed a receipt for transaction #TXN-${Math.floor(Math.random() * 1000)}`;
          break;
      }
      
      const notification: InAppNotification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        type: randomType,
        title,
        message,
        user: randomUser.name,
        timestamp: new Date().toISOString(),
        read: false,
        data: {
          amount: randomAmount,
          fromCurrency,
          toCurrency,
          userInitials: randomUser.initials
        }
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20 notifications
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.success(title, {
        description: message,
        duration: 4000,
        action: {
          label: 'View',
          onClick: () => setShowNotifications(true)
        }
      });
    };

    // Generate initial notifications
    const initialNotifications: InAppNotification[] = [
      {
        id: 'notif-1',
        type: 'transaction_completed',
        title: 'Transaction Completed',
        message: 'Alice Johnson completed a transaction for $1,250 (USD → GHS)',
        user: 'Alice Johnson',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        read: false,
        data: { amount: 1250, fromCurrency: 'USD', toCurrency: 'GHS', userInitials: 'AJ' }
      },
      {
        id: 'notif-2',
        type: 'transaction_printed',
        title: 'Receipt Printed',
        message: 'Bob Smith printed a receipt for transaction #TXN-789',
        user: 'Bob Smith',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        read: false,
        data: { userInitials: 'BS' }
      },
      {
        id: 'notif-3',
        type: 'transaction_created',
        title: 'New Transaction Created',
        message: 'Carol Davis created a transaction for $850 (EUR → NGN)',
        user: 'Carol Davis',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        read: true,
        data: { amount: 850, fromCurrency: 'EUR', toCurrency: 'NGN', userInitials: 'CD' }
      }
    ];
    
    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);

    // Set up random notification generation
    const interval = setInterval(() => {
      // Generate notification every 15-45 seconds
      if (Math.random() > 0.7) { // 30% chance every interval
        generateRandomNotification();
      }
    }, 15000 + Math.random() * 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getNotificationIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'transaction_created':
        return <CurrencyDollar className="h-4 w-4 text-blue-600" weight="duotone" />;
      case 'transaction_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" weight="duotone" />;
      case 'transaction_printed':
        return <Printer className="h-4 w-4 text-purple-600" weight="duotone" />;
      case 'system_alert':
        return <Clock className="h-4 w-4 text-orange-600" weight="duotone" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" weight="duotone" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative h-10 w-10 p-0 notification-bell"
        >
          <Bell className="h-5 w-5" weight="duotone" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs notification-badge"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 max-h-96 bg-card border rounded-lg shadow-2xl z-50 animate-fade-in">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-7 px-2"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`p-3 cursor-pointer transition-all hover:bg-muted/50 ${
                        !notification.read ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {notification.data?.userInitials || notification.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <span className="text-sm font-medium truncate">
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t bg-muted/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setNotifications([]);
                    setUnreadCount(0);
                  }}
                >
                  Clear all notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default InAppNotifications;