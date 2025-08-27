'use client';
import React, { useState, useEffect } from 'react';
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
import { useCreateServerMutation, useUpdateServerMutation } from '@/redux/services/settings/serversApi';
import { useTranslation } from '@/hooks/use-translation';
import { Server, AuthenticationType } from '@/redux/types/server';
import { Plus } from 'lucide-react';

interface CreateServerDialogProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  serverId?: string;
  serverData?: Server;
  mode?: 'create' | 'edit';
}

function CreateServerDialog({ open, setOpen, serverId, serverData, mode = 'create' }: CreateServerDialogProps) {
  const { t } = useTranslation();
  const [createServer, { isLoading: isCreating }] = useCreateServerMutation();
  const [updateServer, { isLoading: isUpdating }] = useUpdateServerMutation();

  const isEditMode = mode === 'edit';
  const isLoading = isCreating || isUpdating;

  const [authType, setAuthType] = useState<AuthenticationType>(() => {
    if (isEditMode && serverData) {
      return serverData.ssh_password ? AuthenticationType.PASSWORD : AuthenticationType.PRIVATE_KEY;
    }
    return AuthenticationType.PASSWORD;
  });

  const baseServerSchema = z.object({
    name: z
      .string()
      .min(2, { message: t('servers.create.dialog.validation.nameRequired') })
      .max(255, { message: t('servers.create.dialog.validation.nameMaxLength') }),
    description: z
      .string()
      .max(500, { message: t('servers.create.dialog.validation.descriptionMaxLength') })
      .optional(),
    host: z
      .string()
      .min(1, { message: t('servers.create.dialog.validation.hostRequired') })
      .refine(
        (host) => {
          // Check if it's a valid IP address
          const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          // Check if it's a valid hostname
          const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
          return ipRegex.test(host) || hostnameRegex.test(host);
        },
        { message: t('servers.create.dialog.validation.invalidHost') }
      ),
    port: z
      .number()
      .min(1, { message: t('servers.create.dialog.validation.portRange') })
      .max(65535, { message: t('servers.create.dialog.validation.portRange') }),
    username: z
      .string()
      .min(1, { message: t('servers.create.dialog.validation.usernameRequired') })
      .regex(/^[a-zA-Z0-9\-_]+$/, { message: t('servers.create.dialog.validation.usernameInvalid') }),
    ssh_password: z
      .string()
      .optional(),
    ssh_private_key_path: z
      .string()
      .optional()
  });

  const createServerSchema = baseServerSchema.refine((data) => {
    if (authType === AuthenticationType.PASSWORD) {
      return data.ssh_password && data.ssh_password.length > 0;
    } else {
      return data.ssh_private_key_path && data.ssh_private_key_path.length > 0;
    }
  }, {
    message: t('servers.create.dialog.validation.authRequired'),
    path: authType === AuthenticationType.PASSWORD ? ['ssh_password'] : ['ssh_private_key_path']
  });

  const editServerSchema = baseServerSchema.refine((data) => {
    if (authType === AuthenticationType.PASSWORD && data.ssh_password) {
      return data.ssh_password.length > 0;
    }
    if (authType === AuthenticationType.PRIVATE_KEY && data.ssh_private_key_path) {
      return data.ssh_private_key_path.length > 0;
    }
    return true;
  }, {
    message: t('servers.create.dialog.validation.authRequired'),
    path: authType === AuthenticationType.PASSWORD ? ['ssh_password'] : ['ssh_private_key_path']
  });

  const serverFormSchema = isEditMode ? editServerSchema : createServerSchema;

  const form = useForm({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: serverData?.name || '',
      description: serverData?.description || '',
      host: serverData?.host || '',
      port: serverData?.port || 22,
      username: serverData?.username || '',
      ssh_password: '',
      ssh_private_key_path: serverData?.ssh_private_key_path || ''
    }
  });

  // Reset form when serverData changes (switching between create/edit modes)
  useEffect(() => {
    if (serverData) {
      form.reset({
        name: serverData.name,
        description: serverData.description,
        host: serverData.host,
        port: serverData.port,
        username: serverData.username,
        ssh_password: '',
        ssh_private_key_path: serverData.ssh_private_key_path || ''
      });

      setAuthType(serverData.ssh_password ? AuthenticationType.PASSWORD : AuthenticationType.PRIVATE_KEY);
    } else {
      form.reset({
        name: '',
        description: '',
        host: '',
        port: 22,
        username: '',
        ssh_password: '',
        ssh_private_key_path: ''
      });
      setAuthType(AuthenticationType.PASSWORD);
    }
  }, [serverData, form]);

  async function onSubmit(formData: z.infer<typeof serverFormSchema>) {
    try {
      const baseRequestData = {
        name: formData.name,
        description: formData.description || '',
        host: formData.host,
        port: formData.port,
        username: formData.username
      };

      let requestData;

      if (isEditMode) {
        // In edit mode, only include auth fields if they are provided
        requestData = { ...baseRequestData } as any;
        
        if (authType === AuthenticationType.PASSWORD && formData.ssh_password) {
          (requestData as any).ssh_password = formData.ssh_password;
        }
        
        if (authType === AuthenticationType.PRIVATE_KEY && formData.ssh_private_key_path) {
          (requestData as any).ssh_private_key_path = formData.ssh_private_key_path;
        }
      } else {
        // In create mode, auth fields are required
        requestData = {
          ...baseRequestData,
          ...(authType === AuthenticationType.PASSWORD
            ? { ssh_password: formData.ssh_password }
            : { ssh_private_key_path: formData.ssh_private_key_path }
          )
        };
      }

      if (isEditMode && serverId) {
        await updateServer({ id: serverId, ...requestData }).unwrap();
        toast.success(t('servers.messages.updateSuccess'));
      } else {
        await createServer(requestData).unwrap();
        toast.success(t('servers.messages.createSuccess'));
      }

      form.reset();
      setOpen?.(false);
    } catch (error) {
      if (isEditMode) {
        toast.error(t('servers.messages.updateError'));
      } else {
        toast.error(t('servers.messages.createError'));
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {t('servers.create.button')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {!isEditMode ? t('servers.create.dialog.title.add') : t('servers.create.dialog.title.update')}
          </DialogTitle>
          <DialogDescription>
            {t('servers.create.dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('servers.create.dialog.fields.name.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('servers.create.dialog.fields.name.placeholder')} {...field} />
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
                  <FormLabel>{t('servers.create.dialog.fields.description.label')}</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={t('servers.create.dialog.fields.description.placeholder')}
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
                    <FormLabel>{t('servers.create.dialog.fields.host.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('servers.create.dialog.fields.host.placeholder')} {...field} />
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
                    <FormLabel>{t('servers.create.dialog.fields.port.label')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('servers.create.dialog.fields.port.placeholder')}
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
                  <FormLabel>{t('servers.create.dialog.fields.username.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('servers.create.dialog.fields.username.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label className="text-sm font-medium">{t('servers.create.dialog.fields.authMethod.label')}</Label>
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
                  <Label htmlFor="password">{t('servers.create.dialog.fields.authMethod.password')}</Label>
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
                  <Label htmlFor="private-key">{t('servers.create.dialog.fields.authMethod.privateKey')}</Label>
                </div>
              </div>

              {authType === AuthenticationType.PASSWORD ? (
                <FormField
                  control={form.control}
                  name="ssh_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('servers.create.dialog.fields.sshPassword.label')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={isEditMode 
                            ? "Leave empty to keep current password" 
                            : t('servers.create.dialog.fields.sshPassword.placeholder')
                          } 
                          {...field} 
                        />
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
                      <FormLabel>
                        {t('servers.create.dialog.fields.privateKeyPath.label')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isEditMode 
                            ? "Leave empty to keep current private key path" 
                            : t('servers.create.dialog.fields.privateKeyPath.placeholder')
                          } 
                          {...field} 
                        />
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
                {t('servers.create.dialog.buttons.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? (isEditMode ? t('servers.create.dialog.buttons.updating') : t('servers.create.dialog.buttons.creating'))
                  : (isEditMode ? t('servers.create.dialog.buttons.update') : t('servers.create.dialog.buttons.create'))
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateServerDialog;
