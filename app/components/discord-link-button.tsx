import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  X
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

interface DiscordLinkButtonProps {
  isLinked?: boolean;
  discordUsername?: string;
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
}

export function DiscordLinkButton({ 
  isLinked = false, 
  discordUsername,
  className = '',
  variant = 'default' 
}: DiscordLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerification = async () => {
    if (!username.trim()) {
      setErrorMessage('Please enter your Discord username');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/discord/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordId: 'temp-id',
          discordUsername: username.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
          window.location.reload(); // Refresh to show updated status
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error occurred');
    }
  };

  if (variant === 'card') {
    return (
      <div className={`bg-white/5 rounded-lg p-4 border border-gray-700 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <div>
              <p className="font-medium">Discord Connection</p>
              <p className="text-sm text-gray-400">
                {isLinked ? `Linked as ${discordUsername}` : 'Not connected'}
              </p>
            </div>
          </div>
          {isLinked ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Link Discord Account
                  </DialogTitle>
                  <DialogDescription>
                    Connect your Discord account to get the "basher" role and access community features.
                  </DialogDescription>
                </DialogHeader>
                <DiscordLinkForm
                  username={username}
                  setUsername={setUsername}
                  status={status}
                  errorMessage={errorMessage}
                  onVerify={handleVerification}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return isLinked ? (
      <div className={`flex items-center gap-2 text-green-400 ${className}`}>
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">Discord Connected</span>
      </div>
    ) : (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Connect Discord
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Link Discord Account
            </DialogTitle>
            <DialogDescription>
              Connect your Discord account to get the "basher" role and access community features.
            </DialogDescription>
          </DialogHeader>
          <DiscordLinkForm
            username={username}
            setUsername={setUsername}
            status={status}
            errorMessage={errorMessage}
            onVerify={handleVerification}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Default variant - full button
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`bg-purple-600 hover:bg-purple-700 ${className}`}
          disabled={isLinked}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {isLinked ? `Connected as ${discordUsername}` : 'Connect Discord'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Link Discord Account
          </DialogTitle>
          <DialogDescription>
            Connect your Discord account to get the "basher" role and access community features.
          </DialogDescription>
        </DialogHeader>
        <DiscordLinkForm
          username={username}
          setUsername={setUsername}
          status={status}
          errorMessage={errorMessage}
          onVerify={handleVerification}
        />
      </DialogContent>
    </Dialog>
  );
}

function DiscordLinkForm({
  username,
  setUsername,
  status,
  errorMessage,
  onVerify,
}: {
  username: string;
  setUsername: (value: string) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage: string;
  onVerify: () => void;
}) {
  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-4"
          >
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-400 mb-2">
              Discord Linked!
            </h3>
            <p className="text-gray-400 text-sm">
              You'll get the "basher" role shortly
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="discord_username">Discord Username</Label>
              <Input
                id="discord_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_discord_username"
                className="bg-gray-800 border-gray-700 mt-1"
                onKeyDown={(e) => e.key === 'Enter' && onVerify()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Just your username, no # or numbers needed
              </p>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-2 rounded"
              >
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </motion.div>
            )}

            <div className="space-y-3">
              <Button
                onClick={onVerify}
                disabled={status === 'loading'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {status === 'loading' ? (
                  'Verifying...'
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Discord Account
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Not in our Discord server yet?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://discord.gg/your-server-invite', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Join Server
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
