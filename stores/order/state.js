export const state = () => ({
  openOrder: true,
  orders: [],
  pendingItem: null,
  isProcessing: false,
  currentOrder: {
    id: null,
    guest: '',
    type: '',
    table_id: null,
    items: [],
    shift_id: null,
    sub_total: 0,
    tax: 0,
    discount: 0,
    discount_type: null,
    total_amount: 0,
    service: 0,
  }
}); 