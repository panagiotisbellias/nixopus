'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Server as ServerIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteServerMutation } from '@/redux/services/settings/serversApi';
import { Server, Pagination, GetServersRequest } from '@/redux/types/server';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import ServersTableSkeleton from './servers-table-skeleton';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { SearchBar } from '@/components/ui/search-bar';
import { SortSelect, SortOption } from '@/components/ui/sort-selector';
import PaginationWrapper from '@/components/ui/pagination';

interface ServersTableProps {
  servers: Server[];
  pagination?: Pagination;
  isLoading: boolean;
  queryParams: GetServersRequest;
  onQueryChange: (params: Partial<GetServersRequest>) => void;
}

function ServersTable({ servers, pagination, isLoading, queryParams, onQueryChange }: ServersTableProps) {
  const { t } = useTranslation();
  const [deleteServer] = useDeleteServerMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);

  const sortOptions: SortOption<Server>[] = [
    { value: 'name', label: t('servers.table.sort.name_asc'), direction: 'asc' },
    { value: 'name', label: t('servers.table.sort.name_desc'), direction: 'desc' },
    { value: 'host', label: t('servers.table.sort.host_asc'), direction: 'asc' },
    { value: 'host', label: t('servers.table.sort.host_desc'), direction: 'desc' },
    { value: 'port', label: t('servers.table.sort.port_asc'), direction: 'asc' },
    { value: 'port', label: t('servers.table.sort.port_desc'), direction: 'desc' },
    { value: 'username', label: t('servers.table.sort.username_asc'), direction: 'asc' },
    { value: 'username', label: t('servers.table.sort.username_desc'), direction: 'desc' },
    { value: 'created_at', label: t('servers.table.sort.created_newest'), direction: 'desc' },
    { value: 'created_at', label: t('servers.table.sort.created_oldest'), direction: 'asc' }
  ];

  const currentSortOption = sortOptions.find(
    option => option.value === queryParams.sort_by && option.direction === queryParams.sort_order
  ) || sortOptions[8];

  const handleDeleteClick = (server: Server) => {
    setServerToDelete(server);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serverToDelete) return;

    try {
      setDeletingId(serverToDelete.id);
      await deleteServer({ id: serverToDelete.id }).unwrap();
      toast.success(t('servers.messages.deleteSuccess'));
      setDeleteDialogOpen(false);
      setServerToDelete(null);
    } catch (error) {
      toast.error(t('servers.messages.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange({ search: e.target.value, page: 1 });
  };

  const handleSortChange = (newSortOption: SortOption<Server>) => {
    onQueryChange({ 
      sort_by: newSortOption.value as string, 
      sort_order: newSortOption.direction,
      page: 1 
    });
  };

  const handlePageSizeChange = (newPageSize: string) => {
    onQueryChange({ page_size: Number(newPageSize), page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onQueryChange({ page: newPage });
  };

  if (isLoading) {
    return <ServersTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <SearchBar
            searchTerm={queryParams.search || ''}
            handleSearchChange={handleSearchChange}
            label={t('servers.table.search.placeholder')}
          />
          <SortSelect
            options={sortOptions}
            currentSort={currentSortOption}
            onSortChange={handleSortChange}
            placeholder={t('servers.table.sort.placeholder')}
            className="w-full sm:w-[200px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">{t('servers.table.pagination.itemsPerPage')}</span>
          <Select value={queryParams.page_size?.toString() || '10'} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!servers?.length ? (
        <div className="text-center py-12 border rounded-lg">
          <ServerIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">{t('servers.table.empty.noServers.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('servers.table.empty.noServers.description')}
          </p>
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <ServerIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">{t('servers.table.empty.noResults.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('servers.table.empty.noResults.description')}
          </p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('servers.table.headers.name')}</TableHead>
                  <TableHead>{t('servers.table.headers.host')}</TableHead>
                  <TableHead>{t('servers.table.headers.port')}</TableHead>
                  <TableHead>{t('servers.table.headers.username')}</TableHead>
                  <TableHead>{t('servers.table.headers.created')}</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{server.name}</div>
                  {server.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {server.description}
                          </div>
                  )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {server.host}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{server.port}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {server.username}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(server.created_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            {t('servers.actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => handleDeleteClick(server)}
                            disabled={deletingId === server.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingId === server.id ? t('servers.actions.deleting') : t('servers.actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center">
              <PaginationWrapper
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('servers.delete.dialog.title')}
        description={t('servers.delete.dialog.description', { name: serverToDelete?.name || '' })}
        onConfirm={handleDeleteConfirm}
        confirmText={deletingId ? t('servers.delete.dialog.buttons.deleting') : t('servers.delete.dialog.buttons.delete')}
        isDeleting={!!deletingId}
        variant="destructive"
        icon={Trash2}
      />
    </div>
  );
}

export default ServersTable;
