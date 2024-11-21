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
        this.tables[index] = updatedTable;
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
          const channel = $echo.channel('tables-channel');
          
          channel.listen('.table-updated', (e) => {
            console.log('Table updated via WebSocket:', e);
            this.handleTableUpdate(e.table);
          });

        } catch (error) {
          console.error('WebSocket initialization error:', error);
        }
      }
    }
  }
}); 