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
      type: '',
      table_id: null,
      items: [],
      shift_id: null,
      sub_total: 0,
      tax: 0,
      discount: 0,
      total_amount: 0,
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
        id: null, // Устанавливаем id в null для нового заказа
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
      const orderData = {
        table_id: this.currentOrder.table_id || null,
        type: this.currentOrder.type,
        guest: this.currentOrder.guest,
        shift_id: this.currentOrder.shift_id,
        items: this.currentOrder.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      if (this.currentOrder.discount && this.currentOrder.discount.type && this.currentOrder.discount.amount > 0) {
        orderData.discount = {
          type: this.currentOrder.discount.type,
          amount: this.currentOrder.discount.amount
        };
      }

      const method = this.currentOrder.id ? 'PUT' : 'POST';
      const endpoint = this.currentOrder.id ? `orders/${this.currentOrder.id}` : 'orders';

      useApi(endpoint, method, {
        type: 'object',
        data: orderData,
      })
        .then((response) => {
          this.updateOrderFromResponse(response.order);
          console.log('Order placed/updated successfully:', response);
          if (this.currentOrder.id) {
            this.editOrder(this.currentOrder.id, { ...this.currentOrder });
          } else {
            this.addOrder({ ...this.currentOrder });
          }
          // this.closeOrder();
          // Show success notification
        })
        .catch((error) => {
          console.error('Order placement/update error:', error);
          // Handle error and show error notification
        });
    },
    cancelOrder() {
      this.closeOrder();
    },
    setOrderFromResponse(orderData) {
      this.currentOrder = {
        id: orderData.id,
        guest: orderData.guest || '',
        type: orderData.type || '',
        table_id: orderData.table_id,
        items: orderData.order_items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price),
          // Add other necessary item properties
        })),
        shift_id: orderData.shift_id,
        sub_total: orderData.sub_total,
        tax: orderData.tax,
        discount: orderData.discount,
        total_amount: orderData.total_amount,
      };
    },
    updateOrderFromResponse(orderData) {
      this.currentOrder = {
        ...this.currentOrder,
        id: orderData.id,
        code: orderData.code,
        status: orderData.status,
        tax: orderData.tax,
        discount: orderData.discount,
        service: orderData.service,
        sub_total: orderData.sub_total,
        total_amount: orderData.total_amount,
        items: orderData.order_items.map(item => ({
          ...item,
          product: this.currentOrder.items.find(i => i.product_id === item.product_id)?.product
        }))
      };
    },
  },
});
