export const webSocketHandlers = {
  initializeWebSocket() {
    if (process.client) {
      const { $echo } = useNuxtApp();
      if (!$echo) {
        console.error('Echo is not initialized');
        return;
      }

      try {
        console.log('Attempting to connect to WebSocket...');
        
        const channel = $echo.channel('orders-channel');
        
        // Only listen for order-updated events
        channel.listen('.order-updated', (e) => {
          console.log('Order updated via WebSocket:', e);
          this.handleOrderUpdate(e.order);
        });

        console.log('WebSocket listeners attached');
      } catch (error) {
        console.error('WebSocket initialization error:', error);
      }
    }
  },

  handleOrderUpdate(updatedOrder) {
    // Format the order items
    const formattedOrder = {
      ...updatedOrder,
      id: updatedOrder?.id,
      type: updatedOrder?.type,        
      table_id: updatedOrder?.table_id,  
      sub_total: parseFloat(updatedOrder?.sub_total || 0),
      tax: parseFloat(updatedOrder?.tax || 0),
      service: parseFloat(updatedOrder?.service || 0),
      discount: parseFloat(updatedOrder?.discount_value || 0),
      total_amount: parseFloat(updatedOrder?.total_amount || 0),
      items: updatedOrder?.order_items?.map(item => ({
        id: item?.id,
        product_id: item?.product_id,
        quantity: item?.quantity,
        price: parseFloat(item?.price || 0),
        name: item?.product?.name,
        image: item?.product?.image,
        order_id: item?.id,
        note: item?.notes,
        total_amount: parseFloat(item?.total_amount || 0),
        tax: parseFloat(item?.tax || 0),
        service: parseFloat(item?.service || 0),
        discount: parseFloat(item?.discount_value || 0)
      })) || []
    };

    // Update in orders list if exists
    const index = this.orders.findIndex(order => order.id === formattedOrder.id);
    if (index !== -1) {
      // إذا كان الأوردر موجود، نحدث فقط الـ items
      this.orders[index] = {
        ...this.orders[index],
        ...formattedOrder,
        items: formattedOrder.items
      };
    } else {
      // إذا كان أوردر جديد، نضيفه كاملاً
      this.orders.unshift(formattedOrder);
    }

    // Update current order if it's open
    if (this.currentOrder.id === formattedOrder.id) {
      this.currentOrder = {
        ...this.currentOrder,
        ...formattedOrder,
        items: formattedOrder.items
      };
      this.orders[index] = {
        ...this.orders[index],
        ...formattedOrder,
        items: formattedOrder.items
      };
    }
  }
}; 