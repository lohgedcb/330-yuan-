// ========== iOS风格弹窗系统 ==========

// 创建iOS风格的alert弹窗
function iosAlert(message, title = '提示') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = title;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.textContent = message;
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';
        
        const okBtn = document.createElement('button');
        okBtn.className = 'ios-dialog-button primary';
        okBtn.textContent = '好';
        okBtn.onclick = () => {
            closeDialog();
        };
        
        buttonsEl.appendChild(okBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog() {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve();
            }, 300);
        }
    });
}

// 创建iOS风格的confirm弹窗
function iosConfirm(message, title = '确认') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = title;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.textContent = message;
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog(false);
        };
        
        const okBtn = document.createElement('button');
        okBtn.className = 'ios-dialog-button primary';
        okBtn.textContent = '确定';
        okBtn.onclick = () => {
            closeDialog(true);
        };
        
        buttonsEl.appendChild(cancelBtn);
        buttonsEl.appendChild(okBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog(result) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 300);
        }
    });
}

// 覆盖原生的alert和confirm
window.alert = iosAlert;
window.confirm = iosConfirm;

// ========== IndexedDB 存储管理系统 ==========

let db = null;
const DB_NAME = 'YuanBaoPhoneDB';
const DB_VERSION = 1;

// 初始化IndexedDB
async function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB打开失败:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB已初始化');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            console.log('IndexedDB升级中...');
            
            // 创建对象存储（类似表）
            if (!db.objectStoreNames.contains('images')) {
                const imageStore = db.createObjectStore('images', { keyPath: 'id' });
                imageStore.createIndex('type', 'type', { unique: false });
                imageStore.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('images存储已创建');
            }
            
            if (!db.objectStoreNames.contains('chats')) {
                const chatStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
                chatStore.createIndex('timestamp', 'timestamp', { unique: false });
                chatStore.createIndex('conversation', 'conversation', { unique: false });
                console.log('chats存储已创建（预留）');
            }
            
            if (!db.objectStoreNames.contains('files')) {
                const fileStore = db.createObjectStore('files', { keyPath: 'id' });
                fileStore.createIndex('type', 'type', { unique: false });
                fileStore.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('files存储已创建');
            }
        };
    });
}

// 保存图片到IndexedDB
async function saveImageToDB(id, imageData, type = 'image') {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        
        const imageObject = {
            id: id,
            data: imageData,
            type: type,
            timestamp: Date.now()
        };
        
        const request = store.put(imageObject);
        
        request.onsuccess = () => {
            console.log(`图片已保存: ${id}`);
            resolve(true);
        };
        
        request.onerror = () => {
            console.error(`图片保存失败: ${id}`, request.error);
            reject(request.error);
        };
    });
}

// 从IndexedDB读取图片
async function getImageFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const request = store.get(id);
        
        request.onsuccess = () => {
            if (request.result) {
                console.log(` 图片已读取: ${id}`);
                resolve(request.result.data);
            } else {
                resolve(null);
            }
        };
        
        request.onerror = () => {
            console.error(` 图片读取失败: ${id}`, request.error);
            reject(request.error);
        };
    });
}

// 删除IndexedDB中的图片
async function deleteImageFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        const request = store.delete(id);
        
        request.onsuccess = () => {
            console.log(` 图片已删除: ${id}`);
            resolve(true);
        };
        
        request.onerror = () => {
            console.error(` 图片删除失败: ${id}`, request.error);
            reject(request.error);
        };
    });
}

// 获取所有图片
async function getAllImagesFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// 获取数据库使用情况
async function getStorageUsage() {
    if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usageInMB = (estimate.usage / (1024 * 1024)).toFixed(2);
        const quotaInMB = (estimate.quota / (1024 * 1024)).toFixed(2);
        console.log(` 存储使用情况: ${usageInMB}MB / ${quotaInMB}MB`);
        return { usage: usageInMB, quota: quotaInMB, percentage: (estimate.usage / estimate.quota * 100).toFixed(2) };
    }
    return null;
}

// ========== 图片压缩功能 ==========

/**
 * 压缩图片
 * @param {File|Blob} file - 图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<string>} - 压缩后的Base64数据
 */
async function compressImage(file, options = {}) {
    const {
        maxWidth = 1920,        // 最大宽度
        maxHeight = 1920,       // 最大高度
        quality = 0.8,          // 压缩质量 (0-1)
        maxSizeKB = 500,        // 最大文件大小(KB)
        outputFormat = 'image/jpeg'  // 输出格式
    } = options;
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // 计算缩放比例
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }
                
                // 创建Canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                
                // 白色背景（针对透明图片）
                if (outputFormat === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                }
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 尝试不同质量压缩，直到满足大小要求
                let currentQuality = quality;
                let compressedData = canvas.toDataURL(outputFormat, currentQuality);
                
                // 计算压缩后的大小（Base64转KB）
                const getBase64SizeKB = (base64) => {
                    const base64Length = base64.length - (base64.indexOf(',') + 1);
                    return (base64Length * 0.75) / 1024;
                };
                
                let attempts = 0;
                const maxAttempts = 5;
                
                while (getBase64SizeKB(compressedData) > maxSizeKB && currentQuality > 0.1 && attempts < maxAttempts) {
                    currentQuality -= 0.1;
                    compressedData = canvas.toDataURL(outputFormat, currentQuality);
                    attempts++;
                }
                
                const finalSizeKB = getBase64SizeKB(compressedData);
                console.log(` 图片压缩完成: ${img.width}x${img.height} → ${width}x${height}, ${finalSizeKB.toFixed(2)}KB, 质量:${(currentQuality * 100).toFixed(0)}%`);
                
                resolve(compressedData);
            };
            
            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };
        
        // 如果是GIF，保留原格式
        if (file.type === 'image/gif') {
            reader.onload = (e) => {
                console.log('GIF图片保留原格式');
                resolve(e.target.result);
            };
        }
        
        reader.readAsDataURL(file);
    });
}

// ========== 锁屏功能 ==========

// 检查并显示锁屏
function checkAndShowLockScreen() {
    const lockScreenEnabled = localStorage.getItem('lockScreenEnabled') === 'true';
    if (lockScreenEnabled) {
        showLockScreen();
    }
}

// 显示锁屏
function showLockScreen() {
    const lockScreen = document.getElementById('lockScreen');
    lockScreen.classList.add('active');
    
    // 应用壁纸
    applyWallpaperToLockScreen();
    
    // 更新时间
    updateLockScreenTime();
    
    // 每秒更新时间
    const timeInterval = setInterval(() => {
        if (!lockScreen.classList.contains('active')) {
            clearInterval(timeInterval);
            return;
        }
        updateLockScreenTime();
    }, 1000);
    
    // 获取滑动方式设置
    const slideMode = localStorage.getItem('lockScreenSlideMode') || 'horizontal';
    
    // 显示对应的解锁界面
    const horizontalSlide = document.getElementById('horizontalSlide');
    const verticalSlide = document.getElementById('verticalSlide');
    
    if (slideMode === 'horizontal') {
        horizontalSlide.style.display = 'block';
        verticalSlide.style.display = 'none';
        initSlideToUnlock();
    } else {
        horizontalSlide.style.display = 'none';
        verticalSlide.style.display = 'block';
        initSwipeUpUnlock();
    }
}

// 更新锁屏时间
function updateLockScreenTime() {
    const now = new Date();
    
    // 获取小时和分钟
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // 获取月份、日期和星期
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    // 更新显示
    document.getElementById('lockTime').textContent = `${hours}:${minutes}`;
    document.getElementById('lockDate').textContent = `${month}月${date}日 ${weekday}`;
}

// 初始化滑动解锁
function initSlideToUnlock() {
    const slideButton = document.getElementById('slideButton');
    const slideTrack = slideButton.parentElement;
    const slideText = document.getElementById('slideText');
    
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    const maxSlide = slideTrack.offsetWidth - slideButton.offsetWidth - 8;
    
    // 鼠标/触摸开始
    function handleStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        slideButton.style.transition = 'none';
    }
    
    // 鼠标/触摸移动
    function handleMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = clientX - startX;
        
        // 限制滑动范围
        if (currentX < 0) currentX = 0;
        if (currentX > maxSlide) currentX = maxSlide;
        
        // 移动按钮
        slideButton.style.transform = `translateX(${currentX}px)`;
        
        // 文字淡出效果
        const opacity = 1 - (currentX / maxSlide);
        slideText.style.opacity = opacity;
        
        // 检查是否滑动到底
        if (currentX >= maxSlide * 0.9) {
            unlockScreen();
        }
    }
    
    // 鼠标/触摸结束
    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // 如果没有滑动到底，回弹
        if (currentX < maxSlide * 0.9) {
            slideButton.style.transition = 'transform 0.3s ease-out';
            slideButton.style.transform = 'translateX(0)';
            slideText.style.opacity = '1';
        }
        
        currentX = 0;
    }
    
    // 解锁屏幕
    function unlockScreen() {
        isDragging = false;
        const lockScreen = document.getElementById('lockScreen');
        
        // 检查是否启用了密码
        const passwordEnabled = localStorage.getItem('lockPasswordEnabled') === 'true';
        const passwordType = localStorage.getItem('passwordType') || 'number';
        const hasPassword = passwordType === 'number' ? 
            localStorage.getItem('lockPassword') : 
            localStorage.getItem('lockGesture');
        
        if (passwordEnabled && hasPassword) {
            // 有密码，重置滑块并显示密码输入界面
            slideButton.style.transition = 'transform 0.3s ease-out';
            slideButton.style.transform = 'translateX(0)';
            slideText.style.opacity = '1';
            
            // 延迟一下显示密码界面，让滑块先复位
            setTimeout(() => {
                showPasswordScreen();
            }, 200);
        } else {
            // 没有密码，直接解锁
            lockScreen.style.transition = 'opacity 0.3s ease-out';
            lockScreen.style.opacity = '0';
            
            setTimeout(() => {
                lockScreen.classList.remove('active');
                lockScreen.style.opacity = '1';
                lockScreen.style.transition = '';
                
                // 重置滑块
                slideButton.style.transition = 'transform 0.3s ease-out';
                slideButton.style.transform = 'translateX(0)';
                slideText.style.opacity = '1';
            }, 300);
        }
    }
    
    // 添加事件监听
    slideButton.addEventListener('mousedown', handleStart);
    slideButton.addEventListener('touchstart', handleStart, { passive: false });
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
}

// 初始化向上滑动解锁
function initSwipeUpUnlock() {
    const lockScreen = document.getElementById('lockScreen');
    let startY = 0;
    let currentY = 0;
    let isSwiping = false;
    
    // 触摸/鼠标开始
    function handleStart(e) {
        isSwiping = true;
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    }
    
    // 触摸/鼠标移动
    function handleMove(e) {
        if (!isSwiping) return;
        
        e.preventDefault();
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        currentY = startY - clientY; // 向上滑动时值为正
        
        // 如果向上滑动超过100px，解锁
        if (currentY > 100) {
            unlockScreen();
        }
    }
    
    // 触摸/鼠标结束
    function handleEnd() {
        isSwiping = false;
        startY = 0;
        currentY = 0;
    }
    
    // 解锁屏幕
    function unlockScreen() {
        isSwiping = false;
        
        // 检查是否启用了密码
        const passwordEnabled = localStorage.getItem('lockPasswordEnabled') === 'true';
        const passwordType = localStorage.getItem('passwordType') || 'number';
        const hasPassword = passwordType === 'number' ? 
            localStorage.getItem('lockPassword') : 
            localStorage.getItem('lockGesture');
        
        if (passwordEnabled && hasPassword) {
            // 有密码，直接显示密码输入界面（不关闭锁屏）
            showPasswordScreen();
        } else {
            // 没有密码，直接解锁
            lockScreen.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            lockScreen.style.opacity = '0';
            lockScreen.style.transform = 'translateY(-50px)';
            
            setTimeout(() => {
                lockScreen.classList.remove('active');
                lockScreen.style.opacity = '1';
                lockScreen.style.transform = '';
                lockScreen.style.transition = '';
            }, 300);
        }
    }
    
    // 添加事件监听（监听整个锁屏界面）
    lockScreen.addEventListener('mousedown', handleStart);
    lockScreen.addEventListener('touchstart', handleStart, { passive: false });
    
    lockScreen.addEventListener('mousemove', handleMove);
    lockScreen.addEventListener('touchmove', handleMove, { passive: false });
    
    lockScreen.addEventListener('mouseup', handleEnd);
    lockScreen.addEventListener('touchend', handleEnd);
}

// ========== IndexedDB 持久化存储管理 ==========

class StorageDB {
    constructor() {
        this.dbName = 'YuanbaoAppDB';
        this.version = 1;
        this.db = null;
    }

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('数据库打开失败:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('数据库初始化成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建对象存储空间（如果不存在）
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                console.log('数据库升级完成');
            };
        });
    }

    // 保存数据
    async setItem(key, value) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value, timestamp: Date.now() });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // 读取数据
    async getItem(key) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // 删除数据
    async removeItem(key) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // 获取所有键
    async getAllKeys() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 清空所有数据
    async clear() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // 从 localStorage 迁移数据
    async migrateFromLocalStorage() {
        const keysToMigrate = ['apiSettings', 'apiPresets', 'widgetAvatar', 'widgetName', 'widgetId', 'widgetContent', 'notebookLoveDate', 'notebookLoveDateConfig', 'notebookText', 'notebookImage', 'musicAvatar', 'musicUsername', 'musicBirthday', 'musicCover'];
        let migrated = 0;

        for (const key of keysToMigrate) {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    // 尝试解析 JSON（头像、名称、ID、文案、相恋日期、图片、音乐头像、音乐用户名、音乐生日和音乐封面直接存储字符串）
                    const stringKeys = ['widgetAvatar', 'widgetName', 'widgetId', 'widgetContent', 'notebookLoveDate', 'notebookText', 'notebookImage', 'musicAvatar', 'musicUsername', 'musicBirthday', 'musicCover'];
                    const parsedValue = stringKeys.includes(key) ? value : JSON.parse(value);
                    await this.setItem(key, parsedValue);
                    migrated++;
                    console.log(`已迁移: ${key}`);
                } catch (e) {
                    console.error(`迁移失败 ${key}:`, e);
                }
            }
        }

        if (migrated > 0) {
            console.log(`成功迁移 ${migrated} 项数据到 IndexedDB`);
        }

        return migrated;
    }
}

// 创建全局存储实例
const storageDB = new StorageDB();

// 更新时间显示
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
}

// 更新电池显示
async function updateBattery() {
    try {
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            const level = Math.floor(battery.level * 100);
            const batteryEl = document.getElementById('batteryPercentage');
            const batteryBody = document.querySelector('.battery-body');
            
            if (batteryEl) {
                batteryEl.textContent = level;
            }
            
            // 根据充电状态和电量更改颜色
            if (batteryBody) {
                // 移除所有状态类
                batteryBody.classList.remove('charging', 'low-battery');
                
                if (battery.charging) {
                    // 充电中显示绿色
                    batteryBody.classList.add('charging');
                } else if (level < 20) {
                    // 低电量显示红色
                    batteryBody.classList.add('low-battery');
                }
                // 其他情况保持默认灰色
            }
        } else {
            // 不支持电池API，显示100
            const batteryEl = document.getElementById('batteryPercentage');
            if (batteryEl) {
                batteryEl.textContent = '100';
            }
        }
    } catch (error) {
        // 出错时显示100
        const batteryEl = document.getElementById('batteryPercentage');
        if (batteryEl) {
            batteryEl.textContent = '100';
        }
    }
}

// 更新日期和星期显示（自动适配用户地区）
function updateWidgetDate() {
    const now = new Date();
    
    // 获取用户所在地区的语言设置
    const userLocale = navigator.language || 'zh-CN';
    
    // 根据地区自动格式化日期
    let dateText;
    if (userLocale.startsWith('zh')) {
        // 中文地区：显示 "月日" 格式
        const month = now.getMonth() + 1;
        const day = now.getDate();
        dateText = `${month}月${day}日`;
    } else if (userLocale.startsWith('ja')) {
        // 日语地区：显示 "月日" 格式
        const month = now.getMonth() + 1;
        const day = now.getDate();
        dateText = `${month}月${day}日`;
    } else if (userLocale.startsWith('en')) {
        // 英语地区：显示 "Mon DD" 格式
        const options = { month: 'short', day: 'numeric' };
        dateText = now.toLocaleDateString(userLocale, options);
    } else {
        // 其他地区：使用简短的日期格式
        const options = { month: 'numeric', day: 'numeric' };
        dateText = now.toLocaleDateString(userLocale, options);
    }
    
    // 获取星期几（根据用户地区自动显示）
    let dayText;
    const dayOfWeek = now.getDay();
    
    if (userLocale.startsWith('zh')) {
        // 中文：星期一、星期二...
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        dayText = days[dayOfWeek];
    } else if (userLocale.startsWith('ja')) {
        // 日语：日曜日、月曜日...
        const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        dayText = days[dayOfWeek];
    } else {
        // 其他语言：使用系统提供的星期名称（短格式）
        const options = { weekday: 'short' };
        dayText = now.toLocaleDateString(userLocale, options);
    }
    
    // 更新DOM
    const dateElement = document.getElementById('widgetDateText');
    const dayElement = document.getElementById('widgetDayText');
    
    if (dateElement && dayElement) {
        dateElement.textContent = dateText;
        dayElement.textContent = dayText;
    }
}

updateTime();
setInterval(updateTime, 1000);

// 更新电池显示
updateBattery();
setInterval(updateBattery, 1000); // 每1秒更新一次电池

// 更新第二个小组件的日期时间显示（自动适配用户地区）
function updateNotebookDateTime() {
    const now = new Date();
    
    // 获取用户所在地区的语言设置
    const userLocale = navigator.language || 'zh-CN';
    
    let dateTimeText;
    
    if (userLocale.startsWith('zh')) {
        // 中文地区：显示 "月日 时:分" 格式
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeText = `${month}月${day}日 ${hours}:${minutes}`;
    } else if (userLocale.startsWith('ja')) {
        // 日语地区：显示 "月日 时:分" 格式
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeText = `${month}月${day}日 ${hours}:${minutes}`;
    } else if (userLocale.startsWith('en')) {
        // 英语地区：显示 "Mon DD HH:MM" 格式
        const options = { month: 'short', day: 'numeric' };
        const dateStr = now.toLocaleDateString(userLocale, options);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeText = `${dateStr} ${hours}:${minutes}`;
    } else {
        // 其他地区：使用本地化的日期时间格式
        const dateOptions = { month: 'numeric', day: 'numeric' };
        const dateStr = now.toLocaleDateString(userLocale, dateOptions);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeText = `${dateStr} ${hours}:${minutes}`;
    }
    
    // 更新DOM
    const dateTimeElement = document.getElementById('notebookDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeText;
    }
}

// 立即更新日期，然后每分钟更新一次（日期变化不频繁）
updateWidgetDate();
setInterval(updateWidgetDate, 60000);

// 立即更新第二个小组件的日期时间，然后每秒更新一次
updateNotebookDateTime();
setInterval(updateNotebookDateTime, 1000);

// 更新第三个小组件（音乐播放器）的日期显示（自动适配用户地区）
function updateMusicDate() {
    const now = new Date();
    
    // 获取用户所在地区的语言设置
    const userLocale = navigator.language || 'zh-CN';
    
    let dateText;
    
    if (userLocale.startsWith('zh')) {
        // 中文地区：显示 "YYYY-MM-DD 周X" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[now.getDay()];
        dateText = `${year}-${month}-${day} ${weekday}`;
    } else if (userLocale.startsWith('ja')) {
        // 日语地区：显示 "YYYY-MM-DD 曜日" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        const weekday = weekdays[now.getDay()];
        dateText = `${year}-${month}-${day} ${weekday}`;
    } else if (userLocale.startsWith('en')) {
        // 英语地区：显示 "YYYY-MM-DD Day" 格式（例如：2025-01-23 Thu）
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${year}-${month}-${day} ${weekday}`;
    } else if (userLocale.startsWith('ko')) {
        // 韩语地区：显示 "YYYY-MM-DD 요일" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const weekday = weekdays[now.getDay()];
        dateText = `${year}-${month}-${day} ${weekday}`;
    } else if (userLocale.startsWith('de')) {
        // 德语地区：显示 "DD.MM.YYYY Tag" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${day}.${month}.${year} ${weekday}`;
    } else if (userLocale.startsWith('fr')) {
        // 法语地区：显示 "DD/MM/YYYY Jour" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${day}/${month}/${year} ${weekday}`;
    } else if (userLocale.startsWith('es')) {
        // 西班牙语地区：显示 "DD/MM/YYYY Día" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${day}/${month}/${year} ${weekday}`;
    } else if (userLocale.startsWith('ru')) {
        // 俄语地区：显示 "DD.MM.YYYY День" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${day}.${month}.${year} ${weekday}`;
    } else {
        // 其他地区：使用 ISO 格式 YYYY-MM-DD + 星期简写
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${year}-${month}-${day} ${weekday}`;
    }
    
    // 更新DOM
    const musicDateElement = document.getElementById('musicDate');
    if (musicDateElement) {
        musicDateElement.textContent = dateText;
    }
}

// 立即更新第三个小组件的日期，然后每分钟更新一次
updateMusicDate();
setInterval(updateMusicDate, 60000);

// API设置相关功能
const apiUrls = {
    hakimi: 'https://generativelanguage.googleapis.com/v1beta',
    claude: 'https://api.anthropic.com/v1',
    ds: 'https://api.deepseek.com/v1',
    custom: ''
};

// 打开API设置界面
function openApiSettings() {
    document.getElementById('apiSettings').classList.add('active');
    handleProviderChange(); // 初始化API地址
}

// 关闭设置界面
function closeSettings() {
    document.getElementById('apiSettings').classList.remove('active');
}

// 打开数据管理界面（占位）
// ==================== 数据管理功能 ====================

// 打开数据管理界面
async function openDataManagement() {
    document.getElementById('dataManagementSettings').classList.add('active');
    
    // 刷新存储信息和数据统计
    await refreshStorageInfo();
    await updateDataStatistics();
}

// 关闭数据管理界面
function closeDataManagement() {
    document.getElementById('dataManagementSettings').classList.remove('active');
}

// 更新数据统计
async function updateDataStatistics() {
    try {
        const allImages = await getAllImagesFromDB();
        const imageCount = allImages.length;
        
        // 计算总大小（估算Base64大小）
        let totalSizeBytes = 0;
        allImages.forEach(img => {
            if (img.data) {
                // Base64 字符串长度 * 0.75 约等于原始字节数
                const base64Length = img.data.length - (img.data.indexOf(',') + 1);
                totalSizeBytes += base64Length * 0.75;
            }
        });
        
        const totalSizeKB = (totalSizeBytes / 1024).toFixed(2);
        const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
        
        // 更新界面
        document.getElementById('imageCount').textContent = imageCount;
        
        if (totalSizeBytes < 1024 * 1024) {
            document.getElementById('totalSize').textContent = `${totalSizeKB} KB`;
        } else {
            document.getElementById('totalSize').textContent = `${totalSizeMB} MB`;
        }
        
        console.log(` 数据统计: ${imageCount}张图片, ${totalSizeKB}KB`);
    } catch (error) {
        console.error('更新数据统计失败:', error);
    }
}

// 显示详细信息
async function showDataDetails() {
    try {
        const allImages = await getAllImagesFromDB();
        
        if (allImages.length === 0) {
            alert('暂无数据');
            return;
        }
        
        let details = '数据详细信息\n\n';
        details += `总计：${allImages.length} 张图片\n\n`;
        
        allImages.forEach((img, index) => {
            const sizeKB = ((img.data.length - (img.data.indexOf(',') + 1)) * 0.75 / 1024).toFixed(2);
            const date = new Date(img.timestamp).toLocaleString('zh-CN');
            details += `${index + 1}. ${img.id}\n`;
            details += `   类型: ${img.type}\n`;
            details += `   大小: ${sizeKB} KB\n`;
            details += `   时间: ${date}\n\n`;
        });
        
        alert(details);
    } catch (error) {
        console.error('获取详细信息失败:', error);
        alert('获取详细信息失败！');
    }
}

// 导出所有数据
async function exportAllData() {
    try {
        const allImages = await getAllImagesFromDB();
        
        if (allImages.length === 0) {
            alert('暂无数据可导出');
            return;
        }
        
        // 创建导出数据
        const exportData = {
            version: '2.0',
            exportTime: new Date().toISOString(),
            images: allImages,
            settings: {
                lockScreenEnabled: localStorage.getItem('lockScreenEnabled'),
                lockScreenSlideMode: localStorage.getItem('lockScreenSlideMode'),
                lockPasswordEnabled: localStorage.getItem('lockPasswordEnabled'),
                passwordType: localStorage.getItem('passwordType'),
                lockWallpaperEnabled: localStorage.getItem('lockWallpaperEnabled'),
                customStyleEnabled: localStorage.getItem('customStyleEnabled')
            }
        };
        
        // 转换为JSON
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `元宝手机_数据备份_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('数据已导出');
        alert('数据导出成功！');
    } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出失败：' + error.message);
    }
}

// 清空所有图片
async function clearAllImages() {
    const confirmed = confirm('确定要清空所有图片吗？\n\n此操作将删除：\n- 头像\n- 壁纸\n- 封面图\n- 所有其他图片\n\n此操作不可恢复！');
    
    if (!confirmed) return;
    
    const doubleConfirm = confirm('再次确认：真的要删除所有图片吗？');
    
    if (!doubleConfirm) return;
    
    try {
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        const request = store.clear();
        
        await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        // 更新统计
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 清除界面上的图片
        document.getElementById('avatarImage').style.display = 'none';
        document.getElementById('avatarPlaceholder').style.display = 'block';
        
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
        
        alert('所有图片已清空！');
        console.log('所有图片已清空');
    } catch (error) {
        console.error('清空图片失败:', error);
        alert('清空失败：' + error.message);
    }
}

// 刷新存储信息
async function refreshStorageInfo() {
    try {
        const usage = await getStorageUsage();
        if (usage) {
            document.getElementById('storageUsage').textContent = `${usage.usage} MB`;
            document.getElementById('storageQuota').textContent = `${usage.quota} MB`;
            document.getElementById('storageBar').style.width = `${usage.percentage}%`;
            
            // 更新百分比显示（如果存在）
            const percentageEl = document.getElementById('storagePercentage');
            if (percentageEl) {
                percentageEl.textContent = `${usage.percentage}% 已使用`;
            }
            
            console.log(` 存储: ${usage.usage}MB / ${usage.quota}MB (${usage.percentage}%)`);
        }
    } catch (error) {
        console.error('获取存储信息失败:', error);
    }
}

// ==================== 图片压缩功能 ====================

// 压缩进行中标志（防止重复点击）
let isCompressing = false;

// 更新压缩质量显示
function updateCompressionQuality(value) {
    document.getElementById('compressionQuality').textContent = value + '%';
}

// 切换是否压缩小组件图片
function toggleWidgetCompression(checked) {
    console.log('压缩小组件图片:', checked);
}

// 压缩单个图片
async function compressImage(base64Data, quality) {
    return new Promise((resolve, reject) => {
        try {
            // 检查是否为有效的base64数据
            if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes('data:image')) {
                reject(new Error('无效的图片数据'));
                return;
            }
            
            // 创建一个Image对象
            const img = new Image();
            
            // 设置crossOrigin以避免污染canvas
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    // 创建canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    
                    // 设置canvas尺寸为图片尺寸
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // 绘制图片到canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // 尝试压缩图片
                    try {
                        // 先尝试压缩为jpeg
                        const compressedBase64 = canvas.toDataURL('image/jpeg', quality / 100);
                        
                        // 检查压缩是否成功（有些透明图片压缩后可能变大）
                        if (compressedBase64 && compressedBase64.length > 0) {
                            resolve(compressedBase64);
                        } else {
                            // 压缩失败，返回原图
                            resolve(base64Data);
                        }
                    } catch (canvasError) {
                        // Canvas操作失败，返回原图
                        console.warn('Canvas压缩失败，使用原图:', canvasError.message);
                        resolve(base64Data);
                    }
                } catch (error) {
                    console.warn('图片处理失败，使用原图:', error.message);
                    resolve(base64Data);
                }
            };
            
            img.onerror = function(error) {
                console.warn('图片加载失败，使用原图');
                // 图片加载失败时返回原图而不是reject
                resolve(base64Data);
            };
            
            // 设置图片源
            img.src = base64Data;
            
        } catch (error) {
            console.warn('压缩过程出错，使用原图:', error.message);
            // 出错时返回原图而不是reject
            resolve(base64Data);
        }
    });
}

// 压缩所有图片
async function compressAllImages() {
    // 防止重复点击
    if (isCompressing) {
        await iosAlert('图片压缩正在进行中，请稍候...', '提示');
        return;
    }
    
    try {
        // 获取压缩质量
        const quality = parseInt(document.getElementById('compressionSlider').value);
        const compressWidget = document.getElementById('compressWidgetImages').checked;
        
        // 确认操作（使用自定义iOS风格弹窗）
        const confirmed = await iosConfirm(
            `压缩质量: ${quality}%\n压缩小组件图片: ${compressWidget ? '是' : '否'}\n\n此操作将覆盖原图片且不可恢复！`,
            '确定要压缩所有图片吗？'
        );
        
        if (!confirmed) return;
        
        // 设置压缩标志
        isCompressing = true;
        
        // 显示进度条
        const progressDiv = document.getElementById('compressionProgress');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressDetail = document.getElementById('progressDetail');
        const compressBtn = document.getElementById('compressBtn');
        
        progressDiv.style.display = 'block';
        compressBtn.disabled = true;
        compressBtn.style.opacity = '0.5';
        compressBtn.textContent = '正在压缩...';
        
        // 获取所有图片
        const allImages = await getAllImagesFromDB();
        
        if (allImages.length === 0) {
            await iosAlert('暂无图片需要压缩', '提示');
            progressDiv.style.display = 'none';
            compressBtn.disabled = false;
            compressBtn.style.opacity = '1';
            compressBtn.textContent = '开始压缩图片';
            isCompressing = false;
            return;
        }
        
        // 小组件类型列表
        const widgetTypes = ['avatar', 'music-avatar', 'music-cover', 'sticker'];
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        let totalSizeBefore = 0;
        let totalSizeAfter = 0;
        
        // 逐个压缩图片
        for (let i = 0; i < allImages.length; i++) {
            const img = allImages[i];
            
            // 计算原始大小（所有图片都要计算）
            const originalSize = (img.data.length - (img.data.indexOf(',') + 1)) * 0.75;
            totalSizeBefore += originalSize;
            
            // 如果不压缩小组件图片，则跳过小组件类型
            if (!compressWidget && widgetTypes.includes(img.type)) {
                totalSizeAfter += originalSize;
                skipCount++;
                progressDetail.textContent = `跳过小组件图片 (${i + 1}/${allImages.length})`;
                
                // 更新进度
                const progress = Math.round(((i + 1) / allImages.length) * 100);
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
                continue;
            }
            
            try {
                
                // 压缩图片
                progressDetail.textContent = `正在压缩 ${img.type} (${i + 1}/${allImages.length})`;
                const compressedData = await compressImage(img.data, quality);
                
                // 计算压缩后大小
                const compressedSize = (compressedData.length - (compressedData.indexOf(',') + 1)) * 0.75;
                
                // 检查是否真的压缩了（如果返回的是原图，大小会一样）
                if (compressedData === img.data) {
                    // 没有压缩，跳过
                    totalSizeAfter += originalSize;
                    skipCount++;
                    progressDetail.textContent = `跳过无法压缩的图片 ${img.type} (${i + 1}/${allImages.length})`;
                } else {
                    totalSizeAfter += compressedSize;
                    
                    // 更新数据库
                    const transaction = db.transaction(['images'], 'readwrite');
                    const store = transaction.objectStore('images');
                    
                    img.data = compressedData;
                    img.timestamp = Date.now(); // 更新时间戳
                    
                    await new Promise((resolve, reject) => {
                        const request = store.put(img);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                    
                    successCount++;
                }
            } catch (error) {
                console.error(`压缩图片失败 (${img.type}):`, error);
                // 压缩失败，保持原大小
                totalSizeAfter += originalSize;
                errorCount++;
            }
            
            // 更新进度
            const progress = Math.round(((i + 1) / allImages.length) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
        
        // 压缩完成
        const savedSizeKB = ((totalSizeBefore - totalSizeAfter) / 1024).toFixed(2);
        const savedPercentage = totalSizeBefore > 0 ? ((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(1) : 0;
        
        progressDetail.textContent = `压缩完成！成功: ${successCount}张，跳过: ${skipCount}张，失败: ${errorCount}张`;
        
        // 刷新统计信息
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 重置按钮
        compressBtn.disabled = false;
        compressBtn.style.opacity = '1';
        compressBtn.textContent = '开始压缩图片';
        
        // 显示结果（使用自定义弹窗）
        await iosAlert(
            `成功: ${successCount}张\n跳过: ${skipCount}张\n失败: ${errorCount}张\n\n节省空间: ${savedSizeKB} KB (${savedPercentage}%)`,
            '压缩完成！'
        );
        
        // 隐藏进度条
        progressDiv.style.display = 'none';
        
        // 重置压缩标志
        isCompressing = false;
        
        console.log(`图片压缩完成: 成功${successCount}张, 跳过${skipCount}张, 失败${errorCount}张, 节省${savedSizeKB}KB`);
        
    } catch (error) {
        console.error('压缩图片失败:', error);
        
        // 重置UI
        const progressDiv = document.getElementById('compressionProgress');
        const compressBtn = document.getElementById('compressBtn');
        if (progressDiv) progressDiv.style.display = 'none';
        if (compressBtn) {
            compressBtn.disabled = false;
            compressBtn.style.opacity = '1';
            compressBtn.textContent = '开始压缩图片';
        }
        
        // 重置压缩标志
        isCompressing = false;
        
        // 显示错误（使用自定义弹窗）
        await iosAlert('压缩失败：' + error.message, '错误');
    }
}

// 打开外观设置界面
async function openAppearanceSettings() {
    document.getElementById('appearanceSettings').classList.add('active');
    
    // 加载保存的锁屏设置
    const lockScreenEnabled = localStorage.getItem('lockScreenEnabled') === 'true';
    document.getElementById('lockScreenToggle').checked = lockScreenEnabled;
    
    // 显示/隐藏子选项
    const lockScreenOptions = document.getElementById('lockScreenOptions');
    lockScreenOptions.style.display = lockScreenEnabled ? 'block' : 'none';
    
    // 加载自定义样式开关状态
    const customStyleEnabled = localStorage.getItem('customStyleEnabled') === 'true';
    document.getElementById('customStyleToggle').checked = customStyleEnabled;
    
    // 显示/隐藏自定义样式选项
    const customStyleOptions = document.getElementById('customStyleOptions');
    customStyleOptions.style.display = customStyleEnabled ? 'block' : 'none';
    
    // 加载滑动方式设置
    const slideMode = localStorage.getItem('lockScreenSlideMode') || 'horizontal';
    const horizontalToggle = document.getElementById('horizontalToggle');
    const verticalToggle = document.getElementById('verticalToggle');
    
    if (slideMode === 'horizontal') {
        horizontalToggle.checked = true;
        verticalToggle.checked = false;
    } else {
        horizontalToggle.checked = false;
        verticalToggle.checked = true;
    }
    
    // 加载密码设置
    const passwordEnabled = localStorage.getItem('lockPasswordEnabled') === 'true';
    document.getElementById('lockPasswordToggle').checked = passwordEnabled;
    
    const passwordOptions = document.getElementById('passwordOptions');
    passwordOptions.style.display = passwordEnabled ? 'block' : 'none';
    
    // 加载密码类型
    const passwordType = localStorage.getItem('passwordType') || 'number';
    switchPasswordType(passwordType);
    
    // 更新密码状态显示
    updatePasswordStatus();
    updateGestureStatus();
    
    // 加载壁纸设置
    const wallpaperEnabled = localStorage.getItem('lockWallpaperEnabled') === 'true';
    document.getElementById('lockWallpaperToggle').checked = wallpaperEnabled;
    
    const wallpaperOptions = document.getElementById('wallpaperOptions');
    wallpaperOptions.style.display = wallpaperEnabled ? 'block' : 'none';
    
    // 加载壁纸预览
    try {
        const wallpaperData = await getImageFromDB('lockWallpaper');
        if (wallpaperData) {
            const preview = document.getElementById('wallpaperPreview');
            const placeholder = document.getElementById('wallpaperPlaceholder');
            preview.src = wallpaperData;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            tempWallpaperData = wallpaperData;
        }
    } catch (error) {
        console.error('加载壁纸预览失败:', error);
    }
    
    // 更新壁纸状态显示
    await updateWallpaperStatus();
    
    // 加载顶栏设置
    const statusBarEnabled = localStorage.getItem('statusBarEnabled');
    // 默认为true（开启状态）
    const isStatusBarEnabled = statusBarEnabled === null ? true : statusBarEnabled === 'true';
    document.getElementById('statusBarToggle').checked = isStatusBarEnabled;
    
    // 加载手机边框设置
    const phoneBorderEnabled = localStorage.getItem('phoneBorderEnabled');
    // 默认为false（关闭状态）
    const isPhoneBorderEnabled = phoneBorderEnabled === 'true';
    document.getElementById('phoneBorderToggle').checked = isPhoneBorderEnabled;
    
    // 加载主屏幕壁纸设置
    const mainWallpaperEnabled = localStorage.getItem('mainWallpaperEnabled');
    const isMainWallpaperEnabled = mainWallpaperEnabled === 'true';
    document.getElementById('mainWallpaperToggle').checked = isMainWallpaperEnabled;
    
    const mainWallpaperOptions = document.getElementById('mainWallpaperOptions');
    mainWallpaperOptions.style.display = isMainWallpaperEnabled ? 'block' : 'none';
    
    // 加载主屏幕壁纸预览
    try {
        const mainWallpaperData = await getImageFromDB('mainWallpaper');
        if (mainWallpaperData) {
            const preview = document.getElementById('mainWallpaperPreview');
            const placeholder = document.getElementById('mainWallpaperPlaceholder');
            preview.src = mainWallpaperData;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            tempMainWallpaperData = mainWallpaperData;
        }
    } catch (error) {
        console.error('加载主屏幕壁纸预览失败:', error);
    }
    
    // 更新主屏幕壁纸状态显示
    await updateMainWallpaperStatus();
}

// 关闭外观设置界面
function closeAppearanceSettings() {
    document.getElementById('appearanceSettings').classList.remove('active');
}

// 切换顶栏显示
function toggleStatusBar() {
    const toggle = document.getElementById('statusBarToggle');
    const isEnabled = toggle.checked;
    const statusBar = document.querySelector('.status-bar');
    
    // 保存设置到localStorage
    localStorage.setItem('statusBarEnabled', isEnabled);
    
    // 显示/隐藏顶栏
    if (statusBar) {
        statusBar.style.display = isEnabled ? 'flex' : 'none';
    }
    
    console.log('顶栏已' + (isEnabled ? '显示' : '隐藏'));
}

// 切换手机边框
function togglePhoneBorder() {
    const toggle = document.getElementById('phoneBorderToggle');
    const isEnabled = toggle.checked;
    const phoneContainer = document.querySelector('.phone-container');
    
    // 保存设置到localStorage
    localStorage.setItem('phoneBorderEnabled', isEnabled);
    
    // 显示/隐藏手机边框
    if (phoneContainer) {
        if (isEnabled) {
            phoneContainer.classList.add('phone-border');
        } else {
            phoneContainer.classList.remove('phone-border');
        }
    }
    
    console.log('手机边框已' + (isEnabled ? '显示' : '隐藏'));
}

// 切换锁屏功能
function toggleLockScreen() {
    const toggle = document.getElementById('lockScreenToggle');
    const isEnabled = toggle.checked;
    const lockScreenOptions = document.getElementById('lockScreenOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('lockScreenEnabled', isEnabled);
    
    // 显示/隐藏子选项
    lockScreenOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('锁屏页面已' + (isEnabled ? '开启' : '关闭'));
    
    if (isEnabled) {
        console.log('锁屏页面已开启');
    } else {
        console.log('锁屏页面已关闭');
    }
}

// 切换自定义样式
function toggleCustomStyle() {
    const toggle = document.getElementById('customStyleToggle');
    const isEnabled = toggle.checked;
    const customStyleOptions = document.getElementById('customStyleOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('customStyleEnabled', isEnabled);
    
    // 显示/隐藏自定义样式选项
    customStyleOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('自定义样式已' + (isEnabled ? '开启' : '关闭'));
    
    if (isEnabled) {
        console.log('可以选择滑动方式');
        // 如果没有保存过滑动方式，默认选择横向
        if (!localStorage.getItem('lockScreenSlideMode')) {
            localStorage.setItem('lockScreenSlideMode', 'horizontal');
            document.getElementById('horizontalToggle').checked = true;
        }
    } else {
        console.log('使用默认样式（横向滑动）');
    }
}

// 切换锁屏密码
function toggleLockPassword() {
    const toggle = document.getElementById('lockPasswordToggle');
    const isEnabled = toggle.checked;
    const passwordOptions = document.getElementById('passwordOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('lockPasswordEnabled', isEnabled);
    
    // 显示/隐藏密码设置选项
    passwordOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('锁屏密码已' + (isEnabled ? '开启' : '关闭'));
    
    if (!isEnabled) {
        // 关闭密码功能时清除所有密码
        localStorage.removeItem('lockPassword');
        localStorage.removeItem('lockGesture');
        updatePasswordStatus();
        updateGestureStatus();
    }
}

// ==================== 锁屏壁纸功能 ====================

// 切换锁屏壁纸
function toggleLockWallpaper() {
    const toggle = document.getElementById('lockWallpaperToggle');
    const isEnabled = toggle.checked;
    const wallpaperOptions = document.getElementById('wallpaperOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('lockWallpaperEnabled', isEnabled);
    
    // 显示/隐藏壁纸设置选项
    wallpaperOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('锁屏壁纸已' + (isEnabled ? '开启' : '关闭'));
    
    if (isEnabled) {
        // 如果有保存的壁纸，应用到锁屏
        applyWallpaperToLockScreen();
    } else {
        // 关闭壁纸功能时移除壁纸
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
    }
}

// 临时壁纸数据
let tempWallpaperData = null;

// 处理本地文件上传
async function handleWallpaperFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }
    
    try {
        console.log(' 正在压缩壁纸...');
        
        // 压缩图片（壁纸使用较大尺寸，保留更多细节）
        const compressedData = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSizeKB: 800,
            outputFormat: file.type === 'image/gif' ? 'image/gif' : 'image/jpeg'
        });
        
        tempWallpaperData = compressedData;
        
        // 显示预览
        const preview = document.getElementById('wallpaperPreview');
        const placeholder = document.getElementById('wallpaperPlaceholder');
        
        preview.src = compressedData;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        
        console.log('壁纸已压缩并加载');
    } catch (error) {
        console.error('壁纸处理失败:', error);
        alert('壁纸处理失败，请重试！');
    }
}

// 处理URL上传
function handleWallpaperUrlUpload() {
    const urlInput = document.getElementById('wallpaperUrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('请输入图片URL地址！');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }
    
    // 创建图片对象测试加载
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        tempWallpaperData = url;
        
        // 显示预览
        const preview = document.getElementById('wallpaperPreview');
        const placeholder = document.getElementById('wallpaperPlaceholder');
        
        preview.src = url;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        
        console.log('壁纸已加载（URL）');
    };
    
    img.onerror = function() {
        alert('无法加载该图片，请检查URL是否正确或图片是否支持跨域访问！');
    };
    
    img.src = url;
}

// 保存壁纸
async function saveWallpaper() {
    if (!tempWallpaperData) {
        alert('请先选择或加载壁纸！');
        return;
    }
    
    try {
        // 保存到IndexedDB
        await saveImageToDB('lockWallpaper', tempWallpaperData, 'wallpaper');
        updateWallpaperStatus();
        await applyWallpaperToLockScreen();
        alert('壁纸保存成功！');
        
        // 显示存储使用情况
        await getStorageUsage();
    } catch (error) {
        console.error('保存壁纸失败:', error);
        alert('保存失败：' + error.message);
    }
}

// 重置壁纸
async function resetWallpaper() {
    if (!confirm('确定要重置壁纸吗？')) return;
    
    try {
        // 从IndexedDB删除壁纸
        await deleteImageFromDB('lockWallpaper');
        tempWallpaperData = null;
        
        // 清除预览
        const preview = document.getElementById('wallpaperPreview');
        const placeholder = document.getElementById('wallpaperPlaceholder');
        
        preview.style.display = 'none';
        preview.src = '';
        placeholder.style.display = 'block';
        
        // 清除URL输入框
        document.getElementById('wallpaperUrlInput').value = '';
        
        // 更新状态
        updateWallpaperStatus();
        
        // 移除锁屏壁纸
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
        
        alert('壁纸已重置！');
        console.log('锁屏壁纸已重置');
    } catch (error) {
        console.error('重置壁纸失败:', error);
        alert('重置失败，请重试！');
    }
}

// 更新壁纸状态显示
async function updateWallpaperStatus() {
    const statusSpan = document.getElementById('wallpaperStatus');
    
    try {
        const hasWallpaper = await getImageFromDB('lockWallpaper');
        
        if (hasWallpaper) {
            statusSpan.textContent = '已设置';
            statusSpan.style.color = '#34c759';
        } else {
            statusSpan.textContent = '未设置';
            statusSpan.style.color = '#dc3545';
        }
    } catch (error) {
        console.error('检查壁纸状态失败:', error);
        statusSpan.textContent = '未设置';
        statusSpan.style.color = '#dc3545';
    }
}

// 应用壁纸到锁屏
async function applyWallpaperToLockScreen() {
    const wallpaperEnabled = localStorage.getItem('lockWallpaperEnabled') === 'true';
    const lockScreen = document.getElementById('lockScreen');
    
    if (!lockScreen) return;
    
    try {
        if (wallpaperEnabled) {
            const wallpaperData = await getImageFromDB('lockWallpaper');
            if (wallpaperData) {
                lockScreen.style.backgroundImage = `url(${wallpaperData})`;
                lockScreen.style.backgroundSize = 'cover';
                lockScreen.style.backgroundPosition = 'center';
                lockScreen.style.backgroundRepeat = 'no-repeat';
                console.log('壁纸已应用到锁屏');
            } else {
                lockScreen.style.backgroundImage = 'none';
                lockScreen.style.backgroundColor = '#ffffff';
            }
        } else {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
    } catch (error) {
        console.error('应用壁纸失败:', error);
        lockScreen.style.backgroundImage = 'none';
        lockScreen.style.backgroundColor = '#ffffff';
    }
}

// ========== 主屏幕壁纸功能 ==========

// 切换主屏幕壁纸
function toggleMainWallpaper() {
    const toggle = document.getElementById('mainWallpaperToggle');
    const isEnabled = toggle.checked;
    const wallpaperOptions = document.getElementById('mainWallpaperOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('mainWallpaperEnabled', isEnabled);
    
    // 显示/隐藏壁纸设置选项
    wallpaperOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('主屏幕壁纸已' + (isEnabled ? '开启' : '关闭'));
    
    if (isEnabled) {
        // 如果有保存的壁纸，应用到主屏幕
        applyWallpaperToMainScreen();
    } else {
        // 关闭壁纸功能时移除壁纸
        const mainScreen = document.querySelector('.main-screen');
        if (mainScreen) {
            mainScreen.style.backgroundImage = 'none';
        }
    }
}

// 临时主屏幕壁纸数据
let tempMainWallpaperData = null;

// 处理主屏幕本地文件上传
async function handleMainWallpaperFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }
    
    try {
        console.log('正在压缩主屏幕壁纸...');
        
        // 压缩图片（壁纸使用较大尺寸，保留更多细节）
        const compressedData = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSizeKB: 800,
            outputFormat: file.type === 'image/gif' ? 'image/gif' : 'image/jpeg'
        });
        
        tempMainWallpaperData = compressedData;
        
        // 显示预览
        const preview = document.getElementById('mainWallpaperPreview');
        const placeholder = document.getElementById('mainWallpaperPlaceholder');
        preview.src = compressedData;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        
        console.log('主屏幕壁纸预览加载成功');
    } catch (error) {
        console.error('主屏幕壁纸上传失败:', error);
        alert('壁纸上传失败，请重试！');
    }
}

// 处理主屏幕URL上传
async function handleMainWallpaperUrlUpload() {
    const urlInput = document.getElementById('mainWallpaperUrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('请输入图片URL地址！');
        return;
    }
    
    try {
        console.log('正在加载主屏幕壁纸URL...');
        
        // 加载图片
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = url;
        });
        
        // 转换为base64
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        tempMainWallpaperData = canvas.toDataURL('image/jpeg', 0.85);
        
        // 显示预览
        const preview = document.getElementById('mainWallpaperPreview');
        const placeholder = document.getElementById('mainWallpaperPlaceholder');
        preview.src = tempMainWallpaperData;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        
        console.log('主屏幕壁纸URL加载成功');
    } catch (error) {
        console.error('主屏幕壁纸URL加载失败:', error);
        alert('图片URL加载失败，请检查地址是否正确！');
    }
}

// 保存主屏幕壁纸
async function saveMainWallpaper() {
    if (!tempMainWallpaperData) {
        alert('请先上传壁纸！');
        return;
    }
    
    try {
        console.log('正在保存主屏幕壁纸...');
        await saveImageToDB('mainWallpaper', tempMainWallpaperData);
        
        // 应用壁纸
        await applyWallpaperToMainScreen();
        
        // 更新状态
        await updateMainWallpaperStatus();
        
        alert('主屏幕壁纸保存成功！');
        console.log('主屏幕壁纸已保存');
    } catch (error) {
        console.error('保存主屏幕壁纸失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置主屏幕壁纸
async function resetMainWallpaper() {
    if (!confirm('确定要重置主屏幕壁纸吗？')) {
        return;
    }
    
    try {
        console.log('正在重置主屏幕壁纸...');
        await deleteImageFromDB('mainWallpaper');
        
        // 清除预览
        const preview = document.getElementById('mainWallpaperPreview');
        const placeholder = document.getElementById('mainWallpaperPlaceholder');
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'block';
        
        // 清除临时数据
        tempMainWallpaperData = null;
        
        // 移除壁纸
        const mainScreen = document.querySelector('.main-screen');
        if (mainScreen) {
            mainScreen.style.backgroundImage = 'none';
        }
        
        // 更新状态
        await updateMainWallpaperStatus();
        
        alert('主屏幕壁纸已重置！');
        console.log('主屏幕壁纸已重置');
    } catch (error) {
        console.error('重置主屏幕壁纸失败:', error);
        alert('重置失败，请重试！');
    }
}

// 更新主屏幕壁纸状态
async function updateMainWallpaperStatus() {
    const statusSpan = document.getElementById('mainWallpaperStatus');
    
    try {
        const hasWallpaper = await getImageFromDB('mainWallpaper');
        
        if (hasWallpaper) {
            statusSpan.textContent = '已设置';
            statusSpan.style.color = '#34c759';
        } else {
            statusSpan.textContent = '未设置';
            statusSpan.style.color = '#dc3545';
        }
    } catch (error) {
        console.error('检查主屏幕壁纸状态失败:', error);
        statusSpan.textContent = '未设置';
        statusSpan.style.color = '#dc3545';
    }
}

// 应用壁纸到主屏幕
async function applyWallpaperToMainScreen() {
    const wallpaperEnabled = localStorage.getItem('mainWallpaperEnabled') === 'true';
    const phoneContainer = document.querySelector('.phone-container');
    const mainScreen = document.querySelector('.main-screen');
    
    if (!phoneContainer || !mainScreen) return;
    
    try {
        if (wallpaperEnabled) {
            const wallpaperData = await getImageFromDB('mainWallpaper');
            if (wallpaperData) {
                // 将壁纸应用到整个手机容器，包括顶栏和底栏
                phoneContainer.style.backgroundImage = `url(${wallpaperData})`;
                phoneContainer.style.backgroundSize = 'cover';
                phoneContainer.style.backgroundPosition = 'center';
                phoneContainer.style.backgroundRepeat = 'no-repeat';
                // 移除主屏幕的背景，让它继承容器的背景
                mainScreen.style.backgroundImage = 'none';
                console.log('壁纸已应用到整个屏幕');
            } else {
                phoneContainer.style.backgroundImage = 'none';
                mainScreen.style.backgroundImage = 'none';
            }
        } else {
            phoneContainer.style.backgroundImage = 'none';
            mainScreen.style.backgroundImage = 'none';
        }
    } catch (error) {
        console.error('应用主屏幕壁纸失败:', error);
        phoneContainer.style.backgroundImage = 'none';
        mainScreen.style.backgroundImage = 'none';
    }
}

// 保存锁屏密码
function saveLockPassword() {
    const passwordInput = document.getElementById('lockPasswordInput');
    const password = passwordInput.value.trim();
    
    // 验证密码格式
    if (password.length !== 4) {
        alert('请输入4位数字密码！');
        return;
    }
    
    if (!/^\d{4}$/.test(password)) {
        alert('密码只能包含数字！');
        return;
    }
    
    // 保存密码
    localStorage.setItem('lockPassword', password);
    passwordInput.value = '';
    updatePasswordStatus();
    alert('密码设置成功！');
    console.log('锁屏密码已设置');
}

// 更新密码状态显示
function updatePasswordStatus() {
    const statusSpan = document.getElementById('passwordStatus');
    const hasPassword = localStorage.getItem('lockPassword');
    
    if (hasPassword) {
        statusSpan.textContent = '已设置';
        statusSpan.style.color = '#34c759';
    } else {
        statusSpan.textContent = '未设置';
        statusSpan.style.color = '#dc3545';
    }
}

// 更新手势密码状态显示
function updateGestureStatus() {
    const statusSpan = document.getElementById('gestureStatus');
    const hasGesture = localStorage.getItem('lockGesture');
    
    if (hasGesture) {
        statusSpan.textContent = '已设置';
        statusSpan.style.color = '#34c759';
    } else {
        statusSpan.textContent = '未设置';
        statusSpan.style.color = '#dc3545';
    }
}

// 切换密码类型
function switchPasswordType(type) {
    const numBtn = document.getElementById('numPasswordBtn');
    const gestureBtn = document.getElementById('gesturePasswordBtn');
    const numSettings = document.getElementById('numberPasswordSettings');
    const gestureSettings = document.getElementById('gesturePasswordSettings');
    
    if (type === 'number') {
        numBtn.classList.add('active');
        gestureBtn.classList.remove('active');
        numSettings.style.display = 'block';
        gestureSettings.style.display = 'none';
        localStorage.setItem('passwordType', 'number');
    } else {
        numBtn.classList.remove('active');
        gestureBtn.classList.add('active');
        numSettings.style.display = 'none';
        gestureSettings.style.display = 'block';
        localStorage.setItem('passwordType', 'gesture');
    }
}

// 密码输入相关
let currentPassword = '';

// 输入密码数字
function inputPassword(num) {
    if (currentPassword.length < 4) {
        currentPassword += num;
        updatePasswordDots();
        
        // 如果输入了4位，自动验证
        if (currentPassword.length === 4) {
            setTimeout(() => {
                verifyPassword();
            }, 300);
        }
    }
}

// 删除密码
function deletePassword() {
    if (currentPassword.length > 0) {
        currentPassword = currentPassword.slice(0, -1);
        updatePasswordDots();
    }
}

// 更新密码圆点显示
function updatePasswordDots() {
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById('dot' + i);
        if (i <= currentPassword.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    }
}

// 验证密码
function verifyPassword() {
    const savedPassword = localStorage.getItem('lockPassword');
    const passwordError = document.getElementById('passwordError');
    
    if (currentPassword === savedPassword) {
        // 密码正确，解锁
        console.log('密码正确，解锁成功');
        const passwordScreen = document.getElementById('passwordScreen');
        const lockScreen = document.getElementById('lockScreen');
        
        // 淡出密码界面
        passwordScreen.style.transition = 'opacity 0.3s ease-out';
        passwordScreen.style.opacity = '0';
        
        // 同时淡出锁屏
        lockScreen.style.transition = 'opacity 0.3s ease-out';
        lockScreen.style.opacity = '0';
        
        setTimeout(() => {
            // 移除密码界面
            passwordScreen.classList.remove('active');
            passwordScreen.style.opacity = '1';
            passwordScreen.style.transition = '';
            
            // 移除锁屏和模糊效果
            lockScreen.classList.remove('active');
            lockScreen.classList.remove('blurred');
            lockScreen.style.opacity = '1';
            lockScreen.style.transition = '';
            
            // 重置密码输入
            currentPassword = '';
            updatePasswordDots();
        }, 300);
    } else {
        // 密码错误
        console.log('密码错误');
        passwordError.classList.add('show');
        
        // 清空输入
        currentPassword = '';
        updatePasswordDots();
        
        // 2秒后隐藏错误提示
        setTimeout(() => {
            passwordError.classList.remove('show');
        }, 2000);
    }
}

// 显示密码输入界面
function showPasswordScreen() {
    const lockScreen = document.getElementById('lockScreen');
    const passwordType = localStorage.getItem('passwordType') || 'number';
    
    // 锁屏保持显示但模糊
    lockScreen.classList.add('blurred');
    
    if (passwordType === 'gesture') {
        // 显示手势输入界面
        const gestureScreen = document.getElementById('gestureScreen');
        gestureScreen.classList.add('active');
        initGestureInput();
    } else {
        // 显示数字密码输入界面
        const passwordScreen = document.getElementById('passwordScreen');
        passwordScreen.classList.add('active');
        currentPassword = '';
        updatePasswordDots();
    }
}

// ==================== 手势密码功能 ====================

// 手势相关变量
let gestureCanvas = null;
let gestureCtx = null;
let gesturePoints = [];
let selectedPoints = [];
let isDrawing = false;
let currentGesture = [];
let gestureSetupStep = 1; // 1: 第一次绘制, 2: 确认绘制

// 初始化手势设置界面
function openGestureSetup() {
    const setupScreen = document.getElementById('gestureSetupScreen');
    setupScreen.classList.add('active');
    
    gestureSetupStep = 1;
    document.getElementById('gestureSetupTitle').textContent = '绘制解锁手势';
    document.getElementById('gestureHint').textContent = '至少连接4个点';
    document.getElementById('gestureConfirmBtn').style.display = 'none';
    
    setTimeout(() => {
        initGestureCanvas('gestureSetupCanvas', true);
    }, 100);
}

// 关闭手势设置界面
function closeGestureSetup() {
    const setupScreen = document.getElementById('gestureSetupScreen');
    setupScreen.classList.remove('active');
    currentGesture = [];
    gestureSetupStep = 1;
}

// 初始化手势画布
function initGestureCanvas(canvasId, isSetup = false) {
    gestureCanvas = document.getElementById(canvasId);
    if (!gestureCanvas) return;
    
    const size = 300;
    gestureCanvas.width = size;
    gestureCanvas.height = size;
    gestureCtx = gestureCanvas.getContext('2d');
    
    // 初始化9个点（3x3网格）
    gesturePoints = [];
    const spacing = size / 4;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            gesturePoints.push({
                x: spacing * (j + 1),
                y: spacing * (i + 1),
                index: i * 3 + j,
                selected: false
            });
        }
    }
    
    selectedPoints = [];
    drawGesturePoints();
    
    // 添加事件监听
    if (isSetup) {
        gestureCanvas.addEventListener('mousedown', handleGestureStart);
        gestureCanvas.addEventListener('mousemove', handleGestureMove);
        gestureCanvas.addEventListener('mouseup', handleGestureEnd);
        gestureCanvas.addEventListener('touchstart', handleGestureStart);
        gestureCanvas.addEventListener('touchmove', handleGestureMove);
        gestureCanvas.addEventListener('touchend', handleGestureEnd);
    } else {
        gestureCanvas.addEventListener('mousedown', handleGestureInputStart);
        gestureCanvas.addEventListener('mousemove', handleGestureInputMove);
        gestureCanvas.addEventListener('mouseup', handleGestureInputEnd);
        gestureCanvas.addEventListener('touchstart', handleGestureInputStart);
        gestureCanvas.addEventListener('touchmove', handleGestureInputMove);
        gestureCanvas.addEventListener('touchend', handleGestureInputEnd);
    }
}

// 绘制手势点
function drawGesturePoints() {
    gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
    
    // 绘制连接线
    if (selectedPoints.length > 0) {
        gestureCtx.strokeStyle = '#007aff';
        gestureCtx.lineWidth = 3;
        gestureCtx.lineCap = 'round';
        gestureCtx.lineJoin = 'round';
        
        gestureCtx.beginPath();
        gestureCtx.moveTo(selectedPoints[0].x, selectedPoints[0].y);
        for (let i = 1; i < selectedPoints.length; i++) {
            gestureCtx.lineTo(selectedPoints[i].x, selectedPoints[i].y);
        }
        gestureCtx.stroke();
    }
    
    // 绘制所有点
    gesturePoints.forEach(point => {
        gestureCtx.beginPath();
        gestureCtx.arc(point.x, point.y, point.selected ? 12 : 8, 0, Math.PI * 2);
        
        if (point.selected) {
            gestureCtx.fillStyle = '#007aff';
            gestureCtx.fill();
            gestureCtx.strokeStyle = '#005cbf';
            gestureCtx.lineWidth = 2;
            gestureCtx.stroke();
        } else {
            gestureCtx.fillStyle = 'white';
            gestureCtx.fill();
            gestureCtx.strokeStyle = '#d1d1d6';
            gestureCtx.lineWidth = 2;
            gestureCtx.stroke();
        }
    });
}

// 获取触摸/鼠标位置
function getGesturePosition(e) {
    const rect = gestureCanvas.getBoundingClientRect();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    return {
        x: (clientX - rect.left) * (gestureCanvas.width / rect.width),
        y: (clientY - rect.top) * (gestureCanvas.height / rect.height)
    };
}

// 查找最近的点
function findNearestPoint(x, y) {
    const threshold = 30;
    for (let point of gesturePoints) {
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
        if (distance < threshold && !point.selected) {
            return point;
        }
    }
    return null;
}

// 手势开始（设置模式）
function handleGestureStart(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getGesturePosition(e);
    const point = findNearestPoint(pos.x, pos.y);
    
    if (point) {
        point.selected = true;
        selectedPoints.push(point);
        drawGesturePoints();
    }
}

// 手势移动（设置模式）
function handleGestureMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getGesturePosition(e);
    const point = findNearestPoint(pos.x, pos.y);
    
    if (point && !point.selected) {
        point.selected = true;
        selectedPoints.push(point);
        drawGesturePoints();
    }
}

// 手势结束（设置模式）
function handleGestureEnd(e) {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawing = false;
    
    if (selectedPoints.length >= 4) {
        if (gestureSetupStep === 1) {
            // 第一次绘制完成
            currentGesture = selectedPoints.map(p => p.index);
            document.getElementById('gestureSetupTitle').textContent = '再次绘制确认';
            document.getElementById('gestureHint').textContent = '请再次绘制相同的手势';
            gestureSetupStep = 2;
            
            // 重置
            resetGestureCanvas();
        } else {
            // 第二次绘制，验证是否一致
            const newGesture = selectedPoints.map(p => p.index);
            if (JSON.stringify(currentGesture) === JSON.stringify(newGesture)) {
                // 手势一致，显示确认按钮
                document.getElementById('gestureHint').textContent = '手势匹配！';
                document.getElementById('gestureHint').style.color = '#34c759';
                document.getElementById('gestureConfirmBtn').style.display = 'block';
            } else {
                // 手势不一致，重新开始
                document.getElementById('gestureHint').textContent = '手势不一致，请重新绘制';
                document.getElementById('gestureHint').style.color = '#ff3b30';
                setTimeout(() => {
                    gestureSetupStep = 1;
                    currentGesture = [];
                    document.getElementById('gestureSetupTitle').textContent = '绘制解锁手势';
                    document.getElementById('gestureHint').textContent = '至少连接4个点';
                    document.getElementById('gestureHint').style.color = '#666';
                    resetGestureCanvas();
                }, 2000);
            }
        }
    } else {
        document.getElementById('gestureHint').textContent = '至少需要连接4个点';
        document.getElementById('gestureHint').style.color = '#ff3b30';
        setTimeout(() => {
            document.getElementById('gestureHint').style.color = '#666';
            resetGestureCanvas();
        }, 1500);
    }
}

// 重置手势画布
function resetGestureCanvas() {
    gesturePoints.forEach(p => p.selected = false);
    selectedPoints = [];
    drawGesturePoints();
}

// 确认并保存手势
function confirmGesture() {
    localStorage.setItem('lockGesture', JSON.stringify(currentGesture));
    updateGestureStatus();
    alert('手势密码设置成功！');
    closeGestureSetup();
    console.log('手势密码已设置');
}

// 初始化手势输入界面
function initGestureInput() {
    setTimeout(() => {
        initGestureCanvas('gestureCanvas', false);
    }, 100);
}

// 手势开始（输入模式）
function handleGestureInputStart(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getGesturePosition(e);
    const point = findNearestPoint(pos.x, pos.y);
    
    if (point) {
        point.selected = true;
        selectedPoints.push(point);
        drawGesturePoints();
    }
}

// 手势移动（输入模式）
function handleGestureInputMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getGesturePosition(e);
    const point = findNearestPoint(pos.x, pos.y);
    
    if (point && !point.selected) {
        point.selected = true;
        selectedPoints.push(point);
        drawGesturePoints();
    }
}

// 手势结束（输入模式）
function handleGestureInputEnd(e) {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawing = false;
    
    // 验证手势
    verifyGesture();
}

// 验证手势
function verifyGesture() {
    const savedGesture = JSON.parse(localStorage.getItem('lockGesture') || '[]');
    const inputGesture = selectedPoints.map(p => p.index);
    const gestureError = document.getElementById('gestureError');
    
    if (JSON.stringify(savedGesture) === JSON.stringify(inputGesture)) {
        // 手势正确，解锁
        console.log('手势正确，解锁成功');
        const gestureScreen = document.getElementById('gestureScreen');
        const lockScreen = document.getElementById('lockScreen');
        
        // 淡出手势界面
        gestureScreen.style.transition = 'opacity 0.3s ease-out';
        gestureScreen.style.opacity = '0';
        
        // 同时淡出锁屏
        lockScreen.style.transition = 'opacity 0.3s ease-out';
        lockScreen.style.opacity = '0';
        
        setTimeout(() => {
            // 移除手势界面
            gestureScreen.classList.remove('active');
            gestureScreen.style.opacity = '1';
            gestureScreen.style.transition = '';
            
            // 移除锁屏和模糊效果
            lockScreen.classList.remove('active');
            lockScreen.classList.remove('blurred');
            lockScreen.style.opacity = '1';
            lockScreen.style.transition = '';
            
            // 重置手势
            resetGestureCanvas();
        }, 300);
    } else {
        // 手势错误
        console.log('手势错误');
        gestureError.classList.add('show');
        
        // 清空手势
        setTimeout(() => {
            resetGestureCanvas();
            gestureError.classList.remove('show');
        }, 2000);
    }
}

// 切换滑动模式（互斥开关）
function toggleSlideMode(mode) {
    const horizontalToggle = document.getElementById('horizontalToggle');
    const verticalToggle = document.getElementById('verticalToggle');
    
    if (mode === 'horizontal') {
        // 打开横向，关闭向上
        horizontalToggle.checked = true;
        verticalToggle.checked = false;
        localStorage.setItem('lockScreenSlideMode', 'horizontal');
        console.log('滑动方式已切换为：横向滑动');
    } else {
        // 打开向上，关闭横向
        horizontalToggle.checked = false;
        verticalToggle.checked = true;
        localStorage.setItem('lockScreenSlideMode', 'vertical');
        console.log('滑动方式已切换为：向上滑动');
    }
}

// 处理API提供商变更
function handleProviderChange() {
    const provider = document.getElementById('apiProvider').value;
    const urlInput = document.getElementById('apiUrl');
    
    if (provider === 'custom') {
        urlInput.value = '';
        urlInput.disabled = false;
        urlInput.placeholder = '请输入自定义API地址';
    } else {
        urlInput.value = apiUrls[provider];
        urlInput.disabled = true;
    }
}

// 获取模型列表
async function fetchModels() {
    const apiUrl = document.getElementById('apiUrl').value;
    const apiKey = document.getElementById('apiKey').value;
    const provider = document.getElementById('apiProvider').value;
    const modelSelect = document.getElementById('modelSelect');

    if (!apiUrl || !apiKey) {
        alert('请填写API地址和密钥');
        return;
    }

    try {
        let models = [];

        if (provider === 'hakimi') {
            // Gemini API 使用特殊的请求头和端点
            const response = await fetch(`${apiUrl}/models?key=${apiKey}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取模型失败');
            }

            const data = await response.json();
            if (data.models && Array.isArray(data.models)) {
                models = data.models.map(model => ({
                    id: model.name.replace('models/', ''),
                    displayName: model.displayName || model.name
                }));
            }
        } else if (provider === 'claude') {
            // Claude API 不提供 models 端点，使用固定模型列表
            models = [
                { id: 'claude-opus-4-20250514', displayName: 'Claude Opus 4.5' },
                { id: 'claude-opus-4-20250115', displayName: 'Claude Opus 4' },
                { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4.5' },
                { id: 'claude-sonnet-4-20250115', displayName: 'Claude Sonnet 4' },
                { id: 'claude-3-7-sonnet-20250219', displayName: 'Claude 3.7 Sonnet' },
                { id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet (Oct)' },
                { id: 'claude-3-5-sonnet-20240620', displayName: 'Claude 3.5 Sonnet (Jun)' },
                { id: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku' },
                { id: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus' },
                { id: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet' },
                { id: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku' }
            ];
        } else if (provider === 'ds') {
            // DeepSeek API 使用标准 OpenAI 风格
            const response = await fetch(`${apiUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取模型失败');
            }

            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                models = data.data.map(model => ({
                    id: model.id,
                    displayName: model.id
                }));
            }
        } else {
            // Custom API 使用标准 OpenAI 风格
            const response = await fetch(`${apiUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取模型失败');
            }

            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                models = data.data.map(model => ({
                    id: model.id,
                    displayName: model.id
                }));
            }
        }

        // 清空现有选项
        modelSelect.innerHTML = '<option value="">从列表选择模型</option>';
        
        // 添加模型选项
        if (models.length > 0) {
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.displayName;
                modelSelect.appendChild(option);
            });
            alert(`模型列表获取成功！共 ${models.length} 个模型`);
        } else {
            throw new Error('未找到可用模型');
        }
    } catch (error) {
        alert('获取模型失败: ' + error.message);
    }
}

// 保存设置
async function saveSettings() {
    const settings = {
        provider: document.getElementById('apiProvider').value,
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('modelInput').value || document.getElementById('modelSelect').value
    };

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('apiSettings', settings);
        alert('设置已保存！');
    } catch (error) {
        console.error('保存设置失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载设置
async function loadSettings() {
    try {
        const settings = await storageDB.getItem('apiSettings');
        if (settings) {
            document.getElementById('apiProvider').value = settings.provider || 'hakimi';
            document.getElementById('apiKey').value = settings.apiKey || '';
            document.getElementById('modelInput').value = settings.model || '';
            handleProviderChange(); // 更新API地址
            if (settings.apiUrl && settings.provider === 'custom') {
                document.getElementById('apiUrl').value = settings.apiUrl;
            }
        }
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 初始化新的IndexedDB存储系统
        console.log(' 正在初始化存储系统...');
        await initIndexedDB();
        
        // 检查并显示锁屏
        checkAndShowLockScreen();
        
        // 恢复顶栏设置
        const statusBarEnabled = localStorage.getItem('statusBarEnabled');
        const isStatusBarEnabled = statusBarEnabled === null ? true : statusBarEnabled === 'true';
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            statusBar.style.display = isStatusBarEnabled ? 'flex' : 'none';
        }
        
        // 恢复手机边框设置
        const phoneBorderEnabled = localStorage.getItem('phoneBorderEnabled');
        const isPhoneBorderEnabled = phoneBorderEnabled === 'true';
        const phoneContainer = document.querySelector('.phone-container');
        if (phoneContainer && isPhoneBorderEnabled) {
            phoneContainer.classList.add('phone-border');
        }
        
        // 恢复主屏幕壁纸
        await applyWallpaperToMainScreen();
        
        // 加载头像
        await loadAvatar();
        
        // 初始化旧数据库（localForage）
        console.log('正在初始化 localForage...');
        await storageDB.init();
        
        // 检查是否需要从 localStorage 迁移数据
        const hasLocalData = localStorage.getItem('apiSettings') || 
                            localStorage.getItem('apiPresets') || 
                            localStorage.getItem('widgetAvatar') ||
                            localStorage.getItem('widgetName') ||
                            localStorage.getItem('widgetId') ||
                            localStorage.getItem('widgetContent') ||
                            localStorage.getItem('notebookLoveDate') ||
                            localStorage.getItem('notebookLoveDateConfig') ||
                            localStorage.getItem('notebookText') ||
                            localStorage.getItem('notebookImage') ||
                            localStorage.getItem('musicAvatar') ||
                            localStorage.getItem('musicUsername') ||
                            localStorage.getItem('musicBirthday') ||
                            localStorage.getItem('musicCover');
        
        if (hasLocalData) {
            console.log('检测到 localStorage 数据，开始迁移...');
            const migrated = await storageDB.migrateFromLocalStorage();
            if (migrated > 0) {
                console.log('数据迁移完成！');
                // 可选：迁移成功后清除 localStorage（谨慎操作）
                // localStorage.clear();
            }
        }
        
        // 模型下拉框变化时同步到输入框
        document.getElementById('modelSelect').addEventListener('change', function() {
            if (this.value) {
                document.getElementById('modelInput').value = this.value;
            }
        });
        
        // 页面加载时加载保存的设置
        await loadSettings();
        await loadPresetList();
        await loadName();
        await loadId();
        await loadContent();
        await loadAvatar();
        await loadLoveDate();
        await loadNotebookText();
        await loadNotebookImage();
        await loadMusicAvatar();
        await loadMusicUsername();
        await loadMusicBirthday();
        await loadMusicCover();
        await loadMusicLibrary();
        
        // 初始化世界书
        await initWorldBooks();
        
        // 加载人设数据
        loadPersonas();
        
        // 加载ID卡人设
        await loadIdCardPersona();
        
        // 加载聊天角色
        loadChatCharacters();
        renderChatList();
        
        console.log('应用初始化完成！');
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败，部分功能可能无法使用。请刷新页面重试。');
    }
});

// ========== 文案编辑功能 ==========

const DEFAULT_CONTENT = '被你牽著的手是不可能的畫面'; // 默认文案

// 打开文案编辑弹窗
async function openContentModal() {
    try {
        // 加载当前文案
        const savedContent = await storageDB.getItem('widgetContent');
        const currentContent = savedContent || DEFAULT_CONTENT;
        
        // 设置输入框和预览
        document.getElementById('contentInput').value = currentContent;
        document.getElementById('contentPreview').textContent = currentContent;
        
        document.getElementById('contentModal').classList.add('active');
    } catch (error) {
        console.error('打开文案弹窗失败:', error);
    }
}

// 关闭文案编辑弹窗
function closeContentModal() {
    document.getElementById('contentModal').classList.remove('active');
}

// 更新文案预览
function updateContentPreview() {
    const contentInput = document.getElementById('contentInput').value;
    document.getElementById('contentPreview').textContent = contentInput || DEFAULT_CONTENT;
}

// 翻译文案
async function translateContent(targetLang) {
    const contentInput = document.getElementById('contentInput').value.trim();
    
    if (!contentInput) {
        alert('请先输入文案内容！');
        return;
    }

    if (contentInput.length > 500) {
        alert('文案内容不能超过500字符！');
        return;
    }

    // 显示加载提示
    const originalText = '正在翻译...';
    alert(originalText);

    try {
        // 语言代码映射
        const langMap = {
            'zh-TW': 'zh-TW',  // 繁体中文
            'en': 'en-US',      // 英语
            'ja': 'ja-JP',      // 日语
            'de': 'de-DE',      // 德语
            'fr': 'fr-FR',      // 法语
            'ko': 'ko-KR',      // 韩语
            'es': 'es-ES',      // 西班牙语
            'ru': 'ru-RU'       // 俄语
        };

        const targetLangCode = langMap[targetLang] || targetLang;

        // 使用 MyMemory Translation API (免费，无需密钥)
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(contentInput)}&langpair=zh-CN|${targetLangCode}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData) {
            const translatedText = data.responseData.translatedText;
            
            // 更新输入框和预览
            document.getElementById('contentInput').value = translatedText;
            document.getElementById('contentPreview').textContent = translatedText;
            
            alert('翻译完成！');
        } else {
            throw new Error('翻译失败');
        }
    } catch (error) {
        console.error('翻译失败:', error);
        alert('翻译失败，请检查网络连接或稍后重试！\n提示：也可以手动编辑文案内容。');
    }
}

// 保存文案
async function saveContent() {
    const contentInput = document.getElementById('contentInput').value.trim();
    
    if (!contentInput) {
        alert('请输入文案内容！');
        return;
    }

    if (contentInput.length > 500) {
        alert('文案内容不能超过500字符！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('widgetContent', contentInput);
        
        // 更新主界面文案
        document.getElementById('widgetContent').textContent = contentInput;
        
        alert('文案保存成功！');
        closeContentModal();
    } catch (error) {
        console.error('保存文案失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置文案
async function resetContent() {
    if (!confirm('确定要重置为默认文案吗？')) {
        return;
    }

    try {
        // 清除保存的文案
        await storageDB.removeItem('widgetContent');
        
        // 更新预览和输入框
        document.getElementById('contentInput').value = DEFAULT_CONTENT;
        document.getElementById('contentPreview').textContent = DEFAULT_CONTENT;
        
        // 更新主界面
        document.getElementById('widgetContent').textContent = DEFAULT_CONTENT;
        
        alert('已重置为默认文案！');
    } catch (error) {
        console.error('重置文案失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的文案
async function loadContent() {
    try {
        const savedContent = await storageDB.getItem('widgetContent');
        if (savedContent) {
            document.getElementById('widgetContent').textContent = savedContent;
        }
    } catch (error) {
        console.error('加载文案失败:', error);
    }
}

// ========== ID修改功能 ==========

const DEFAULT_ID = '1234'; // 默认ID

// 打开ID修改弹窗
async function openIdModal() {
    try {
        // 加载当前ID
        const savedId = await storageDB.getItem('widgetId');
        const currentId = savedId || DEFAULT_ID;
        
        // 设置输入框和预览
        document.getElementById('idInput').value = currentId;
        document.getElementById('idPreview').textContent = '@' + currentId;
        
        document.getElementById('idModal').classList.add('active');
    } catch (error) {
        console.error('打开ID弹窗失败:', error);
    }
}

// 关闭ID修改弹窗
function closeIdModal() {
    document.getElementById('idModal').classList.remove('active');
    document.getElementById('idInput').value = '';
}

// 更新ID预览
function updateIdPreview() {
    const idInput = document.getElementById('idInput').value.trim();
    document.getElementById('idPreview').textContent = '@' + (idInput || DEFAULT_ID);
}

// 验证ID格式（只允许字母、数字、下划线）
function isValidId(id) {
    return /^[a-zA-Z0-9_]+$/.test(id);
}

// 保存ID
async function saveId() {
    const idInput = document.getElementById('idInput').value.trim();
    
    if (!idInput) {
        alert('请输入ID！');
        return;
    }

    if (idInput.length > 30) {
        alert('ID不能超过30个字符！');
        return;
    }

    if (!isValidId(idInput)) {
        alert('ID只能包含字母、数字和下划线！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('widgetId', idInput);
        
        // 更新主界面ID
        document.getElementById('widgetId').textContent = '@' + idInput;
        
        alert('ID保存成功！');
        closeIdModal();
    } catch (error) {
        console.error('保存ID失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置ID
async function resetId() {
    if (!confirm(`确定要重置为默认ID "@${DEFAULT_ID}" 吗？`)) {
        return;
    }

    try {
        // 清除保存的ID
        await storageDB.removeItem('widgetId');
        
        // 更新预览和输入框
        document.getElementById('idInput').value = DEFAULT_ID;
        document.getElementById('idPreview').textContent = '@' + DEFAULT_ID;
        
        // 更新主界面
        document.getElementById('widgetId').textContent = '@' + DEFAULT_ID;
        
        alert('已重置为默认ID！');
    } catch (error) {
        console.error('重置ID失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的ID
async function loadId() {
    try {
        const savedId = await storageDB.getItem('widgetId');
        if (savedId) {
            document.getElementById('widgetId').textContent = '@' + savedId;
        }
    } catch (error) {
        console.error('加载ID失败:', error);
    }
}

// ========== 名称修改功能 ==========

const DEFAULT_NAME = '习惯'; // 默认名称

// 打开名称修改弹窗
async function openNameModal() {
    try {
        // 加载当前名称
        const savedName = await storageDB.getItem('widgetName');
        const currentName = savedName || DEFAULT_NAME;
        
        // 设置输入框和预览
        document.getElementById('nameInput').value = currentName;
        document.getElementById('namePreview').textContent = currentName;
        
        document.getElementById('nameModal').classList.add('active');
    } catch (error) {
        console.error('打开名称弹窗失败:', error);
    }
}

// 关闭名称修改弹窗
function closeNameModal() {
    document.getElementById('nameModal').classList.remove('active');
    document.getElementById('nameInput').value = '';
}

// 更新名称预览
function updateNamePreview() {
    const nameInput = document.getElementById('nameInput').value.trim();
    document.getElementById('namePreview').textContent = nameInput || DEFAULT_NAME;
}

// 保存名称
async function saveName() {
    const nameInput = document.getElementById('nameInput').value.trim();
    
    if (!nameInput) {
        alert('请输入名称！');
        return;
    }

    if (nameInput.length > 20) {
        alert('名称不能超过20个字符！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('widgetName', nameInput);
        
        // 更新主界面名称
        document.getElementById('widgetName').textContent = nameInput;
        
        alert('名称保存成功！');
        closeNameModal();
    } catch (error) {
        console.error('保存名称失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置名称
async function resetName() {
    if (!confirm(`确定要重置为默认名称"${DEFAULT_NAME}"吗？`)) {
        return;
    }

    try {
        // 清除保存的名称
        await storageDB.removeItem('widgetName');
        
        // 更新预览和输入框
        document.getElementById('nameInput').value = DEFAULT_NAME;
        document.getElementById('namePreview').textContent = DEFAULT_NAME;
        
        // 更新主界面
        document.getElementById('widgetName').textContent = DEFAULT_NAME;
        
        alert('已重置为默认名称！');
    } catch (error) {
        console.error('重置名称失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的名称
async function loadName() {
    try {
        const savedName = await storageDB.getItem('widgetName');
        if (savedName) {
            document.getElementById('widgetName').textContent = savedName;
        }
    } catch (error) {
        console.error('加载名称失败:', error);
    }
}

// ========== 头像更换功能 ==========

let tempAvatarData = null; // 临时存储预览的头像数据

// 打开头像更换弹窗
async function openAvatarModal() {
    try {
        // 加载当前头像到预览
        const savedAvatar = await storageDB.getItem('widgetAvatar');
        if (savedAvatar) {
            document.getElementById('previewImage').src = savedAvatar;
            document.getElementById('previewImage').style.display = 'block';
            document.getElementById('previewPlaceholder').style.display = 'none';
            tempAvatarData = savedAvatar;
        } else {
            document.getElementById('previewImage').style.display = 'none';
            document.getElementById('previewPlaceholder').style.display = 'block';
            tempAvatarData = null;
        }
        
        document.getElementById('avatarModal').classList.add('active');
    } catch (error) {
        console.error('打开头像弹窗失败:', error);
    }
}

// 关闭头像更换弹窗
function closeAvatarModal() {
    document.getElementById('avatarModal').classList.remove('active');
    document.getElementById('avatarUrlInput').value = '';
    tempAvatarData = null;
}

// 处理本地文件上传
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    try {
        // 显示压缩进度
        console.log(' 正在压缩图片...');
        
        // 压缩图片（头像使用较小尺寸）
        const compressedData = await compressImage(file, {
            maxWidth: 500,
            maxHeight: 500,
            quality: 0.85,
            maxSizeKB: 200
        });
        
        // 显示预览
        document.getElementById('previewImage').src = compressedData;
        document.getElementById('previewImage').style.display = 'block';
        document.getElementById('previewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempAvatarData = compressedData;
        
        console.log('头像图片已压缩并预览');
    } catch (error) {
        console.error('图片处理失败:', error);
        alert('图片处理失败，请重试！');
    }
}

// 处理URL上传
function handleUrlUpload() {
    const url = document.getElementById('avatarUrlInput').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }

    // 创建图片对象测试URL是否有效
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        // URL有效，显示预览
        document.getElementById('previewImage').src = url;
        document.getElementById('previewImage').style.display = 'block';
        document.getElementById('previewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempAvatarData = url;
        alert('图片加载成功！');
    };
    
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确！\n注意：某些图片可能因跨域限制无法加载。');
    };
    
    img.src = url;
}

// 重置头像
async function resetAvatar() {
    if (!confirm('确定要重置为默认头像吗？')) {
        return;
    }

    try {
        // 清空预览
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('previewPlaceholder').style.display = 'block';
        tempAvatarData = null;
        
        // 从IndexedDB删除头像
        await deleteImageFromDB('widgetAvatar');
        
        // 更新主界面
        document.getElementById('avatarImage').style.display = 'none';
        document.getElementById('avatarPlaceholder').style.display = 'block';
        
        alert('已重置为默认头像！');
        console.log('头像已重置');
    } catch (error) {
        console.error('重置头像失败:', error);
        alert('重置失败，请重试！');
    }
}

// 保存头像
async function saveAvatar() {
    if (!tempAvatarData) {
        alert('请先选择或上传图片！');
        return;
    }

    try {
        // 保存到IndexedDB
        await saveImageToDB('widgetAvatar', tempAvatarData, 'avatar');
        
        // 更新主界面头像
        document.getElementById('avatarImage').src = tempAvatarData;
        document.getElementById('avatarImage').style.display = 'block';
        document.getElementById('avatarPlaceholder').style.display = 'none';
        
        alert('头像保存成功！');
        closeAvatarModal();
        
        // 显示存储使用情况
        await getStorageUsage();
    } catch (error) {
        console.error('保存头像失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载保存的头像
async function loadAvatar() {
    try {
        const savedAvatar = await getImageFromDB('widgetAvatar');
        if (savedAvatar) {
            document.getElementById('avatarImage').src = savedAvatar;
            document.getElementById('avatarImage').style.display = 'block';
            document.getElementById('avatarPlaceholder').style.display = 'none';
            console.log('头像已加载');
        }
    } catch (error) {
        console.error('加载头像失败:', error);
    }
}

// ========== 相恋日期编辑功能 ==========

const DEFAULT_LOVE_DATE = '相恋日期：520'; // 默认相恋日期
let currentLoveDateMode = 'manual'; // 当前编辑模式：manual（手动输入）或 date（日期计算）

// 初始化日期选择器
function initializeDateSelectors() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const daySelect = document.getElementById('daySelect');
    
    // 生成年份选项（过去50年到未来10年）
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let year = currentYear - 50; year <= currentYear + 10; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
    
    // 生成月份选项
    monthSelect.innerHTML = '';
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        if (month === new Date().getMonth() + 1) option.selected = true;
        monthSelect.appendChild(option);
    }
    
    // 初始化日期选项
    updateDayOptions();
}

// 更新日期选项（根据年月动态调整天数）
function updateDayOptions() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const daySelect = document.getElementById('daySelect');
    
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const currentDay = parseInt(daySelect.value) || new Date().getDate();
    
    // 计算该月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 生成日期选项
    daySelect.innerHTML = '';
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        if (day === currentDay && day <= daysInMonth) {
            option.selected = true;
        }
        daySelect.appendChild(option);
    }
    
    // 如果当前选中的日期超过了该月的天数，选择该月最后一天
    if (currentDay > daysInMonth) {
        daySelect.value = daysInMonth;
    }
}

// 计算天数并更新显示
function calculateAndUpdateDays() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const daySelect = document.getElementById('daySelect');
    const prefix = document.getElementById('loveDatePrefix').value.trim();
    
    const selectedYear = parseInt(yearSelect.value);
    const selectedMonth = parseInt(monthSelect.value);
    const selectedDay = parseInt(daySelect.value);
    
    // 创建选择的日期对象（设置为当天的开始时间）
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 计算天数差（向下取整）
    const timeDiff = today.getTime() - selectedDate.getTime();
    const daysDiff = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
    
    // 判断是过去还是未来
    const isPast = timeDiff >= 0;
    
    // 更新天数显示
    document.getElementById('daysCount').textContent = daysDiff;
    document.getElementById('daysLabel').textContent = isPast ? '已经过了：' : '还剩：';
    
    // 更新预览
    let previewText;
    if (prefix) {
        previewText = `${prefix} ${daysDiff} 天`;
    } else {
        previewText = isPast ? `已经 ${daysDiff} 天` : `还有 ${daysDiff} 天`;
    }
    
    document.getElementById('loveDatePreview').textContent = previewText;
}

// 切换编辑模式
function switchLoveDateMode(mode) {
    currentLoveDateMode = mode;
    
    const manualSection = document.getElementById('manualInputSection');
    const dateSection = document.getElementById('dateCalculateSection');
    const manualBtn = document.getElementById('manualModeBtn');
    const dateBtn = document.getElementById('dateModeBtn');
    
    if (mode === 'manual') {
        manualSection.style.display = 'block';
        dateSection.style.display = 'none';
        manualBtn.style.background = '#007bff';
        dateBtn.style.background = '#6c757d';
        
        // 更新预览为手动输入的内容
        updateLoveDatePreview();
    } else {
        manualSection.style.display = 'none';
        dateSection.style.display = 'block';
        manualBtn.style.background = '#6c757d';
        dateBtn.style.background = '#007bff';
        
        // 计算并更新天数
        calculateAndUpdateDays();
    }
}

// 打开相恋日期编辑弹窗
async function openLoveDateModal() {
    try {
        // 先显示弹窗
        document.getElementById('loveDateModal').classList.add('active');
        
        // 立即初始化日期选择器（确保下拉框有内容）
        initializeDateSelectors();
        
        // 加载保存的配置
        const savedConfig = await storageDB.getItem('notebookLoveDateConfig');
        
        if (savedConfig && savedConfig.mode === 'date') {
            // 日期计算模式
            switchLoveDateMode('date');
            
            // 恢复保存的日期和前缀
            if (savedConfig.year && savedConfig.month && savedConfig.day) {
                document.getElementById('yearSelect').value = savedConfig.year;
                document.getElementById('monthSelect').value = savedConfig.month;
                updateDayOptions(); // 更新天数选项
                document.getElementById('daySelect').value = savedConfig.day;
            }
            if (savedConfig.prefix) {
                document.getElementById('loveDatePrefix').value = savedConfig.prefix;
            }
            
            calculateAndUpdateDays();
        } else {
            // 手动输入模式
            switchLoveDateMode('manual');
            
            const savedLoveDate = await storageDB.getItem('notebookLoveDate');
            const currentLoveDate = savedLoveDate || DEFAULT_LOVE_DATE;
            
            document.getElementById('loveDateInput').value = currentLoveDate;
            document.getElementById('loveDatePreview').textContent = currentLoveDate;
        }
    } catch (error) {
        console.error('打开相恋日期弹窗失败:', error);
    }
}

// 关闭相恋日期编辑弹窗
function closeLoveDateModal() {
    document.getElementById('loveDateModal').classList.remove('active');
}

// 更新相恋日期预览（手动输入模式）
function updateLoveDatePreview() {
    if (currentLoveDateMode === 'manual') {
        const loveDateInput = document.getElementById('loveDateInput').value;
        document.getElementById('loveDatePreview').textContent = loveDateInput || DEFAULT_LOVE_DATE;
    }
}

// 保存相恋日期
async function saveLoveDate() {
    try {
        let displayText;
        let config;
        
        if (currentLoveDateMode === 'manual') {
            // 手动输入模式
            const loveDateInput = document.getElementById('loveDateInput').value.trim();
            
            if (!loveDateInput) {
                alert('请输入相恋日期内容！');
                return;
            }
            
            if (loveDateInput.length > 50) {
                alert('内容不能超过50个字符！');
                return;
            }
            
            displayText = loveDateInput;
            config = {
                mode: 'manual',
                text: loveDateInput
            };
        } else {
            // 日期计算模式
            const prefix = document.getElementById('loveDatePrefix').value.trim();
            const year = document.getElementById('yearSelect').value;
            const month = document.getElementById('monthSelect').value;
            const day = document.getElementById('daySelect').value;
            
            displayText = document.getElementById('loveDatePreview').textContent;
            config = {
                mode: 'date',
                prefix: prefix,
                year: year,
                month: month,
                day: day
            };
        }
        
        // 保存配置和显示文本
        await storageDB.setItem('notebookLoveDateConfig', config);
        await storageDB.setItem('notebookLoveDate', displayText);
        
        // 更新主界面
        document.getElementById('notebookLoveDate').textContent = displayText;
        
        alert('相恋日期保存成功！');
        closeLoveDateModal();
    } catch (error) {
        console.error('保存相恋日期失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置相恋日期
async function resetLoveDate() {
    if (!confirm(`确定要重置为默认内容"${DEFAULT_LOVE_DATE}"吗？`)) {
        return;
    }

    try {
        // 清除保存的相恋日期和配置
        await storageDB.removeItem('notebookLoveDate');
        await storageDB.removeItem('notebookLoveDateConfig');
        
        // 切换到手动输入模式
        switchLoveDateMode('manual');
        
        // 更新预览和输入框
        document.getElementById('loveDateInput').value = DEFAULT_LOVE_DATE;
        document.getElementById('loveDatePreview').textContent = DEFAULT_LOVE_DATE;
        
        // 更新主界面
        document.getElementById('notebookLoveDate').textContent = DEFAULT_LOVE_DATE;
        
        alert('已重置为默认内容！');
    } catch (error) {
        console.error('重置相恋日期失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的相恋日期
async function loadLoveDate() {
    try {
        const savedConfig = await storageDB.getItem('notebookLoveDateConfig');
        
        if (savedConfig && savedConfig.mode === 'date') {
            // 日期计算模式：需要每天更新显示
            updateLoveDateDisplay();
            // 设置定时器，每天0点更新一次
            scheduleNextDayUpdate();
        } else {
            // 手动输入模式：直接显示保存的文本
            const savedLoveDate = await storageDB.getItem('notebookLoveDate');
            if (savedLoveDate) {
                document.getElementById('notebookLoveDate').textContent = savedLoveDate;
            }
        }
    } catch (error) {
        console.error('加载相恋日期失败:', error);
    }
}

// 更新相恋日期显示（用于日期计算模式）
async function updateLoveDateDisplay() {
    try {
        const savedConfig = await storageDB.getItem('notebookLoveDateConfig');
        
        if (savedConfig && savedConfig.mode === 'date') {
            const selectedDate = new Date(
                parseInt(savedConfig.year),
                parseInt(savedConfig.month) - 1,
                parseInt(savedConfig.day),
                0, 0, 0
            );
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const timeDiff = today.getTime() - selectedDate.getTime();
            const daysDiff = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
            
            let displayText;
            if (savedConfig.prefix) {
                displayText = `${savedConfig.prefix} ${daysDiff} 天`;
            } else {
                const isPast = timeDiff >= 0;
                displayText = isPast ? `已经 ${daysDiff} 天` : `还有 ${daysDiff} 天`;
            }
            
            // 更新显示
            document.getElementById('notebookLoveDate').textContent = displayText;
            
            // 同时更新保存的文本
            await storageDB.setItem('notebookLoveDate', displayText);
        }
    } catch (error) {
        console.error('更新相恋日期显示失败:', error);
    }
}

// 计划下一次0点更新
function scheduleNextDayUpdate() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
        updateLoveDateDisplay();
        scheduleNextDayUpdate(); // 递归调用，继续计划下一次更新
    }, timeUntilMidnight);
}

// ========== 第三个白条文案编辑功能 ==========

const DEFAULT_NOTEBOOK_TEXT = '跨越时空的思念'; // 默认文案

// 打开第三个白条文案编辑弹窗
async function openNotebookTextModal() {
    try {
        // 加载当前文案
        const savedText = await storageDB.getItem('notebookText');
        const currentText = savedText || DEFAULT_NOTEBOOK_TEXT;
        
        // 设置输入框和预览
        document.getElementById('notebookTextInput').value = currentText;
        document.getElementById('notebookTextPreview').textContent = currentText;
        
        document.getElementById('notebookTextModal').classList.add('active');
    } catch (error) {
        console.error('打开文案弹窗失败:', error);
    }
}

// 关闭第三个白条文案编辑弹窗
function closeNotebookTextModal() {
    document.getElementById('notebookTextModal').classList.remove('active');
}

// 更新第三个白条文案预览
function updateNotebookTextPreview() {
    const textInput = document.getElementById('notebookTextInput').value;
    document.getElementById('notebookTextPreview').textContent = textInput || DEFAULT_NOTEBOOK_TEXT;
}

// 保存第三个白条文案
async function saveNotebookText() {
    const textInput = document.getElementById('notebookTextInput').value.trim();
    
    if (!textInput) {
        alert('请输入文案内容！');
        return;
    }

    if (textInput.length > 100) {
        alert('文案内容不能超过100字符！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('notebookText', textInput);
        
        // 更新主界面文案
        document.getElementById('notebookText').textContent = textInput;
        
        alert('文案保存成功！');
        closeNotebookTextModal();
    } catch (error) {
        console.error('保存文案失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置第三个白条文案
async function resetNotebookText() {
    if (!confirm(`确定要重置为默认文案"${DEFAULT_NOTEBOOK_TEXT}"吗？`)) {
        return;
    }

    try {
        // 清除保存的文案
        await storageDB.removeItem('notebookText');
        
        // 更新预览和输入框
        document.getElementById('notebookTextInput').value = DEFAULT_NOTEBOOK_TEXT;
        document.getElementById('notebookTextPreview').textContent = DEFAULT_NOTEBOOK_TEXT;
        
        // 更新主界面
        document.getElementById('notebookText').textContent = DEFAULT_NOTEBOOK_TEXT;
        
        alert('已重置为默认文案！');
    } catch (error) {
        console.error('重置文案失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的第三个白条文案
async function loadNotebookText() {
    try {
        const savedText = await storageDB.getItem('notebookText');
        if (savedText) {
            document.getElementById('notebookText').textContent = savedText;
        }
    } catch (error) {
        console.error('加载文案失败:', error);
    }
}

// ========== 本子小组件图片编辑功能 ==========

let tempNotebookImageData = null; // 临时存储预览的图片数据

// 打开本子小组件图片编辑弹窗
async function openNotebookImageModal() {
    try {
        // 加载当前图片到预览
        const savedImage = await storageDB.getItem('notebookImage');
        if (savedImage) {
            document.getElementById('notebookImagePreview').src = savedImage;
            document.getElementById('notebookImagePreview').style.display = 'block';
            document.getElementById('notebookImagePreviewPlaceholder').style.display = 'none';
            tempNotebookImageData = savedImage;
        } else {
            document.getElementById('notebookImagePreview').style.display = 'none';
            document.getElementById('notebookImagePreviewPlaceholder').style.display = 'block';
            tempNotebookImageData = null;
        }
        
        document.getElementById('notebookImageModal').classList.add('active');
    } catch (error) {
        console.error('打开图片弹窗失败:', error);
    }
}

// 关闭本子小组件图片编辑弹窗
function closeNotebookImageModal() {
    document.getElementById('notebookImageModal').classList.remove('active');
    document.getElementById('notebookImageUrlInput').value = '';
    tempNotebookImageData = null;
}

// 处理本地文件上传
function handleNotebookImageFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片文件不能超过5MB！');
        return;
    }

    // 读取文件并转换为Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // 显示预览
        document.getElementById('notebookImagePreview').src = imageData;
        document.getElementById('notebookImagePreview').style.display = 'block';
        document.getElementById('notebookImagePreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempNotebookImageData = imageData;
    };
    reader.readAsDataURL(file);
}

// 处理URL上传
function handleNotebookImageUrlUpload() {
    const url = document.getElementById('notebookImageUrlInput').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }

    // 创建图片对象测试URL是否有效
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        // URL有效，显示预览
        document.getElementById('notebookImagePreview').src = url;
        document.getElementById('notebookImagePreview').style.display = 'block';
        document.getElementById('notebookImagePreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempNotebookImageData = url;
        alert('图片加载成功！');
    };
    
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确！\n注意：某些图片可能因跨域限制无法加载。');
    };
    
    img.src = url;
}

// 重置本子小组件图片
async function resetNotebookImage() {
    if (!confirm('确定要重置为默认图片吗？')) {
        return;
    }

    try {
        // 清空预览
        document.getElementById('notebookImagePreview').style.display = 'none';
        document.getElementById('notebookImagePreviewPlaceholder').style.display = 'block';
        tempNotebookImageData = null;
        
        // 清除保存的图片
        await storageDB.removeItem('notebookImage');
        
        // 更新主界面
        document.getElementById('notebookImage').style.display = 'none';
        document.getElementById('notebookImagePlaceholder').style.display = 'block';
        
        alert('已重置为默认图片！');
    } catch (error) {
        console.error('重置图片失败:', error);
        alert('重置失败，请重试！');
    }
}

// 保存本子小组件图片
async function saveNotebookImage() {
    if (!tempNotebookImageData) {
        alert('请先选择或上传图片！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('notebookImage', tempNotebookImageData);
        
        // 更新主界面图片
        document.getElementById('notebookImage').src = tempNotebookImageData;
        document.getElementById('notebookImage').style.display = 'block';
        document.getElementById('notebookImagePlaceholder').style.display = 'none';
        
        alert('图片保存成功！');
        closeNotebookImageModal();
    } catch (error) {
        console.error('保存图片失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载保存的本子小组件图片
async function loadNotebookImage() {
    try {
        const savedImage = await storageDB.getItem('notebookImage');
        if (savedImage) {
            document.getElementById('notebookImage').src = savedImage;
            document.getElementById('notebookImage').style.display = 'block';
            document.getElementById('notebookImagePlaceholder').style.display = 'none';
        }
    } catch (error) {
        console.error('加载图片失败:', error);
    }
}

// ========== 音乐头像更换功能 ==========

let tempMusicAvatarData = null; // 临时存储预览的音乐头像数据

// 打开音乐头像更换弹窗
async function openMusicAvatarModal() {
    try {
        // 加载当前音乐头像到预览
        const savedAvatar = await storageDB.getItem('musicAvatar');
        if (savedAvatar) {
            document.getElementById('musicAvatarPreview').src = savedAvatar;
            document.getElementById('musicAvatarPreview').style.display = 'block';
            document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'none';
            tempMusicAvatarData = savedAvatar;
        } else {
            document.getElementById('musicAvatarPreview').style.display = 'none';
            document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'block';
            tempMusicAvatarData = null;
        }
        
        document.getElementById('musicAvatarModal').classList.add('active');
    } catch (error) {
        console.error('打开音乐头像弹窗失败:', error);
    }
}

// 关闭音乐头像更换弹窗
function closeMusicAvatarModal() {
    document.getElementById('musicAvatarModal').classList.remove('active');
    document.getElementById('musicAvatarUrlInput').value = '';
    tempMusicAvatarData = null;
}

// 处理本地文件上传（音乐头像）
function handleMusicAvatarFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片文件不能超过5MB！');
        return;
    }

    // 读取文件并转换为Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // 显示预览
        document.getElementById('musicAvatarPreview').src = imageData;
        document.getElementById('musicAvatarPreview').style.display = 'block';
        document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempMusicAvatarData = imageData;
    };
    reader.readAsDataURL(file);
}

// 处理URL上传（音乐头像）
function handleMusicAvatarUrlUpload() {
    const url = document.getElementById('musicAvatarUrlInput').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }

    // 创建图片对象测试URL是否有效
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        // URL有效，显示预览
        document.getElementById('musicAvatarPreview').src = url;
        document.getElementById('musicAvatarPreview').style.display = 'block';
        document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempMusicAvatarData = url;
        alert('图片加载成功！');
    };
    
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确！\n注意：某些图片可能因跨域限制无法加载。');
    };
    
    img.src = url;
}

// 重置音乐头像
async function resetMusicAvatar() {
    if (!confirm('确定要重置为默认头像吗？')) {
        return;
    }

    try {
        // 清空预览
        document.getElementById('musicAvatarPreview').style.display = 'none';
        document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'block';
        tempMusicAvatarData = null;
        
        // 清除保存的头像
        await storageDB.removeItem('musicAvatar');
        
        // 更新主界面
        document.getElementById('musicAvatarImage').style.display = 'none';
        document.getElementById('musicAvatarPlaceholder').style.display = 'block';
        
        alert('已重置为默认头像！');
    } catch (error) {
        console.error('重置音乐头像失败:', error);
        alert('重置失败，请重试！');
    }
}

// 保存音乐头像
async function saveMusicAvatar() {
    if (!tempMusicAvatarData) {
        alert('请先选择或上传图片！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('musicAvatar', tempMusicAvatarData);
        
        // 更新主界面头像
        document.getElementById('musicAvatarImage').src = tempMusicAvatarData;
        document.getElementById('musicAvatarImage').style.display = 'block';
        document.getElementById('musicAvatarPlaceholder').style.display = 'none';
        
        alert('头像保存成功！');
        closeMusicAvatarModal();
    } catch (error) {
        console.error('保存音乐头像失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载保存的音乐头像
async function loadMusicAvatar() {
    try {
        const savedAvatar = await storageDB.getItem('musicAvatar');
        if (savedAvatar) {
            document.getElementById('musicAvatarImage').src = savedAvatar;
            document.getElementById('musicAvatarImage').style.display = 'block';
            document.getElementById('musicAvatarPlaceholder').style.display = 'none';
        }
    } catch (error) {
        console.error('加载音乐头像失败:', error);
    }
}

// ========== API预设保存功能 ==========

// 保存当前配置为预设
async function savePreset() {
    // 获取当前配置
    const currentSettings = {
        provider: document.getElementById('apiProvider').value,
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('modelInput').value
    };

    // 检查必填项
    if (!currentSettings.provider || !currentSettings.apiUrl || !currentSettings.apiKey) {
        alert('请先完整填写API配置！');
        return;
    }

    // 让用户输入预设名称
    const presetName = prompt('请输入预设名称：');
    if (!presetName || presetName.trim() === '') {
        return;
    }

    try {
        // 获取现有预设
        const presets = await storageDB.getItem('apiPresets') || {};
        
        // 检查是否已存在同名预设
        if (presets[presetName]) {
            if (!confirm(`预设 "${presetName}" 已存在，是否覆盖？`)) {
                return;
            }
        }

        // 保存预设
        presets[presetName] = {
            ...currentSettings,
            createdAt: new Date().toISOString()
        };
        await storageDB.setItem('apiPresets', presets);
        
        // 刷新预设列表
        await loadPresetList();
        alert(`预设 "${presetName}" 保存成功！`);
    } catch (error) {
        console.error('保存预设失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载选中的预设
async function loadPreset() {
    const presetSelect = document.getElementById('presetSelect');
    const presetName = presetSelect.value;
    
    if (!presetName) {
        alert('请先选择一个预设！');
        return;
    }

    try {
        const presets = await storageDB.getItem('apiPresets') || {};
        const preset = presets[presetName];

        if (!preset) {
            alert('预设不存在！');
            return;
        }

        // 应用预设配置
        document.getElementById('apiProvider').value = preset.provider;
        document.getElementById('apiKey').value = preset.apiKey;
        document.getElementById('modelInput').value = preset.model || '';
        
        // 更新API地址
        handleProviderChange();
        if (preset.provider === 'custom') {
            document.getElementById('apiUrl').value = preset.apiUrl;
        }

        alert(`预设 "${presetName}" 已加载！`);
    } catch (error) {
        console.error('加载预设失败:', error);
        alert('加载失败，请重试！');
    }
}

// 打开删除预设弹窗
async function openDeleteModal() {
    try {
        const presets = await storageDB.getItem('apiPresets') || {};
        if (Object.keys(presets).length === 0) {
            alert('暂无预设可删除！');
            return;
        }
        
        await loadDeletePresetList();
        document.getElementById('deleteModal').classList.add('active');
    } catch (error) {
        console.error('打开删除弹窗失败:', error);
        alert('操作失败，请重试！');
    }
}

// 关闭删除预设弹窗
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

// 加载删除弹窗中的预设列表
async function loadDeletePresetList() {
    try {
        const deleteSelect = document.getElementById('deletePresetSelect');
        const presets = await storageDB.getItem('apiPresets') || {};
        const presetNames = Object.keys(presets);

        // 清空现有选项
        deleteSelect.innerHTML = '';

        if (presetNames.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.disabled = true;
            option.style.color = '#999';
            option.textContent = '暂无预设';
            deleteSelect.appendChild(option);
        } else {
            // 按创建时间排序
            presetNames.sort((a, b) => {
                const timeA = new Date(presets[a].createdAt || 0).getTime();
                const timeB = new Date(presets[b].createdAt || 0).getTime();
                return timeB - timeA;
            });

            presetNames.forEach(name => {
                const preset = presets[name];
                const option = document.createElement('option');
                option.value = name;
                
                const providerName = {
                    'hakimi': 'Gemini',
                    'claude': 'Claude',
                    'ds': 'DeepSeek',
                    'custom': 'Custom'
                }[preset.provider] || preset.provider;
                
                option.textContent = `${name} (${providerName})`;
                deleteSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载删除列表失败:', error);
    }
}

// 删除弹窗中的全选/取消全选
function toggleDeleteSelectAll() {
    const deleteSelect = document.getElementById('deletePresetSelect');
    const options = Array.from(deleteSelect.options).filter(opt => !opt.disabled);
    
    if (options.length === 0) {
        return;
    }

    // 如果所有选项都已选中，则取消全选；否则全选
    const allSelected = options.every(opt => opt.selected);
    options.forEach(opt => {
        opt.selected = !allSelected;
    });
}

// 确认删除选中的预设
async function confirmDeletePresets() {
    const deleteSelect = document.getElementById('deletePresetSelect');
    const selectedOptions = Array.from(deleteSelect.selectedOptions);
    
    if (selectedOptions.length === 0) {
        alert('请先选择要删除的预设！');
        return;
    }

    const presetNames = selectedOptions.map(opt => opt.value);
    const confirmMsg = presetNames.length === 1 
        ? `确定要删除预设 "${presetNames[0]}" 吗？`
        : `确定要删除选中的 ${presetNames.length} 个预设吗？\n\n${presetNames.join('\n')}`;

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        // 从 IndexedDB 中删除
        const presets = await storageDB.getItem('apiPresets') || {};
        presetNames.forEach(name => {
            delete presets[name];
        });
        await storageDB.setItem('apiPresets', presets);

        // 刷新两个列表
        await loadPresetList();
        await loadDeletePresetList();
        
        alert(`已删除 ${presetNames.length} 个预设！`);
        
        // 如果没有预设了，关闭弹窗
        if (Object.keys(presets).length === 0) {
            closeDeleteModal();
        }
    } catch (error) {
        console.error('删除预设失败:', error);
        alert('删除失败，请重试！');
    }
}

// 加载预设列表到下拉框
async function loadPresetList() {
    try {
        const presetSelect = document.getElementById('presetSelect');
        const presets = await storageDB.getItem('apiPresets') || {};
        const presetNames = Object.keys(presets);

        // 清空现有选项，保留默认选项
        presetSelect.innerHTML = '<option value="">选择预设...</option>';

        if (presetNames.length > 0) {
            // 按创建时间排序（最新的在上面）
            presetNames.sort((a, b) => {
                const timeA = new Date(presets[a].createdAt || 0).getTime();
                const timeB = new Date(presets[b].createdAt || 0).getTime();
                return timeB - timeA;
            });

            presetNames.forEach(name => {
                const preset = presets[name];
                const option = document.createElement('option');
                option.value = name;
                
                // 显示预设名称和提供商
                const providerName = {
                    'hakimi': 'Gemini',
                    'claude': 'Claude',
                    'ds': 'DeepSeek',
                    'custom': 'Custom'
                }[preset.provider] || preset.provider;
                
                option.textContent = `${name} (${providerName})`;
                presetSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载预设列表失败:', error);
    }
}

// ========== 音乐用户名修改功能 ==========

const DEFAULT_MUSIC_USERNAME = '@{{user}}'; // 默认音乐用户名

// 打开音乐用户名修改弹窗
async function openMusicUsernameModal() {
    try {
        // 加载当前用户名
        const savedUsername = await storageDB.getItem('musicUsername');
        const currentUsername = savedUsername || DEFAULT_MUSIC_USERNAME;
        
        // 设置输入框和预览
        document.getElementById('musicUsernameInput').value = currentUsername;
        document.getElementById('musicUsernamePreview').textContent = currentUsername;
        
        document.getElementById('musicUsernameModal').classList.add('active');
    } catch (error) {
        console.error('打开音乐用户名弹窗失败:', error);
    }
}

// 关闭音乐用户名修改弹窗
function closeMusicUsernameModal() {
    document.getElementById('musicUsernameModal').classList.remove('active');
}

// 更新音乐用户名预览
function updateMusicUsernamePreview() {
    const usernameInput = document.getElementById('musicUsernameInput').value;
    document.getElementById('musicUsernamePreview').textContent = usernameInput || DEFAULT_MUSIC_USERNAME;
}

// 翻译音乐用户名
async function translateMusicUsername(targetLang) {
    const usernameInput = document.getElementById('musicUsernameInput').value.trim();
    
    if (!usernameInput) {
        alert('请先输入用户名内容！');
        return;
    }

    if (usernameInput.length > 50) {
        alert('用户名内容不能超过50字符！');
        return;
    }

    // 显示加载提示
    alert('正在翻译...');

    try {
        // 语言代码映射
        const langMap = {
            'zh-TW': 'zh-TW',  // 繁体中文
            'en': 'en-US',      // 英语
            'ja': 'ja-JP',      // 日语
            'de': 'de-DE',      // 德语
            'fr': 'fr-FR',      // 法语
            'ko': 'ko-KR',      // 韩语
            'es': 'es-ES',      // 西班牙语
            'ru': 'ru-RU'       // 俄语
        };

        const targetLangCode = langMap[targetLang] || targetLang;

        // 使用 MyMemory Translation API (免费，无需密钥)
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(usernameInput)}&langpair=zh-CN|${targetLangCode}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData) {
            const translatedText = data.responseData.translatedText;
            
            // 更新输入框和预览
            document.getElementById('musicUsernameInput').value = translatedText;
            document.getElementById('musicUsernamePreview').textContent = translatedText;
            
            alert('翻译完成！');
        } else {
            throw new Error('翻译失败');
        }
    } catch (error) {
        console.error('翻译失败:', error);
        alert('翻译失败，请检查网络连接或稍后重试！\n提示：也可以手动编辑用户名内容。');
    }
}

// 保存音乐用户名
async function saveMusicUsername() {
    const usernameInput = document.getElementById('musicUsernameInput').value.trim();
    
    if (!usernameInput) {
        alert('请输入用户名内容！');
        return;
    }

    if (usernameInput.length > 50) {
        alert('用户名内容不能超过50字符！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('musicUsername', usernameInput);
        
        // 更新主界面用户名
        document.getElementById('musicUsername').textContent = usernameInput;
        
        alert('用户名保存成功！');
        closeMusicUsernameModal();
    } catch (error) {
        console.error('保存用户名失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置音乐用户名
async function resetMusicUsername() {
    if (!confirm(`确定要重置为默认用户名"${DEFAULT_MUSIC_USERNAME}"吗？`)) {
        return;
    }

    try {
        // 清除保存的用户名
        await storageDB.removeItem('musicUsername');
        
        // 更新预览和输入框
        document.getElementById('musicUsernameInput').value = DEFAULT_MUSIC_USERNAME;
        document.getElementById('musicUsernamePreview').textContent = DEFAULT_MUSIC_USERNAME;
        
        // 更新主界面
        document.getElementById('musicUsername').textContent = DEFAULT_MUSIC_USERNAME;
        
        alert('已重置为默认用户名！');
    } catch (error) {
        console.error('重置用户名失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的音乐用户名
async function loadMusicUsername() {
    try {
        const savedUsername = await storageDB.getItem('musicUsername');
        if (savedUsername) {
            document.getElementById('musicUsername').textContent = savedUsername;
        }
    } catch (error) {
        console.error('加载用户名失败:', error);
    }
}

// ========== 音乐生日编辑功能 ==========

const DEFAULT_MUSIC_BIRTHDAY = 'birthday 2000/08/01'; // 默认生日

// 初始化生日日期选择器
function initializeBirthdaySelectors() {
    const yearSelect = document.getElementById('birthdayYearSelect');
    const monthSelect = document.getElementById('birthdayMonthSelect');
    const daySelect = document.getElementById('birthdayDaySelect');
    
    // 生成年份选项（从1900年到当前年份）
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === 2000) option.selected = true;
        yearSelect.appendChild(option);
    }
    
    // 生成月份选项
    monthSelect.innerHTML = '';
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = String(month).padStart(2, '0');
        option.textContent = month;
        if (month === 8) option.selected = true;
        monthSelect.appendChild(option);
    }
    
    // 初始化日期选项
    updateBirthdayDayOptions();
}

// 更新生日日期选项（根据年月动态调整天数）
function updateBirthdayDayOptions() {
    const yearSelect = document.getElementById('birthdayYearSelect');
    const monthSelect = document.getElementById('birthdayMonthSelect');
    const daySelect = document.getElementById('birthdayDaySelect');
    
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const currentDay = parseInt(daySelect.value) || 1;
    
    // 计算该月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 生成日期选项
    daySelect.innerHTML = '';
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = String(day).padStart(2, '0');
        option.textContent = day;
        if (day === currentDay && day <= daysInMonth) {
            option.selected = true;
        }
        daySelect.appendChild(option);
    }
    
    // 如果当前选中的日期超过了该月的天数，选择该月最后一天
    if (currentDay > daysInMonth) {
        daySelect.value = String(daysInMonth).padStart(2, '0');
    }
}

// 打开音乐生日编辑弹窗
async function openMusicBirthdayModal() {
    try {
        // 先显示弹窗
        document.getElementById('musicBirthdayModal').classList.add('active');
        
        // 立即初始化日期选择器
        initializeBirthdaySelectors();
        
        // 加载保存的生日配置
        const savedBirthday = await storageDB.getItem('musicBirthday');
        
        if (savedBirthday) {
            // 解析保存的生日数据
            // 格式可能是 "birthday 2000/08/01" 或 "2000/08/01" 或 "生日 2000/08/01"
            const match = savedBirthday.match(/(\d{4})\/(\d{2})\/(\d{2})/);
            if (match) {
                const year = match[1];
                const month = match[2];
                const day = match[3];
                
                document.getElementById('birthdayYearSelect').value = year;
                document.getElementById('birthdayMonthSelect').value = month;
                updateBirthdayDayOptions();
                document.getElementById('birthdayDaySelect').value = day;
                
                // 提取前缀（如果有）
                const prefixMatch = savedBirthday.match(/^(.+?)\s+\d{4}/);
                if (prefixMatch) {
                    document.getElementById('birthdayPrefixInput').value = prefixMatch[1];
                } else {
                    document.getElementById('birthdayPrefixInput').value = '';
                }
            } else {
                // 如果解析失败，使用默认值
                document.getElementById('birthdayPrefixInput').value = 'birthday';
            }
            
            document.getElementById('musicBirthdayPreview').textContent = savedBirthday;
        } else {
            // 使用默认值
            document.getElementById('birthdayPrefixInput').value = 'birthday';
            document.getElementById('musicBirthdayPreview').textContent = DEFAULT_MUSIC_BIRTHDAY;
        }
    } catch (error) {
        console.error('打开生日弹窗失败:', error);
    }
}

// 关闭音乐生日编辑弹窗
function closeMusicBirthdayModal() {
    document.getElementById('musicBirthdayModal').classList.remove('active');
}

// 更新音乐生日预览
function updateMusicBirthdayPreview() {
    const year = document.getElementById('birthdayYearSelect').value;
    const month = document.getElementById('birthdayMonthSelect').value;
    const day = document.getElementById('birthdayDaySelect').value;
    const prefix = document.getElementById('birthdayPrefixInput').value.trim();
    
    let previewText;
    if (prefix) {
        previewText = `${prefix} ${year}/${month}/${day}`;
    } else {
        previewText = `${year}/${month}/${day}`;
    }
    
    document.getElementById('musicBirthdayPreview').textContent = previewText;
}

// 保存音乐生日
async function saveMusicBirthday() {
    try {
        const year = document.getElementById('birthdayYearSelect').value;
        const month = document.getElementById('birthdayMonthSelect').value;
        const day = document.getElementById('birthdayDaySelect').value;
        const prefix = document.getElementById('birthdayPrefixInput').value.trim();
        
        let birthdayText;
        if (prefix) {
            if (prefix.length > 20) {
                alert('前缀文字不能超过20个字符！');
                return;
            }
            birthdayText = `${prefix} ${year}/${month}/${day}`;
        } else {
            birthdayText = `${year}/${month}/${day}`;
        }
        
        // 保存到 IndexedDB
        await storageDB.setItem('musicBirthday', birthdayText);
        
        // 更新主界面生日显示
        document.getElementById('musicBirthday').textContent = birthdayText;
        
        alert('生日保存成功！');
        closeMusicBirthdayModal();
    } catch (error) {
        console.error('保存生日失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置音乐生日
async function resetMusicBirthday() {
    if (!confirm(`确定要重置为默认生日"${DEFAULT_MUSIC_BIRTHDAY}"吗？`)) {
        return;
    }

    try {
        // 清除保存的生日
        await storageDB.removeItem('musicBirthday');
        
        // 重新初始化选择器
        initializeBirthdaySelectors();
        
        // 更新预览和输入框
        document.getElementById('birthdayPrefixInput').value = 'birthday';
        document.getElementById('musicBirthdayPreview').textContent = DEFAULT_MUSIC_BIRTHDAY;
        
        // 更新主界面
        document.getElementById('musicBirthday').textContent = DEFAULT_MUSIC_BIRTHDAY;
        
        alert('已重置为默认生日！');
    } catch (error) {
        console.error('重置生日失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的音乐生日
async function loadMusicBirthday() {
    try {
        const savedBirthday = await storageDB.getItem('musicBirthday');
        if (savedBirthday) {
            document.getElementById('musicBirthday').textContent = savedBirthday;
        }
    } catch (error) {
        console.error('加载生日失败:', error);
    }
}

// ========== 音乐封面更换功能 ==========

let tempMusicCoverData = null; // 临时存储预览的音乐封面数据

// 打开音乐封面更换弹窗
async function openMusicCoverModal() {
    try {
        // 加载当前音乐封面到预览
        const savedCover = await storageDB.getItem('musicCover');
        if (savedCover) {
            document.getElementById('musicCoverPreview').src = savedCover;
            document.getElementById('musicCoverPreview').style.display = 'block';
            document.getElementById('musicCoverPreviewPlaceholder').style.display = 'none';
            tempMusicCoverData = savedCover;
        } else {
            document.getElementById('musicCoverPreview').style.display = 'none';
            document.getElementById('musicCoverPreviewPlaceholder').style.display = 'block';
            tempMusicCoverData = null;
        }
        
        document.getElementById('musicCoverModal').classList.add('active');
    } catch (error) {
        console.error('打开音乐封面弹窗失败:', error);
    }
}

// 关闭音乐封面更换弹窗
function closeMusicCoverModal() {
    document.getElementById('musicCoverModal').classList.remove('active');
    document.getElementById('musicCoverUrlInput').value = '';
    tempMusicCoverData = null;
}

// 处理本地文件上传（音乐封面）
function handleMusicCoverFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片文件不能超过5MB！');
        return;
    }

    // 读取文件并转换为Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // 显示预览
        document.getElementById('musicCoverPreview').src = imageData;
        document.getElementById('musicCoverPreview').style.display = 'block';
        document.getElementById('musicCoverPreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempMusicCoverData = imageData;
    };
    reader.readAsDataURL(file);
}

// 处理URL上传（音乐封面）
function handleMusicCoverUrlUpload() {
    const url = document.getElementById('musicCoverUrlInput').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }

    // 创建图片对象测试URL是否有效
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        // URL有效，显示预览
        document.getElementById('musicCoverPreview').src = url;
        document.getElementById('musicCoverPreview').style.display = 'block';
        document.getElementById('musicCoverPreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempMusicCoverData = url;
        alert('图片加载成功！');
    };
    
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确！\n注意：某些图片可能因跨域限制无法加载。');
    };
    
    img.src = url;
}

// 重置音乐封面
async function resetMusicCover() {
    if (!confirm('确定要重置为默认封面吗？')) {
        return;
    }

    try {
        // 清空预览
        document.getElementById('musicCoverPreview').style.display = 'none';
        document.getElementById('musicCoverPreviewPlaceholder').style.display = 'block';
        tempMusicCoverData = null;
        
        // 清除保存的封面
        await storageDB.removeItem('musicCover');
        
        // 更新主界面
        document.getElementById('musicCoverImage').style.display = 'none';
        document.getElementById('musicCoverPlaceholder').style.display = 'block';
        
        alert('已重置为默认封面！');
    } catch (error) {
        console.error('重置音乐封面失败:', error);
        alert('重置失败，请重试！');
    }
}

// 保存音乐封面
async function saveMusicCover() {
    if (!tempMusicCoverData) {
        alert('请先选择或上传图片！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('musicCover', tempMusicCoverData);
        
        // 更新主界面封面
        document.getElementById('musicCoverImage').src = tempMusicCoverData;
        document.getElementById('musicCoverImage').style.display = 'block';
        document.getElementById('musicCoverPlaceholder').style.display = 'none';
        
        alert('封面保存成功！');
        closeMusicCoverModal();
    } catch (error) {
        console.error('保存音乐封面失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载保存的音乐封面
async function loadMusicCover() {
    try {
        const savedCover = await storageDB.getItem('musicCover');
        if (savedCover) {
            document.getElementById('musicCoverImage').src = savedCover;
            document.getElementById('musicCoverImage').style.display = 'block';
            document.getElementById('musicCoverPlaceholder').style.display = 'none';
        }
    } catch (error) {
        console.error('加载音乐封面失败:', error);
    }
}

// ========== 在线音乐搜索和播放功能 ==========

// 全局音乐播放器状态
let musicLibrary = []; // 音乐库
let currentMusicIndex = 0; // 当前播放索引
let isPlaying = false; // 是否正在播放
let playMode = 'list'; // 播放模式：'list'=连续播放, 'single'=单曲循环
const audioPlayer = document.getElementById('audioPlayer');

// 初始化音乐播放器
if (audioPlayer) {
    // 监听播放结束事件
    audioPlayer.addEventListener('ended', function() {
        if (playMode === 'single') {
            // 单曲循环：重新播放当前歌曲
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            // 连续播放：播放下一首
            playNextSong();
        }
    });
    
    // 监听播放进度
    audioPlayer.addEventListener('timeupdate', function() {
        updateProgressBar();
        updateLyric();
    });
    
    // 监听加载完成
    audioPlayer.addEventListener('loadedmetadata', function() {
        console.log('音乐加载完成，时长:', audioPlayer.duration);
    });
}

// 更新API描述
function updateApiDescription() {
    const apiSelect = document.getElementById('musicApiSelect');
    const desc = document.getElementById('apiDescription');
    
    const descriptions = {
        'meting1': '实测可用 - 支持网易云、QQ、酷狗、酷我',
        'meting2': '实测可用 - 稳定快速，多平台聚合',
        'meting3': '实测可用 - 支持网易云和QQ音乐',
        'aa1': '聚合多个音乐平台，一次搜索全部结果',
        'nanyi': '全平台聚合API，支持网易云、QQ、酷狗等'
    };
    
    desc.textContent = descriptions[apiSelect.value] || '';
}

// 智能提取歌手信息的辅助函数
function extractArtistInfo(song) {
    // 尝试从多个可能的字段中提取歌手信息
    let artist = null;
    
    // 1. 处理数组格式的歌手信息（如网易云的 ar 字段）
    if (song.ar && Array.isArray(song.ar) && song.ar.length > 0) {
        artist = song.ar.map(a => a.name).filter(Boolean).join(', ');
    }
    // 2. 处理 artists 数组
    else if (song.artists && Array.isArray(song.artists) && song.artists.length > 0) {
        artist = song.artists.map(a => a.name || a).filter(Boolean).join(', ');
    }
    // 3. 处理 artist 数组格式
    else if (Array.isArray(song.artist) && song.artist.length > 0) {
        artist = song.artist.map(a => (typeof a === 'object' ? a.name : a)).filter(Boolean).join(', ');
    }
    // 4. 处理字符串格式的各种字段
    else if (song.singer) {
        artist = song.singer;
    }
    else if (song.artist) {
        artist = song.artist;
    }
    else if (song.artistName) {
        artist = song.artistName;
    }
    else if (song.author) {
        artist = song.author;
    }
    else if (song.auther) { // 注意：有些API拼写错误
        artist = song.auther;
    }
    else if (song.singerName) {
        artist = song.singerName;
    }
    
    // 清理和验证结果
    if (artist) {
        artist = String(artist).trim();
        // 过滤掉无效值
        if (artist === '' || artist === 'null' || artist === 'undefined' || artist === 'None') {
            artist = null;
        }
    }
    
    // 返回结果，如果没有找到则返回"未知歌手"
    return artist || '未知歌手';
}

// 智能提取专辑信息的辅助函数
function extractAlbumInfo(song) {
    // 尝试从多个可能的字段中提取专辑信息
    let album = null;
    
    // 1. 处理对象格式的专辑信息（如网易云的 al 字段）
    if (song.al && typeof song.al === 'object' && song.al.name) {
        album = song.al.name;
    }
    // 2. 处理 album 对象格式
    else if (song.album && typeof song.album === 'object' && song.album.name) {
        album = song.album.name;
    }
    // 3. 处理字符串格式的各种字段
    else if (typeof song.album === 'string') {
        album = song.album;
    }
    else if (song.albumName) {
        album = song.albumName;
    }
    else if (song.albumTitle) {
        album = song.albumTitle;
    }
    else if (song.disc) {
        album = song.disc;
    }
    else if (song.albumname) {
        album = song.albumname;
    }
    
    // 清理和验证结果
    if (album) {
        album = String(album).trim();
        // 过滤掉无效值
        if (album === '' || album === 'null' || album === 'undefined' || album === 'None' || album === '未知' || album === 'unknown') {
            album = null;
        }
    }
    
    // 返回结果，如果没有找到则返回"未知专辑"
    return album || '未知专辑';
}

// 搜索音乐（聚合多平台）
async function searchMusic() {
    const searchInput = document.getElementById('musicSearchInput').value.trim();
    const apiSource = document.getElementById('musicApiSelect').value;
    
    if (!searchInput) {
        alert('请输入搜索关键词！');
        return;
    }

    // 显示加载提示
    document.getElementById('musicSearchLoading').style.display = 'block';
    document.getElementById('musicSearchResults').style.display = 'none';

    try {
        let results = [];
        
        if (apiSource === 'meting1') {
            results = await searchWithMetingAPINew(searchInput);
        } else if (apiSource === 'meting2') {
            results = await searchWithMetingAPINew2(searchInput);
        } else if (apiSource === 'meting3') {
            results = await searchWithVkeysAPI(searchInput);
        } else if (apiSource === 'aa1') {
            results = await searchWithAA1API(searchInput);
        } else if (apiSource === 'nanyi') {
            results = await searchWithNanYiAPI(searchInput);
        }

        if (results.length > 0) {
            displayMusicResults(results);
        } else {
            document.getElementById('musicSearchLoading').style.display = 'none';
            alert('没有找到相关音乐，请尝试其他关键词或切换API！');
        }
    } catch (error) {
        console.error('搜索音乐失败:', error);
        document.getElementById('musicSearchLoading').style.display = 'none';
        alert('搜索失败：' + error.message + '\n\n建议：\n1. 尝试切换其他API服务\n2. 检查网络连接\n3. 稍后重试');
    }
}

// 新版Meting API 1 (i-meto.com) - 实测可用
async function searchWithMetingAPINew(keyword) {
    const baseUrl = 'https://api.i-meto.com/meting/api';
    return await searchWithMetingCore(baseUrl, keyword);
}

// 新版Meting API 2 (qjqq.cn) - 实测可用
async function searchWithMetingAPINew2(keyword) {
    const baseUrl = 'https://meting.qjqq.cn/api.php';
    return await searchWithMetingCore(baseUrl, keyword);
}

// Meting核心搜索函数
async function searchWithMetingCore(baseUrl, keyword) {
    try {
        const platforms = ['netease', 'tencent', 'kugou', 'kuwo'];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const searchTerm = keyword.replace(/\s/g, '');
                const searchUrl = `${baseUrl}?server=${platform}&type=search&id=${encodeURIComponent(searchTerm)}`;
                
                console.log(`🎵 搜索${platform}:`, searchUrl);
                const response = await fetch(searchUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (Array.isArray(data) && data.length > 0) {
                        console.log(`${platform} 返回 ${data.length} 条结果`);
                        
                        // 处理前5条结果
                        for (const song of data.slice(0, 5)) {
                            // Meting API直接在搜索结果中返回URL
                            if (song.url) {
                                const platformNames = {
                                    'netease': '网易云',
                                    'tencent': 'QQ音乐',
                                    'kugou': '酷狗',
                                    'kuwo': '酷我'
                                };
                                
                                allResults.push({
                                    id: `${platform}_${song.id || Math.random()}`,
                                    name: song.name || song.title || '未知歌曲',
                                    artist: extractArtistInfo(song),
                                    album: extractAlbumInfo(song),
                                    cover: song.pic || song.cover,
                                    coverSmall: song.pic || song.cover,
                                    playUrl: song.url,
                                    source: platform,
                                    platform: platformNames[platform] || platform
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`${platform}搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('Meting API搜索失败:', error);
        throw error;
    }
}

// Vkeys API - 自定义实现
async function searchWithVkeysAPI(keyword) {
    const baseUrl = 'https://api.vkeys.cn/v2/music';
    return await searchWithVkeysCore(baseUrl, keyword);
}

// Vkeys核心搜索函数（参考METING风格编写）
async function searchWithVkeysCore(baseUrl, keyword) {
    try {
        const platforms = [
            { name: 'netease', label: '网易云' },
            { name: 'tencent', label: 'QQ音乐' }
        ];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const searchTerm = keyword.replace(/\s/g, '');
                const searchUrl = `${baseUrl}/${platform.name}?word=${encodeURIComponent(searchTerm)}`;
                
                console.log(`🎵 搜索${platform.label}:`, searchUrl);
                const response = await fetch(searchUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
                        console.log(`${platform.label} 返回 ${data.data.length} 条结果`);
                        
                        // 处理前6条结果
                        for (const song of data.data.slice(0, 6)) {
                            try {
                                // 获取播放链接（Vkeys API需要额外请求获取URL）
                                const urlResponse = await fetch(`${baseUrl}/${platform.name}?id=${song.id}`);
                                const urlData = await urlResponse.json();
                                
                                if (urlData.code === 200 && urlData.data?.url) {
                                    allResults.push({
                                        id: `${platform.name}_${song.id}`,
                                        name: song.name || song.song || song.title || '未知歌曲',
                                        artist: extractArtistInfo(song),
                                        album: extractAlbumInfo(song),
                                        cover: song.al?.picUrl || song.pic || song.cover || '',
                                        coverSmall: song.al?.picUrl || song.pic || song.cover || '',
                                        playUrl: urlData.data.url,
                                        source: platform.name,
                                        platform: platform.label
                                    });
                                }
                            } catch (urlErr) {
                                console.log(`${platform.label} 获取播放链接失败:`, urlErr);
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`${platform.label} 搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('Vkeys API 搜索失败:', error);
        return [];
    }
}

// AA1 聚合API
async function searchWithAA1API(keyword) {
    try {
        const url = `https://api.aa1.cn/api/api-wenan-wangyiyunyinyue/index.php?msg=${encodeURIComponent(keyword)}&n=20`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('AA1 API请求失败');
        }
        
        const data = await response.json();
        const results = [];
        
        if (data && Array.isArray(data)) {
            for (const song of data) {
                if (song.url) {
                    results.push({
                        id: `aa1_${song.id || Math.random()}`,
                        name: song.name || song.title,
                        artist: extractArtistInfo(song),
                        album: extractAlbumInfo(song),
                        cover: song.pic || song.cover,
                        coverSmall: song.pic || song.cover,
                        playUrl: song.url,
                        source: 'netease',
                        platform: '网易云'
                    });
                }
            }
        }
        
        return results;
    } catch (error) {
        console.error('AA1 API搜索失败:', error);
        throw error;
    }
}

// NanYi 聚合API
async function searchWithNanYiAPI(keyword) {
    try {
        const platforms = ['netease', 'qq', 'kugou', 'kuwo'];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const url = `https://api.nanyinet.com/api/music/${platform}?msg=${encodeURIComponent(keyword)}&n=5`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data && data.data && Array.isArray(data.data)) {
                        for (const song of data.data) {
                            if (song.url) {
                                allResults.push({
                                    id: `${platform}_${song.id || Math.random()}`,
                                    name: song.name || song.title,
                                    artist: extractArtistInfo(song),
                                    album: extractAlbumInfo(song),
                                    cover: song.pic || song.cover,
                                    coverSmall: song.pic || song.cover,
                                    playUrl: song.url,
                                    source: platform,
                                    platform: platform
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`NanYi ${platform}搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('NanYi API搜索失败:', error);
        throw error;
    }
}

// 显示音乐搜索结果
function displayMusicResults(results) {
    const resultsContainer = document.getElementById('musicSearchList');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: #999;">没有找到相关音乐</div>';
        document.getElementById('musicSearchLoading').style.display = 'none';
        document.getElementById('musicSearchResults').style.display = 'block';
        return;
    }

    // 平台标识和颜色
    const platformColors = {
        'netease': '#e60012',
        'qq': '#31c27c',
        'kugou': '#2ca7f8',
        'kuwo': '#f63',
        '网易云': '#e60012',
        'QQ音乐': '#31c27c'
    };

    const platformNames = {
        'netease': '网易云',
        'qq': 'QQ音乐',
        'kugou': '酷狗',
        'kuwo': '酷我'
    };

    results.forEach((music, index) => {
        const musicItem = document.createElement('div');
        musicItem.style.cssText = `
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            transition: background-color 0.2s;
            position: relative;
        `;
        
        musicItem.onmouseover = function() {
            this.style.backgroundColor = '#fff';
        };
        
        musicItem.onmouseout = function() {
            this.style.backgroundColor = 'transparent';
        };

        const platformName = music.platform || platformNames[music.source] || music.source;
        const platformColor = platformColors[music.source] || platformColors[music.platform] || '#666';

        musicItem.innerHTML = `
            <img src="${music.coverSmall}" alt="封面" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-right: 12px;" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23999%27 font-size=%2714%27%3E封面%3C/text%3E%3C/svg%3E'">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 500; color: #333; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.name}
                    <span style="display: inline-block; padding: 2px 6px; background: ${platformColor}; color: white; border-radius: 4px; font-size: 10px; margin-left: 6px; vertical-align: middle;">
                        ${platformName}
                    </span>
                </div>
                <div style="font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.artist}
                </div>
                <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.album}
                </div>
            </div>
            <button onclick='addToMusicLibrary(${JSON.stringify(music).replace(/'/g, "&apos;").replace(/"/g, "&quot;")})' 
                    style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; white-space: nowrap;">
                添加
            </button>
        `;

        resultsContainer.appendChild(musicItem);
    });

    // 隐藏加载提示，显示结果
    document.getElementById('musicSearchLoading').style.display = 'none';
    document.getElementById('musicSearchResults').style.display = 'block';
}

// 添加到音乐库
async function addToMusicLibrary(music) {
    try {
        // 检查是否已存在
        const exists = musicLibrary.some(item => item.id === music.id && item.source === music.source);
        if (exists) {
            alert('该音乐已在音乐库中！');
            return;
        }

        // 获取歌词
        let lyric = null;
        const apiSource = document.getElementById('musicApiSelect')?.value || 'meting1';
        const songId = music.id.split('_').pop(); // 提取原始ID
        
        try {
            if (apiSource === 'meting1') {
                lyric = await getLyricFromMeting('https://api.i-meto.com/meting/api', music.source, songId);
            } else if (apiSource === 'meting2') {
                lyric = await getLyricFromMeting('https://meting.qjqq.cn/api.php', music.source, songId);
            } else if (apiSource === 'meting3') {
                lyric = await getLyricFromVkeys(music.source, songId);
            } else if (apiSource === 'nanyi') {
                lyric = await getLyricFromNanYi(music.source, songId);
            }
            
            if (lyric) {
                music.lyric = lyric;
                console.log('✅ 歌词获取成功');
            } else {
                console.log('⚠️ 未获取到歌词');
            }
        } catch (error) {
            console.error('获取歌词出错:', error);
        }

        // 添加到音乐库
        musicLibrary.push(music);
        
        // 保存到 IndexedDB
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 更新显示
        displayMusicLibrary();
        
        alert(`已添加《${music.name}》到音乐库！${music.lyric ? '\n✅ 歌词已同步' : '\n⚠️ 暂无歌词'}`);
    } catch (error) {
        console.error('添加音乐失败:', error);
        alert('添加失败，请重试！');
    }
}

// 切换自定义音乐上传表单显示
function toggleCustomMusicUpload() {
    const toggle = document.getElementById('customMusicToggle');
    const form = document.getElementById('customMusicForm');
    
    if (toggle.checked) {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

// 处理歌词文件上传
function handleLyricFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.name.endsWith('.lrc') && !file.name.endsWith('.txt')) {
        alert('请上传LRC或TXT格式的歌词文件！');
        event.target.value = '';
        return;
    }
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('customMusicLyric').value = content;
        alert('歌词文件已加载！');
    };
    reader.onerror = function() {
        alert('读取文件失败，请重试！');
    };
    reader.readAsText(file, 'UTF-8');
    
    // 清空文件选择，允许重复上传同一文件
    event.target.value = '';
}

// 清空自定义歌词
function clearCustomLyric() {
    document.getElementById('customMusicLyric').value = '';
}

// 添加自定义音乐
async function addCustomMusic() {
    try {
        const name = document.getElementById('customMusicName').value.trim();
        const artist = document.getElementById('customMusicArtist').value.trim();
        const album = document.getElementById('customMusicAlbum').value.trim();
        const cover = document.getElementById('customMusicCover').value.trim();
        const playUrl = document.getElementById('customMusicUrl').value.trim();
        const lyric = document.getElementById('customMusicLyric').value.trim();
        
        // 验证必填项
        if (!name) {
            alert('请输入歌曲名称！');
            return;
        }
        
        if (!artist) {
            alert('请输入歌手名称！');
            return;
        }
        
        if (!playUrl) {
            alert('请输入音乐URL！');
            return;
        }
        
        // 验证URL格式
        try {
            new URL(playUrl);
        } catch (e) {
            alert('音乐URL格式不正确，请输入有效的URL！');
            return;
        }
        
        // 如果有封面URL，验证格式
        if (cover) {
            try {
                new URL(cover);
            } catch (e) {
                alert('封面URL格式不正确，请输入有效的URL！');
                return;
            }
        }
        
        // 创建音乐对象
        const customMusic = {
            id: `custom_${Date.now()}`,
            name: name,
            artist: artist,
            album: album || '自定义专辑',
            cover: cover || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E封面%3C/text%3E%3C/svg%3E',
            coverSmall: cover || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E封面%3C/text%3E%3C/svg%3E',
            playUrl: playUrl,
            source: 'custom',
            platform: '本地上传',
            lyric: lyric || null
        };
        
        // 检查是否已存在
        const exists = musicLibrary.some(item => item.playUrl === playUrl);
        if (exists) {
            alert('该音乐URL已在音乐库中！');
            return;
        }
        
        // 添加到音乐库
        musicLibrary.push(customMusic);
        
        // 保存到 IndexedDB
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 更新显示
        displayMusicLibrary();
        
        // 清空表单
        document.getElementById('customMusicName').value = '';
        document.getElementById('customMusicArtist').value = '';
        document.getElementById('customMusicAlbum').value = '';
        document.getElementById('customMusicCover').value = '';
        document.getElementById('customMusicUrl').value = '';
        document.getElementById('customMusicLyric').value = '';
        
        alert(`已添加《${name}》到音乐库！${lyric ? '\n✅ 歌词已同步' : '\n⚠️ 未添加歌词'}`);
    } catch (error) {
        console.error('添加自定义音乐失败:', error);
        alert('添加失败，请重试！');
    }
}

// 显示音乐库
function displayMusicLibrary() {
    const libraryContainer = document.getElementById('musicLibraryList');
    
    if (musicLibrary.length === 0) {
        libraryContainer.innerHTML = `
            <div style="text-align: center; color: #999; padding: 30px;">
                暂无音乐，请先搜索并添加
            </div>
        `;
        return;
    }

    libraryContainer.innerHTML = '';

    musicLibrary.forEach((music, index) => {
        const musicItem = document.createElement('div');
        musicItem.style.cssText = `
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 8px;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid ${index === currentMusicIndex ? '#007bff' : 'transparent'};
        `;
        
        musicItem.onclick = function() {
            playMusicByIndex(index);
        };

        musicItem.innerHTML = `
            <img src="${music.coverSmall}" alt="封面" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover; margin-right: 10px;">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.name}
                </div>
                <div style="font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.artist}
                </div>
            </div>
            <button onclick="event.stopPropagation(); removeFromLibrary(${index})" 
                    style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                删除
            </button>
        `;

        libraryContainer.appendChild(musicItem);
    });
}

// 从音乐库删除
async function removeFromLibrary(index) {
    if (confirm('确定要删除这首音乐吗？')) {
        musicLibrary.splice(index, 1);
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 如果删除的是当前播放的歌曲
        if (index === currentMusicIndex) {
            audioPlayer.pause();
            isPlaying = false;
            updatePlayPauseButton();
            if (musicLibrary.length > 0) {
                currentMusicIndex = 0;
                loadMusic(currentMusicIndex);
            }
        } else if (index < currentMusicIndex) {
            currentMusicIndex--;
        }
        
        displayMusicLibrary();
    }
}

// 清空音乐库
async function clearMusicLibrary() {
    const confirmed = await iosConfirm('确定要清空音乐库吗？', '确认清空');
    if (confirmed) {
        musicLibrary = [];
        currentMusicIndex = 0;
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseButton();
        await storageDB.setItem('musicLibrary', []);
        displayMusicLibrary();
        showIosAlert('成功', '音乐库已清空');
    }
}

// 加载音乐库
async function loadMusicLibrary() {
    try {
        const savedLibrary = await storageDB.getItem('musicLibrary');
        if (savedLibrary && Array.isArray(savedLibrary)) {
            musicLibrary = savedLibrary;
            displayMusicLibrary();
            if (musicLibrary.length > 0) {
                loadMusic(0);
            }
        }
    } catch (error) {
        console.error('加载音乐库失败:', error);
    }
}

// 播放指定索引的音乐
function playMusicByIndex(index) {
    if (index >= 0 && index < musicLibrary.length) {
        currentMusicIndex = index;
        loadMusic(index);
        audioPlayer.play();
        isPlaying = true;
        updatePlayPauseButton();
        displayMusicLibrary(); // 更新高亮
    }
}

// 加载音乐
function loadMusic(index) {
    if (index < 0 || index >= musicLibrary.length) return;
    
    const music = musicLibrary[index];
    
    // 设置音频源
    audioPlayer.src = music.playUrl;
    
    // 更新界面显示
    document.getElementById('currentMusicTitle').textContent = music.name;
    document.getElementById('currentMusicSong').textContent = `♪ ${music.artist}`;
    
    // 更新封面
    document.getElementById('musicCoverImage').src = music.cover;
    document.getElementById('musicCoverImage').style.display = 'block';
    document.getElementById('musicCoverPlaceholder').style.display = 'none';
    
    // 保存当前封面
    storageDB.setItem('musicCover', music.cover);
    
    // 加载歌词
    if (music.lyric) {
        loadLyric(music.lyric);
    } else {
        clearLyric();
    }
}

// 播放/暂停切换
function togglePlayPause() {
    if (musicLibrary.length === 0) {
        alert('音乐库为空！请先搜索并添加音乐。');
        return;
    }

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    
    updatePlayPauseButton();
}

// 更新播放/暂停按钮
function updatePlayPauseButton() {
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.textContent = isPlaying ? '⏸' : '▶';
    }
}

// 上一首
function playPreviousSong() {
    if (musicLibrary.length === 0) return;
    
    currentMusicIndex = (currentMusicIndex - 1 + musicLibrary.length) % musicLibrary.length;
    loadMusic(currentMusicIndex);
    
    if (isPlaying) {
        audioPlayer.play();
    }
    
    displayMusicLibrary();
}

// 下一首
function playNextSong() {
    if (musicLibrary.length === 0) return;
    
    currentMusicIndex = (currentMusicIndex + 1) % musicLibrary.length;
    loadMusic(currentMusicIndex);
    
    if (isPlaying) {
        audioPlayer.play();
    }
    
    displayMusicLibrary();
}

// 切换播放模式
function togglePlayMode() {
    const playModeBtn = document.getElementById('playModeBtn');
    
    if (playMode === 'list') {
        // 切换到单曲循环
        playMode = 'single';
        playModeBtn.textContent = '单';
        playModeBtn.style.color = '#007bff';
        playModeBtn.title = '单曲循环';
        console.log('切换到单曲循环模式');
    } else {
        // 切换到连续播放
        playMode = 'list';
        playModeBtn.textContent = '列';
        playModeBtn.style.color = '';
        playModeBtn.title = '连续播放';
        console.log('切换到列表播放模式');
    }
}

// 更新进度条
function updateProgressBar() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        const fill = document.getElementById('musicProgressFill');
        if (fill) {
            fill.style.width = progress + '%';
        }
    }
}

// 点击进度条跳转
function seekMusic(event) {
    if (audioPlayer.duration) {
        const progressBar = document.getElementById('musicProgressBar');
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
}

// ========== 聊天功能 ==========

// 打开聊天页面
function openChatPage() {
    const chatPage = document.getElementById('chatPage');
    if (chatPage) {
        chatPage.style.display = 'flex';
        // 加载聊天头像
        loadChatAvatar();
        // 默认显示聊天标签页
        switchChatTab('chat');
    }
}

// 关闭聊天页面
function closeChatPage() {
    const chatPage = document.getElementById('chatPage');
    if (chatPage) {
        chatPage.style.display = 'none';
    }
}

// 切换聊天标签页
function switchChatTab(tab) {
    // 获取顶栏元素
    const chatHeader = document.getElementById('chatHeader');
    
    // 更新底部导航栏激活状态
    const navItems = document.querySelectorAll('.chat-nav-item');
    navItems.forEach((item, index) => {
        item.classList.remove('active');
        if ((tab === 'chat' && index === 0) ||
            (tab === 'friends' && index === 1) ||
            (tab === 'moments' && index === 2) ||
            (tab === 'profile' && index === 3)) {
            item.classList.add('active');
        }
    });

    // 隐藏所有标签页内容
    const chatTabContent = document.getElementById('chatTabContent');
    const profileTabContent = document.getElementById('profileTabContent');
    
    if (chatTabContent) chatTabContent.style.display = 'none';
    if (profileTabContent) profileTabContent.style.display = 'none';

    // 显示对应的标签页内容
    switch(tab) {
        case 'chat':
            if (chatTabContent) chatTabContent.style.display = 'flex';
            if (chatHeader) chatHeader.style.display = 'flex';
            renderChatList(); // 刷新聊天列表
            break;
        case 'friends':
            // 好友页面待开发
            if (chatTabContent) chatTabContent.style.display = 'flex';
            if (chatHeader) chatHeader.style.display = 'flex';
            alert('好友功能待开发');
            break;
        case 'moments':
            // 朋友圈页面待开发
            if (chatTabContent) chatTabContent.style.display = 'flex';
            if (chatHeader) chatHeader.style.display = 'flex';
            alert('朋友圈功能待开发');
            break;
        case 'profile':
            if (profileTabContent) {
                profileTabContent.style.display = 'flex';
                loadProfileData();
            }
            // 隐藏顶栏
            if (chatHeader) chatHeader.style.display = 'none';
            break;
    }
}

// 加载我的页面数据
async function loadProfileData() {
    try {
        // 从localStorage加载保存的名称
        const savedName = localStorage.getItem('chatProfileName');
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = savedName || '';
        }

        // 从localStorage加载保存的头像
        const savedAvatar = localStorage.getItem('chatProfileAvatar');
        const profileAvatarImage = document.getElementById('profileAvatarImage');
        const profileAvatarPlaceholder = document.getElementById('profileAvatarPlaceholder');
        
        if (savedAvatar && profileAvatarImage && profileAvatarPlaceholder) {
            profileAvatarImage.src = savedAvatar;
            profileAvatarImage.style.display = 'block';
            profileAvatarPlaceholder.style.display = 'none';
        } else if (profileAvatarPlaceholder) {
            profileAvatarPlaceholder.textContent = '头像';
            if (profileAvatarImage) {
                profileAvatarImage.style.display = 'none';
            }
        }

        // 从localStorage加载保存的ID
        const savedId = localStorage.getItem('chatProfileId');
        const profileId = document.getElementById('profileId');
        if (profileId) {
            profileId.textContent = savedId || '';
        }
        
        // 有效期默认为"长期"
        const profileExpiry = document.getElementById('profileExpiry');
        if (profileExpiry) {
            profileExpiry.textContent = '长期';
        }
        
        // 生成条形码
        if (savedId) {
            generateBarcode(savedId);
        } else {
            generateBarcode('DEFAULT');
        }
    } catch (error) {
        console.error('加载我的页面数据失败:', error);
    }
}

// 生成字符串哈希值（确保唯一性）
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
}

// 生成条形码（基于ID内容的唯一编码）
function generateBarcode(text, canvasId = 'profileBarcode') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvasId === 'profileBarcodePreview' ? 200 : 100;
    const height = canvasId === 'profileBarcodePreview' ? 50 : 40;
    
    // 设置canvas尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 清空画布（透明背景）
    ctx.clearRect(0, 0, width, height);
    
    // 方法1：使用完整的字符编码（如果文本较短）
    // 方法2：使用哈希值生成唯一模式（如果文本较长）
    
    let binaryString = '';
    
    if (text.length <= 10) {
        // 短文本：使用完整的字符编码
        for (let i = 0; i < text.length; i++) {
            const binary = text.charCodeAt(i).toString(2).padStart(8, '0');
            binaryString += binary;
        }
    } else {
        // 长文本：使用哈希值组合，确保唯一性
        // 生成多个哈希值来增加唯一性
        const hash1 = hashString(text);
        const hash2 = hashString(text.split('').reverse().join(''));
        const hash3 = hashString(text + text.length);
        
        // 将哈希值转换为二进制并组合
        binaryString = hash1.toString(2).padStart(32, '0') + 
                       hash2.toString(2).padStart(32, '0') + 
                       hash3.toString(2).padStart(32, '0');
    }
    
    // 固定条形码长度
    const targetLength = canvasId === 'profileBarcodePreview' ? 96 : 80;
    
    // 如果太短，重复填充；如果太长，使用哈希压缩
    if (binaryString.length < targetLength) {
        while (binaryString.length < targetLength) {
            binaryString += binaryString;
        }
    }
    binaryString = binaryString.substring(0, targetLength);
    
    // 绘制条形码
    const barWidth = width / binaryString.length;
    const barHeight = height;
    
    ctx.fillStyle = '#000000';
    for (let i = 0; i < binaryString.length; i++) {
        if (binaryString[i] === '1') {
            ctx.fillRect(i * barWidth, 0, barWidth, barHeight);
        }
    }
}

// ========== 编辑身份ID功能 ==========

// 打开编辑ID弹窗
function openProfileIdModal() {
    const currentId = document.getElementById('profileId').textContent || '';
    const input = document.getElementById('profileIdInput');
    const preview = document.getElementById('profileIdPreview');
    
    // 填充当前ID
    input.value = currentId;
    preview.textContent = currentId || '未设置';
    
    // 生成条形码预览
    if (currentId) {
        generateBarcode(currentId, 'profileBarcodePreview');
    } else {
        generateBarcode('DEFAULT', 'profileBarcodePreview');
    }
    
    // 打开弹窗
    document.getElementById('profileIdModal').classList.add('active');
}

// 关闭编辑ID弹窗
function closeProfileIdModal() {
    document.getElementById('profileIdModal').classList.remove('active');
}

// 更新ID预览
function updateProfileIdPreview() {
    const input = document.getElementById('profileIdInput').value.trim();
    const preview = document.getElementById('profileIdPreview');
    
    if (input) {
        preview.textContent = input;
        generateBarcode(input, 'profileBarcodePreview');
    } else {
        preview.textContent = '未设置';
        generateBarcode('DEFAULT', 'profileBarcodePreview');
    }
}

// 保存ID
function saveProfileId() {
    const input = document.getElementById('profileIdInput').value.trim();
    
    // 保存到localStorage
    if (input) {
        localStorage.setItem('chatProfileId', input);
        // 更新身份卡显示
        document.getElementById('profileId').textContent = input;
        // 更新条形码
        generateBarcode(input);
    } else {
        localStorage.removeItem('chatProfileId');
        document.getElementById('profileId').textContent = '';
        generateBarcode('DEFAULT');
    }
    
    // 关闭弹窗
    closeProfileIdModal();
    showIosAlert('成功', input ? 'ID已保存' : 'ID已清空');
}

// 清空ID
function resetProfileId() {
    document.getElementById('profileIdInput').value = '';
    updateProfileIdPreview();
}

// ========== 聊天角色管理 ==========

let chatCharacters = [];

// 添加新聊天
function addNewChat() {
    openAddChatCharacter();
}

// 打开新增聊天角色界面
function openAddChatCharacter() {
    // 重置表单
    document.getElementById('chatCharacterNameInput').value = '';
    document.getElementById('chatCharacterRemarkInput').value = '';
    document.getElementById('chatCharacterDescInput').value = '';
    document.getElementById('chatCharacterAvatarUrl').value = '';
    document.getElementById('chatCharacterUrlInputSection').style.display = 'none';
    
    // 重置头像预览
    document.getElementById('chatCharacterAvatarImage').style.display = 'none';
    document.getElementById('chatCharacterAvatarPlaceholder').style.display = 'block';
    
    // 打开界面
    document.getElementById('addChatCharacterPage').classList.add('active');
}

// 关闭新增聊天角色界面
function closeAddChatCharacter() {
    document.getElementById('addChatCharacterPage').classList.remove('active');
}

// 显示URL输入框
function showChatCharacterUrlInput() {
    const section = document.getElementById('chatCharacterUrlInputSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

// 处理本地头像上传
function handleChatCharacterAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showIosAlert('错误', '图片大小不能超过5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('chatCharacterAvatarImage');
            img.src = e.target.result;
            img.style.display = 'block';
            document.getElementById('chatCharacterAvatarPlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// 从URL加载头像
function loadChatCharacterAvatarFromUrl() {
    const url = document.getElementById('chatCharacterAvatarUrl').value.trim();
    if (!url) {
        showIosAlert('提示', '请输入图片URL地址');
        return;
    }
    
    const img = document.getElementById('chatCharacterAvatarImage');
    img.onload = function() {
        img.style.display = 'block';
        document.getElementById('chatCharacterAvatarPlaceholder').style.display = 'none';
        showIosAlert('成功', '图片加载成功');
    };
    img.onerror = function() {
        showIosAlert('错误', '图片加载失败，请检查URL是否正确');
    };
    img.src = url;
}

// 保存聊天角色
function saveChatCharacter() {
    const name = document.getElementById('chatCharacterNameInput').value.trim();
    const remark = document.getElementById('chatCharacterRemarkInput').value.trim();
    const description = document.getElementById('chatCharacterDescInput').value.trim();
    const avatarImg = document.getElementById('chatCharacterAvatarImage');
    const avatar = avatarImg.style.display !== 'none' ? avatarImg.src : '';
    
    if (!name) {
        showIosAlert('提示', '请输入角色姓名');
        return;
    }
    
    if (!remark) {
        showIosAlert('提示', '请输入备注名称');
        return;
    }
    
    const character = {
        id: Date.now().toString(),
        name: name,
        remark: remark,
        description: description,
        avatar: avatar,
        lastMessage: '暂无消息',
        lastMessageTime: new Date().toISOString(),
        createTime: new Date().toISOString()
    };
    
    chatCharacters.push(character);
    saveChatCharacters();
    renderChatList();
    closeAddChatCharacter();
    showIosAlert('成功', '聊天角色已创建');
}

// 保存聊天角色到localStorage
function saveChatCharacters() {
    try {
        localStorage.setItem('chatCharacters', JSON.stringify(chatCharacters));
    } catch (e) {
        console.error('保存聊天角色失败:', e);
    }
}

// 从localStorage加载聊天角色
function loadChatCharacters() {
    try {
        const data = localStorage.getItem('chatCharacters');
        if (data) {
            chatCharacters = JSON.parse(data);
        } else {
            chatCharacters = [];
        }
    } catch (e) {
        console.error('加载聊天角色失败:', e);
        chatCharacters = [];
    }
}

// 渲染聊天列表
function renderChatList() {
    const container = document.getElementById('chatListContainer');
    
    if (chatCharacters.length === 0) {
        container.innerHTML = `
            <div class="chat-empty-state">
                <div class="chat-empty-text">暂无聊天记录</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    chatCharacters.forEach(char => {
        const avatarHtml = char.avatar 
            ? `<img src="${char.avatar}" alt="${char.remark}">`
            : '<span style="font-size: 12px; color: #666;">头像</span>';
        
        // 格式化时间
        const timeStr = formatChatTime(char.lastMessageTime);
        
        html += `
            <div class="chat-list-item" onclick="openChatDetail('${char.id}')">
                <div class="chat-list-avatar">${avatarHtml}</div>
                <div class="chat-list-info">
                    <div class="chat-list-name">${escapeHtml(char.remark)}</div>
                    <div class="chat-list-message">${escapeHtml(char.lastMessage)}</div>
                </div>
                <div class="chat-list-time">${timeStr}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 格式化聊天时间
function formatChatTime(timeStr) {
    const time = new Date(timeStr);
    const now = new Date();
    const diff = now - time;
    
    // 今天
    if (diff < 24 * 60 * 60 * 1000) {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (time >= today) {
            return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
    }
    
    // 昨天
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (time >= yesterday) {
        return '昨天';
    }
    
    // 一周内
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[time.getDay()];
    }
    
    // 更早
    return `${time.getMonth() + 1}月${time.getDate()}日`;
}

// ========== 聊天详情界面 ==========

let currentChatCharacter = null;

// 打开聊天详情
function openChatDetail(characterId) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;
    
    currentChatCharacter = character;
    
    // 设置备注名称
    document.getElementById('chatDetailName').textContent = character.remark;
    
    // 显示聊天界面
    document.getElementById('chatDetailPage').style.display = 'block';
}

// 关闭聊天详情
function closeChatDetail() {
    document.getElementById('chatDetailPage').style.display = 'none';
    currentChatCharacter = null;
}

// 显示角色信息
function showChatCharacterInfo() {
    if (!currentChatCharacter) return;
    
    showIosAlert(
        '角色信息',
        `真名：${currentChatCharacter.name}\n备注：${currentChatCharacter.remark}\n\n描述：${currentChatCharacter.description}`
    );
}

// ========== 聊天设置界面 ==========

// 打开聊天设置
function openChatSettings() {
    if (!currentChatCharacter) return;
    
    // 加载角色信息
    const charAvatarImg = document.getElementById('charAvatarImage');
    const charAvatarPlaceholder = document.getElementById('charAvatarPlaceholder');
    
    if (currentChatCharacter.avatar) {
        charAvatarImg.src = currentChatCharacter.avatar;
        charAvatarImg.style.display = 'block';
        charAvatarPlaceholder.style.display = 'none';
    } else {
        charAvatarImg.style.display = 'none';
        charAvatarPlaceholder.style.display = 'block';
    }
    
    document.getElementById('charNameInput').value = currentChatCharacter.name || '';
    document.getElementById('charRemarkInput').value = currentChatCharacter.remark || '';
    document.getElementById('charDescInput').value = currentChatCharacter.description || '';
    
    // 加载用户信息
    const savedUserData = localStorage.getItem('chatUserData');
    let userData = {
        avatar: '',
        name: '',
        description: ''
    };
    
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
    }
    
    const userAvatarImg = document.getElementById('userAvatarImage');
    const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
    
    if (userData.avatar) {
        userAvatarImg.src = userData.avatar;
        userAvatarImg.style.display = 'block';
        userAvatarPlaceholder.style.display = 'none';
    } else {
        userAvatarImg.style.display = 'none';
        userAvatarPlaceholder.style.display = 'block';
    }
    
    document.getElementById('userNameInput').value = userData.name || '';
    document.getElementById('userDescInput').value = userData.description || '';
    
    // 显示设置界面
    document.getElementById('chatSettingsPage').style.display = 'block';
}

// 关闭聊天设置界面
function closeChatSettingsPage() {
    document.getElementById('chatSettingsPage').style.display = 'none';
}

// 处理角色头像上传
function handleCharAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const charAvatarImg = document.getElementById('charAvatarImage');
            const charAvatarPlaceholder = document.getElementById('charAvatarPlaceholder');
            
            charAvatarImg.src = e.target.result;
            charAvatarImg.style.display = 'block';
            charAvatarPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// 显示角色头像URL输入
function showCharAvatarUrlInput() {
    iosPrompt('输入头像URL', '', function(url) {
        if (url && url.trim()) {
            loadCharAvatarFromUrl(url.trim());
        }
    });
}

// 从URL加载角色头像
function loadCharAvatarFromUrl(url) {
    const charAvatarImg = document.getElementById('charAvatarImage');
    const charAvatarPlaceholder = document.getElementById('charAvatarPlaceholder');
    
    charAvatarImg.src = url;
    charAvatarImg.style.display = 'block';
    charAvatarPlaceholder.style.display = 'none';
    
    charAvatarImg.onerror = function() {
        showIosAlert('错误', '头像加载失败，请检查URL是否正确');
        charAvatarImg.style.display = 'none';
        charAvatarPlaceholder.style.display = 'block';
    };
}

// 处理用户头像上传
function handleUserAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const userAvatarImg = document.getElementById('userAvatarImage');
            const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
            
            userAvatarImg.src = e.target.result;
            userAvatarImg.style.display = 'block';
            userAvatarPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// 显示用户头像URL输入
function showUserAvatarUrlInput() {
    iosPrompt('输入头像URL', '', function(url) {
        if (url && url.trim()) {
            loadUserAvatarFromUrl(url.trim());
        }
    });
}

// 从URL加载用户头像
function loadUserAvatarFromUrl(url) {
    const userAvatarImg = document.getElementById('userAvatarImage');
    const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
    
    userAvatarImg.src = url;
    userAvatarImg.style.display = 'block';
    userAvatarPlaceholder.style.display = 'none';
    
    userAvatarImg.onerror = function() {
        showIosAlert('错误', '头像加载失败，请检查URL是否正确');
        userAvatarImg.style.display = 'none';
        userAvatarPlaceholder.style.display = 'block';
    };
}

// 保存聊天设置
function saveChatSettings() {
    if (!currentChatCharacter) return;
    
    // 获取角色信息
    const charAvatar = document.getElementById('charAvatarImage').style.display === 'block' 
        ? document.getElementById('charAvatarImage').src 
        : '';
    const charName = document.getElementById('charNameInput').value.trim();
    const charRemark = document.getElementById('charRemarkInput').value.trim();
    const charDesc = document.getElementById('charDescInput').value.trim();
    
    // 获取用户信息
    const userAvatar = document.getElementById('userAvatarImage').style.display === 'block'
        ? document.getElementById('userAvatarImage').src
        : '';
    const userName = document.getElementById('userNameInput').value.trim();
    const userDesc = document.getElementById('userDescInput').value.trim();
    
    // 更新角色信息
    currentChatCharacter.avatar = charAvatar;
    currentChatCharacter.name = charName || currentChatCharacter.name;
    currentChatCharacter.remark = charRemark || currentChatCharacter.remark;
    currentChatCharacter.description = charDesc || currentChatCharacter.description;
    
    // 保存到chatCharacters数组
    const index = chatCharacters.findIndex(c => c.id === currentChatCharacter.id);
    if (index !== -1) {
        chatCharacters[index] = currentChatCharacter;
        saveChatCharacters();
        renderChatList();
    }
    
    // 更新聊天详情界面显示
    document.getElementById('chatDetailName').textContent = currentChatCharacter.remark;
    
    // 保存用户信息到localStorage
    const userData = {
        avatar: userAvatar,
        name: userName,
        description: userDesc
    };
    localStorage.setItem('chatUserData', JSON.stringify(userData));
    
    // 关闭设置界面
    closeChatSettingsPage();
    
    showIosAlert('成功', '设置已保存');
}

// CHAR头像库（占位）
function showCharAvatarLibrary() {
    showIosAlert('提示', '头像库功能开发中');
}

// CHAR头像框（占位）
function showCharAvatarFrame() {
    showIosAlert('提示', '头像框功能开发中');
}

// USER头像库（占位）
function showUserAvatarLibrary() {
    showIosAlert('提示', '头像库功能开发中');
}

// USER头像框（占位）
function showUserAvatarFrame() {
    showIosAlert('提示', '头像框功能开发中');
}

// 切换语音输入
function toggleVoiceInput() {
    showIosAlert('提示', '语音功能开发中');
}

// 显示表情选择器
function showEmojiPicker() {
    showIosAlert('提示', '表情功能开发中');
}

// 显示更多选项
function showMoreOptions() {
    showIosAlert('提示', '更多功能开发中');
}

// 发送消息
function sendMessage() {
    const input = document.getElementById('chatInputField');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    // TODO: 实现消息发送逻辑
    showIosAlert('提示', '消息发送功能开发中\n\n您的消息：' + message);
    
    // 清空输入框
    input.value = '';
}

// 打开聊天个人资料设置
function openChatProfileSettings() {
    alert('个人资料设置功能待开发');
}

// ========== 我的页面功能选项 ==========

// 人设数据存储
let personas = [];
let currentEditingPersonaId = null;
let isPersonaEditMode = false;
let selectedPersonaIds = new Set();

// 追踪表单是否被修改
let personaFormChanged = false;
let personaOriginalData = {};

// 打开人设管理
function openPersonaSettings() {
    document.getElementById('personaManagement').classList.add('active');
    loadPersonas();
    isPersonaEditMode = false;
    selectedPersonaIds.clear();
    renderPersonaList();
}

// 关闭人设管理
function closePersonaManagement() {
    document.getElementById('personaManagement').classList.remove('active');
    // 退出编辑模式
    if (isPersonaEditMode) {
        togglePersonaEditMode();
    }
}

// 切换编辑模式
function togglePersonaEditMode() {
    isPersonaEditMode = !isPersonaEditMode;
    selectedPersonaIds.clear();
    
    const deleteBtn = document.getElementById('deletePersonaBtn');
    const bottomBar = document.getElementById('personaBottomBar');
    
    if (isPersonaEditMode) {
        deleteBtn.textContent = '取消';
        bottomBar.style.display = 'flex';
    } else {
        deleteBtn.textContent = '删除';
        bottomBar.style.display = 'none';
    }
    
    renderPersonaList();
    updateSelectedCount();
}

// 切换人设选中状态
function togglePersonaSelection(personaId, event) {
    event.stopPropagation();
    
    if (selectedPersonaIds.has(personaId)) {
        selectedPersonaIds.delete(personaId);
    } else {
        selectedPersonaIds.add(personaId);
    }
    
    renderPersonaList();
    updateSelectedCount();
}

// 全选/取消全选
function selectAllPersonas() {
    if (selectedPersonaIds.size === personas.length) {
        // 全部取消选中
        selectedPersonaIds.clear();
    } else {
        // 全部选中
        selectedPersonaIds.clear();
        personas.forEach(p => selectedPersonaIds.add(p.id));
    }
    
    renderPersonaList();
    updateSelectedCount();
}

// 更新选中数量显示
function updateSelectedCount() {
    const countElement = document.getElementById('selectedPersonaCount');
    if (countElement) {
        countElement.textContent = selectedPersonaIds.size;
    }
}

// 删除选中的人设
async function deleteSelectedPersonas() {
    if (selectedPersonaIds.size === 0) {
        showIosAlert('提示', '请选择要删除的人设');
        return;
    }
    
    const confirmed = await iosConfirm(
        `确定要删除选中的 ${selectedPersonaIds.size} 个人设吗？\n删除后无法恢复。`,
        '确认删除'
    );
    
    if (confirmed) {
        personas = personas.filter(p => !selectedPersonaIds.has(p.id));
        savePersonas();
        selectedPersonaIds.clear();
        renderPersonaList();
        updateSelectedCount();
        showIosAlert('成功', '已删除选中的人设');
    }
}

// 打开添加人设选择对话框
async function openAddPersona() {
    // 显示iOS风格选择对话框
    const choice = await showPersonaCreationChoice();
    
    if (choice === 'manual') {
        // 手动创建
        openManualCreatePersona();
    } else if (choice === 'import') {
        // SillyTavern导入
        openSillyTavernImport();
    }
}

// 显示人设创建方式选择对话框
function showPersonaCreationChoice() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay show';
        overlay.style.zIndex = '10002';
        
        overlay.innerHTML = `
            <div class="ios-dialog">
                <div class="ios-dialog-title">选择创建方式</div>
                <div class="ios-dialog-message">请选择如何添加人设</div>
                <div class="ios-dialog-buttons vertical">
                    <button class="ios-dialog-button" data-action="manual">手动创建</button>
                    <button class="ios-dialog-button" data-action="import">SillyTavern 导入</button>
                    <button class="ios-dialog-button" data-action="cancel">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.querySelectorAll('.ios-dialog-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                document.body.removeChild(overlay);
                resolve(action);
            });
        });
    });
}

// 手动创建人设
function openManualCreatePersona() {
    currentEditingPersonaId = null;
    document.getElementById('addPersonaTitle').textContent = '添加人设';
    document.getElementById('personaNameInput').value = '';
    document.getElementById('personaDescInput').value = '';
    document.getElementById('personaAvatarUrl').value = '';
    document.getElementById('personaUrlInputSection').style.display = 'none';
    
    // 重置头像预览
    document.getElementById('personaAvatarImage').style.display = 'none';
    document.getElementById('personaAvatarPlaceholder').style.display = 'block';
    
    // 重置ID卡展示开关
    document.getElementById('personaAsIdCardToggle').checked = false;
    
    // 重置表单修改状态
    personaFormChanged = false;
    personaOriginalData = {
        name: '',
        description: '',
        avatar: '',
        isIdCard: false
    };
    
    // 添加输入监听
    setupPersonaFormListeners();
    
    document.getElementById('addPersonaPage').classList.add('active');
}

// 关闭添加人设界面
async function closeAddPersona() {
    // 检查是否有未保存的修改
    if (personaFormChanged) {
        const confirmed = await iosConfirm(
            '您有未保存的修改，确定要退出吗？',
            '确认退出'
        );
        
        if (!confirmed) {
            return; // 用户选择不退出
        }
    }
    
    document.getElementById('addPersonaPage').classList.remove('active');
    personaFormChanged = false;
}

// 设置表单输入监听
function setupPersonaFormListeners() {
    const nameInput = document.getElementById('personaNameInput');
    const descInput = document.getElementById('personaDescInput');
    
    // 移除旧的监听器（如果有）
    nameInput.removeEventListener('input', markPersonaFormChanged);
    descInput.removeEventListener('input', markPersonaFormChanged);
    
    // 添加新的监听器
    nameInput.addEventListener('input', markPersonaFormChanged);
    descInput.addEventListener('input', markPersonaFormChanged);
}

// 标记表单已修改
function markPersonaFormChanged() {
    const currentName = document.getElementById('personaNameInput').value.trim();
    const currentDesc = document.getElementById('personaDescInput').value.trim();
    const currentAvatar = document.getElementById('personaAvatarImage').style.display !== 'none' 
        ? document.getElementById('personaAvatarImage').src 
        : '';
    const currentIsIdCard = document.getElementById('personaAsIdCardToggle').checked;
    
    // 检查是否有任何字段被修改
    if (currentName !== personaOriginalData.name ||
        currentDesc !== personaOriginalData.description ||
        currentAvatar !== personaOriginalData.avatar ||
        currentIsIdCard !== personaOriginalData.isIdCard) {
        personaFormChanged = true;
    } else {
        personaFormChanged = false;
    }
}

// 显示URL输入框
function showPersonaUrlInput() {
    const section = document.getElementById('personaUrlInputSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

// 处理本地头像上传
function handlePersonaAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showIosAlert('错误', '图片大小不能超过5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('personaAvatarImage');
            img.src = e.target.result;
            img.style.display = 'block';
            document.getElementById('personaAvatarPlaceholder').style.display = 'none';
            markPersonaFormChanged(); // 标记表单已修改
        };
        reader.readAsDataURL(file);
    }
}

// 从URL加载头像
function loadPersonaAvatarFromUrl() {
    const url = document.getElementById('personaAvatarUrl').value.trim();
    if (!url) {
        showIosAlert('提示', '请输入图片URL地址');
        return;
    }
    
    const img = document.getElementById('personaAvatarImage');
    img.onload = function() {
        img.style.display = 'block';
        document.getElementById('personaAvatarPlaceholder').style.display = 'none';
        markPersonaFormChanged(); // 标记表单已修改
        showIosAlert('成功', '图片加载成功');
    };
    img.onerror = function() {
        showIosAlert('错误', '图片加载失败，请检查URL是否正确');
    };
    img.src = url;
}

// 保存人设
async function savePersona() {
    const name = document.getElementById('personaNameInput').value.trim();
    const description = document.getElementById('personaDescInput').value.trim();
    const avatarImg = document.getElementById('personaAvatarImage');
    const avatar = avatarImg.style.display !== 'none' ? avatarImg.src : '';
    const isIdCard = document.getElementById('personaAsIdCardToggle').checked;
    
    if (!name) {
        showIosAlert('提示', '请输入人设名称');
        return;
    }
    
    if (!description) {
        showIosAlert('提示', '请输入人设描述');
        return;
    }
    
    // 如果设置为ID卡角色，需要取消其他人设的ID卡状态
    if (isIdCard) {
        personas.forEach(p => {
            if (p.id !== currentEditingPersonaId) {
                p.isIdCard = false;
            }
        });
    }
    
    const persona = {
        id: currentEditingPersonaId || Date.now().toString(),
        name: name,
        description: description,
        avatar: avatar,
        isIdCard: isIdCard,
        createTime: currentEditingPersonaId ? personas.find(p => p.id === currentEditingPersonaId).createTime : new Date().toISOString(),
        updateTime: new Date().toISOString()
    };
    
    if (currentEditingPersonaId) {
        // 编辑模式
        const index = personas.findIndex(p => p.id === currentEditingPersonaId);
        if (index !== -1) {
            personas[index] = persona;
        }
    } else {
        // 新增模式
        personas.push(persona);
    }
    
    savePersonas();
    renderPersonaList();
    
    // 如果设置为ID卡角色，应用到ID卡
    if (isIdCard) {
        await applyPersonaToIdCard(persona);
    }
    
    // 保存成功后重置表单修改状态
    personaFormChanged = false;
    
    // 关闭编辑界面（不会触发未保存提示）
    document.getElementById('addPersonaPage').classList.remove('active');
    
    showIosAlert('成功', currentEditingPersonaId ? '人设已更新' : '人设已保存');
}

// 保存人设到localStorage
function savePersonas() {
    try {
        localStorage.setItem('personas', JSON.stringify(personas));
    } catch (e) {
        console.error('保存人设失败:', e);
        showIosAlert('错误', '保存失败，可能是存储空间不足');
    }
}

// 从localStorage加载人设
function loadPersonas() {
    try {
        const data = localStorage.getItem('personas');
        if (data) {
            personas = JSON.parse(data);
        } else {
            personas = [];
        }
    } catch (e) {
        console.error('加载人设失败:', e);
        personas = [];
    }
}

// 渲染人设列表
function renderPersonaList() {
    const listContainer = document.getElementById('personaList');
    
    if (personas.length === 0) {
        listContainer.innerHTML = `
            <div class="persona-empty">
                <div style="color: #999; font-size: 14px;">暂无人设</div>
                <div style="color: #ccc; font-size: 12px; margin-top: 5px;">点击右上角 + 添加人设</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    personas.forEach(persona => {
        const avatarHtml = persona.avatar 
            ? `<img src="${persona.avatar}" alt="${persona.name}">`
            : '<span style="font-size: 12px; color: #666;">无头像</span>';
        
        const isSelected = selectedPersonaIds.has(persona.id);
        const editModeClass = isPersonaEditMode ? 'edit-mode' : '';
        const clickHandler = isPersonaEditMode 
            ? `onclick="togglePersonaSelection('${persona.id}', event)"`
            : `onclick="viewPersonaDetail('${persona.id}')"`;
        const idCardBadge = persona.isIdCard ? '<span style="display: inline-block; margin-left: 6px; padding: 2px 8px; background: #007bff; color: white; font-size: 10px; border-radius: 10px; font-weight: 500;">ID卡</span>' : '';
        
        html += `
            <div class="persona-item ${editModeClass}" ${clickHandler}>
                ${isPersonaEditMode ? `
                    <div class="persona-checkbox ${isSelected ? 'checked' : ''}" onclick="togglePersonaSelection('${persona.id}', event)"></div>
                ` : ''}
                <div class="persona-item-avatar">${avatarHtml}</div>
                <div class="persona-item-info">
                    <div class="persona-item-name">${escapeHtml(persona.name)}${idCardBadge}</div>
                    <div class="persona-item-desc">${escapeHtml(persona.description.substring(0, 30))}${persona.description.length > 30 ? '...' : ''}</div>
                </div>
                ${!isPersonaEditMode ? '<div class="persona-item-arrow">›</div>' : ''}
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
}

// 查看/编辑人设详情
function viewPersonaDetail(personaId) {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;
    
    // 设置为编辑模式
    currentEditingPersonaId = personaId;
    document.getElementById('addPersonaTitle').textContent = '编辑人设';
    
    // 填充表单数据
    document.getElementById('personaNameInput').value = persona.name;
    document.getElementById('personaDescInput').value = persona.description;
    document.getElementById('personaAvatarUrl').value = '';
    document.getElementById('personaUrlInputSection').style.display = 'none';
    
    // 设置头像
    const img = document.getElementById('personaAvatarImage');
    if (persona.avatar) {
        img.src = persona.avatar;
        img.style.display = 'block';
        document.getElementById('personaAvatarPlaceholder').style.display = 'none';
    } else {
        img.style.display = 'none';
        document.getElementById('personaAvatarPlaceholder').style.display = 'block';
    }
    
    // 设置ID卡展示开关
    document.getElementById('personaAsIdCardToggle').checked = persona.isIdCard || false;
    
    // 保存原始数据用于对比
    personaOriginalData = {
        name: persona.name,
        description: persona.description,
        avatar: persona.avatar || '',
        isIdCard: persona.isIdCard || false
    };
    
    // 重置表单修改状态
    personaFormChanged = false;
    
    // 添加输入监听
    setupPersonaFormListeners();
    
    // 打开编辑界面
    document.getElementById('addPersonaPage').classList.add('active');
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 应用人设到ID卡（聊天APP的"我的"界面的身份卡）
async function applyPersonaToIdCard(persona) {
    try {
        // 应用姓名到身份卡
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = persona.name;
            // 保存到localStorage
            localStorage.setItem('chatProfileName', persona.name);
        }
        
        // 应用头像到身份卡
        if (persona.avatar) {
            const profileAvatarImage = document.getElementById('profileAvatarImage');
            const profileAvatarPlaceholder = document.getElementById('profileAvatarPlaceholder');
            
            if (profileAvatarImage && profileAvatarPlaceholder) {
                profileAvatarImage.src = persona.avatar;
                profileAvatarImage.style.display = 'block';
                profileAvatarPlaceholder.style.display = 'none';
                // 保存到localStorage
                localStorage.setItem('chatProfileAvatar', persona.avatar);
            }
        }
        
        console.log('人设已应用到聊天APP身份卡:', persona.name);
    } catch (error) {
        console.error('应用人设到ID卡失败:', error);
    }
}

// 加载ID卡人设
async function loadIdCardPersona() {
    try {
        // 查找设置为ID卡的人设
        const idCardPersona = personas.find(p => p.isIdCard === true);
        if (idCardPersona) {
            await applyPersonaToIdCard(idCardPersona);
            console.log('已加载ID卡人设:', idCardPersona.name);
        }
    } catch (error) {
        console.error('加载ID卡人设失败:', error);
    }
}

// ========== SillyTavern 导入功能 ==========

let parsedSillyTavernData = null;
let selectedImportPersonas = new Set();

// 打开 SillyTavern 导入界面
function openSillyTavernImport() {
    parsedSillyTavernData = null;
    selectedImportPersonas.clear();
    document.getElementById('sillyTavernFileInfo').style.display = 'none';
    document.getElementById('sillyTavernFileInput').value = '';
    document.getElementById('sillyTavernImportPage').classList.add('active');
}

// 关闭 SillyTavern 导入界面
function closeSillyTavernImport() {
    document.getElementById('sillyTavernImportPage').classList.remove('active');
}

// 处理文件上传
function handleSillyTavernFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            parsedSillyTavernData = parseSillyTavernJSON(data);
            
            if (parsedSillyTavernData.length === 0) {
                showIosAlert('错误', '未找到有效的人设数据');
                return;
            }
            
            // 显示文件信息
            document.getElementById('sillyTavernFileName').textContent = file.name;
            document.getElementById('sillyTavernPersonaCount').textContent = parsedSillyTavernData.length;
            document.getElementById('sillyTavernFileInfo').style.display = 'block';
            
        } catch (error) {
            console.error('解析文件失败:', error);
            showIosAlert('错误', '文件格式不正确，请选择有效的 SillyTavern personas.json 文件');
        }
    };
    reader.readAsText(file);
}

// 解析 SillyTavern JSON 格式
function parseSillyTavernJSON(data) {
    const personas = [];
    
    if (!data.personas || !data.persona_descriptions) {
        return personas;
    }
    
    // 遍历所有人设
    for (const [avatarFile, name] of Object.entries(data.personas)) {
        const description = data.persona_descriptions[avatarFile];
        
        if (description && description.description) {
            personas.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: name,
                description: description.description.trim(),
                avatar: '', // SillyTavern 不包含Base64头像，默认为空
                avatarFile: avatarFile, // 保存原始文件名供参考
                isIdCard: false
            });
        }
    }
    
    return personas;
}

// 显示人设选择对话框
function showPersonaSelectionDialog() {
    if (!parsedSillyTavernData || parsedSillyTavernData.length === 0) {
        showIosAlert('提示', '没有可导入的人设');
        return;
    }
    
    selectedImportPersonas.clear();
    renderImportPersonaList();
    document.getElementById('personaSelectionDialog').style.display = 'block';
    document.getElementById('personaSelectionDialog').classList.add('active');
}

// 关闭人设选择对话框
function closePersonaSelection() {
    document.getElementById('personaSelectionDialog').classList.remove('active');
    setTimeout(() => {
        document.getElementById('personaSelectionDialog').style.display = 'none';
    }, 300);
}

// 渲染导入人设列表
function renderImportPersonaList() {
    const listContainer = document.getElementById('importPersonaList');
    
    if (!parsedSillyTavernData || parsedSillyTavernData.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 40px;">没有可导入的人设</div>';
        return;
    }
    
    let html = '';
    parsedSillyTavernData.forEach(persona => {
        const isSelected = selectedImportPersonas.has(persona.id);
        const selectedClass = isSelected ? 'selected' : '';
        
        html += `
            <div class="import-persona-item ${selectedClass}" onclick="toggleImportPersonaSelection('${persona.id}')">
                <div class="import-checkbox"></div>
                <div class="import-persona-info">
                    <div class="import-persona-name">${escapeHtml(persona.name)}</div>
                    <div class="import-persona-desc">${escapeHtml(persona.description.substring(0, 100))}${persona.description.length > 100 ? '...' : ''}</div>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
    updateImportCount();
}

// 切换人设选择状态
function toggleImportPersonaSelection(personaId) {
    if (selectedImportPersonas.has(personaId)) {
        selectedImportPersonas.delete(personaId);
    } else {
        selectedImportPersonas.add(personaId);
    }
    renderImportPersonaList();
}

// 全选
function selectAllImportPersonas() {
    if (selectedImportPersonas.size === parsedSillyTavernData.length) {
        // 取消全选
        selectedImportPersonas.clear();
    } else {
        // 全选
        selectedImportPersonas.clear();
        parsedSillyTavernData.forEach(p => selectedImportPersonas.add(p.id));
    }
    renderImportPersonaList();
}

// 更新选中数量
function updateImportCount() {
    const countElement = document.getElementById('selectedImportCount');
    if (countElement) {
        countElement.textContent = selectedImportPersonas.size;
    }
}

// 导入选中的人设
async function importSelectedPersonas() {
    if (selectedImportPersonas.size === 0) {
        showIosAlert('提示', '请选择要导入的人设');
        return;
    }
    
    const selectedPersonas = parsedSillyTavernData.filter(p => selectedImportPersonas.has(p.id));
    
    // 添加到人设库
    personas.push(...selectedPersonas);
    savePersonas();
    renderPersonaList();
    
    // 关闭对话框
    closePersonaSelection();
    closeSillyTavernImport();
    
    // 显示成功提示
    showIosAlert('成功', `已成功导入 ${selectedPersonas.length} 个人设！`);
}

// 打开美化设置
function openBeautifySettings() {
    showIosAlert('提示', '美化功能开发中，敬请期待！');
}

// 打开通用设置
function openGeneralSettings() {
    showIosAlert('提示', '设置功能开发中，敬请期待！');
}

// 加载聊天头像
async function loadChatAvatar() {
    // 不再加载第一个小组件的头像，保持默认灰色占位符
    console.log('聊天头像使用默认占位符');
}

// ========== 自定义确认对话框 ==========

// 显示自定义确认对话框
// showCustomConfirm 现在使用iOS风格弹窗
function showCustomConfirm(title, message) {
    return iosConfirm(message, title);
}

// ========== 世界书功能 ==========

// 世界书列表
let worldBooks = [];

// 世界书分组列表
let worldBookGroups = ['默认'];

// 追踪表单是否被修改
let worldBookFormChanged = false;
let worldBookOriginalData = {};

// 初始化世界书
async function initWorldBooks() {
    try {
        const savedWorldBooks = await storageDB.getItem('worldBooks');
        if (savedWorldBooks) {
            worldBooks = JSON.parse(savedWorldBooks);
            // 为旧数据添加默认分组
            worldBooks.forEach(book => {
                if (!book.group) {
                    book.group = '默认';
                }
            });
            console.log('世界书已加载:', worldBooks.length, '个条目');
        } else {
            worldBooks = [];
        }

        // 加载分组数据
        const savedGroups = await storageDB.getItem('worldBookGroups');
        if (savedGroups) {
            worldBookGroups = JSON.parse(savedGroups);
            // 确保有默认分组
            if (!worldBookGroups.includes('默认')) {
                worldBookGroups.unshift('默认');
            }
        } else {
            worldBookGroups = ['默认'];
        }
    } catch (error) {
        console.error('加载世界书失败，使用空列表:', error);
        worldBooks = [];
        worldBookGroups = ['默认'];
        // 清除损坏的数据
        await storageDB.removeItem('worldBooks');
        await storageDB.removeItem('worldBookGroups');
    }
}

// 打开世界书页面
function openWorldBook() {
    const worldBookPage = document.getElementById('worldBookPage');
    if (worldBookPage) {
        worldBookPage.style.display = 'flex';
        displayWorldBooks();
    }
}

// 关闭世界书页面
function closeWorldBook() {
    const worldBookPage = document.getElementById('worldBookPage');
    if (worldBookPage) {
        worldBookPage.style.display = 'none';
    }
}

// 添加世界书条目
function addWorldBookItem() {
    openWorldBookEdit();
}

// 打开世界书编辑弹窗
function openWorldBookEdit(bookId = null) {
    const modal = document.getElementById('worldBookEditModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 更新分组下拉框选项
        updateGroupSelect();
        
        // 重置修改标记
        worldBookFormChanged = false;
        
        if (bookId !== null) {
            // 编辑模式 - 加载现有世界书数据
            const book = worldBooks.find(b => b.id === bookId);
            if (book) {
                document.getElementById('worldBookName').value = book.name;
                document.getElementById('worldBookContentInput').value = book.content;
                document.getElementById('worldBookGlobal').checked = book.isGlobal;
                document.getElementById('worldBookPosition').value = book.position;
                document.getElementById('worldBookGroup').value = book.group || '默认';
                document.getElementById('worldBookEditModal').dataset.editId = bookId;
                
                // 保存原始数据
                worldBookOriginalData = {
                    name: book.name,
                    content: book.content,
                    isGlobal: book.isGlobal,
                    position: book.position,
                    group: book.group || '默认'
                };
            }
        } else {
            // 新建模式 - 清空表单
            document.getElementById('worldBookName').value = '';
            document.getElementById('worldBookContentInput').value = '';
            document.getElementById('worldBookGlobal').checked = false;
            document.getElementById('worldBookPosition').value = 'middle';
            document.getElementById('worldBookGroup').value = '默认';
            delete document.getElementById('worldBookEditModal').dataset.editId;
            
            // 保存原始数据(空)
            worldBookOriginalData = {
                name: '',
                content: '',
                isGlobal: false,
                position: 'middle',
                group: '默认'
            };
        }
        
        // 添加输入监听
        setupWorldBookFormListeners();
    }
}

// 设置表单输入监听
function setupWorldBookFormListeners() {
    const nameInput = document.getElementById('worldBookName');
    const contentInput = document.getElementById('worldBookContentInput');
    const globalCheckbox = document.getElementById('worldBookGlobal');
    const positionSelect = document.getElementById('worldBookPosition');
    const groupSelect = document.getElementById('worldBookGroup');
    
    // 移除旧的监听器
    nameInput.removeEventListener('input', markWorldBookFormChanged);
    contentInput.removeEventListener('input', markWorldBookFormChanged);
    globalCheckbox.removeEventListener('change', markWorldBookFormChanged);
    positionSelect.removeEventListener('change', markWorldBookFormChanged);
    groupSelect.removeEventListener('change', markWorldBookFormChanged);
    
    // 添加新的监听器
    nameInput.addEventListener('input', markWorldBookFormChanged);
    contentInput.addEventListener('input', markWorldBookFormChanged);
    globalCheckbox.addEventListener('change', markWorldBookFormChanged);
    positionSelect.addEventListener('change', markWorldBookFormChanged);
    groupSelect.addEventListener('change', markWorldBookFormChanged);
}

// 标记表单已修改
function markWorldBookFormChanged() {
    const currentData = {
        name: document.getElementById('worldBookName').value,
        content: document.getElementById('worldBookContentInput').value,
        isGlobal: document.getElementById('worldBookGlobal').checked,
        position: document.getElementById('worldBookPosition').value,
        group: document.getElementById('worldBookGroup').value
    };
    
    // 检查是否与原始数据不同
    worldBookFormChanged = 
        currentData.name !== worldBookOriginalData.name ||
        currentData.content !== worldBookOriginalData.content ||
        currentData.isGlobal !== worldBookOriginalData.isGlobal ||
        currentData.position !== worldBookOriginalData.position ||
        currentData.group !== worldBookOriginalData.group;
}

// 关闭世界书编辑弹窗
async function closeWorldBookEdit() {
    // 检查是否有未保存的更改
    if (worldBookFormChanged) {
        const userConfirmed = await showCustomConfirm(
            '提示',
            '你还没有保存哦，是否确定要离开？\n\n点击"确定"放弃修改并返回\n点击"取消"继续编辑'
        );
        
        if (!userConfirmed) {
            // 用户选择取消，继续编辑
            return;
        }
    }
    
    // 关闭弹窗
    const modal = document.getElementById('worldBookEditModal');
    if (modal) {
        modal.style.display = 'none';
        // 重置修改标记
        worldBookFormChanged = false;
        worldBookOriginalData = {};
    }
}

// 保存世界书
async function saveWorldBook() {
    const name = document.getElementById('worldBookName').value.trim();
    const content = document.getElementById('worldBookContentInput').value.trim();
    const isGlobal = document.getElementById('worldBookGlobal').checked;
    const position = document.getElementById('worldBookPosition').value;
    const group = document.getElementById('worldBookGroup').value;
    
    // 验证
    if (!name) {
        alert('请输入世界书名字！');
        return;
    }
    
    if (!content) {
        alert('请输入世界书内容！');
        return;
    }
    
    const modal = document.getElementById('worldBookEditModal');
    const editId = modal.dataset.editId;
    
    if (editId) {
        // 编辑现有世界书
        const index = worldBooks.findIndex(b => b.id === parseInt(editId));
        if (index !== -1) {
            worldBooks[index] = {
                ...worldBooks[index],
                name,
                content,
                isGlobal,
                position,
                group,
                updatedAt: Date.now()
            };
        }
    } else {
        // 创建新世界书
        const newBook = {
            id: Date.now(),
            name,
            content,
            isGlobal,
            position,
            group,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        worldBooks.push(newBook);
    }
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 重置修改标记(保存成功后不需要提示)
        worldBookFormChanged = false;
        
        // 显示成功提示
        alert('世界书保存成功！');
        
        // 关闭弹窗并刷新列表
        closeWorldBookEdit();
        displayWorldBooks();
        
        console.log('世界书已保存，当前共有', worldBooks.length, '个条目');
    } catch (error) {
        console.error('保存世界书失败:', error);
        alert('保存失败，请重试！');
    }
}

// 显示世界书列表
function displayWorldBooks() {
    const container = document.getElementById('worldBookContent');
    console.log('displayWorldBooks 被调用, 容器:', container, '世界书数量:', worldBooks.length);
    
    if (!container) {
        console.error('找不到世界书容器元素!');
        return;
    }
    
    if (worldBooks.length === 0) {
        container.innerHTML = `
            <div class="world-book-empty">
                <div class="world-book-empty-text">暂无内容</div>
            </div>
        `;
        return;
    }
    
    // 获取当前选中的分组筛选
    const filterSelect = document.getElementById('worldBookGroupFilter');
    const selectedGroup = filterSelect ? filterSelect.value : 'all';
    
    let html = '<div style="padding: 15px;">';
    let hasContent = false;
    
    // 按分组显示世界书
    worldBookGroups.forEach(group => {
        // 如果选择了特定分组，只显示该分组
        if (selectedGroup !== 'all' && selectedGroup !== group) {
            return;
        }
        
        const booksInGroup = worldBooks.filter(book => (book.group || '默认') === group);
        
        if (booksInGroup.length > 0) {
            hasContent = true;
            
            // 分组标题
            html += `
                <div style="font-size: 14px; font-weight: 600; color: #666; padding: 10px 5px; margin-top: 10px; border-bottom: 2px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between;">
                    <span>${group}</span>
                    <span style="font-size: 12px; color: #999; font-weight: normal;">${booksInGroup.length} 个</span>
                </div>
            `;
            
            // 分组内的世界书
            booksInGroup.forEach(book => {
                const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">全局</span>' : '';
                const positionText = book.position === 'before' ? '前' : book.position === 'middle' ? '中' : '后';
                
                html += `
                    <div style="background: white; border: 1px solid #e5e5e5; border-radius: 12px; padding: 15px; margin-bottom: 12px; margin-top: 8px; cursor: pointer; transition: all 0.2s;" 
                         onclick="openWorldBookEdit(${book.id})"
                         onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"
                         onmouseout="this.style.boxShadow='none'">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div style="font-size: 16px; font-weight: 600; color: #333;">
                                ${book.name}${globalBadge}
                            </div>
                            <div style="font-size: 12px; color: #999;">注入: ${positionText}</div>
                        </div>
                        <div style="font-size: 14px; color: #666; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${book.content}
                        </div>
                    </div>
                `;
            });
        }
    });
    
    html += '</div>';
    
    // 如果筛选后没有内容，显示空状态
    if (!hasContent) {
        container.innerHTML = `
            <div class="world-book-empty">
                <div class="world-book-empty-text">该分组暂无内容</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = html;
    console.log('世界书列表已更新, HTML长度:', html.length);
}

// 打开删除世界书弹窗
function openWorldBookDeleteModal() {
    const modal = document.getElementById('worldBookDeleteModal');
    if (modal) {
        modal.style.display = 'flex';
        displayWorldBookDeleteList();
    }
}

// 关闭删除世界书弹窗
function closeWorldBookDeleteModal() {
    const modal = document.getElementById('worldBookDeleteModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示删除列表
function displayWorldBookDeleteList() {
    const container = document.getElementById('worldBookDeleteList');
    if (!container) return;
    
    if (worldBooks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">暂无世界书</div>';
        return;
    }
    
    let html = '';
    worldBooks.forEach(book => {
        const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">全局</span>' : '';
        
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5; transition: all 0.2s;"
                 onmouseover="this.style.borderColor='#007bff'"
                 onmouseout="this.style.borderColor='#e5e5e5'">
                <input type="checkbox" class="world-book-checkbox" data-book-id="${book.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${book.name}${globalBadge}
                    </div>
                    <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${book.content}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选
function toggleSelectAllWorldBooks() {
    const checkboxes = document.querySelectorAll('.world-book-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 确认删除世界书
async function confirmDeleteWorldBooks() {
    const checkboxes = document.querySelectorAll('.world-book-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要删除的世界书！');
        return;
    }
    
    const confirmed = await showCustomConfirm(
        '确认删除',
        `确定要删除选中的 ${checkboxes.length} 个世界书吗？\n此操作无法撤销！`
    );
    
    if (!confirmed) return;
    
    // 获取要删除的ID列表
    const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.bookId));
    
    // 删除选中的世界书
    worldBooks = worldBooks.filter(book => !idsToDelete.includes(book.id));
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 显示成功提示
        alert(`成功删除 ${idsToDelete.length} 个世界书！`);
        
        // 关闭弹窗并刷新列表
        closeWorldBookDeleteModal();
        displayWorldBooks();
        
        console.log('世界书已删除，当前共有', worldBooks.length, '个条目');
    } catch (error) {
        console.error('删除世界书失败:', error);
        alert('删除失败，请重试！');
    }
}

// 删除单个世界书
function deleteWorldBook(bookId) {
    if (confirm('确定要删除这个世界书吗？')) {
        worldBooks = worldBooks.filter(b => b.id !== bookId);
        storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        displayWorldBooks();
    }
}

// 获取所有全局世界书
function getGlobalWorldBooks() {
    return worldBooks.filter(book => book.isGlobal);
}

// 根据位置获取世界书
function getWorldBooksByPosition(position) {
    return worldBooks.filter(book => book.position === position);
}

// ========== 世界书分组管理 ==========

// 更新分组下拉框选项
function updateGroupSelect() {
    const groupSelect = document.getElementById('worldBookGroup');
    if (groupSelect) {
        groupSelect.innerHTML = '';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            groupSelect.appendChild(option);
        });
    }
}

// 打开分组管理弹窗
function openWorldBookGroupModal() {
    const modal = document.getElementById('worldBookGroupModal');
    if (modal) {
        modal.style.display = 'flex';
        updateWorldBookGroupFilter();
        updateTargetGroupSelect();
        displayWorldBookMoveList();
        displayGroupGlobalList();
        displayGroupsList();
    }
}

// 关闭分组管理弹窗
function closeWorldBookGroupModal() {
    const modal = document.getElementById('worldBookGroupModal');
    if (modal) {
        modal.style.display = 'none';
        // 清空输入框
        document.getElementById('newGroupName').value = '';
    }
}

// 创建新分组
async function createNewGroup() {
    const groupName = document.getElementById('newGroupName').value.trim();
    
    if (!groupName) {
        alert('请输入分组名称！');
        return;
    }
    
    if (worldBookGroups.includes(groupName)) {
        alert('该分组已存在！');
        return;
    }
    
    if (groupName === '默认') {
        alert('不能创建名为"默认"的分组！');
        return;
    }
    
    // 添加新分组
    worldBookGroups.push(groupName);
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBookGroups', JSON.stringify(worldBookGroups));
        
        // 清空输入框
        document.getElementById('newGroupName').value = '';
        
        // 刷新界面
        updateTargetGroupSelect();
        updateWorldBookGroupFilter();
        displayGroupGlobalList();
        displayGroupsList();
        
        alert('分组创建成功！');
    } catch (error) {
        console.error('创建分组失败:', error);
        alert('创建失败，请重试！');
        // 回滚
        worldBookGroups = worldBookGroups.filter(g => g !== groupName);
    }
}

// 更新目标分组下拉框
function updateTargetGroupSelect() {
    const targetSelect = document.getElementById('targetGroupSelect');
    if (targetSelect) {
        targetSelect.innerHTML = '';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            targetSelect.appendChild(option);
        });
    }
}

// 显示世界书移动列表
function displayWorldBookMoveList() {
    const container = document.getElementById('worldBookMoveList');
    if (!container) return;
    
    if (worldBooks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">暂无世界书</div>';
        return;
    }
    
    let html = '';
    worldBooks.forEach(book => {
        const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">全局</span>' : '';
        const groupBadge = `<span style="background: #6c757d; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">${book.group || '默认'}</span>`;
        
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5; transition: all 0.2s;"
                 onmouseover="this.style.borderColor='#007bff'"
                 onmouseout="this.style.borderColor='#e5e5e5'">
                <input type="checkbox" class="world-book-move-checkbox" data-book-id="${book.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${book.name}${globalBadge}${groupBadge}
                    </div>
                    <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${book.content}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选（用于移动）
function toggleSelectAllForMove() {
    const checkboxes = document.querySelectorAll('.world-book-move-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 确认移动到分组
async function confirmMoveToGroup() {
    const checkboxes = document.querySelectorAll('.world-book-move-checkbox:checked');
    const targetGroup = document.getElementById('targetGroupSelect').value;
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要移动的世界书！');
        return;
    }
    
    const confirmed = await showCustomConfirm(
        '确认移动',
        `确定要将选中的 ${checkboxes.length} 个世界书移动到"${targetGroup}"分组吗？`
    );
    
    if (!confirmed) return;
    
    // 获取要移动的ID列表
    const idsToMove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.bookId));
    
    // 更新分组
    worldBooks.forEach(book => {
        if (idsToMove.includes(book.id)) {
            book.group = targetGroup;
        }
    });
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 显示成功提示
        alert(`成功移动 ${idsToMove.length} 个世界书到"${targetGroup}"分组！`);
        
        // 刷新列表
        displayWorldBookMoveList();
        displayWorldBooks();
        
    } catch (error) {
        console.error('移动世界书失败:', error);
        alert('移动失败，请重试！');
    }
}

// 显示分组列表
function displayGroupsList() {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    let html = '';
    worldBookGroups.forEach(group => {
        const count = worldBooks.filter(book => (book.group || '默认') === group).length;
        const isDefault = group === '默认';
        
        html += `
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5;">
                <div style="font-size: 14px; font-weight: 600; color: #333;">
                    ${group}
                    ${isDefault ? '<span style="color: #999; font-size: 12px; font-weight: normal; margin-left: 8px;">(系统分组)</span>' : ''}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    ${count} 个世界书
                </div>
                ${!isDefault ? `
                    <button class="btn-primary" onclick="deleteGroup('${group}')" style="background: #dc3545; padding: 8px 12px; font-size: 14px; margin-top: 10px; width: 100%;">
                        删除
                    </button>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 删除分组
async function deleteGroup(groupName) {
    if (groupName === '默认') {
        alert('不能删除默认分组！');
        return;
    }
    
    const booksInGroup = worldBooks.filter(book => book.group === groupName);
    
    let confirmMessage = `确定要删除"${groupName}"分组吗？`;
    if (booksInGroup.length > 0) {
        confirmMessage += `\n\n该分组中有 ${booksInGroup.length} 个世界书，删除后将移动到"默认"分组。`;
    }
    
    const confirmed = await showCustomConfirm('确认删除', confirmMessage);
    
    if (!confirmed) return;
    
    // 将该分组的世界书移动到默认分组
    worldBooks.forEach(book => {
        if (book.group === groupName) {
            book.group = '默认';
        }
    });
    
    // 删除分组
    worldBookGroups = worldBookGroups.filter(g => g !== groupName);
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBookGroups', JSON.stringify(worldBookGroups));
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 刷新界面
        updateTargetGroupSelect();
        updateWorldBookGroupFilter();
        displayGroupGlobalList();
        displayGroupsList();
        displayWorldBookMoveList();
        displayWorldBooks();
        
        alert('分组删除成功！');
    } catch (error) {
        console.error('删除分组失败:', error);
        alert('删除失败，请重试！');
    }
}

// 更新世界书分组筛选器
function updateWorldBookGroupFilter() {
    const filterSelect = document.getElementById('worldBookGroupFilter');
    if (filterSelect) {
        const currentValue = filterSelect.value || 'all';
        filterSelect.innerHTML = '<option value="all">全部分组</option>';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            filterSelect.appendChild(option);
        });
        // 恢复之前的选择
        if (filterSelect.querySelector(`option[value="${currentValue}"]`)) {
            filterSelect.value = currentValue;
        }
    }
}

// 根据分组筛选世界书
function filterWorldBooksByGroup() {
    displayWorldBooks();
}

// 显示分组全局设置列表
function displayGroupGlobalList() {
    const container = document.getElementById('groupGlobalList');
    if (!container) return;
    
    let html = '';
    worldBookGroups.forEach(group => {
        const booksInGroup = worldBooks.filter(book => (book.group || '默认') === group);
        const globalCount = booksInGroup.filter(book => book.isGlobal).length;
        const allGlobal = booksInGroup.length > 0 && globalCount === booksInGroup.length;
        
        html += `
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 14px; font-weight: 600; color: #333;">
                            ${group}
                        </div>
                        <div style="font-size: 12px; color: #999; margin-top: 4px;">
                            ${booksInGroup.length} 个世界书，其中 ${globalCount} 个已是全局
                        </div>
                    </div>
                    <label class="ios-switch">
                        <input type="checkbox" ${allGlobal ? 'checked' : ''} onchange="toggleGroupGlobal('${group}', this.checked)">
                        <span class="ios-slider"></span>
                    </label>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 切换分组全局状态
async function toggleGroupGlobal(groupName, isGlobal) {
    const booksInGroup = worldBooks.filter(book => (book.group || '默认') === groupName);
    
    if (booksInGroup.length === 0) {
        alert('该分组没有世界书！');
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
        return;
    }
    
    const actionText = isGlobal ? '设置为全局' : '取消全局';
    const confirmed = await showCustomConfirm(
        '确认操作',
        `确定要将"${groupName}"分组下的 ${booksInGroup.length} 个世界书${actionText}吗？`
    );
    
    if (!confirmed) {
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
        return;
    }
    
    // 更新分组内所有世界书的全局状态
    worldBooks.forEach(book => {
        if ((book.group || '默认') === groupName) {
            book.isGlobal = isGlobal;
        }
    });
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 刷新界面
        displayGroupGlobalList();
        displayWorldBookMoveList();
        displayWorldBooks();
        
        alert(`成功将"${groupName}"分组${actionText}！`);
    } catch (error) {
        console.error('更新分组全局状态失败:', error);
        alert('操作失败，请重试！');
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
    }
}

// ========== 音乐歌词功能 ==========

// 歌词数据结构
let currentLyrics = []; // 当前歌曲的歌词数组 [{time: 秒数, text: 歌词文本}]
let currentLyricIndex = -1; // 当前显示的歌词索引

// 解析LRC格式歌词
function parseLyric(lyricText) {
    if (!lyricText || typeof lyricText !== 'string') {
        return [];
    }
    
    const lyrics = [];
    const lines = lyricText.split('\n');
    
    // LRC时间标签格式：[mm:ss.xx] 或 [mm:ss]
    const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/g;
    
    for (const line of lines) {
        const matches = [...line.matchAll(timeRegex)];
        if (matches.length === 0) continue;
        
        // 提取歌词文本（去除所有时间标签）
        const text = line.replace(timeRegex, '').trim();
        if (!text) continue;
        
        // 一行可能有多个时间标签（重复歌词）
        for (const match of matches) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0;
            
            const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
            
            lyrics.push({
                time: timeInSeconds,
                text: text
            });
        }
    }
    
    // 按时间排序
    lyrics.sort((a, b) => a.time - b.time);
    
    return lyrics;
}

// 更新歌词显示
function updateLyric() {
    const lyricElement = document.getElementById('musicLyric');
    if (!lyricElement) return;
    
    // 如果没有歌曲在播放或没有歌词数据，清空显示
    if (!isPlaying || currentLyrics.length === 0) {
        if (lyricElement.textContent !== '') {
            lyricElement.textContent = '';
        }
        return;
    }
    
    const currentTime = audioPlayer.currentTime;
    
    // 查找当前时间应该显示的歌词
    let newIndex = -1;
    for (let i = currentLyrics.length - 1; i >= 0; i--) {
        if (currentTime >= currentLyrics[i].time) {
            newIndex = i;
            break;
        }
    }
    
    // 如果歌词索引发生变化，更新显示
    if (newIndex !== currentLyricIndex) {
        currentLyricIndex = newIndex;
        if (newIndex >= 0) {
            lyricElement.textContent = currentLyrics[newIndex].text;
        } else {
            lyricElement.textContent = '';
        }
    }
}

// 加载歌词到当前播放
function loadLyric(lyricText) {
    currentLyrics = parseLyric(lyricText);
    currentLyricIndex = -1;
    
    const lyricElement = document.getElementById('musicLyric');
    if (lyricElement) {
        lyricElement.textContent = '';
    }
    
    console.log('歌词已加载，共', currentLyrics.length, '行');
}

// 清空歌词
function clearLyric() {
    currentLyrics = [];
    currentLyricIndex = -1;
    
    const lyricElement = document.getElementById('musicLyric');
    if (lyricElement) {
        lyricElement.textContent = '';
    }
}

// 从Meting API获取歌词
async function getLyricFromMeting(baseUrl, server, id) {
    try {
        const url = `${baseUrl}?server=${server}&type=lyric&id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // Meting API返回格式：{lyric: "lrc内容"}
        if (data && data.lyric) {
            return data.lyric;
        }
        
        return null;
    } catch (error) {
        console.error('获取Meting歌词失败:', error);
        return null;
    }
}

// 从Vkeys API获取歌词
async function getLyricFromVkeys(server, id) {
    try {
        const url = `https://api.vkeys.cn/v2/music/${server}/lyric?id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // Vkeys API返回格式需要根据实际情况调整
        if (data && data.code === 200 && data.data) {
            if (data.data.lyric) {
                return data.data.lyric;
            } else if (data.data.lrc) {
                return data.data.lrc;
            }
        }
        
        return null;
    } catch (error) {
        console.error('获取Vkeys歌词失败:', error);
        return null;
    }
}

// 从NanYi API获取歌词
async function getLyricFromNanYi(platform, id) {
    try {
        const url = `https://api.nanyinet.com/api/music/${platform}/lyric?id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // NanYi API返回格式需要根据实际情况调整
        if (data && data.data) {
            if (data.data.lyric) {
                return data.data.lyric;
            } else if (data.data.lrc) {
                return data.data.lrc;
            }
        }
        
        return null;
    } catch (error) {
        console.error('获取NanYi歌词失败:', error);
        return null;
    }
}

// ========== 音乐链接检查功能 ==========

let invalidMusicList = []; // 失效音乐列表

// 检查音乐链接
async function checkMusicLinks() {
    if (musicLibrary.length === 0) {
        alert('音乐库为空！');
        return;
    }

    // 打开弹窗
    const modal = document.getElementById('invalidMusicModal');
    modal.style.display = 'flex';

    // 显示检查进度
    document.getElementById('checkingProgress').style.display = 'block';
    document.getElementById('invalidMusicResult').style.display = 'none';
    document.getElementById('noInvalidMusic').style.display = 'none';

    invalidMusicList = [];
    let checkedCount = 0;

    // 检查每首音乐
    for (const music of musicLibrary) {
        checkedCount++;
        document.getElementById('checkingStatus').textContent = `正在检查 ${checkedCount}/${musicLibrary.length}`;

        const isValid = await checkSingleMusicLink(music.playUrl);
        if (!isValid) {
            invalidMusicList.push(music);
        }
    }

    // 隐藏进度
    document.getElementById('checkingProgress').style.display = 'none';

    // 显示结果
    if (invalidMusicList.length > 0) {
        displayInvalidMusicList();
        document.getElementById('invalidMusicResult').style.display = 'block';
    } else {
        document.getElementById('noInvalidMusic').style.display = 'block';
    }
}

// 检查单个音乐链接
async function checkSingleMusicLink(url) {
    try {
        // 使用HEAD请求检查链接
        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors' // 避免CORS问题
        });
        
        // no-cors模式下无法获取状态码，所以我们尝试加载音频
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'metadata';
            
            const timeout = setTimeout(() => {
                audio.src = '';
                resolve(false);
            }, 5000); // 5秒超时
            
            audio.onloadedmetadata = () => {
                clearTimeout(timeout);
                audio.src = '';
                resolve(true);
            };
            
            audio.onerror = () => {
                clearTimeout(timeout);
                audio.src = '';
                resolve(false);
            };
            
            audio.src = url;
        });
    } catch (error) {
        console.error('检查链接失败:', error);
        return false;
    }
}

// 显示失效音乐列表
function displayInvalidMusicList() {
    const container = document.getElementById('invalidMusicList');
    
    let html = '';
    invalidMusicList.forEach(music => {
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #dc3545;">
                <input type="checkbox" class="invalid-music-checkbox" data-music-id="${music.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${music.name}
                        <span style="background: #dc3545; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">失效</span>
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        ${music.artist} · ${music.platform || '未知平台'}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选失效音乐
function toggleSelectAllInvalid() {
    const checkboxes = document.querySelectorAll('.invalid-music-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 重新搜索选中的音乐
async function researchSelectedMusic() {
    const checkboxes = document.querySelectorAll('.invalid-music-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要重新搜索的音乐！');
        return;
    }

    const confirmed = await showCustomConfirm(
        '确认重新搜索',
        `确定要重新搜索选中的 ${checkboxes.length} 首音乐吗？\n\n将依次搜索并自动更新音乐库中的链接。`
    );

    if (!confirmed) return;

    // 获取选中的音乐ID
    const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.musicId);
    const musicsToResearch = invalidMusicList.filter(m => selectedIds.includes(m.id));

    // 关闭弹窗
    closeInvalidMusicModal();

    // 显示进度提示
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < musicsToResearch.length; i++) {
        const music = musicsToResearch[i];
        const progress = `(${i + 1}/${musicsToResearch.length})`;
        
        try {
            // 搜索音乐
            const keyword = `${music.name} ${music.artist}`;
            const apiSource = document.getElementById('musicApiSelect')?.value || 'meting1';
            
            let results = [];
            if (apiSource === 'meting1') {
                results = await searchWithMetingAPINew(keyword);
            } else if (apiSource === 'meting2') {
                results = await searchWithMetingAPINew2(keyword);
            } else if (apiSource === 'meting3') {
                results = await searchWithVkeysAPI(keyword);
            } else if (apiSource === 'aa1') {
                results = await searchWithAA1API(keyword);
            } else if (apiSource === 'nanyi') {
                results = await searchWithNanYiAPI(keyword);
            }

            if (results.length > 0) {
                // 使用第一个搜索结果更新
                const newMusic = results[0];
                const index = musicLibrary.findIndex(m => m.id === music.id);
                
                if (index !== -1) {
                    // 保留原来的ID和歌词
                    musicLibrary[index] = {
                        ...newMusic,
                        id: music.id,
                        lyric: music.lyric || newMusic.lyric
                    };
                    successCount++;
                    console.log(`✅ ${progress} 成功更新: ${music.name}`);
                }
            } else {
                failCount++;
                console.log(`❌ ${progress} 搜索失败: ${music.name}`);
            }
        } catch (error) {
            failCount++;
            console.error(`❌ ${progress} 搜索出错:`, music.name, error);
        }
    }

    // 保存更新后的音乐库
    try {
        await storageDB.setItem('musicLibrary', musicLibrary);
        displayMusicLibrary();
        
        let message = `重新搜索完成！\n\n`;
        message += `✅ 成功: ${successCount} 首\n`;
        if (failCount > 0) {
            message += `❌ 失败: ${failCount} 首`;
        }
        alert(message);
    } catch (error) {
        console.error('保存音乐库失败:', error);
        alert('保存失败，请重试！');
    }
}

// 关闭失效音乐弹窗
function closeInvalidMusicModal() {
    const modal = document.getElementById('invalidMusicModal');
    modal.style.display = 'none';
    invalidMusicList = [];
}
