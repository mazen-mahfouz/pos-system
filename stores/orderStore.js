import { defineStore } from 'pinia';

export const useOrderStore = defineStore('order', {
  state: () => ({
    openOrder: false,
    orders: [
      // ... (الأوامر الموجودة مسبقًا)
    ],
    currentOrder: {
      id: null,
      guest: '',
      type: null,
      table_id: null,
      items: [],
      shift_id: 1,
      discount: {
        type: null,
        amount: 0
      }
    },
  }),
  getters: {
    subtotal() {
      return this.currentOrder.items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    tax() {
      return this.subtotal * 0.1; // افتراض ضريبة 10%
    },
    discountAmount() {
      if (this.currentOrder.discount && this.currentOrder.discount.type === 'cash') {
        return this.currentOrder.discount.amount;
      } else if (this.currentOrder.discount && this.currentOrder.discount.type === 'percentage') {
        return this.subtotal * (this.currentOrder.discount.amount / 100);
      }
      return 0;
    },
    total() {
      return this.subtotal + this.tax - this.discountAmount;
    },
  },
  actions: {
    createNewOrder(type, table_id) {
      this.currentOrder = {
        id: Date.now(),
        guest: '',
        type: type,
        table_id: table_id,
        items: [],
        shift_id: 1,
        discount: {
          type: null,
          amount: 0
        }
      };
      this.openOrder = true;
    },
    addOrder(order) {
      this.orders.push(order);
    },
    editOrder(orderId, updatedOrder) {
      const index = this.orders.findIndex(order => order.id === orderId);
      if (index !== -1) {
        this.orders[index] = updatedOrder;
      }
    },
    openExistingOrder(orderId) {
      const order = this.orders.find(order => order.id === orderId);
      if (order) {
        this.currentOrder = { ...order };
        this.openOrder = true;
      }
    },
    closeOrder() {
      this.currentOrder = {
        id: null,
        guest: '',
        type: null,
        table_id: null,
        items: [],
        shift_id: 1,
        discount: {
          type: null,
          amount: 0
        }
      };
      this.openOrder = false;
    },
    addItemToOrder(item) {
      const existingItem = this.currentOrder.items.find(i => i.product_id === item.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.currentOrder.items.push({
          product_id: item.id,
          quantity: 1,
          name: item.name,
          price: item.price,
          image: item.image
        });
      }
    },
    updateDiscount(discount) {
      this.currentOrder.discount = discount;
    },
    increaseQuantity(productId) {
      const item = this.currentOrder.items.find(i => i.product_id === productId);
      if (item) {
        item.quantity++;
      }
    },
    decreaseQuantity(productId) {
      const item = this.currentOrder.items.find(i => i.product_id === productId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          this.removeItem(productId);
        }
      }
    },
    removeItem(productId) {
      this.currentOrder.items = this.currentOrder.items.filter(i => i.product_id !== productId);
    },
    setOrderName(name) {
      this.currentOrder.guest = name;
    },
    placeOrder() {
      if (this.currentOrder.id) {
        this.editOrder(this.currentOrder.id, { ...this.currentOrder });
      } else {
        this.addOrder({ ...this.currentOrder });
      }
      this.closeOrder();
    },
    cancelOrder() {
      this.closeOrder();
    },
  },
});