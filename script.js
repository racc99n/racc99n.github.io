// ในไฟล์ script.js
document.addEventListener('DOMContentLoaded', function() {
    const marqueeContainer = document.querySelector('.marquee-text-container');
  
    if (marqueeContainer) {
      // โหลด config จาก remote
      fetch('config.json')
        .then(response => response.json())
        .then(config => {
          // เริ่มต้นวิดเจ็ตด้วยค่า config ที่โหลดมา
          initializeWidget(marqueeContainer, config);
        })
        .catch(error => {
          console.error('Error loading config:', error);
          // ใช้ค่าเริ่มต้นถ้าโหลด config ไม่สำเร็จ
          initializeWidget(marqueeContainer, {
            // default config values
          });
        });
    }
  });
  
  function initializeWidget(container, config) {
    // เพิ่ม class และสร้าง container
    container.classList.add('gu-withdrawal-widget');
    container.innerHTML = `
      <div class="gu-withdrawal-container">
        <div class="gu-withdrawal-slider">
          <!-- รายการถอนเงินจะถูกเพิ่มโดย JavaScript -->
        </div>
      </div>
    `;
  
    // ใช้ค่า config ในการตั้งค่า styles
    const containerElement = container.querySelector('.gu-withdrawal-container');
    if (containerElement && config.styles) {
      containerElement.style.backgroundColor = config.styles.backgroundColor;
      containerElement.style.borderRadius = config.styles.borderRadius;
      containerElement.style.boxShadow = config.styles.boxShadow;
    }
    const thaiNames = [
        'สมชาย', 'วรรณา', 'อรุณ', 'มานะ', 'รุ่งนภา', 'พิทักษ์', 'กัญญา', 'สมศักดิ์',
        'พรทิพย์', 'ชาติชาย', 'อรพรรณ', 'ประเสริฐ', 'ธนากร', 'กรรณิการ์', 'สุทธิพงษ์', 'อาทิตย์',
        'ธิดา', 'สุภาพร', 'ไพบูลย์', 'ปรีชา', 'วันดี', 'นงลักษณ์', 'สมหมาย', 'เอกชัย', 'สุนทร',
        'นิภา', 'วราภรณ์', 'สุพจน์', 'ทิพวรรณ', 'ธีรพงษ์', 'พิมพ์พร', 'ปัญญา', 'จันทร์เพ็ญ',
        'อัมพร', 'อนุพงษ์', 'ศิริพร', 'ภานุวัฒน์', 'จรัญ', 'เกศินี', 'อนันต์', 'ชูชาติ', 'รัชนี',
        'บุญเรือง', 'อัญชลี', 'เฉลิมพล', 'ประภาส', 'สุรีย์', 'นิพนธ์', 'ดารณี', 'นิรันดร์', 'จิรา'
      ];

      // เปลี่ยนจากรายชื่อตายตัวเป็นการดึงข้อมูลจาก API
      let nameCache = [...thaiNames]; // เริ่มต้นด้วยรายชื่อที่มีอยู่แล้ว
      let isLoadingNames = false;

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

      // ดึงชื่อจาก kidhaina.com เมื่อเริ่มต้น
      fetchThaiNames();

      // ฟังก์ชันสุ่มชื่อผู้ใช้ที่ดูสมจริงมากขึ้น - แก้ไขให้เป็นรูปแบบ GUxXXXx
      function getRandomUser() {
        const prefix = 'GU';
        const suffix = 'x';
        // สุ่มตัวเลข 3 หลัก
        const middle = Math.floor(100 + Math.random() * 900);
        return `${prefix}x${middle}${suffix}`;
      }

      // ฟังก์ชันดึง 3 ตัวสุดท้ายของรหัสผู้ใช้ - ปรับให้รองรับรูปแบบใหม่
      function getLastThreeDigits(user) {
        // ดึง 3 ตัวเลขจากกลางตามรูปแบบ GUxXXXx
        const match = user.match(/GUx(\d{3})x/);
        if (match && match[1]) {
          return match[1];
        }

        // ยังคงรองรับรูปแบบเดิม xxxx0000xx สำหรับข้อมูลตัวอย่าง
        const oldMatch = user.match(/(\d{3,4})xx$/);
        if (oldMatch && oldMatch[1]) {
          const digits = oldMatch[1];
          return digits.slice(-3);
        }

        return "000"; // ค่าเริ่มต้นถ้าไม่พบรูปแบบที่ต้องการ
      }

      // ข้อมูลตัวอย่าง - ปรับรูปแบบให้เป็น GUxXXXx
      const withdrawals = [
        { icon: '6.png', user: 'GUx853x', date: '17/4/68 18:25', amount: '14,262.00', name: 'สมชาย' },
        { icon: '3.png', user: 'GUx937x', date: '17/4/68 18:25', amount: '17,488.00', name: 'วรรณา' },
        { icon: '6.png', user: 'GUx916x', date: '17/4/68 18:25', amount: '4,092.00', name: 'อรุณ' },
        { icon: '2.png', user: 'GUx123x', date: '17/4/68 18:25', amount: '5,000.00', name: 'มานะ' },
        { icon: '4.png', user: 'GUx567x', date: '17/4/68 18:25', amount: '7,500.00', name: 'รุ่งนภา' },
        { icon: '1.png', user: 'GUx345x', date: '17/4/68 18:25', amount: '9,800.00', name: 'พิทักษ์' },
        { icon: '5.png', user: 'GUx789x', date: '17/4/68 18:25', amount: '12,500.00', name: 'กัญญา' },
        { icon: '2.png', user: 'GUx246x', date: '17/4/68 18:26', amount: '21,000.00', name: 'สมศักดิ์' }
      ];

      const slider = marqueeContainer.querySelector('.gu-withdrawal-slider');
      let highlightedItemElement = null; // Track the highlighted item

      // ฟังก์ชันสุ่มยอดถอนตามโอกาส
      function getRandomAmount() {
        const ranges = [
          { min: 500, max: 2000, weight: 40 },
          { min: 2001, max: 5000, weight: 30 },
          { min: 5001, max: 20000, weight: 20 },
          { min: 20001, max: 50000, weight: 8 },
          { min: 50001, max: 100000, weight: 2 }
        ];

        const weightedList = ranges.flatMap(range =>
          Array(range.weight).fill(range)
        );

        const selectedRange = weightedList[Math.floor(Math.random() * weightedList.length)];
        const randomAmount = Math.random() * (selectedRange.max - selectedRange.min) + selectedRange.min;
        // เปลี่ยนการรูปแบบตัวเลขให้มี comma กั้นหลักพัน
        return formatNumberWithCommas(randomAmount.toFixed(2));
      }

      // เพิ่มฟังก์ชันใหม่สำหรับการจัดรูปแบบจำนวนเงินให้มี comma separator
      function formatNumberWithCommas(number) {
        // แยกส่วนจำนวนเต็มกับทศนิยม
        const parts = number.toString().split('.');
        // ใส่ comma ในส่วนจำนวนเต็ม โดยเริ่มจากท้ายไปหน้า ทุกๆ 3 ตำแหน่ง
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        // รวมจำนวนเต็มกับทศนิยมกลับเข้าด้วยกัน
        return parts.join('.');
      }

      // ฟังก์ชันสร้างรูปแบบวันที่เวลาปัจจุบัน
      function getCurrentDateTime() {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = (now.getFullYear() + 543) % 100;  // แปลงเป็นปี พ.ศ. และเอาแค่ 2 หลักสุดท้าย
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }

      // เลือกไอคอนแบบสุ่ม
      function getRandomIcon() {
        const icons = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png'];
        return icons[Math.floor(Math.random() * icons.length)];
      }

      // สร้างรายการถอนเงินทั้งหมดตั้งแต่เริ่มต้น
      function initializeWithdrawals() {
        const slider = marqueeContainer.querySelector('.gu-withdrawal-slider');
        slider.innerHTML = '';

        const isMobile = window.innerWidth <= 768;
        const numItems = 3; // Always show 3 items

        for (let i = 0; i < numItems; i++) {
          const itemIndex = i % withdrawals.length;
          const item = withdrawals[itemIndex];
          const lastThreeDigits = getLastThreeDigits(item.user);
          const itemElement = document.createElement('div');

          // กำหนด class ตามตำแหน่ง (same for mobile and desktop)
          if (i === 0) itemElement.className = 'withdrawal-item left';
          else if (i === 1) itemElement.className = 'withdrawal-item center';
          else itemElement.className = 'withdrawal-item right';

          itemElement.innerHTML = `
            <div class="item-content">
              <div class="congrats-message">GU899 ขอแสดงความยินดี</div>
              <div class="detail-section">
                <div class="bank-logo">
                  <img src="https://banfah99.com/img/${item.icon}" alt="Bank Icon">
                </div>
                <div class="details-container">
                  <div class="user-info">คุณ : <span class="withdraw-text-highlight">${item.name}</span> ถอนเงินสำเร็จ</div>
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

      // เริ่มต้นแสดงรายการ
      initializeWithdrawals();

      // ปรับปรุงฟังก์ชัน updateWithdrawals ให้มี animation ที่ต่อเนื่องแบบวน loop
      function updateWithdrawals() {
        const slider = marqueeContainer.querySelector('.gu-withdrawal-slider');
        const expectedItems = 3; // Always expect 3 items
        let isNewItemLarge = false; // Flag for the newly added item

        if (slider.children.length === expectedItems) {
          slider.children[0].classList.add('exit-item');

          const newData = {
            icon: getRandomIcon(),
            user: getRandomUser(),
            date: getCurrentDateTime(),
            amount: getRandomAmount(),
            name: getRandomThaiName()
          };

          // Check if the new amount is large
          const numericAmount = parseFloat(newData.amount.replace(/,/g, ''));
          isNewItemLarge = numericAmount >= 30000;

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
            const newClass = 'right';
            itemElement.className = `withdrawal-item ${newClass} new-item`;
            const lastThreeDigits = getLastThreeDigits(newData.user);

            itemElement.innerHTML = `
              <div class="item-content">
                <div class="congrats-message">GU899 ขอแสดงความยินดี</div>
                <div class="detail-section">
                  <div class="bank-logo">
                    <img src="https://banfah99.com/img/${newData.icon}" alt="Bank Icon">
                  </div>
                  <div class="details-container">
                    <div class="user-info">คุณ : <span class="withdraw-text-highlight">${newData.name}</span> ถอนเงินสำเร็จ</div>
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
              highlightedItemElement = itemElement; // Track the highlighted item
            }

            slider.appendChild(itemElement);

            setTimeout(() => {
              itemElement.classList.remove('new-item');
            }, 600);
          }, 400);
        } else if (slider.children.length !== expectedItems) {
            console.warn(`Incorrect item count (${slider.children.length}), re-initializing.`);
            initializeWithdrawals();
        }
        return isNewItemLarge; // Return status of the new item
      }

      // ปรับปรุงการแสดงผลเมื่อขนาดหน้าจอเปลี่ยน
      window.addEventListener('resize', () => {
        // ล้าง timeout ที่กำลังทำงานอยู่เพื่อป้องกันการอัพเดทซ้ำซ้อน
        if (window.updateTimeout) {
          clearTimeout(window.updateTimeout);
        }

        // รีเซ็ตและสร้างรายการใหม่ทั้งหมดเมื่อหน้าจอเปลี่ยนขนาด
        initializeWithdrawals();

        // เริ่มการอัพเดทใหม่หลังจากปรับขนาดหน้าจอ
        if (window.autoUpdateEnabled) {
          scheduleNextUpdate();
        }
      });

      // อัพเดทรายการด้วยระยะเวลาสุ่ม, รับค่า delay ที่อาจ override ได้
      function scheduleNextUpdate(delayOverride) {
        let delay;
        if (delayOverride !== undefined) {
          delay = delayOverride;
        } else {
          // Default random delay: 5 to 15 seconds
          delay = Math.random() * 10000 + 5000;
        }

        // Clear previous timeout if any
        if (window.updateTimeout) {
          clearTimeout(window.updateTimeout);
        }

        window.updateTimeout = setTimeout(() => {
          // Remove highlight from the previous item *before* updating
          if (highlightedItemElement) {
            highlightedItemElement.classList.remove('large-withdrawal-highlight');
            highlightedItemElement = null;
          }

          // Update the withdrawals and check if the new item is large
          const isNewItemLarge = updateWithdrawals();

          // Determine the next delay
          const nextDelay = isNewItemLarge ? 20000 : undefined; // 20s if large, undefined for random next time

          // Schedule the *next* update
          scheduleNextUpdate(nextDelay);

        }, delay); // Use the calculated delay for *this* timeout
        return window.updateTimeout;
      }

      // ตัวแปรสำหรับควบคุมการอัพเดทอัตโนมัติ
      window.autoUpdateEnabled = true;

      // เริ่มต้นการอัพเดทรายการอัตโนมัติ (ใช้ delay เริ่มต้นแบบสุ่ม)
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