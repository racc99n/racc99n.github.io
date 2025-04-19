// ในไฟล์ script.js
document.addEventListener('DOMContentLoaded', function() {
  const marqueeContainer = document.querySelector('.marquee-text-container');

  if (marqueeContainer) {
    // โหลด config จาก remote
    fetch('config.json?' + Date.now()) // เพิ่ม timestamp เพื่อป้องกันการ cache
      .then(response => response.json())
      .then(config => {
        // เริ่มต้นวิดเจ็ตด้วยค่า config ที่โหลดมา
        initializeWidget(marqueeContainer, config);
      })
      .catch(error => {
        console.error('Error loading config:', error);
        // ใช้ค่าเริ่มต้นถ้าโหลด config ไม่สำเร็จ
        initializeWidget(marqueeContainer, {
          // ค่าเริ่มต้นต่างๆ ถ้าโหลด config ไม่ได้
          styles: {
            backgroundColor: "rgba(111, 255, 183, 0.1)",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(122, 12, 12, 0.05)"
          },
          content: {
            congratsMessage: "GU899 ขอแสดงความยินดี",
            successMessage: "ถอนเงินสำเร็จ"
          },
          withdrawalRanges: [
            { min: 500, max: 20000, weight: 90 },
            { min: 20001, max: 100000, weight: 10 }
          ],
          icons: ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"],
          timing: {
            minDelay: 5000,
            maxDelay: 15000,
            largeWithdrawalDelay: 20000,
            largeWithdrawalThreshold: 30000
          }
        });
      });
  }
});

function initializeWidget(container, config) {
  // เพิ่ม unique class ให้กับ container เพื่อทำ scoped CSS
  container.classList.add('gu-withdrawal-widget');

  // สร้าง container ใหม่
  container.innerHTML = `
    <div class="gu-withdrawal-container">
      <div class="gu-withdrawal-slider">
        <!-- รายการถอนเงินจะถูกเพิ่มโดย JavaScript -->
      </div>
    </div>
  `;

  // ปรับแต่ง style ตามค่า config
  const containerElement = container.querySelector('.gu-withdrawal-container');
  if (containerElement && config.styles) {
    containerElement.style.backgroundColor = config.styles.backgroundColor;
    containerElement.style.borderRadius = config.styles.borderRadius;
    containerElement.style.boxShadow = config.styles.boxShadow;
  }

  // เริ่มต้นตัวแปรสำหรับระบบแสดงผล
  const thaiNames = config.thaiNames || [];
  let nameCache = [...thaiNames];
  let isLoadingNames = false;
  let highlightedItemElement = null;
  
  // ข้อมูลเริ่มต้น
  const withdrawals = config.initialData || [];
  
  // ฟังก์ชันสุ่มชื่อภาษาไทย
  function getRandomThaiName() {
    // สุ่มจากแคชที่มีอยู่
    const randomName = nameCache[Math.floor(Math.random() * nameCache.length)];
    // พยายามดึงชื่อใหม่เพิ่มเติม (แบบไม่บล็อก)
    if (!isLoadingNames && Math.random() < 0.1) { // 10% โอกาสในการดึงข้อมูลใหม่
      fetchThaiNames();
    }
    return randomName;
  }

  // ฟังก์ชันดึงชื่อจาก kidhaina.com
  async function fetchThaiNames() {
    if (isLoadingNames) return;
    isLoadingNames = true;
    try {
      const response = await fetch('https://kidhaina.com/thainamegenerator');
      const html = await response.text();

      // ใช้ regular expression เพื่อดึงชื่อจาก HTML
      const namePattern = /<div class="name-list">\s*<ul>([\s\S]*?)<\/ul>\s*<\/div>/;
      const listItemPattern = /<li>(.*?)<\/li>/g;

      const match = html.match(namePattern);
      if (match && match[1]) {
        const nameList = match[1];
        let nameMatch;
        const names = [];

        while ((nameMatch = listItemPattern.exec(nameList)) !== null) {
          names.push(nameMatch[1].trim());
        }

        if (names.length > 0) {
          // เพิ่มชื่อใหม่เข้าไปในแคช
          nameCache = [...new Set([...nameCache, ...names])];
          console.log(`ดึงชื่อจาก kidhaina.com สำเร็จ: เพิ่ม ${names.length} ชื่อ, รวมทั้งหมด ${nameCache.length} ชื่อ`);
        } else {
          console.warn('ไม่พบชื่อใน HTML ที่ดึงมา');
        }
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงชื่อ:', error);
    } finally {
      isLoadingNames = false;
    }
  }

  // ฟังก์ชันสุ่มชื่อผู้ใช้
  function getRandomUser() {
    const prefix = 'GU';
    const suffix = 'x';
    // สุ่มตัวเลข 3 หลัก
    const middle = Math.floor(100 + Math.random() * 900);
    return `${prefix}x${middle}${suffix}`;
  }

  // ฟังก์ชันดึง 3 ตัวสุดท้ายของรหัสผู้ใช้
  function getLastThreeDigits(user) {
    const match = user.match(/GUx(\d{3})x/);
    if (match && match[1]) {
      return match[1];
    }

    const oldMatch = user.match(/(\d{3,4})xx$/);
    if (oldMatch && oldMatch[1]) {
      const digits = oldMatch[1];
      return digits.slice(-3);
    }

    return "000";
  }

  // ฟังก์ชันสุ่มยอดถอนตามโอกาส - ใช้ค่าจาก config
  function getRandomAmount() {
    const ranges = config.withdrawalRanges || [
      { min: 500, max: 20000, weight: 90 },
      { min: 20001, max: 100000, weight: 10 }
    ];

    const weightedList = ranges.flatMap(range =>
      Array(range.weight).fill(range)
    );

    const selectedRange = weightedList[Math.floor(Math.random() * weightedList.length)];
    const randomAmount = Math.random() * (selectedRange.max - selectedRange.min) + selectedRange.min;
    
    return formatNumberWithCommas(randomAmount.toFixed(2));
  }

  // จัดรูปแบบจำนวนเงิน
  function formatNumberWithCommas(number) {
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  // ฟังก์ชันสร้างรูปแบบวันที่เวลาปัจจุบัน
  function getCurrentDateTime() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = (now.getFullYear() + 543) % 100;
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // เลือกไอคอนแบบสุ่ม - ใช้ค่าจาก config
  function getRandomIcon() {
    const icons = config.icons || ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png'];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  // สร้างรายการถอนเงินทั้งหมดตั้งแต่เริ่มต้น
  function initializeWithdrawals() {
    const slider = container.querySelector('.gu-withdrawal-slider');
    slider.innerHTML = '';

    const numItems = 3; // Always show 3 items

    for (let i = 0; i < numItems; i++) {
      const itemIndex = i % withdrawals.length;
      const item = withdrawals[itemIndex];
      const itemElement = document.createElement('div');

      // กำหนด class ตามตำแหน่ง
      if (i === 0) itemElement.className = 'withdrawal-item left';
      else if (i === 1) itemElement.className = 'withdrawal-item center';
      else itemElement.className = 'withdrawal-item right';

      // ใช้ค่า config.content.congratsMessage แทนข้อความเดิม
      itemElement.innerHTML = `
        <div class="item-content">
          <div class="congrats-message">${config.content.congratsMessage}</div>
          <div class="detail-section">
            <div class="bank-logo">
              <img src="https://banfah99.com/img/${item.icon}" alt="Bank Icon">
            </div>
            <div class="details-container">
              <div class="user-info">คุณ : <span class="withdraw-text-highlight">${item.name}</span> ${config.content.successMessage}</div>
              <div class="amount-display"><span class="amount-highlight">${item.amount}</span></div>
              <div class="meta-info">
                <span class="user-id withdraw-text-highlight">${item.user}</span>
                <span class="separator">|</span>
                <span class="date-time withdraw-text-highlight">${item.date}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      slider.appendChild(itemElement);
    }
  }

  // ปรับปรุงรายการถอนเงิน
  function updateWithdrawals() {
    const slider = container.querySelector('.gu-withdrawal-slider');
    const expectedItems = 3;
    let isNewItemLarge = false;

    if (slider.children.length === expectedItems) {
      slider.children[0].classList.add('exit-item');

      const newData = {
        icon: getRandomIcon(),
        user: getRandomUser(),
        date: getCurrentDateTime(),
        amount: getRandomAmount(),
        name: getRandomThaiName()
      };

      // ตรวจสอบว่าจำนวนเงินมากพอที่จะ highlight หรือไม่
      const numericAmount = parseFloat(newData.amount.replace(/,/g, ''));
      isNewItemLarge = numericAmount >= config.timing.largeWithdrawalThreshold;

      setTimeout(() => {
        if (slider.children.length > 0) {
          slider.removeChild(slider.children[0]);
        }

        if (slider.children[0]) {
          slider.children[0].classList.remove('center');
          slider.children[0].classList.add('left');
        }
        if (slider.children[1]) {
          slider.children[1].classList.remove('right');
          slider.children[1].classList.add('center');
        }

        const itemElement = document.createElement('div');
        itemElement.className = 'withdrawal-item right new-item';

        // ใช้ค่าจาก config สำหรับข้อความแสดงความยินดี
        itemElement.innerHTML = `
          <div class="item-content">
            <div class="congrats-message">${config.content.congratsMessage}</div>
            <div class="detail-section">
              <div class="bank-logo">
                <img src="https://banfah99.com/img/${newData.icon}" alt="Bank Icon">
              </div>
              <div class="details-container">
                <div class="user-info">คุณ : <span class="withdraw-text-highlight">${newData.name}</span> ${config.content.successMessage}</div>
                <div class="amount-display"><span class="amount-highlight">${newData.amount}</span></div>
                <div class="meta-info">
                  <span class="user-id withdraw-text-highlight">${newData.user}</span>
                  <span class="separator">|</span>
                  <span class="date-time withdraw-text-highlight">${newData.date}</span>
                </div>
              </div>
            </div>
          </div>
        `;

        // Add highlight class if the new item is large
        if (isNewItemLarge) {
          itemElement.classList.add('large-withdrawal-highlight');
          highlightedItemElement = itemElement;
        }

        slider.appendChild(itemElement);

        setTimeout(() => {
          itemElement.classList.remove('new-item');
        }, 600);
      }, 400);
    } else {
      console.warn(`Incorrect item count (${slider.children.length}), re-initializing.`);
      initializeWithdrawals();
    }
    return isNewItemLarge;
  }

  // ปรับปรุงการแสดงผลเมื่อขนาดหน้าจอเปลี่ยน
  window.addEventListener('resize', () => {
    if (window.updateTimeout) {
      clearTimeout(window.updateTimeout);
    }

    initializeWithdrawals();

    if (window.autoUpdateEnabled) {
      scheduleNextUpdate();
    }
  });

  // อัพเดทรายการด้วยระยะเวลาตามค่า config
  function scheduleNextUpdate(delayOverride) {
    let delay;
    if (delayOverride !== undefined) {
      delay = delayOverride;
    } else {
      delay = Math.random() * (config.timing.maxDelay - config.timing.minDelay) + config.timing.minDelay;
    }

    if (window.updateTimeout) {
      clearTimeout(window.updateTimeout);
    }

    window.updateTimeout = setTimeout(() => {
      if (highlightedItemElement) {
        highlightedItemElement.classList.remove('large-withdrawal-highlight');
        highlightedItemElement = null;
      }

      const isNewItemLarge = updateWithdrawals();

      const nextDelay = isNewItemLarge ? config.timing.largeWithdrawalDelay : undefined;

      scheduleNextUpdate(nextDelay);

    }, delay);
    return window.updateTimeout;
  }

  // ดึงชื่อจาก kidhaina.com เมื่อเริ่มต้น
  fetchThaiNames();
  
  // เริ่มต้นแสดงรายการ
  initializeWithdrawals();

  // ตัวแปรสำหรับควบคุมการอัพเดทอัตโนมัติ
  window.autoUpdateEnabled = true;

  // เริ่มต้นการอัพเดทรายการอัตโนมัติ
  scheduleNextUpdate();

  // แจ้งให้ parent window ทราบว่าวิดเจ็ตพร้อมใช้งานแล้ว
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'GU_WIDGET_READY', height: document.body.scrollHeight }, '*');
  }
}

// รองรับการปรับขนาด iframe จาก parent
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'GU_RESIZE_IFRAME') {
    const container = document.querySelector('.marquee-text-container');
    if (container) {
      container.style.height = event.data.height + 'px';
    }
  }
});