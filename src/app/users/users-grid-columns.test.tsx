import { describe, expect, it, vi } from 'vitest';
import { defaultColDef, getColumnDefs } from './users-grid-columns';

describe('users-grid-columns', () => {
  const mockHandlers = {
    onSendEmail: vi.fn(),
    onSendNotification: vi.fn(),
    onDelete: vi.fn(),
    onImpersonate: vi.fn(),
    isSendingNotification: false,
    currentUserId: 'user-123',
  };

  describe('defaultColDef', () => {
    it('has correct default properties', () => {
      expect(defaultColDef.sortable).toBe(true);
      expect(defaultColDef.filter).toBe(true);
      expect(defaultColDef.editable).toBe(true);
      expect(defaultColDef.resizable).toBe(true);
    });

    it('includes filter options', () => {
      expect(defaultColDef.filterParams?.filterOptions).toContain('contains');
      expect(defaultColDef.filterParams?.filterOptions).toContain('equals');
      expect(defaultColDef.filterParams?.filterOptions).toContain('blank');
    });
  });

  describe('getColumnDefs', () => {
    it('returns array of column definitions', () => {
      const columns = getColumnDefs(mockHandlers);

      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('includes all expected fields', () => {
      const columns = getColumnDefs(mockHandlers);
      const fields = columns.map((col) => col.field).filter(Boolean);

      expect(fields).toContain('name');
      expect(fields).toContain('email');
      expect(fields).toContain('role');
      expect(fields).toContain('id');
      expect(fields).toContain('createdAt');
      expect(fields).toContain('updatedAt');
    });

    it('configures role field with select editor', () => {
      const columns = getColumnDefs(mockHandlers);
      const roleColumn = columns.find((col) => col.field === 'role');

      expect(roleColumn?.cellEditor).toBe('agSelectCellEditor');
      expect(roleColumn?.cellEditorParams?.values).toContain('ADMIN');
      expect(roleColumn?.cellEditorParams?.values).toContain('STAFF');
    });

    it('makes id field non-editable', () => {
      const columns = getColumnDefs(mockHandlers);
      const idColumn = columns.find((col) => col.field === 'id');

      expect(idColumn?.editable).toBe(false);
    });

    it('configures date columns with date filter', () => {
      const columns = getColumnDefs(mockHandlers);
      const createdAtColumn = columns.find((col) => col.field === 'createdAt');

      expect(createdAtColumn?.filter).toBe('agDateColumnFilter');
      expect(createdAtColumn?.editable).toBe(false);
    });

    it('formats date values correctly', () => {
      const columns = getColumnDefs(mockHandlers);
      const createdAtColumn = columns.find((col) => col.field === 'createdAt');

      const testDate = new Date('2024-01-01T12:00:00Z');
      const formatter = createdAtColumn?.valueFormatter;

      // Check that formatter exists and is a function
      expect(formatter).toBeDefined();
      expect(typeof formatter).toBe('function');

      if (typeof formatter === 'function') {
        const formatted = formatter({
          value: testDate.toISOString(),
        } as never);

        // eslint-disable-next-line vitest/no-conditional-expect
        expect(formatted).toBeTruthy();
        // eslint-disable-next-line vitest/no-conditional-expect
        expect(typeof formatted).toBe('string');
      }
    });

    it('configures actions column correctly', () => {
      const columns = getColumnDefs(mockHandlers);
      const actionsColumn = columns.find((col) => col.field === 'actions');

      expect(actionsColumn?.headerName).toBe('Actions');
      expect(actionsColumn?.editable).toBe(false);
      expect(actionsColumn?.filter).toBe(false);
      expect(actionsColumn?.sortable).toBe(false);
      expect(actionsColumn?.pinned).toBe('right');
      expect(actionsColumn?.cellRenderer).toBeDefined();
    });

    it('actions column has custom cell renderer', () => {
      const columns = getColumnDefs(mockHandlers);
      const actionsColumn = columns.find((col) => col.field === 'actions');

      expect(typeof actionsColumn?.cellRenderer).toBe('function');
    });
  });
});
