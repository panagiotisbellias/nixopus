'use client';
import React, { useState } from 'react';
import DashboardPageHeader from '@/components/layout/dashboard-page-header';
import { ResourceGuard } from '@/components/rbac/PermissionGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllServersQuery } from '@/redux/services/settings/serversApi';
import { GetServersRequest } from '@/redux/types/server';
import { useTranslation } from '@/hooks/use-translation';
import CreateServerDialog from './components/create-server';
import ServersTable from './components/servers-table';

function Page() {
  const { t } = useTranslation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [queryParams, setQueryParams] = useState<GetServersRequest>({
    page: 1,
    page_size: 10,
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const { data: serverResponse, isLoading, error } = useGetAllServersQuery(queryParams);

  const handleQueryChange = (newParams: Partial<GetServersRequest>) => {
    setQueryParams(prev => ({ ...prev, ...newParams }));
  };

  return (
    <ResourceGuard
      resource="server"
      action="read"
      loadingFallback={<Skeleton className="h-96" />}
    >
      <div className="container mx-auto py-6 space-y-8 max-w-6xl">
        <div className="flex justify-between items-center">
          <DashboardPageHeader
            label={t('servers.page.title')}
            description={t('servers.page.description')}
          />
          <ResourceGuard resource="server" action="create">
            <CreateServerDialog
              open={createDialogOpen}
              setOpen={setCreateDialogOpen}
            />
          </ResourceGuard>
        </div>

        <div className="space-y-6">
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{t('servers.page.error')}</p>
            </div>
          ) : (
            <ServersTable
              servers={serverResponse?.servers || []}
              pagination={serverResponse?.pagination}
              isLoading={isLoading}
              queryParams={queryParams}
              onQueryChange={handleQueryChange}
            />
          )}
        </div>
      </div>
    </ResourceGuard>
  );
}

export default Page;
