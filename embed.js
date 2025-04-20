(function() {
  // ตรวจสอบว่ามีการโหลดไปแล้วหรือไม่
  if (window.guWidgetLoaded) return;
  
  // สร้าง container
  const container = document.createElement('div');
  container.className = 'gu-withdrawal-embed-container';
  container.style.width = '100%';
  container.style.maxWidth = '750px';
  container.style.margin = '0 auto';
  container.style.overflow = 'hidden';
  
  // สร้าง iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'gu-withdrawal-iframe';
  iframe.src = 'https://racc99n.github.io/wiget-only.html';
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.height = '150px';
  iframe.style.display = 'block';
  
  // เพิ่ม iframe เข้าไปใน container
  container.appendChild(iframe);
  
  // สร้างฟังก์ชันสำหรับรอจนกว่า DOM จะพร้อม
  function domReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }
  
  // แทรก container เข้าไปในหน้าเว็บ
  domReady(function() {
    // หาตำแหน่งที่จะแทรก (คุณสามารถเปลี่ยนตามความต้องการ)
    const targetSelector = 'body';
    const targetPosition = 'beforeend'; // 'afterbegin', 'beforeend', 'beforebegin', 'afterend'
    
    const targetElement = document.querySelector(targetSelector);
    if (targetElement) {
      targetElement.insertAdjacentElement(targetPosition, container);
    } else {
      console.error('Target element for GU Withdrawal Widget not found');
    }
  });
  
  // รองรับการรับข้อมูลจาก iframe
  window.addEventListener('message', function(event) {
    // ตรวจสอบว่าเป็นข้อมูลจาก iframe ของเรา
    if (event.data && event.data.type === 'GU_WIDGET_READY') {
      const iframe = document.getElementById('gu-withdrawal-iframe');
      if (iframe) {
        // ปรับความสูงตามข้อมูลที่ได้รับ
        iframe.style.height = (event.data.height || 150) + 'px';
      }
    }
  });
  
  // บันทึกว่าได้โหลดไปแล้ว
  window.guWidgetLoaded = true;
  
  // API สำหรับควบคุมวิดเจ็ตจากภายนอก
  window.guWidgetControl = {
    setHeight: function(height) {
      const iframe = document.getElementById('gu-withdrawal-iframe');
      if (iframe) {
        iframe.style.height = height + 'px';
      }
    },
    sendCommand: function(command, params) {
      const iframe = document.getElementById('gu-withdrawal-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'GU_COMMAND',
          command: command,
          params: params
        }, '*');
      }
    }
  };
})();