'use client';

import { Form } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Quote, Flag } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

export function CreateClanForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {/* <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            <Users className="w-5 h-5 mr-2" />
            Create New Clan
          </Button> */}
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-gradient-to-br from-gray-900 to-gray-800 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Create a New Clan
          </DialogTitle>
        </DialogHeader>
        <Form method="post" className="space-y-6">
          <div className="space-y-4">
            {/* Clan Name */}
            <div className="grid gap-2">
              <Label
                htmlFor="clan_name"
                className="text-white flex items-center gap-2"
              >
                <Flag className="w-4 h-4 text-blue-400" />
                Clan Name
              </Label>
              <Input
                id="clan_name"
                name="clan_name"
                placeholder="Enter clan name"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell us about your clan..."
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                required
              />
            </div>

            {/* Quotes */}
            <div className="grid gap-2">
              <Label className="text-white flex items-center gap-2">
                <Quote className="w-4 h-4 text-purple-400" />
                Clan Quotes
              </Label>
              <div className="space-y-3">
                <Input
                  name="quote1"
                  placeholder="Enter first quote"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
                <Input
                  name="quote2"
                  placeholder="Enter second quote (optional)"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Logo & Banner */}
            {/* <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="logo_url" className="text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-green-400" />
                  Logo URL
                </Label>
                <Input
                  id="logo_url"
                  name="logo_url"
                  type="url"
                  placeholder="Enter logo URL"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="banner_url" className="text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-400" />
                  Banner URL
                </Label>
                <Input
                  id="banner_url"
                  name="banner_url"
                  type="url"
                  placeholder="Enter banner URL"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div> */}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            Create Clan
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
