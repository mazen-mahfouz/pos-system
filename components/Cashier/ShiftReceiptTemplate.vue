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

    <!-- Only render content if shift data exists -->
    <template v-if="shift">
      <!-- Shift Info -->
      <div class="shift-info">
        <div class="title">SHIFT REPORT</div>
        <div class="detail-row">
          <span class="label">Shift #:</span>
          <span class="value">{{ shift.id }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Start Time:</span>
          <span class="value">{{ formatDateTime(shift.start_time) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">End Time:</span>
          <span class="value">{{ formatDateTime(shift.end_time) }}</span>
        </div>
      </div>

      <div class="separator">--------------------------------</div>

      <!-- Sales Summary -->
      <div class="summary-section">
        <div class="section-title">SALES SUMMARY</div>
        <div class="detail-row">
          <span class="label">Total Sales:</span>
          <span class="value">£{{ formatPrice(shift.total_sales) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Tax:</span>
          <span class="value">£{{ formatPrice(shift.total_tax) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Service Charges:</span>
          <span class="value">£{{ formatPrice(shift.total_services) }}</span>
        </div>
        <div class="detail-row discount">
          <span class="label">Discounts:</span>
          <span class="value">-£{{ formatPrice(shift.total_discounts) }}</span>
        </div>
      </div>

      <div class="separator">--------------------------------</div>

      <!-- Payment Methods -->
      <div class="payment-section" v-if="shift.payment_totals?.length">
        <div class="section-title">PAYMENT METHODS</div>
        <div v-for="payment in shift.payment_totals" :key="payment.method" class="detail-row">
          <span class="label">{{ payment.method }}:</span>
          <span class="value">£{{ formatPrice(payment.total_amount) }}</span>
        </div>
      </div>

      <div class="separator">--------------------------------</div>
    </template>

    <!-- Footer -->
    <div class="footer">
      <div class="print-info">Printed: {{ formatDateTime(new Date()) }}</div>
      <div class="cashier-info">Cashier: {{ cashierName }}</div>
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
  if (!props.shift) {
    console.error('No shift data available')
    return
  }

  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    console.error('Failed to open print window')
    return
  }

  const printContent = `
    <html>
      <head>
        <title>Shift Report</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 10mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
          }

          .receipt-container {
            width: 80mm;
            margin: 0 auto;
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
          }

          .logo-text {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }

          .store-info {
            font-size: 12px;
          }

          .title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .separator {
            text-align: center;
            margin: 15px 0;
          }

          .section-title {
            font-weight: bold;
            margin-bottom: 8px;
          }

          .discount .value {
            color: #d32f2f;
          }

          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 11px;
          }

          .print-info {
            margin-bottom: 5px;
            color: #666;
          }

          .cashier-info {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        ${receiptRef.value.outerHTML}
      </body>
    </html>
  `
  
  printWindow.document.write(printContent)
  printWindow.document.close()
  
  printWindow.onload = function() {
    printWindow.focus()
    printWindow.print()
    setTimeout(() => {
      printWindow.close()
    }, 1000)
  }
}

defineExpose({
  print
})
</script>

<style scoped>
/* Hide receipt on screen */
.receipt-container {
  display: none;
}
</style>