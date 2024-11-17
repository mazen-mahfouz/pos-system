import { defineStore } from 'pinia';

export const useOrderStore = defineStore('order', {
  state: () => ({
    openOrder: false,
    orders: [],
    pendingItem: null,
    isButtonDisabled: false,
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
    },
  }),
  getters: {
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
    },
  },
  actions: {
    createNewOrder(type, table_id) {
      this.currentOrder = {
        id: null,
        guest: '',
        type: type,
        table_id: table_id,
        items: [],
        shift_id: useCookie('PosUserData').value.shift,
        discount: 0,
        discount_type: null,
      };
      this.openOrder = true;

      if (this.pendingItem) {
        this.addItemToOrder(this.pendingItem);
        this.pendingItem = null;
      }
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
      };
      this.openOrder = false;
    },
    async addItemToOrder(item) {
      if (this.isButtonDisabled) return;
      
      this.setButtonDisabled(true);
      try {
        const existingItem = this.currentOrder.items.find(i => i.product_id === item.id);
        if (existingItem) {
          existingItem.quantity++;
          this.updateOrderTotals();
          if (!this.currentOrder.id) {
            await this.placeOrder();
          }
        } else {
          this.currentOrder.items.push({
            product_id: item.id,
            quantity: 1,
            name: item.name,
            price: item.price,
            image: item.image,
            order_id: null
          });
          this.updateOrderTotals();
          if (!this.currentOrder.id) {
            await this.placeOrder();
          }
        }

        if (this.currentOrder.id) {
          useApi('orderItem', 'POST', {
            type: 'object',
            data: {
              order_id: this.currentOrder.id,
              product_id: item.id,
              quantity: existingItem ? existingItem.quantity : 1
            }
          })
          .then(response => {
            const updatedItem = this.currentOrder.items.find(i => i.product_id === item.id);
            if (updatedItem) {
              updatedItem.order_id = response.order_item.id;
            }
            this.updateOrderFromResponse(response.order_item.order);
          })
          .catch(error => {
            console.error('Error adding item to order:', error);
          });
        }
      } finally {
        setTimeout(() => {
          this.setButtonDisabled(false);
        }, 500);
      }
    },
    updateOrderTotals() {
      let subtotal = 0;
      
      // Calculate subtotal including item-level discounts
      this.currentOrder.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        if (item.discount) {
          if (item.discount_type === 'percentage') {
            subtotal += itemTotal * (1 - item.discount / 100);
          } else {
            subtotal += Math.max(itemTotal - item.discount, 0);
          }
        } else {
          subtotal += itemTotal;
        }
      });

      // Apply order-level discount if exists
      if (this.currentOrder.discount) {
        if (this.currentOrder.discount_type === 'percentage') {
          subtotal *= (1 - this.currentOrder.discount / 100);
        } else {
          subtotal = Math.max(subtotal - this.currentOrder.discount, 0);
        }
      }

      this.currentOrder.sub_total = subtotal;
      this.currentOrder.tax = subtotal * 0.20; // Assuming 20% tax rate
      this.currentOrder.total_amount = subtotal + this.currentOrder.tax;
    },
    updateDiscount(discountData) {
      this.currentOrder.discount = discountData;
    },
    removeDiscount() {
      this.currentOrder.discount = 0;
    },
    increaseQuantity(productId) {
      if (this.isButtonDisabled) return;
      
      this.setButtonDisabled(true);
      try {
        const item = this.currentOrder.items.find(i =>  i.id ? i.id : i.order_id === productId);
        if (!item) return;

        item.quantity++;
        this.updateOrderTotals();
        console.log(productId)
        if (this.currentOrder.id) {
          useApi(`orderItem/${productId}`, 'PUT', {
            type: 'object',
            data: {
              quantity: item.quantity
            }
          })
          .then(response => {
            if (response.order_item.order) {
              this.updateOrderFromResponse(response.order_item.order);
            }
          })
          .catch(error => {
            item.quantity--;
            this.updateOrderTotals();
            console.error('Failed to update quantity:', error);
          });
        }
      } finally {
        setTimeout(() => {
          this.setButtonDisabled(false);
        }, 500);
      }
    },
    decreaseQuantity(productId) {
      const item = this.currentOrder.items.find(i => i.product_id === productId);
      if (!item) {
        return;
      }

      if (item.quantity <= 1) {
        return;
      }

      item.quantity--;
      this.updateOrderTotals();

      if (this.currentOrder.id) {
        useApi(`orderItem/${this.currentOrder.id}/${productId}`, 'PUT', {
          type: 'object',
          data: {
            quantity: item.quantity
          }
        })
          .then(response => {
            if (response.order) {
              this.updateOrderFromResponse(response.order);
            }
          })
          .catch(error => {
            item.quantity++;
            this.updateOrderTotals();
          });
      }
    },
    removeItem(productId) {
      const itemIndex = this.currentOrder.items.findIndex(i => i.product_id === productId);
      if (itemIndex === -1) {
        return;
      }

      this.currentOrder.items.splice(itemIndex, 1);
      this.updateOrderTotals();
      this.placeOrder();






      // if (this.currentOrder.id) {
      //   useApi(`orderItem/${productId}`, 'DELETE')
      //     .then(response => {
      //       if (response.order) {
      //         this.updateOrderFromResponse(response.order);
      //       }
      //     })
      //     .catch(error => {
      //       this.currentOrder.items.splice(itemIndex, 0, removedItem);
      //       this.updateOrderTotals();
      //     });
      // }
    },
    setOrderName(name) {
      this.currentOrder.guest = name;
    },
    placeOrder() {
      const orderData = {
        guest: this.currentOrder.guest,
        type: this.currentOrder.type,
        table_id: this.currentOrder.table_id,
        shift_id: this.currentOrder.shift_id,
        items: this.currentOrder.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          discount: item.discount,
          discount_type: item.discount_type,
          note: item.note
        }))
      };

      const method = this.currentOrder.id ? 'PUT' : 'POST';
      const endpoint = this.currentOrder.id ? `orders/${this.currentOrder.id}` : 'orders';

      useApi(endpoint, method, {
        type: 'object',
        data: orderData,
      })
        .then((response) => {
          const updatedItems = response.order.order_items.map(orderItem => ({
            product_id: orderItem.product_id,
            quantity: orderItem.quantity,
            price: parseFloat(orderItem.price),
            order_id: orderItem.id,
            name: orderItem.product.name,
            image: orderItem.product.image
          }));
          
          this.currentOrder.items = updatedItems;
          this.updateOrderFromResponse(response.order);
          
          if (this.currentOrder.id) {
            this.editOrder(this.currentOrder.id, { ...this.currentOrder });
          } else {
            this.addOrder({ ...this.currentOrder });
          }
        })
        .catch((error) => {
          console.error('Order placement/update error:', error);
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
        })),
        shift_id: orderData.shift_id,
        sub_total: orderData.sub_total,
        tax: orderData.tax,
        discount: orderData.discount,
        discount_type: orderData.discount_type,
        total_amount: orderData.total_amount,
      };
    },
    updateOrderFromResponse(orderData) {
      this.currentOrder = {
        ...this.currentOrder,
        id: orderData.id,
        code: orderData.code,
        status: orderData.status,
        tax: parseFloat(orderData.tax),
        service: parseFloat(orderData.service),
        discount: parseFloat(orderData.discount),
        discount_type: orderData.discount_type,
        sub_total: parseFloat(orderData.sub_total),
        total_amount: parseFloat(orderData.total_amount),
      };
      this.updateOrderTotals();
    },
    setPendingItem(item) {
      this.pendingItem = item;
    },
    setButtonDisabled(value) {
      this.isButtonDisabled = value;
    },
    updateItemDiscount(itemId, discountData) {
      const item = this.currentOrder.items.find(item => item.product_id === itemId);
      if (item) {
        item.discount = discountData?.discount || null;
        item.discount_type = discountData?.discount_type || null;
        this.updateOrderTotals();
      }
    },
    updateItemNote(itemId, note) {
      const item = this.currentOrder.items.find(item => item.product_id === itemId);
      if (item) {
        item.note = note;
      }
    },
  },
});
