export const orderManagement = {
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

  async placeOrder() {
    try {
      const orderData = {
        type: this.currentOrder.type,
        table_id: this.currentOrder.table_id,
        guest: this.currentOrder.guest,
        shift_id: this.currentOrder.shift_id,
      };

      // Add discount if exists
      if (this.currentOrder.discount && this.currentOrder.discount_type) {
        orderData.discount = {
          type: this.currentOrder.discount_type,
          amount: this.currentOrder.discount
        };
      }

      // Add items only for new orders
      if (!this.currentOrder.id) {
        orderData.items = this.currentOrder.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }));
      }

      // Choose endpoint and method based on whether it's an update or new order
      const endpoint = this.currentOrder.id ? `orders/${this.currentOrder.id}` : 'orders';
      const method = this.currentOrder.id ? 'PUT' : 'POST';

      const response = await useApi(endpoint, method, {
        type: 'object',
        data: orderData
      });

      // تحديث الـ currentOrder بالريسبونس في حالة الأوردر الجديد
      if (!this.currentOrder.id && response) {
        this.updateOrderFromResponse(response.order);
      }

      return response;
    } catch (error) {
      console.error('Order placement/update error:', error);
      throw error;
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

  updateOrderFromResponse(orderData) {
    const formattedItems = orderData.order_items?.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: parseFloat(item.price),
      name: item.product.name,
      image: item.product.image,
      order_id: item.id,
      note: item.notes,
      total_amount: parseFloat(item.total_amount),
      tax: parseFloat(item.tax),
      service: parseFloat(item.service),
      discount: parseFloat(item.discount)
    })) || [];

    this.currentOrder = {
      ...this.currentOrder,
      id: orderData.id,
      code: orderData.code,
      status: orderData.status,
      type: orderData.type,           // تأكد من تحديث النوع
      table_id: orderData.table_id,   // تأكد من تحديث رقم الطاولة
      items: formattedItems,
      tax: parseFloat(orderData.tax || 0),
      service: parseFloat(orderData.service || 0),
      discount: parseFloat(orderData.discount || 0),
      discount_type: orderData.discount_type,
      sub_total: parseFloat(orderData.sub_total || 0),
      total_amount: parseFloat(orderData.total_amount || 0),
    };
  },

  async fetchInitialOrders() {
    try {
      const response = await useApi('orders', 'GET');
      if (response) {
        const formattedOrders = response.map(order => ({
          ...order,
          sub_total: parseFloat(order.sub_total),
          tax: parseFloat(order.tax),
          service: parseFloat(order.service),
          discount: parseFloat(order.discount),
          total_amount: parseFloat(order.total_amount),
          items: order.order_items?.map(item => ({
            ...item,
            price: parseFloat(item.price),
            total_amount: parseFloat(item.total_amount),
            tax: parseFloat(item.tax),
            service: parseFloat(item.service),
            discount: parseFloat(item.discount)
          })),
          order_items: null,
        }));
        
        this.orders = formattedOrders;
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      this.orders = [];
      throw error;
    }
  },

  async updateOrderType(type, table_id = null) {
    if (!this.currentOrder.id) return;

    try {
      await useApi(`orders/${this.currentOrder.id}`, 'PUT', {
        type: 'object',
        data: {
          type: type,
          table_id: table_id
        }
      });
      
      // تحديث البيانات محلياً حتى يأتي التحديث من WebSocket
      this.currentOrder.type = type;
      this.currentOrder.table_id = table_id;

      // تحديث القائمة الرئيسية أيضاً
      const orderIndex = this.orders.findIndex(order => order.id === this.currentOrder.id);
      if (orderIndex !== -1) {
        this.orders[orderIndex] = {
          ...this.orders[orderIndex],
          type: type,
          table_id: table_id
        };
      }
    } catch (error) {
      console.error('Error updating order type:', error);
      throw error;
    }
  },

  openExistingOrder(orderId) {
    const order = this.orders.find(order => order.id === orderId);
    if (order) {
      this.currentOrder = { ...order };
      this.openOrder = true;
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
  }
}; 