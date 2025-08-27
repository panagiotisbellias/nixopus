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
import { useGetAllServersQuery } from '@/redux/services/settings/serversApi';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setActiveServer, setActiveServerId } from '@/redux/features/servers/serverSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { ServerIcon } from 'lucide-react';

interface ServerSelectorProps {
  className?: string;
}

export function ServerSelector({ className }: ServerSelectorProps) {
  const dispatch = useAppDispatch();
  const activeOrg = useAppSelector((state) => state.user.activeOrganization);
  const activeServerId = useAppSelector((state) => state.server.activeServerId);
  
  const { data: serverResponse, isLoading } = useGetAllServersQuery({
    organization_id: activeOrg?.id || '',
    page: 1,
    page_size: 100,
    sort_by: 'name',
    sort_order: 'asc'
  });

  const servers = serverResponse?.servers || [];

  const handleServerChange = (value: string) => {
    if (value === 'default') {
      dispatch(setActiveServerId(null));
    } else {
      const selectedServer = servers.find((server: Server) => server.id === value);
      if (selectedServer) {
        dispatch(setActiveServer(selectedServer));
      } else {
        dispatch(setActiveServerId(value));
      }
    }
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-[200px]" />;
  }

  if (!servers.length) {
    return null;
  }

  return (
    <Select
      value={activeServerId || 'default'}
      onValueChange={handleServerChange}
    >
      <SelectTrigger className={`w-[200px] ${className || ''}`}>
        <div className="flex items-center gap-2">
          <ServerIcon className="h-4 w-4" />
          <SelectValue placeholder="Select server" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Default</SelectItem>
        {servers.map((server: Server) => (
          <SelectItem key={server.id} value={server.id}>
            <div className="flex items-center gap-2">
              <span>{server.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
