document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname === '/withdrawl' || window.location.href.includes('/withdrawl#')) {
    const targetElement = document.querySelector('.marquee-text-container');
    
    if (targetElement) {
      // สร้าง iframe 
      const iframe = document.createElement('iframe');
      iframe.src = 'withdrawal-widget';
      iframe.style.width = '100%';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.id = 'gu-withdrawal-iframe';
      
      // แทนที่เนื้อหาเดิม
      targetElement.innerHTML = '';
      targetElement.appendChild(iframe);
      
      // รับข้อความจาก iframe เพื่อปรับขนาด
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'GU_WIDGET_READY') {
          iframe.style.height = event.data.height + 'px';
        }
      });
    }
  }
});