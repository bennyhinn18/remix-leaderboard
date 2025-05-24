import { Link } from '@remix-run/react';
import {
  Trophy,
  Book,
  Code,
  MessageCircle,
  Feather,
  Building,
  Home,
  User,
  Crown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import iconImage from '~/assets/bashers.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (
    tab:
      | 'overall'
      | 'bashclan'
      | 'github'
      | 'leetcode'
      | 'duolingo'
      | 'discord'
      | 'books'
  ) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
    {
      name: 'Overall',
      icon: <Trophy className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('overall');
        localStorage.setItem('activeTab', 'overall');
      },
      isActive: activeTab === 'overall',
    },
    {
      name: 'BashClan',
      icon: <Building className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('bashclan');
        localStorage.setItem('activeTab', 'bashclan');
      },
      isActive: activeTab === 'bashclan',
    },
    {
      name: 'GitHub',
      icon: <Code className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('github');
        localStorage.setItem('activeTab', 'github');
      },
      isActive: activeTab === 'github',
    },
    {
      name: 'Duolingo',
      icon: <Feather className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('duolingo');
        localStorage.setItem('activeTab', 'duolingo');
      },
      isActive: activeTab === 'duolingo',
    },
    {
      name: 'LeetCode',
      icon: <Crown className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('leetcode');
        localStorage.setItem('activeTab', 'leetcode');
      },
      isActive: activeTab === 'leetcode',
    },
    {
      name: 'Discord',
      icon: <MessageCircle className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('discord');
        localStorage.setItem('activeTab', 'discord');
      },
      isActive: activeTab === 'discord',
    },
    {
      name: 'Books',
      icon: <Book className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('books');
        localStorage.setItem('activeTab', 'books');
      },
      isActive: activeTab === 'books',
    },
    { name: 'Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
  ];

  return (
    <div className="hidden md:flex h-screen bg-gray-900 w-[200px] text-white flex-col border-r border-white/10 fixed left-0 top-0">
      <div className="p-4 flex items-center justify-center border-b border-white/10">
        <Link to="/" className="flex items-center justify-center">
          <img
            src={iconImage || '/placeholder.svg'}
            alt="Basher Logo"
            className="w-12 h-12"
          />
        </Link>
      </div>

      <div className="flex flex-col flex-1 p-2 gap-1 overflow-auto">
        {navItems.map((item) => {
          const content = (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer ${
                item.isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
              onClick={item.onClick}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </motion.div>
          );

          return item.path ? (
            <Link key={item.name} to={item.path} className="no-underline">
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>
    </div>
  );
}
