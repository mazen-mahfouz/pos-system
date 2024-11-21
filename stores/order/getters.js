export const getters = {
  subtotal() {
    return this.currentOrder.sub_total || 0;
  },
  tax() {
    return this.currentOrder.tax || 0;
  },
  discountAmount() {
    return this.currentOrder.discount || 0;
  },
  total() {
    return this.currentOrder.total_amount || 0;
  }
}; 