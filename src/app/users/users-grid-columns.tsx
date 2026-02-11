import type { User } from '@prisma/client';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import { UserActionsCell } from './UserActionsCell';

export const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  editable: true,
  resizable: true,
  filterParams: {
    filterOptions: [
      'contains',
      'notContains',
      'equals',
      'notEqual',
      'startsWith',
      'endsWith',
      'blank',
      'notBlank',
    ],
  },
};

export function getColumnDefs({
  onSendEmail,
  onSendNotification,
  onDelete,
  onImpersonate,
  isSendingNotification,
  currentUserId,
}: {
  onSendEmail: (_: User) => void;
  onSendNotification: (_: User) => void;
  onDelete: (_: User) => void;
  onImpersonate: (_: User) => void;
  isSendingNotification: boolean;
  currentUserId?: string;
}): ColDef[] {
  return [
    { field: 'name' },
    { field: 'email' },
    {
      field: 'role',
      filter: false,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [null, 'ADMIN', 'STAFF'],
      },
    },
    { field: 'id', editable: false },
    {
      field: 'createdAt',
      editable: false,
      filter: 'agDateColumnFilter',
      filterParams: {
        filterOptions: ['greaterThanOrEqual', 'lessThanOrEqual', 'inRange'],
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (!cellValue) return -1;
          const cellDate = new Date(cellValue);
          const cellDateAtMidnight = new Date(
            cellDate.getFullYear(),
            cellDate.getMonth(),
            cellDate.getDate()
          );

          if (cellDateAtMidnight < filterLocalDateAtMidnight) return -1;
          if (cellDateAtMidnight > filterLocalDateAtMidnight) return 1;
          return 0;
        },
      },
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString() : '',
    },
    {
      field: 'updatedAt',
      editable: false,
      filter: 'agDateColumnFilter',
      filterParams: {
        filterOptions: ['greaterThanOrEqual', 'lessThanOrEqual', 'inRange'],
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (!cellValue) return -1;
          const cellDate = new Date(cellValue);
          const cellDateAtMidnight = new Date(
            cellDate.getFullYear(),
            cellDate.getMonth(),
            cellDate.getDate()
          );

          if (cellDateAtMidnight < filterLocalDateAtMidnight) return -1;
          if (cellDateAtMidnight > filterLocalDateAtMidnight) return 1;
          return 0;
        },
      },
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString() : '',
    },
    {
      headerName: 'Actions',
      field: 'actions',
      editable: false,
      cellClass: 'flex justify-center items-center',
      width: 80,
      resizable: false,
      filter: false,
      sortable: false,
      pinned: 'right',
      cellRenderer: function (params: ICellRendererParams<User>) {
        return React.createElement(UserActionsCell, {
          ...params,
          onSendEmail,
          onSendNotification,
          onDelete,
          onImpersonate,
          isSendingNotification,
          currentUserId,
        });
      },
    },
  ];
}
