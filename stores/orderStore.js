import { defineStore } from 'pinia';
import { state } from './order/state';
import { getters } from './order/getters';
import { actions } from './order/actions';

export const useOrderStore = defineStore('order', {
  state,
  getters,
  actions
}); 

// import { defineStore } from 'pinia';

// export const useOrderStore = defineStore('order', {
//   state: () => ({
//     openOrder: false,
//     orders: [],
//     pendingItem: null,
//     currentOrder: {
//       id: null,
//       guest: '',
//       type: '',
//       table_id: null,
//       items: [],
//       shift_id: null,
//       sub_total: 0,
//       tax: 0,
//       discount: 0,
//       discount_type: null,
//       total_amount: 0,
//       service: 0,
//     },
//   }),
//   getters: {
//     subtotal() {
//       return this.currentOrder.sub_total || 0;
//     },
//     tax() {
//       return this.currentOrder.tax || 0;
//     },
//     discountAmount() {
//       return this.currentOrder.discount || 0;
//     },
//     total() {
//       return this.currentOrder.total_amount || 0;
//     },
//   },
//   actions: {
//     createNewOrder(type, table_id) {
//       this.currentOrder = {
//         id: null,
//         guest: '',
//         type: type,
//         table_id: table_id,
//         items: [],
//         shift_id: useCookie('PosUserData').value.shift,
//         discount: 0,
//         discount_type: null,
//       };
//       this.openOrder = true;

//       if (this.pendingItem) {
//         this.addItemToOrder(this.pendingItem);
//         this.pendingItem = null;
//       }
//     },
//     addOrder(order) {
//       this.orders.push(order);
//     },
//     editOrder(orderId, updatedOrder) {
//       const index = this.orders.findIndex(order => order.id === orderId);
//       if (index !== -1) {
//         this.orders[index] = updatedOrder;
//       }
//     },
//     openExistingOrder(orderId) {
//       const order = this.orders.find(order => order.id === orderId);
//       if (order) {
//         this.currentOrder = { ...order };
//         this.openOrder = true;
//       }
//     },
//     closeOrder() {
//       this.currentOrder = {
//         id: null,
//         guest: '',
//         type: '',
//         table_id: null,
//         items: [],
//         shift_id: null,
//         sub_total: 0,
//         tax: 0,
//         discount: 0,
//         discount_type: null,
//         total_amount: 0,
//         service: 0,
//       };
//       this.openOrder = false;
//     },
//     async addItemToOrder(item) {
//       const existingItem = this.currentOrder.items.find(i => 
//         i.product_id === item.id || 
//         i.id === item.id || 
//         i.order_id === item.id
//       );

//       if (existingItem) {
//         this.increaseQuantity(existingItem.id || existingItem.order_id);
//         return;
//       }

//       this.currentOrder.items.push({
//         product_id: item.id,
//         quantity: 1,
//         name: item.name,
//         price: item.price,
//         image: item.image,
//         order_id: null
//       });

//       this.updateOrderTotals();
      
//       if (!this.currentOrder.id) {
//         await this.placeOrder();
//       } else {
//         useApi('orderItem', 'POST', {
//           type: 'object',
//           data: {
//             order_id: this.currentOrder.id,
//             product_id: item.id,
//             quantity: 1
//           }
//         })
//         .then(response => {
//           const updatedItem = this.currentOrder.items.find(i => i.product_id === item.id);
//           if (updatedItem) {
//             updatedItem.order_id = response.order_item.id;
//           }
//           // this.updateOrderFromResponse(response.order_item.order);
//         })
//         .catch(error => {
//           console.error('Error adding item to order:', error);
//         });
//       }
//     },
//     updateOrderTotals() {
//       this.currentOrder.sub_total = this.subtotal;
//       this.currentOrder.tax = this.tax;
//       this.currentOrder.total_amount = this.total;
//     },
//     updateDiscount(discountData) {
//       this.currentOrder.discount = discountData;
//     },
//     removeDiscount() {  
//       this.currentOrder.discount = 0;
//     },
//     increaseQuantity(itemId) {
//       const item = this.currentOrder.items.find(i => i.id === itemId || i.order_id === itemId);
//       if (!item) return;

//       item.quantity++;
      
//       if (this.currentOrder.id) {
//         useApi(`orderItem/${itemId}`, 'PUT', {
//           type: 'object',
//           data: {
//             quantity: item.quantity
//           }
//         })
//         .catch(error => {
//           // في حالة الفشل، نعيد الكمية لما كانت عليه
//           item.quantity--;
//           console.error('Failed to update quantity:', error);
//         });
//       }
//     },
//     decreaseQuantity(productId) {
//       const item = this.currentOrder.items.find(i => i.product_id === productId);
//       if (!item) {
//         return;
//       }

//       if (item.quantity <= 1) {
//         return;
//       }

//       item.quantity--;
//       this.updateOrderTotals();

//       if (this.currentOrder.id) {
//         useApi(`orderItem/${this.currentOrder.id}/${productId}`, 'PUT', {
//           type: 'object',
//           data: {
//             quantity: item.quantity
//           }
//         })
//           .then(response => {
//             if (response.order) {
//               // this.updateOrderFromResponse(response.order);
//             }
//           })
//           .catch(error => {
//             item.quantity++;
//             this.updateOrderTotals();
//           });
//       }
//     },
//     removeItem(productId) {
//       const itemIndex = this.currentOrder.items.findIndex(i => i.product_id === productId);
//       if (itemIndex === -1) {
//         return;
//       }

//       this.currentOrder.items.splice(itemIndex, 1);
//       this.updateOrderTotals();
//       this.placeOrder();






//       // if (this.currentOrder.id) {
//       //   useApi(`orderItem/${productId}`, 'DELETE')
//       //     .then(response => {
//       //       if (response.order) {
//       //         this.updateOrderFromResponse(response.order);
//       //       }
//       //     })
//       //     .catch(error => {
//       //       this.currentOrder.items.splice(itemIndex, 0, removedItem);
//       //       this.updateOrderTotals();
//       //     });
//       // }
//     },
//     setOrderName(name) {
//       this.currentOrder.guest = name;
//     },
//     placeOrder() {
//       const orderData = {
//         table_id: this.currentOrder.table_id || null,
//         type: this.currentOrder.type,
//         guest: this.currentOrder.guest,
//         shift_id: this.currentOrder.shift_id,
//         items: this.currentOrder.items.map(item => ({
//           product_id: item.product_id,
//           quantity: item.quantity
//         }))
//       };

//       if (this.currentOrder.discount && this.currentOrder.discount.type && this.currentOrder.discount.amount > 0) {
//         orderData.discount = {
//           type: this.currentOrder.discount.type,
//           amount: this.currentOrder.discount.amount
//         };
//       }

//       const method = this.currentOrder.id ? 'PUT' : 'POST';
//       const endpoint = this.currentOrder.id ? `orders/${this.currentOrder.id}` : 'orders';

//       useApi(endpoint, method, {
//         type: 'object',
//         data: orderData,
//       })
//         .then((response) => {
//           const updatedItems = response.order?.order_items.map(orderItem => ({
//             product_id: orderItem.product_id,
//             quantity: orderItem.quantity,
//             price: parseFloat(orderItem.price),
//             order_id: orderItem.id,
//             name: orderItem.product.name,
//             image: orderItem.product.image
//           }));
          
//           this.currentOrder.items = updatedItems;
//           this.updateOrderFromResponse(response.order);
          
//           if (this.currentOrder.id) {
//             this.editOrder(this.currentOrder.id, { ...this.currentOrder });
//           } else {
//             this.addOrder({ ...this.currentOrder });
//           }
//         })
//         .catch((error) => {
//           console.error('Order placement/update error:', error);
//         });
//     },
//     cancelOrder() {
//       this.closeOrder();
//     },
//     setOrderFromResponse(orderData) {
//       this.currentOrder = {
//         id: orderData.id,
//         code: orderData.code,
//         guest: orderData.guest || '',
//         type: orderData.type || '',
//         table_id: orderData.table_id,
//         items: orderData.order_items,
//         shift_id: orderData.shift_id,
//         sub_total: parseFloat(orderData.sub_total),
//         tax: parseFloat(orderData.tax),
//         service: parseFloat(orderData.service),
//         discount: parseFloat(orderData.discount),
//         total_amount: parseFloat(orderData.total_amount),
//         status: orderData.status
//       };
//     },
//     updateOrderFromResponse(orderData) {
//       const formattedItems = orderData.order_items?.map(item => ({
//         id: item.id,
//         product_id: item.product_id,
//         quantity: item.quantity,
//         price: parseFloat(item.price),
//         name: item.product.name,
//         image: item.product.image,
//         order_id: item.id,
//         note: item.notes,
//         total_amount: parseFloat(item.total_amount),
//         tax: parseFloat(item.tax),
//         service: parseFloat(item.service),
//         discount: parseFloat(item.discount)
//       })) || [];

//       this.currentOrder = {
//         ...this.currentOrder,
//         id: orderData.id,
//         code: orderData.code,
//         status: orderData.status,
//         items: formattedItems,
//         tax: parseFloat(orderData.tax || 0),
//         service: parseFloat(orderData.service || 0),
//         discount: parseFloat(orderData.discount || 0),
//         discount_type: orderData.discount_type,
//         sub_total: parseFloat(orderData.sub_total || 0),
//         total_amount: parseFloat(orderData.total_amount || 0),
//       };
//     },
//     setPendingItem(item) {
//       this.pendingItem = item;
//     },
//     initializeWebSocket() {
//       if (process.client) {
//         const { $echo } = useNuxtApp()
//         if (!$echo) {
//           console.error('Echo is not initialized')
//           return
//         }

//         try {
//           console.log('Attempting to connect to WebSocket...')
          
//           const channel = $echo.channel('orders-channel')
          
//           channel
//             .listen('.order-updated', (e) => {
//               console.log('Order updated via WebSocket:', e)
//               this.handleOrderUpdate(e.order)
//             })
//             .listen('.order-created', (e) => {
//               console.log('New order created:', e)
//               this.handleNewOrder(e.order)
//             })
//             .listen('.order-deleted', (e) => {
//               console.log('Order deleted:', e)
//               this.handleOrderDelete(e.orderId)
//             })

//           console.log('WebSocket listeners attached')
//         } catch (error) {
//           console.error('WebSocket initialization error:', error)
//         }
//       }
//     },
//     handleOrderUpdate(updatedOrder) {
//       // تحديث الطلب في القائمة
//       const index = this.orders.findIndex(order => order.id === updatedOrder.id);
//       if (index !== -1) {
//         console.log('not foubnd')
//         this.orders[index] = {
//           ...updatedOrder,
//           items: updatedOrder.order_items?.map(item => ({
//             id: item.id,
//             product_id: item.product_id,
//             quantity: item.quantity,
//             price: parseFloat(item.price),
//             name: item.product.name,
//             image: item.product.image,
//             order_id: item.id
//           })) || []
//         };
//       }

//       // تحديث الطلب الحالي إذا كان مفتوحاً
//       if (this.currentOrder.id === updatedOrder.id) {
//         console.log('not foubnd')
//         this.updateOrderFromResponse(updatedOrder);
//       }
//     },
//     handleNewOrder(newOrder) {
//       // إضافة الطلب الجديد إلى القائمة
//       this.addOrder(newOrder)
//     },
//     handleOrderDelete(orderId) {
//       // حذف الطلب من القائمة
//       const index = this.orders.findIndex(order => order.id === orderId)
//       if (index !== -1) {
//         this.orders.splice(index, 1)
//       }

//       // إذا كان هذا هو الطلب الحالي المفتوح، قم بإغلاقه
//       if (this.currentOrder.id === orderId) {
//         this.closeOrder()
//       }
//     },
//     async fetchInitialOrders() {
//       try {
//         const response = await useApi('orders', 'GET');
//         if (response) {
//           // تحويل البيانات المالية إلى أرقام عشرية
//           const formattedOrders = response.map(order => ({
//             ...order,
//             sub_total: parseFloat(order.sub_total),
//             tax: parseFloat(order.tax),
//             service: parseFloat(order.service),
//             discount: parseFloat(order.discount),
//             total_amount: parseFloat(order.total_amount),
//             items: order.order_items?.map(item => ({
//               ...item,
//               price: parseFloat(item.price),
//               total_amount: parseFloat(item.total_amount),
//               tax: parseFloat(item.tax),
//               service: parseFloat(item.service),
//               discount: parseFloat(item.discount)
//             })),
//             order_items: null,
//           }));
          
//           this.orders = formattedOrders;
//         }
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//         this.orders = [];
//         throw error; // إعادة رمي الخطأ للتعامل معه في المكون
//       }
//     },
//     updateItemDiscount(itemId, discount) {
//       const item = this.currentOrder.items.find(i => i.id === itemId || i.order_id === itemId);
//       if (item) {
//         item.discount = discount;
//       }
//     },
//     updateItemNote(itemId, note) {
//       const item = this.currentOrder.items.find(i => i.id === itemId || i.order_id === itemId);
//       if (item) {
//         item.note = note;
//       }
//     },
//     async updateItemDiscount(itemId, discountData) {
//       try {
//         await useApi(`orderItem/${itemId}/discount`, 'POST', {
//           type: 'object',
//           data: {
//             type: discountData.type,
//             amount: discountData.amount
//           }
//         });
//         // WebSocket سيقوم بتحديث البيانات تلقائياً
//       } catch (error) {
//         console.error('Error updating item discount:', error);
//         throw error;
//       }
//     },

//     async updateItemNote(itemId, note) {
//       try {
//         await useApi(`orderItem/${itemId}/add_note`, 'PUT', {
//           type: 'object',
//           data: {
//             notes: note
//           }
//         });
//         // WebSocket سيقوم بتحديث البيانات تلقائياً
//       } catch (error) {
//         console.error('Error updating item note:', error);
//         throw error;
//       }
//     }
//   },
// });
