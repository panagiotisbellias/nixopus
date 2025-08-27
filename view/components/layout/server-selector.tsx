'use client';

import React, { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Server } from '@/redux/types/server';
import {
  useGetAllServersQuery,
  useGetActiveServerQuery,
  useUpdateServerStatusMutation
} from '@/redux/services/settings/serversApi';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setActiveServer, clearActiveServer } from '@/redux/features/servers/serverSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { ServerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface ServerSelectorProps {
  className?: string;
}

const getStatusLabel = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'active':
      return t('servers.selector.status.active');
    case 'maintenance':
      return t('servers.selector.status.maintenance');
    case 'inactive':
    default:
      return t('servers.selector.status.inactive');
  }
};

export function ServerSelector({ className }: ServerSelectorProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeServer = useAppSelector((state) => state.server.activeServer);

  const { data: serverResponse, isLoading: isServersLoading } = useGetAllServersQuery({
    page: 1,
    page_size: 100,
    sort_by: 'name',
    sort_order: 'asc'
  });

  const { data: apiActiveServer, isLoading: isActiveServerLoading } = useGetActiveServerQuery();

  const [updateServerStatus] = useUpdateServerStatusMutation();

  const servers = serverResponse?.servers || [];

  useEffect(() => {
    if (apiActiveServer && (!activeServer || activeServer.id !== apiActiveServer.id)) {
      dispatch(setActiveServer(apiActiveServer));
    } else if (!apiActiveServer && activeServer) {
      dispatch(clearActiveServer());
    }
  }, [apiActiveServer, activeServer, dispatch]);

  const handleServerChange = async (value: string) => {
    if (value === 'default') {
      if (activeServer) {
        try {
          await updateServerStatus({
            id: activeServer.id,
            status: 'inactive'
          }).unwrap();
          dispatch(clearActiveServer());
        } catch (error) {
          console.error('Failed to deactivate server:', error);
        }
      }
    } else {
      const selectedServer = servers.find((server: Server) => server.id === value);
      if (selectedServer) {
        try {
          await updateServerStatus({
            id: selectedServer.id,
            status: 'active'
          }).unwrap();
        } catch (error) {
          console.error('Failed to activate server:', error);
        }
      }
    }
  };

  if (isServersLoading || isActiveServerLoading) {
    return <Skeleton className="h-9 w-[200px]" />;
  }

  if (!servers.length) {
    return null;
  }

  return (
    <Select
      value={activeServer?.id || 'default'}
      onValueChange={handleServerChange}
    >
      <SelectTrigger className={cn('w-[200px]', className)}>
        <div className="flex items-center gap-2">
          <ServerIcon className="h-4 w-4" />
          <SelectValue placeholder={t('servers.selector.placeholder')}>
            {activeServer ? (
              <span>{activeServer.name}</span>
            ) : (
              t('servers.selector.default')
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">
          <div className="flex items-center gap-2">
            <span>{t('servers.selector.default')}</span>
          </div>
        </SelectItem>
        {servers.map((server: Server) => (
          <SelectItem key={server.id} value={server.id}>
            <div className="flex items-center gap-2">
              <span>{server.name}</span>
              <span className="text-xs text-muted-foreground">{getStatusLabel(server.status, t)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
