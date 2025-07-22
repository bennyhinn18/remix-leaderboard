import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher, Form } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Github,
  User
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { createServerSupabase } from '~/utils/supabase.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return redirect('/login');
  }

  // Get user's GitHub username
  const githubUsername = user.user_metadata?.user_name || 
                        user.identities?.find((i: any) => i.provider === 'github')?.identity_data?.user_name;

  // Check if user already has Discord linked
  const { data: member } = await supabase
    .from('members')
    .select('discord_username, title, bash_points')
    .eq('github_username', githubUsername)
    .single();

  return json({
    user: {
      github_username: githubUsername,
      name: user.user_metadata?.full_name || githubUsername,
      avatar_url: user.user_metadata?.avatar_url,
    },
    member,
    isAlreadyVerified: !!member?.discord_username,
    discordServerInvite: 'https://discord.com/invite/hsFPDHhsPK', // Replace with your actual invite
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const discordUsername = formData.get('discord_username');

  if (!discordUsername) {
    return json({ error: 'Discord username is required' }, { status: 400 });
  }

  // The verification logic is handled by the API endpoint
  // This action just validates the form input
  return json({ success: true });
};

export default function DiscordVerify() {
  const { user, member, isAlreadyVerified, discordServerInvite } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [discordUsername, setDiscordUsername] = useState('');
  const [step, setStep] = useState(isAlreadyVerified ? 3 : 1);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerification = async () => {
    if (!discordUsername.trim()) {
      setErrorMessage('Please enter your Discord username');
      return;
    }

    setVerificationStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/discord/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordId: 'temp-id', // In a real implementation, you'd get this from Discord OAuth
          discordUsername: discordUsername.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStatus('success');
        setStep(3);
      } else {
        setVerificationStatus('error');
        setErrorMessage(result.error || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('Network error occurred');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Github className="w-8 h-8 text-blue-400" />
            <Shield className="w-8 h-8 text-green-400" />
            <MessageCircle className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Connect Discord to Terminal
          </h1>
          <p className="text-gray-400 mt-2">
            Link your Discord account to access the ByteBashBlitz community
          </p>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mb-8 p-4 bg-white/5 rounded-lg border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-400">@{user.github_username}</p>
            </div>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= stepNumber
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Join Discord Server */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                Step 1: Join Our Discord Server
              </h2>
              <p className="text-gray-400 mb-4">
                First, make sure you're a member of our Discord server. You'll get a "newcomer" role initially.
              </p>
              <Button
                onClick={() => window.open(discordServerInvite, '_blank')}
                className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord Server
              </Button>
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="w-full"
              >
                I'm already in the server
              </Button>
            </motion.div>
          )}

          {/* Step 2: Link Discord Account */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Step 2: Link Your Discord Account
              </h2>
              <p className="text-gray-400 mb-6">
                Enter your Discord username to link it with your GitHub account. This will automatically give you the "basher" role and access to all community channels.
              </p>
              
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30 mb-4">
                <p className="text-xs text-blue-400">
                  <strong>🔐 Terminal Verification Required:</strong> Only users who have logged into Basher Terminal can receive the "basher" role. 
                  This ensures our Discord community is limited to verified developers.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="discord_username">Discord Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discord_username"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      placeholder="your_discord_username"
                      className="bg-gray-800 border-gray-700"
                    />
                    <Button
                      onClick={() => copyToClipboard(user.github_username)}
                      variant="outline"
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Just your username, no # or numbers needed
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                  </div>
                )}

                <Button
                  onClick={handleVerification}
                  disabled={verificationStatus === 'loading'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {verificationStatus === 'loading' ? (
                    'Verifying...'
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Discord Account
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 mt-2">
                  <p>⚠️ Note: Discord role assignment may take a few minutes.</p>
                  <p>If you don't get the role immediately, please contact an admin.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 rounded-xl p-6 border border-green-500/30"
            >
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-green-400 mb-2">
                  Verification Complete!
                </h2>
                <p className="text-gray-300 mb-6">
                  {isAlreadyVerified
                    ? 'Your Discord account is already linked to Terminal.'
                    : 'Your Discord account has been successfully linked to ByteBashBlitz Terminal!'}
                </p>

                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-2">What happens next:</h3>
                  <ul className="text-sm text-gray-400 space-y-1 text-left">
                    <li>✅ Your Discord account is now linked to Terminal</li>
                    <li>🤖 Our bot will assign you the "basher" role shortly</li>
                    <li>📢 You'll get access to all community channels</li>
                    <li>🎉 Event notifications and announcements</li>
                    <li>💻 Project showcase opportunities</li>
                  </ul>
                  <div className="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                    <p className="text-xs text-yellow-400">
                      <strong>Role Assignment:</strong> If you don't see the "basher" role within 5 minutes, 
                      please message an admin in Discord or contact support.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => window.open(discordServerInvite, '_blank')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Go to Discord
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/leaderboard'}
                    variant="outline"
                    className="flex-1"
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"
        >
          <h3 className="font-medium text-blue-400 mb-2">How it works:</h3>
          <ol className="text-sm text-gray-400 space-y-1">
            <li>1. Your GitHub account is already authenticated with Terminal</li>
            <li>2. Link your Discord username to enable role synchronization</li>
            <li>3. Our bot automatically assigns you the appropriate Discord roles</li>
            <li>4. Roles stay synced based on your Terminal status</li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
