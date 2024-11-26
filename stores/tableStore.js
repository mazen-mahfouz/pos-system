import { defineStore } from 'pinia';

export const useTableStore = defineStore('table', {
  state: () => ({
    tables: []
  }),

  actions: {
    async fetchInitialTables() {
      try {
        const response = await useApi('tables', 'GET');
        this.tables = response || [];
      } catch (error) {
        console.error('Error fetching tables:', error);
        this.tables = [];
      }
    },

    handleTableUpdate(updatedTable) {
      const index = this.tables.findIndex(table => table.id === updatedTable.id);
      if (index !== -1) {
        this.tables[index] = {
          ...this.tables[index],
          ...updatedTable,
          is_free: updatedTable.is_free,
          waiter: updatedTable.waiter,
          created_at: updatedTable.created_at
        };
      } else {
        this.tables.push(updatedTable);
      }
    },

    initializeWebSocket() {
      if (process.client) {
        const { $echo } = useNuxtApp();
        
        if (!$echo) {
          console.error('Echo is not initialized');
          return;
        }

        try {
          console.log('Attempting to connect to Tables WebSocket...');
          
          const channel = $echo.channel('table-channel');
          
          channel.listen('.table-updated', (e) => {
            console.log('Table updated via WebSocket:', e);
            this.handleTableUpdate(e.table);
          });

          console.log('Table WebSocket listener attached');
        } catch (error) {
          console.error('Table WebSocket initialization error:', error);
        }
      }
    }
  }
}); 