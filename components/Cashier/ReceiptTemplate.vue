<template>
  <div class="receipt-container" ref="receiptRef">
    <!-- Header -->
    <div class="header">
      <div class="logo-text">SUGAR RUSH</div>
      <div class="store-info">
        Sugar Rush - Arabela Plaza<br>
        Tax Registration: 123456789<br>
        Tel: +20 123 456 7890
      </div>
    </div>

    <!-- Order Info -->
    <div class="order-info">
      <div class="order-details">
        <div class="detail-row">
          <span class="label">Order #:</span>
          <span class="value">{{ order.id }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">{{ formatDateTime(order.created_at) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Type:</span>
          <span class="value">{{ order.type }} {{ order.table_id ? `(Table ${order.table_id})` : '' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Customer:</span>
          <span class="value">{{ order.guest || 'Walk-in Customer' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Cashier:</span>
          <span class="value">{{ cashierName }}</span>
        </div>
      </div>
    </div>

    <div class="separator">--------------------------------</div>

    <!-- Items -->
    <div class="items-section">
      <div class="items-header">
        <span class="qty">Qty</span>
        <span class="desc">Description</span>
        <span class="amount">Amount</span>
      </div>
      <div class="items-list">
        <div v-for="item in order.items" :key="item.id" class="item-row">
          <span class="qty">{{ item.quantity }}</span>
          <span class="desc">{{ item.name }}</span>
          <span class="amount">{{ formatPrice(item.price * item.quantity) }}</span>
        </div>
      </div>
    </div>

    <div class="separator">--------------------------------</div>

    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>{{ formatPrice(order.sub_total) }}</span>
      </div>
      <div class="total-row">
        <span>VAT (14%):</span>
        <span>{{ formatPrice(order.tax) }}</span>
      </div>
      <div v-if="order.service_charge > 0" class="total-row">
        <span>Service Charge:</span>
        <span>{{ formatPrice(order.service_charge) }}</span>
      </div>
      <div v-if="order.discount > 0" class="total-row discount">
        <span>Discount:</span>
        <span>-{{ formatPrice(order.discount) }}</span>
      </div>
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <span>{{ formatPrice(order.total_amount) }}</span>
      </div>
      <div v-if="order.payments && order.payments.length > 0" class="payment-info">
        <div class="total-row">
          <span>Paid ({{ order.payments[0].method }}):</span>
          <span>{{ formatPrice(order.payments[0].amount) }}</span>
        </div>
        <div v-if="order.payments[0].method === 'Cash'" class="total-row">
          <span>Change:</span>
          <span>{{ formatPrice(order.payments[0].change_amount || 0) }}</span>
        </div>
      </div>
    </div>

    <div class="separator">--------------------------------</div>

    <!-- Footer -->
    <div class="footer">
      <div class="items-count">Items Count: {{ order.items.reduce((sum, item) => sum + item.quantity, 0) }}</div>
      <div class="thank-you">Thank You For Your Visit!</div>
      <div class="print-info">{{ formatDateTime(new Date(), true) }}</div>
    </div>
  </div>
</template>

<script setup>


const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

const AuthStore = useAuthStore();
const receiptRef = ref(null);

const cashierName = computed(() => {
  return AuthStore?.user ? `${AuthStore.user.first_name} ${AuthStore.user.last_name}` : 'Unknown';
});

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : '0.00';
};

const formatDateTime = (date, timeOnly = false) => {
  if (!date) return '';
  const d = new Date(date);
  const options = timeOnly
    ? { hour: '2-digit', minute: '2-digit' }
    : { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
  return new Intl.DateTimeFormat('en-GB', options).format(d);
};

const printReceipt = () => {
  const printWindow = window.open('', '', 'width=800,height=600');
  
  const printContent = `
    <html>
      <head>
        <title>Print Receipt</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
          }

          .receipt-container {
            width: 80mm;
            background: white;
          }

          .header {
            text-align: center;
            margin-bottom: 15px;
          }

          .logo-text {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }

          .store-info {
            font-size: 12px;
            margin-bottom: 12px;
          }

          .order-info {
            margin-bottom: 15px;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .separator {
            text-align: center;
            margin: 10px 0;
          }

          .items-section {
            margin: 15px 0;
          }

          .items-header {
            display: flex;
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
          }

          .item-row {
            display: flex;
            margin-bottom: 4px;
          }

          .qty {
            width: 40px;
            text-align: center;
          }

          .desc {
            flex: 1;
            padding: 0 8px;
          }

          .amount {
            width: 80px;
            text-align: right;
          }

          .totals-section {
            margin: 15px 0;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .discount {
            color: #d32f2f;
          }

          .grand-total {
            font-weight: bold;
            font-size: 14px;
            margin: 8px 0;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }

          .payment-info {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed #000;
          }

          .footer {
            text-align: center;
            margin-top: 20px;
          }

          .thank-you {
            font-weight: bold;
            margin: 8px 0;
            font-size: 14px;
          }

          .print-info {
            font-size: 10px;
            color: #666;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        ${receiptRef.value.outerHTML}
      </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  printWindow.onload = function() {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };
};

defineExpose({
  printReceipt
});
</script>

<style scoped>
/* Hide receipt on screen */
.receipt-container {
  display: none;
}
</style>