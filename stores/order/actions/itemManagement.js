export const itemManagement = {
  async addItemToOrder(item) {
    this.isProcessing = true;
    try {
      const existingItem = this.currentOrder.items.find(i => 
        i.product_id === item.id || 
        i.id === item.id || 
        i.order_id === item.id
      );

      if (existingItem) {
        await this.increaseQuantity(existingItem.id || existingItem.order_id);
        return;
      }

      // إضافة العنصر الجديد للطلب الحالي
      this.currentOrder.items.push({
        product_id: item.id,
        quantity: 1,
        name: item.name,
        price: item.price,
        image: item.image,
        order_id: null
      });

      // إذا لم يكن هناك طلب حالي، قم بإنشاء طلب جديد
      if (!this.currentOrder.id) {
        await this.placeOrder();
      } else {
        // إذا كان هناك طلب حالي، أضف العنصر فقط
        const response = await useApi('orderItem', 'POST', {
          type: 'object',
          data: {
            order_id: this.currentOrder.id,
            product_id: item.id,
            quantity: 1
          }
        });
      }
    } catch (error) {
      console.error('Error adding item to order:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  },

  async increaseQuantity(itemId) {
    this.isProcessing = true;
    try {
      const item = this.currentOrder.items.find(i => i.id === itemId || i.order_id === itemId);
      if (!item) return;

      item.quantity++;
      
      if (this.currentOrder.id) {
        await useApi(`orderItem/${itemId}`, 'PUT', {
          type: 'object',
          data: {
            quantity: item.quantity
          }
        });
      }
    } catch (error) {
      const item = this.currentOrder.items.find(i => i.id === itemId || i.order_id === itemId);
      if (item) item.quantity--;
      console.error('Failed to update quantity:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  },

  decreaseQuantity(productId) {
    const item = this.currentOrder.items.find(i => i.product_id === productId);
    if (!item || item.quantity <= 1) return;

    item.quantity--;

    if (this.currentOrder.id) {
      useApi(`orderItem/${this.currentOrder.id}/${productId}`, 'PUT', {
        type: 'object',
        data: {
          quantity: item.quantity
        }
      })
      .catch(error => {
        item.quantity++;
      });
    }
  },

  removeItem(productId) {
    const itemIndex = this.currentOrder.items.findIndex(i => i.product_id === productId);
    if (itemIndex === -1) return;

    this.currentOrder.items.splice(itemIndex, 1);
    
    if (this.currentOrder.id) {
      useApi(`orderItem/${productId}`, 'DELETE')
        .catch(error => {
          console.error('Error removing item:', error);
        });
    }
  },

  async updateItemDiscount(itemId, discountData) {
    try {
      await useApi(`orderItem/${itemId}/discount`, 'POST', {
        type: 'object',
        data: {
          type: discountData.type,
          amount: discountData.amount
        }
      });
      // WebSocket سيقوم بتحديث البيانات تلقائياً
    } catch (error) {
      console.error('Error updating item discount:', error);
      throw error;
    }
  },

  async updateItemNote(itemId, note) {
    console.log('sadas')

    try {
      await useApi(`orderItem/${itemId}/add_note`, 'PUT', {
        type: 'object',
        data: {
          notes: note
        }
      });
      // WebSocket سيقوم بتحديث البيانات تلقائياً
    } catch (error) {
      console.error('Error updating item note:', error);
      throw error;
    }
  },

  setPendingItem(item) {
    this.pendingItem = item;
  }
}; 