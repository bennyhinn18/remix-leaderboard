import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Github, 
  Code2, 
  Globe, 
  MessageSquare, 
  Hash, 
  Instagram, 
  Linkedin, 
  ExternalLink,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Briefcase,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Form, useFetcher } from '@remix-run/react';

interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  placeholder: string;
  prefix?: string;
  validation?: (value: string) => boolean;
  formatUrl?: (username: string) => string;
}

const platforms: Platform[] = [
  {
    id: 'github_username',
    name: 'GitHub',
    icon: Github,
    color: 'text-gray-400',
    placeholder: 'your-github-username',
    formatUrl: (username) => `https://github.com/${username}`,
    validation: (value) => /^[a-zA-Z0-9-]+$/.test(value),
  },
  {
    id: 'leetcode_username',
    name: 'LeetCode',
    icon: Code2,
    color: 'text-orange-400',
    placeholder: 'your-leetcode-username',
    formatUrl: (username) => `https://leetcode.com/${username}`,
    validation: (value) => /^[a-zA-Z0-9_-]+$/.test(value),
  },
  {
    id: 'duolingo_username',
    name: 'Duolingo',
    icon: Globe,
    color: 'text-green-400',
    placeholder: 'your-duolingo-username',
    formatUrl: (username) => `https://www.duolingo.com/profile/${username}`,
    validation: (value) => /^[a-zA-Z0-9_-]+$/.test(value),
  },
  {
    id: 'discord_username',
    name: 'Discord',
    icon: MessageSquare,
    color: 'text-indigo-400',
    placeholder: 'username#1234',
    validation: (value) => /^.{2,32}#\d{4}$/.test(value),
  },
  {
    id: 'hackerrank_username',
    name: 'HackerRank',
    icon: Hash,
    color: 'text-emerald-400',
    placeholder: 'your-hackerrank-username',
    formatUrl: (username) => `https://www.hackerrank.com/${username}`,
    validation: (value) => /^[a-zA-Z0-9_-]+$/.test(value),
  },
  {
    id: 'instagram_username',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-400',
    placeholder: 'your-instagram-username',
    formatUrl: (username) => `https://instagram.com/${username}`,
    validation: (value) => /^[a-zA-Z0-9_.]+$/.test(value),
  },
  {
    id: 'linkedin_url',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-400',
    placeholder: 'https://linkedin.com/in/your-profile',
    validation: (value) => /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(value),
  },
  {
    id: 'personal_website',
    name: 'Personal Website',
    icon: LinkIcon,
    color: 'text-purple-400',
    placeholder: 'https://your-website.com',
    validation: (value) => /^https?:\/\/.+\..+$/.test(value),
  },
  {
    id: 'portfolio_url',
    name: 'Portfolio',
    icon: Briefcase,
    color: 'text-cyan-400',
    placeholder: 'https://your-portfolio.com',
    validation: (value) => /^https?:\/\/.+\..+$/.test(value),
  },
  {
    id: 'resume_url',
    name: 'Resume/CV',
    icon: FileText,
    color: 'text-amber-400',
    placeholder: 'https://drive.google.com/your-resume',
    validation: (value) => /^https?:\/\/.+$/.test(value),
  },
];

interface ProfileConnectionsProps {
  member: {
    id?: number;
    github_username?: string;
    leetcode_username?: string;
    duolingo_username?: string;
    discord_username?: string;
    hackerrank_username?: string;
    instagram_username?: string;
    linkedin_url?: string;
    personal_website?: string;
    portfolio_url?: string;
    resume_url?: string;
  } | null;
  canEdit?: boolean;
  isOwnProfile?: boolean;
}

export default function ProfileConnections({ member, canEdit = false, isOwnProfile = false }: ProfileConnectionsProps) {
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, string>>({});
  const [isCollapsed, setIsCollapsed] = useState(true);
  const fetcher = useFetcher();

  const handleEdit = (platformId: string, currentValue: string) => {
    setEditingPlatform(platformId);
    setTempValues({ ...tempValues, [platformId]: currentValue || '' });
  };

  const handleSave = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    const value = tempValues[platformId];
    
    if (platform?.validation && value && !platform.validation(value)) {
      return; // Invalid value, don't save
    }

    // Submit the form data
    const formData = new FormData();
    formData.append(platformId, value || '');
    
    fetcher.submit(formData, { method: 'post' });
    setEditingPlatform(null);
  };

  const handleCancel = () => {
    setEditingPlatform(null);
    setTempValues({});
  };

  const getPlatformValue = (platformId: string): string => {
    return (member as any)?.[platformId] || '';
  };

  const isValidValue = (platform: Platform, value: string): boolean => {
    if (!value) return true; // Empty is valid
    return platform.validation ? platform.validation(value) : true;
  };

  if (!isOwnProfile && !canEdit) {
    // Read-only view for other users' profiles
    const connectedPlatforms = platforms.filter(platform => getPlatformValue(platform.id));
    
    if (connectedPlatforms.length === 0) {
      return (
        <Card className="bg-white/5 border-gray-700">
          <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-400" />
                Platform Connections
              </div>
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </CardTitle>
            {!isCollapsed && <CardDescription>No platforms connected yet</CardDescription>}
          </CardHeader>
        </Card>
      );
    }

    return (
      <Card className="bg-white/5 border-gray-700">
        <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-400" />
              Platform Connections
            </div>
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </CardTitle>
          {!isCollapsed && <CardDescription>Connected platforms and profiles</CardDescription>}
        </CardHeader>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connectedPlatforms.map((platform) => {
                  const value = getPlatformValue(platform.id);
                  const Icon = platform.icon;
                  const url = platform.formatUrl ? platform.formatUrl(value) : value;

                  return (
                    <div key={platform.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${platform.color}`} />
                        <div>
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-sm text-gray-400">{value}</div>
                        </div>
                      </div>
                      {url && url.startsWith('http') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-gray-400 hover:text-white"
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </motion.div>
        )}
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="bg-white/5 border-gray-700">
        <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-400" />
              Platform Connections
            </div>
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </CardTitle>
          {!isCollapsed && (
            <CardDescription>
              Connect your accounts to showcase your skills and achievements. 
              Your GitHub and LeetCode will show live data on your profile!
            </CardDescription>
          )}
        </CardHeader>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {platforms.map((platform) => {
                  const value = getPlatformValue(platform.id);
                  const Icon = platform.icon;
                  const isEditing = editingPlatform === platform.id;
                  const currentValue = isEditing ? tempValues[platform.id] : value;
                  const isValid = isValidValue(platform, currentValue);

                  return (
                    <div key={platform.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-gray-700/50">
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className={`w-5 h-5 ${platform.color}`} />
                        <div className="flex-1">
                          <div className="font-medium mb-1">{platform.name}</div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={currentValue}
                                onChange={(e) => setTempValues({ ...tempValues, [platform.id]: e.target.value })}
                                placeholder={platform.placeholder}
                                className={`flex-1 bg-gray-800 border-gray-600 ${!isValid ? 'border-red-500' : ''}`}
                                autoFocus
                              />
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSave(platform.id)}
                                  disabled={!isValid}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancel}
                                  className="text-gray-400 hover:text-gray-300"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {value ? (
                                <>
                                  <div className="text-sm text-gray-300">{value}</div>
                                  <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Connected
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <div className="text-sm text-gray-500">Not connected</div>
                                  <Badge variant="outline" className="text-xs text-gray-400 border-gray-500/30">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Not set
                                  </Badge>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {value && platform.formatUrl && !isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-gray-400 hover:text-white"
                          >
                            <a href={platform.formatUrl(value)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(platform.id, value)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
