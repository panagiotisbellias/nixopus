'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCreateServerMutation } from '@/redux/services/settings/serversApi';
import { useTranslation } from '@/hooks/use-translation';
import { Server, AuthenticationType } from '@/redux/types/server';
import { useAppSelector } from '@/redux/hooks';
import { Plus } from 'lucide-react';

interface CreateServerDialogProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  id?: string;
  data?: Server;
}

function CreateServerDialog({ open, setOpen, id, data }: CreateServerDialogProps) {
  const { t } = useTranslation();
  const [createServer, { isLoading }] = useCreateServerMutation();
  const [authType, setAuthType] = useState<AuthenticationType>(AuthenticationType.PASSWORD);

  const serverFormSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Server name must be at least 2 characters' })
      .max(255, { message: 'Server name must be less than 255 characters' }),
    description: z
      .string()
      .max(500, { message: 'Description must be less than 500 characters' })
      .optional(),
    host: z
      .string()
      .min(1, { message: 'Host is required' })
      .refine(
        (host) => {
          // Check if it's a valid IP address
          const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          // Check if it's a valid hostname
          const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
          return ipRegex.test(host) || hostnameRegex.test(host);
        },
        { message: 'Invalid IP address or hostname' }
      ),
    port: z
      .number()
      .min(1, { message: 'Port must be between 1 and 65535' })
      .max(65535, { message: 'Port must be between 1 and 65535' }),
    username: z
      .string()
      .min(1, { message: 'Username is required' })
      .regex(/^[a-zA-Z0-9\-_]+$/, { message: 'Username can only contain alphanumeric characters, hyphens, and underscores' }),
    ssh_password: z
      .string()
      .optional(),
    ssh_private_key_path: z
      .string()
      .optional()
  }).refine((data) => {
    if (authType === AuthenticationType.PASSWORD) {
      return data.ssh_password && data.ssh_password.length > 0;
    } else {
      return data.ssh_private_key_path && data.ssh_private_key_path.length > 0;
    }
  }, {
    message: 'Either SSH password or private key path is required',
    path: authType === AuthenticationType.PASSWORD ? ['ssh_password'] : ['ssh_private_key_path']
  });

  const form = useForm({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: data?.name || '',
      description: data?.description || '',
      host: data?.host || '',
      port: data?.port || 22,
      username: data?.username || '',
      ssh_password: '',
      ssh_private_key_path: ''
    }
  });

  const activeOrganization = useAppSelector((state) => state.user.activeOrganization);

  async function onSubmit(formData: z.infer<typeof serverFormSchema>) {
    try {
      const serverData = {
        name: formData.name,
        description: formData.description || '',
        host: formData.host,
        port: formData.port,
        username: formData.username,
        organization_id: activeOrganization?.id || '',
        ...(authType === AuthenticationType.PASSWORD 
          ? { ssh_password: formData.ssh_password }
          : { ssh_private_key_path: formData.ssh_private_key_path }
        )
      };

      await createServer(serverData).unwrap();
      toast.success('Server created successfully');
      form.reset();
      setOpen?.(false);
    } catch (error) {
      toast.error('Failed to create server');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!id && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Server
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {!id ? 'Add New Server' : 'Update Server'}
          </DialogTitle>
          <DialogDescription>
            Configure your server connection details. Choose either password or private key authentication.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Production Server" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Short Details to identify this server" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.100 or server.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="22" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 22)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="root" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label className="text-sm font-medium">Authentication Method</Label>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="password"
                    name="authType"
                    value={AuthenticationType.PASSWORD}
                    checked={authType === AuthenticationType.PASSWORD}
                    onChange={(e) => setAuthType(e.target.value as AuthenticationType)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input"
                  />
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="private-key"
                    name="authType"
                    value={AuthenticationType.PRIVATE_KEY}
                    checked={authType === AuthenticationType.PRIVATE_KEY}
                    onChange={(e) => setAuthType(e.target.value as AuthenticationType)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input"
                  />
                  <Label htmlFor="private-key">Private Key</Label>
                </div>
              </div>

              {authType === AuthenticationType.PASSWORD ? (
                <FormField
                  control={form.control}
                  name="ssh_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSH Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Your SSH password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="ssh_private_key_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private Key Path</FormLabel>
                      <FormControl>
                        <Input placeholder="/path/to/private/key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOpen?.(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Server'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateServerDialog;
