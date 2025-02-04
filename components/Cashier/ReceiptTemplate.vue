<template>
  <div class="receipt-container border border-gray-200 rounded-lg" ref="receiptRef">
    <!-- Header -->
    <div class="header">
      <div class="logo-text">
        <i class="fas fa-cookie-bite"></i>
        SUGAR RUSH
        <i class="fas fa-cookie-bite"></i>
      </div>
      <div class="store-info">Sugar Rush - Arabela Plaza</div>
    </div>

    <!-- Order Details Grid -->
    <div class="details-grid">
      <div class="detail-group">
        <div class="detail-item">
          <div class="flex items-center gap-1.5">
            <i class="fas fa-hashtag text-[13px] text-[#2b3c5e]"></i>
            <span class="text-[12px] text-gray-600">Order ID</span>
          </div>
          <p class="mt-1 text-[13px] font-bold text-[#2b3c5e]">#{{ props.order?.code }}</p>
        </div>
        
        <div class="detail-item">
          <div class="flex items-center gap-1.5">
            <i class="far fa-clock text-[13px] text-[#2b3c5e]"></i>
            <span class="text-[12px] text-gray-600">Date</span>
          </div>
          <p class="mt-1 text-[13px] font-medium">{{ formatDateTime(props.order?.created_at) }}</p>
        </div>
      </div>

      <div class="detail-group">
        <div class="detail-item">
          <div class="flex items-center gap-1.5">
            <i class="fas fa-circle-check text-[13px] text-[#2b3c5e]"></i>
            <span class="text-[12px] text-gray-600">Status</span>
          </div>
          <span class="mt-1 inline-block status-badge">Live</span>
        </div>
        
        <div class="detail-item">
          <div class="flex items-center gap-1.5">
            <i class="far fa-user text-[13px] text-[#2b3c5e]"></i>
            <span class="text-[12px] text-gray-600">Customer</span>
          </div>
          <p class="mt-1 text-[13px] font-medium">{{ props.order?.guest || 'Walk-in Customer' }}</p>
        </div>
      </div>

      <div class="detail-group">
        <div class="detail-item">
          <div class="flex items-center gap-1.5">
            <i class="fas fa-shopping-bag text-[13px] text-[#2b3c5e]"></i>
            <span class="text-[12px] text-gray-600">Order Type</span>
          </div>
          <p class="mt-1 text-[13px] font-medium">{{ props.order?.type }}</p>
        </div>
        
        <div class="detail-item">
          <div class="flex items-center gap-1.5">
            <i class="fas fa-list text-[13px] text-[#2b3c5e]"></i>
            <span class="text-[12px] text-gray-600">Items Count</span>
          </div>
          <p class="mt-1 text-[13px] font-medium">{{ props.order?.items?.length || 0 }}</p>
        </div>

        <div class="detail-item">
          <div class="flex items-center gap-1.5">
            <i class="fas fa-money-bill text-[13px] text-[#2b3c5e]"></i>
            <span class="text-[12px] text-gray-600">Total Amount</span>
          </div>
          <p class="mt-1 text-[13px] font-bold text-[#2b3c5e]">£{{ formatPrice(props.order?.total_amount) }}</p>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-table">
      <div class="table-header">
        <div class="col-item">ITEM</div>
        <div class="col-qty">QTY</div>
        <div class="col-price">PRICE</div>
        <div class="col-total">TOTAL</div>
      </div>

      <div class="table-body">
        <div v-for="item in props.order?.items || []" :key="item.id" class="table-row">
          <div class="col-item">{{ item?.name ? item.name : item?.product?.name }}</div>
          <div class="col-qty">{{ item.quantity }}</div>
          <div class="col-price">£{{ formatPrice(item.price) }}</div>
          <div class="col-total">£{{ formatPrice(item.price * item.quantity) }}</div>
        </div>
      </div>
    </div>

    <!-- Totals Section -->
    <div class="totals-section">
      <div class="total-row">
        <span>Subtotal</span>
        <span>£{{ formatPrice(props.order?.sub_total) }}</span>
      </div>
      <div class="total-row">
        <span>Tax</span>
        <span>£{{ formatPrice(props.order?.tax) }}</span>
      </div>
      <div class="total-row">
        <span>Service Charge</span>
        <span>{{ formatPrice(props.order?.service) }}</span>
      </div>
      <div v-if="props.order?.discount > 0" class="total-row discount">
        <span>Discount</span>
        <span>-{{ formatPrice(props.order?.discount) }}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total Amount</span>
        <span class="amount">£{{ formatPrice(props.order?.total_amount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

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
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  const printContent = `
    <html>
      <head>
        <title>Print Receipt</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 8px;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            background: #fff;
          }

          .receipt-container {
            width: 80mm;
            padding: 8px;
            text-align: center;
          }

          .store-header {
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px dashed #000;
          }

          .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: #000;
            margin-bottom: 8px;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .logo-text i {
            font-size: 18px;
          }

          .store-info {
            font-size: 12px;
            font-weight: 500;
            color: #333;
          }

          .info-cards {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 16px;
            text-align: left;
          }

          .info-card {
            background-color: #f8f8f8 !important;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #eee;
          }

          .info-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }

          .icon {
            font-size: 14px;
            color: #000;
            width: 16px;
            text-align: center;
          }

          .info-label {
            font-size: 11px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
          }

          .info-value {
            margin-top: 4px;
            font-size: 12px;
            font-weight: 600;
            color: #000;
          }

          .items-table {
            width: 100%;
            margin: 16px 0;
            border-collapse: collapse;
            text-align: left;
          }

          .items-table th {
            font-size: 11px;
            color: #333;
            text-transform: uppercase;
            padding: 8px 4px;
            border-bottom: 1px solid #000;
            font-weight: 600;
          }

          .items-table td {
            padding: 8px 4px;
            font-size: 12px;
            border-bottom: 1px dashed #ddd;
            color: #000;
            font-weight: 500;
          }

          .items-table .text-right {
            text-align: right;
          }

          .summary-section {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 2px dashed #000;
            text-align: right;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 6px;
            font-weight: 500;
            color: #333;
          }

          .summary-total {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #000;
            font-weight: 700;
            font-size: 14px;
            color: #000;
          }

          .receipt-footer {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 2px dashed #000;
            text-align: center;
            font-size: 12px;
            font-weight: 700;
            color: #000;
          }

          .qr-section {
            margin: 16px 0;
            padding: 10px;
            background: #f8f8f8;
            border-radius: 6px;
            font-size: 11px;
            font-family: monospace;
            font-weight: 700;
            border: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="store-header">
            <div class="logo-text">
              <i class="fas fa-cookie-bite"></i>
              SUGAR RUSH
              <i class="fas fa-cookie-bite"></i>
            </div>
            <div class="store-info">Arabela Plaza</div>
          </div>

          <div class="info-cards">
            <div class="info-card">
              <div class="info-card-header">
                <i class="icon fas fa-hashtag"></i>
                <span class="info-label">Order ID</span>
              </div>
              <p class="info-value">#${props.order?.code}</p>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <i class="icon far fa-clock"></i>
                <span class="info-label">Date</span>
              </div>
              <p class="info-value">${formatDateTime(props.order?.created_at)}</p>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <i class="icon far fa-user"></i>
                <span class="info-label">Customer</span>
              </div>
              <p class="info-value">${props.order?.guest || 'Walk-in Customer'}</p>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <i class="icon fas fa-user-tie"></i>
                <span class="info-label">Served By</span>
              </div>
              <p class="info-value">${cashierName.value}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(props.order?.items || []).map(item => `
                <tr>
                  <td>${item?.name || item?.product?.name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">£${formatPrice(item.price)}</td>
                  <td class="text-right">£${formatPrice(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-row">
              <span><i class="fas fa-calculator"></i> Subtotal:</span>
              <span>£${formatPrice(props.order?.sub_total)}</span>
            </div>
            <div class="summary-row">
              <span><i class="fas fa-percent"></i> VAT (20%):</span>
              <span>£${formatPrice(props.order?.tax)}</span>
            </div>
            ${props.order?.service ? `
              <div class="summary-row">
                <span><i class="fas fa-concierge-bell"></i> Service:</span>
                <span>£${formatPrice(props.order?.service)}</span>
              </div>
            ` : ''}
            ${props.order?.discount > 0 ? `
              <div class="summary-row">
                <span><i class="fas fa-tag"></i> Discount:</span>
                <span>-£${formatPrice(props.order?.discount)}</span>
              </div>
            ` : ''}
            <div class="summary-total">
              <span><i class="fas fa-coins"></i> TOTAL:</span>
              <span>£${formatPrice(props.order?.total_amount)}</span>
            </div>
          </div>

          <div class="qr-section">
            <i class="fas fa-qrcode"></i> ${props.order?.code}
          </div>

          <div class="receipt-footer">
            <i class="fas fa-heart"></i> Thank You For Your Visit! <i class="fas fa-heart"></i><br>
            Have a Sweet Day!
          </div>
        </div>
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


/* Hide receipt on screen */
.receipt-container {
  display: none;
}

/* Print styles */
@media print {
  .receipt-container {
    display: block;
    box-shadow: none;
  }
}
</style>