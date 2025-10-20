 import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationTesterProps {
  onTestNotification: (title: string, body: string, type: string, transaction?: any) => void;
}

export default function NotificationTester({ onTestNotification }: NotificationTesterProps) {
  const testNotifications = [
    {
      title: 'New Transaction Received',
      body: 'John Smith sent $1,000 USD → GHS',
      type: 'new',
      icon: <Bell className="h-4 w-4 text-blue-600" />,
      transaction: {
        id: 'TEST-001',
        clientName: 'John Smith',
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'GHS'
      }
    },
    {
      title: 'Transaction Completed',
      body: 'Transaction TXN-001 has been completed successfully',
      type: 'completed',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      transaction: {
        id: 'TXN-001',
        clientName: 'Mary Johnson',
        status: 'completed'
      }
    },
    {
      title: 'Transaction Failed',
      body: 'Transaction TXN-002 failed - Action required',
      type: 'failed',
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      transaction: {
        id: 'TXN-002',
        clientName: 'David Brown',
        status: 'failed'
      }
    },
    {
      title: 'Transaction Pending',
      body: 'Transaction TXN-003 is now pending verification',
      type: 'pending',
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      transaction: {
        id: 'TXN-003',
        clientName: 'Sarah Wilson',
        status: 'pending'
      }
    }
  ];

  const handleTestNotification = (notification: typeof testNotifications[0]) => {
    // Show both push notification and toast
    onTestNotification(notification.title, notification.body, notification.type, notification.transaction);
    toast.success(`Sent: ${notification.title}`);
  };

  const testAllNotifications = () => {
    testNotifications.forEach((notification, index) => {
      setTimeout(() => {
        handleTestNotification(notification);
      }, index * 2000); // 2 second delay between each notification
    });
    toast.success('Testing all notification types (2s intervals)');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Notification Testing
        </CardTitle>
        <CardDescription>
          Test different types of push notifications to see how they appear to users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {testNotifications.map((notification, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto p-4 text-left"
              onClick={() => handleTestNotification(notification)}
            >
              <div className="flex items-start gap-3 w-full">
                {notification.icon}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {notification.body}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <Button onClick={testAllNotifications} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Test All Notifications
          </Button>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <div className="font-medium text-blue-900 mb-1">Note:</div>
          <div className="text-blue-700">
            Make sure notifications are enabled to see the push notifications. 
            Toast notifications will always appear as a fallback.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}