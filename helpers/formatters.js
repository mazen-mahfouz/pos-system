export const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }
  
  export const formatPrice = (price) => {
    if (!price) return '£0.00'
    return `£${Number(price).toFixed(2)}`
  }