import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '~/components/ui/card';

interface PushNotificationManagerProps {
  memberId?: number;
}

export function PushNotificationManager({ memberId }: PushNotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fetcher = useFetcher();
  
  useEffect(() => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      setError('This browser does not support push notifications');
      return;
    }
    
    setPermission(Notification.permission);
    
    // Check for existing subscription
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => {
          return registration.pushManager.getSubscription();
        })
        .then(existingSubscription => {
          setSubscription(existingSubscription);
        })
        .catch(err => {
          console.error('Error checking for existing subscription:', err);
        });
    }
  }, []);
  
  // Function to convert a base64 string to a Uint8Array
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  const subscribeUser = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSubscribing(true);
    
    try {
      // Request notification permission if not granted
      if (Notification.permission !== 'granted') {
        const result = await Notification.requestPermission();
        setPermission(result);
        
        if (result !== 'granted') {
          setError('Permission denied for push notifications');
          setIsSubscribing(false);
          return;
        }
      }
      
      if (!('serviceWorker' in navigator)) {
        setError('Service Workers are not supported in this browser');
        setIsSubscribing(false);
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      
      // Get public VAPID key from server
      const vapidResponse = await fetch('/api/push/vapid-public-key');
      if (!vapidResponse.ok) {
        throw new Error('Failed to get VAPID public key');
      }
      
      const { publicKey } = await vapidResponse.json();
      
      // Convert the public key to the expected format
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      
      // Subscribe the user
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      
      setSubscription(newSubscription);
      
      // Send the subscription to the server
      if (memberId) {
        fetcher.submit(
          { 
            subscription: JSON.stringify(newSubscription),
            memberId: memberId.toString()
          },
          { method: 'post', action: '/api/push/subscribe' }
        );
        setSuccessMessage('Successfully subscribed to push notifications!');
      }
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe to push notifications');
    } finally {
      setIsSubscribing(false);
    }
  };
  
  const unsubscribeUser = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSubscribing(true);
    
    try {
      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe();
        
        // Send the unsubscription to the server
        if (memberId) {
          fetcher.submit(
            { 
              endpoint: subscription.endpoint,
              memberId: memberId.toString()
            },
            { method: 'post', action: '/api/push/unsubscribe' }
          );
        }
        
        setSubscription(null);
        setSuccessMessage('Successfully unsubscribed from push notifications');
      }
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe from push notifications');
    } finally {
      setIsSubscribing(false);
    }
  };
  
  if (!memberId) {
    return null;
  }
  
  // If browser doesn't support notifications, don't show anything
  if (error === 'This browser does not support push notifications') {
    return null;
  }
  
  return (
    <Card className="p-4 bg-white/5 border border-white/10">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">Push Notifications</h3>
          </div>
          
          {subscription ? (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> Enabled
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full flex items-center">
              <BellOff className="w-3 h-3 mr-1" /> Disabled
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-400">
          {subscription 
            ? "You're receiving push notifications for important updates." 
            : "Enable push notifications to stay updated with the latest news and events."}
        </p>
        
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> {error}
          </div>
        )}
        
        {successMessage && (
          <div className="text-sm text-green-400 bg-green-500/10 p-2 rounded flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" /> {successMessage}
          </div>
        )}
        
        <div>
          {subscription ? (
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              onClick={unsubscribeUser}
              disabled={isSubscribing}
            >
              <BellOff className="w-4 h-4 mr-2" />
              Disable Notifications
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30"
              onClick={subscribeUser}
              disabled={isSubscribing}
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
