<template>
  <div class="kitchen-receipt-container" ref="receiptRef">
    <!-- Header -->
    <div class="header">
      <div class="logo-text">KITCHEN ORDER</div>
      <div class="order-info">
        <div class="detail-row">
          <span class="label">Order #:</span>
          <span class="value">{{ order?.code }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Time:</span>
          <span class="value">{{ formatDateTime(order?.created_at) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Type:</span>
          <span class="value">{{ order?.type }} {{ order?.table_id ? `(Table ${order.table_id})` : '' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Guest:</span>
          <span class="value">{{ order?.guest || 'Walk-in Customer' }}</span>
        </div>
      </div>
    </div>

    <div class="separator">--------------------------------</div>

    <!-- Items -->
    <div class="items-section">
      <div v-for="item in order?.items || []" :key="item.id" class="item-row">
        <div class="quantity">{{ item.quantity }}x</div>
        <div class="item-details">
          <div class="item-name">{{ item?.name ? item.name : item?.product?.name }}</div>
          <div v-if="item.notes" class="item-notes">Note: {{ item.notes }}</div>
        </div>
      </div>
    </div>

    <div class="separator">--------------------------------</div>

    <!-- Footer -->
    <div class="footer">
      <div class="items-count">Total Items: {{ order?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0 }}</div>
      <div class="print-info">Printed: {{ formatDateTime(new Date()) }}</div>
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

const receiptRef = ref(null);

const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

const printReceipt = () => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  const printContent = `
    <html>
      <head>
        <title>Kitchen Order</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 10px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.5;
          }

          .kitchen-receipt-container {
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
            margin-bottom: 10px;
          }

          .order-info {
            margin-bottom: 10px;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
          }

          .separator {
            text-align: center;
            margin: 10px 0;
            font-size: 12px;
          }

          .item-row {
            margin-bottom: 15px;
          }

          .quantity {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .item-name {
            font-size: 18px;
            font-weight: bold;
          }

          .item-notes {
            font-style: italic;
            margin-top: 5px;
            font-size: 14px;
          }

          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
          }

          .items-count {
            font-weight: bold;
            margin-bottom: 5px;
          }

          .print-info {
            color: #666;
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
    printWindow.print();
    printWindow.close();
  };
};

defineExpose({
  printReceipt
});
</script>

<style scoped>
.kitchen-receipt-container {
  display: none;
}
</style> 