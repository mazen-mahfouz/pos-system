<template>
  <div class="receipt-container" ref="receiptRef">
    <!-- Header -->
    <div class="header">
      <div class="logo-text">
        <i class="fas fa-cookie-bite"></i>
        SUGAR RUSH
        <i class="fas fa-cookie-bite"></i>
      </div>
      <div class="store-info">Arabela Plaza</div>
    </div>

    <template v-if="shift">
      <!-- Shift Info Cards -->
      <div class="info-cards">
        <div class="info-card">
          <div class="info-card-header">
            <i class="icon fas fa-hashtag"></i>
            <span class="info-label">Shift ID</span>
          </div>
          <p class="info-value">#{{ shift.id }}</p>
        </div>

        <div class="info-card">
          <div class="info-card-header">
            <i class="icon fas fa-clock"></i>
            <span class="info-label">Start Time</span>
          </div>
          <p class="info-value">{{ formatDateTime(shift.start_time) }}</p>
        </div>

        <div class="info-card">
          <div class="info-card-header">
            <i class="icon fas fa-clock"></i>
            <span class="info-label">End Time</span>
          </div>
          <p class="info-value">{{ formatDateTime(new Date()) }}</p>
        </div>

        <div class="info-card">
          <div class="info-card-header">
            <i class="icon fas fa-user-tie"></i>
            <span class="info-label">Cashier</span>
          </div>
          <p class="info-value">{{ cashierName }}</p>
        </div>
      </div>

      <!-- Sales Summary -->
      <div class="summary-section">
        <div class="section-title">
          <i class="fas fa-chart-line"></i> Sales Summary
        </div>
        <div class="summary-row">
          <span><i class="fas fa-calculator"></i> Subtotal:</span>
          <span>£{{ formatPrice(shift.total_sales || 0) }}</span>
        </div>
        <div class="summary-row discount">
          <span><i class="fas fa-tag"></i> Discount:</span>
          <span>-£{{ formatPrice(shift.total_discounts || 0) }}</span>
        </div>
        <div class="summary-row">
          <span><i class="fas fa-concierge-bell"></i> Service:</span>
          <span>£{{ formatPrice(shift.total_services || 0) }}</span>
        </div>
        <div class="summary-row">
          <span><i class="fas fa-percent"></i> VAT (14%):</span>
          <span>£{{ formatPrice(shift.total_tax || 0) }}</span>
        </div>
        <div class="summary-total">
          <span><i class="fas fa-coins"></i> Total:</span>
          <span>£{{ formatPrice(calculateNetTotal) }}</span>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="payment-section" v-if="shift.payment_totals?.length">
        <div class="section-title">
          <i class="fas fa-credit-card"></i> PAYMENT METHODS
        </div>
        <div v-for="payment in shift.payment_totals" :key="payment.method" class="summary-row">
          <span>
            <i :class="getPaymentIcon(payment.method)"></i>
            {{ payment.method }}:
          </span>
          <span>£{{ formatPrice(payment.total_amount) }}</span>
        </div>
      </div>
    </template>

    <!-- Footer -->
    <div class="receipt-footer">
      <div class="print-time">
        <i class="far fa-clock"></i> {{ formatDateTime(new Date()) }}
      </div>
      <div class="footer-text">
        <i class="fas fa-heart"></i> Thank You! <i class="fas fa-heart"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  shift: {
    type: Object,
    default: () => null
  }
})

const AuthStore = useAuthStore()
const receiptRef = ref(null)

const cashierName = computed(() => {
  return AuthStore?.user ? `${AuthStore.user.first_name} ${AuthStore.user.last_name}` : 'Unknown'
})

const formatPrice = (price) => {
  if (!price) return '0.00'
  return Number(price).toFixed(2)
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

const print = () => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!props.shift) return;
  
  const printContent = `
    <html>
      <head>
        <title>Shift Report</title>
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
            font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            background: #fff;
            color: #000;
            font-weight: bold;
          }

          .receipt-container {
            width: 80mm;
            padding: 8px;
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
          }

          .logo-text {
            font-size: 24px;
            font-weight: 900;
            font-family: 'Arial Black', 'Helvetica Black', sans-serif;
            color: #000;
            margin-bottom: 8px;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .store-info {
            font-size: 13px;
            font-weight: bold;
            color: #000;
          }

          .info-cards {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 16px;
          }

          .info-card {
            background: #fff;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #000;
          }

          .info-card-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;
            color: #000;
          }

          .info-label {
            font-size: 11px;
            color: #000;
            font-weight: bold;
          }

          .info-value {
            margin-top: 4px;
            font-size: 12px;
            font-weight: bold;
            color: #000;
          }

          .items-table {
            width: 100%;
            margin: 16px 0;
            border-collapse: collapse;
          }

          .items-table th {
            padding: 8px;
            font-size: 12px;
            font-weight: bold;
            color: #000;
            text-align: left;
            border-bottom: 1px solid #000;
          }

          .items-table td {
            padding: 8px;
            font-size: 12px;
            border-bottom: 1px dashed #000;
            color: #000;
            font-weight: bold;
          }

          .items-table .text-right {
            text-align: right;
          }

          .summary-section {
            margin-top: 16px;
            border-top: 1px solid #000;
            padding-top: 16px;
          }

          .section-title {
            font-size: 14px;
            font-weight: 900;
            color: #000;
            margin-bottom: 12px;
            font-family: 'Arial Black', 'Helvetica Black', sans-serif;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
            color: #000;
            font-weight: bold;
          }

          .summary-total {
            margin-top: 15px;
            padding-top: 12px;
            border-top: 1px solid #000;
            font-weight: 900;
            font-size: 14px;
            color: #000;
            font-family: 'Arial Black', 'Helvetica Black', sans-serif;
          }

          .receipt-footer {
            margin-top: 24px;
            text-align: center;
            font-size: 12px;
            color: #000;
            font-weight: bold;
            border-top: 2px dashed #000;
            padding-top: 16px;
          }

          /* إزالة جميع الألوان من الأيقونات */
          .text-[#2b3c5e] {
            color: #000 !important;
          }

          .text-red-500, .text-red-600 {
            color: #000 !important;
          }

          /* تأكيد على أن كل العناصر سوداء */
          i, span, p, div {
            color: #000 !important;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo-text">
              <i class="fas fa-cookie-bite"></i>
              SUGAR RUSH
              <i class="fas fa-cookie-bite"></i>
            </div>
            <div class="store-info">Sugar Rush - Arabela Plaza</div>
          </div>

          <div class="info-cards">
            <div class="info-card">
              <div class="info-card-header">
                <i class="fas fa-hashtag text-[#2b3c5e]"></i>
                <span class="info-label">Shift ID</span>
              </div>
              <p class="info-value">#${props.shift.id}</p>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <i class="far fa-clock text-[#2b3c5e]"></i>
                <span class="info-label">Start Time</span>
              </div>
              <p class="info-value">${formatDateTime(props.shift.start_time)}</p>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <i class="far fa-clock text-[#2b3c5e]"></i>
                <span class="info-label">End Time</span>
              </div>
              <p class="info-value">${formatDateTime(new Date())}</p>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <i class="fas fa-user-tie text-[#2b3c5e]"></i>
                <span class="info-label">Cashier</span>
              </div>
              <p class="info-value">${cashierName.value}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Summary</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><i class="fas fa-shopping-cart text-[#2b3c5e]"></i> Total Sales</td>
                <td class="text-right">£${formatPrice(props.shift.total_sales || 0)}</td>
              </tr>
              <tr>
                <td><i class="fas fa-percent text-[#2b3c5e]"></i> Tax (14%)</td>
                <td class="text-right">£${formatPrice(props.shift.total_tax || 0)}</td>
              </tr>
              <tr>
                <td><i class="fas fa-concierge-bell text-[#2b3c5e]"></i> Service (12%)</td>
                <td class="text-right">£${formatPrice(props.shift.total_services || 0)}</td>
              </tr>
              <tr>
                <td><i class="fas fa-tag text-[#2b3c5e]"></i> Discounts</td>
                <td class="text-right text-red-600">-£${formatPrice(props.shift.total_discounts || 0)}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-total">
            <span><i class="fas fa-coins text-[#2b3c5e]"></i> TOTAL:</span>
            <span>£${formatPrice(props.shift.total_sales || 0)}</span>
          </div>

          ${props.shift.payment_totals?.length ? `
            <table class="items-table">
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${props.shift.payment_totals.map(payment => `
                  <tr>
                    <td><i class="${getPaymentIcon(payment.method)} text-[#2b3c5e]"></i> ${payment.method}</td>
                    <td class="text-right">£${formatPrice(payment.total_amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div class="receipt-footer">
            <div class="print-time">
              <i class="far fa-clock"></i> ${formatDateTime(new Date())}
            </div>
            <div class="mt-2">
              <i class="fas fa-heart text-red-500"></i>
              Thank You!
              <i class="fas fa-heart text-red-500"></i>
            </div>
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
  print
})

// إضافة حساب المجموع النهائي
const calculateNetTotal = computed(() => {
  const sales = Number(props.shift?.total_sales || 0);
  const tax = Number(props.shift?.total_tax || 0);
  const services = Number(props.shift?.total_services || 0);
  const discounts = Number(props.shift?.total_discounts || 0);
  
  return sales + tax + services - discounts;
});

const getPaymentIcon = (method) => {
  const icons = {
    'Cash': 'fas fa-money-bill-wave',
    'Card': 'fas fa-credit-card',
    'Bank Transfer': 'fas fa-university',
    'Mobile Wallet': 'fas fa-mobile-alt'
  };
  return icons[method] || 'fas fa-money-check';
};
</script>

<style scoped>
/* Add these styles to match ReceiptTemplate */
.receipt-container {
  display: none; /* Only for screen display */
}

@media print {
  .receipt-container {
    display: block;
    width: 80mm;
    padding: 8px;
    font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
  }
}
</style>