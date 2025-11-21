// GBA模拟器核心实现
class GBAEmulator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.imageData = this.ctx.createImageData(240, 160);
        this.running = false;
        this.frameCount = 0;
        this.romData = null;
        this.saveStateData = null;
        
        // GBA分辨率
        this.width = 240;
        this.height = 160;
        
        // 设置画布大小
        this.canvas.width = this.width * 2; // 放大显示
        this.canvas.height = this.height * 2;
        
        // 按键状态
        this.keyState = {
            up: false, down: false, left: false, right: false,
            a: false, b: false, l: false, r: false,
            start: false, select: false
        };
        
        // 按键映射
        this.keyMapping = {
            'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
            'KeyZ': 'a', 'KeyX': 'b', 'KeyA': 'l', 'KeyS': 'r',
            'Enter': 'start', 'ShiftLeft': 'select', 'ShiftRight': 'select'
        };
        
        this.loadKeyMapping();
        this.setupEventListeners();
    }
    
    loadKeyMapping() {
        const saved = localStorage.getItem('gbaKeyMapping');
        if (saved) {
            this.keyMapping = JSON.parse(saved);
        }
    }
    
    saveKeyMapping() {
        localStorage.setItem('gbaKeyMapping', JSON.stringify(this.keyMapping));
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.running) {
                e.preventDefault();
                const key = this.keyMapping[e.code];
                if (key) {
                    this.keyState[key] = true;
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (this.running) {
                e.preventDefault();
                const key = this.keyMapping[e.code];
                if (key) {
                    this.keyState[key] = false;
                }
            }
        });
        
        // 防止页面滚动
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    loadROM(romData, fileName) {
        this.romData = romData;
        this.fileName = fileName;
        
        // 简单的ROM验证
        if (romData.length < 0xA0) {
            throw new Error('ROM文件太小，可能不是有效的GBA文件');
        }
        
        // 检查Nintendo标志（简单的验证）
        const nintendoLogo = [
            0x24, 0xFF, 0xAE, 0x51, 0x69, 0x9A, 0xA2, 0x21, 0x3D, 0x84, 0x82, 0x0A, 0x84, 0xE4, 0x09, 0xAD,
            0x11, 0x24, 0x8B, 0x98, 0xC0, 0x81, 0x7F, 0x21, 0xA3, 0x52, 0xBE, 0x19, 0x93, 0x09, 0xCE, 0x20,
            0x10, 0x46, 0x4A, 0x4A, 0xF8, 0x27, 0x31, 0xEC, 0x58, 0xC7, 0xE8, 0x33, 0x82, 0xE3, 0xCE, 0xBF,
            0x85, 0xF4, 0xDF, 0x94, 0xCE, 0x4B, 0x09, 0xC1, 0x94, 0x56, 0x8A, 0xC0, 0x13, 0x72, 0xA7, 0xFC,
            0x9F, 0x84, 0x4D, 0x73, 0xA3, 0xCA, 0x9A, 0x61, 0x58, 0x97, 0xA3, 0x27, 0xFC, 0x03, 0x98, 0x76,
            0x23, 0x1D, 0xC7, 0x61, 0x03, 0x04, 0xAE, 0x56, 0xBF, 0x38, 0x84, 0x00, 0x40, 0xA7, 0x0E, 0xFD,
            0xFF, 0x52, 0xFE, 0x03, 0x6F, 0x95, 0x30, 0xF1, 0x97, 0xFB, 0xC0, 0x85, 0x60, 0xD6, 0x80, 0x25,
            0xA9, 0x63, 0xBE, 0x03, 0x01, 0x4E, 0x38, 0xE2, 0xF9, 0xA2, 0x34, 0xFF, 0xBB, 0x3E, 0x03, 0x44,
            0x78, 0x00, 0x90, 0xCB, 0x88, 0x11, 0x3A, 0x94, 0x65, 0xC0, 0x7C, 0x63, 0x87, 0xF0, 0x3C, 0xAF,
            0xD6, 0x25, 0xE4, 0x8B, 0x38, 0x0A, 0xAC, 0x72, 0x21, 0xD4, 0xF8, 0x07
        ];
        
        let logoValid = true;
        for (let i = 0; i < 156; i++) {
            if (romData[0x04 + i] !== nintendoLogo[i]) {
                logoValid = false;
                break;
            }
        }
        
        if (!logoValid) {
            console.warn('Nintendo标志验证失败，但这可能只是自制游戏');
        }
        
        return true;
    }
    
    start() {
        if (!this.romData) {
            throw new Error('请先加载ROM文件');
        }
        
        this.running = true;
        this.gameLoop();
    }
    
    stop() {
        this.running = false;
    }
    
    reset() {
        this.frameCount = 0;
        this.stop();
        this.clearScreen();
    }
    
    clearScreen() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    gameLoop() {
        if (!this.running) return;
        
        this.update();
        this.render();
        
        this.frameCount++;
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 这里应该实现GBA的CPU、内存、图形等更新逻辑
        // 目前只是模拟一些基本行为
        
        // 模拟按键响应
        if (this.keyState.a) {
            // A键被按下时的处理
        }
        if (this.keyState.b) {
            // B键被按下时的处理
        }
        // ... 其他按键处理
    }
    
    render() {
        // 清空屏幕
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制游戏画面（模拟）
        this.drawGameScreen();
        
        // 绘制UI信息
        this.drawUI();
    }
    
    drawGameScreen() {
        // 模拟GBA游戏画面
        const scale = 2;
        const offsetX = (this.canvas.width - this.width * scale) / 2;
        const offsetY = (this.canvas.height - this.height * scale) / 2;
        
        // 创建渐变背景（模拟游戏画面）
        const gradient = this.ctx.createLinearGradient(0, 0, this.width * scale, this.height * scale);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(offsetX, offsetY, this.width * scale, this.height * scale);
        
        // 绘制一些模拟的游戏元素
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        
        // 绘制标题
        this.ctx.fillText('GBA EMULATOR', offsetX + this.width * scale / 2, offsetY + 30);
        
        // 绘制按键状态
        this.drawKeyStatus(offsetX, offsetY);
        
        // 绘制边框
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX, offsetY, this.width * scale, this.height * scale);
    }
    
    drawKeyStatus(offsetX, offsetY) {
        const keyNames = ['↑', '↓', '←', '→', 'A', 'B', 'L', 'R', 'Start', 'Select'];
        const keyStates = [
            this.keyState.up, this.keyState.down, this.keyState.left, this.keyState.right,
            this.keyState.a, this.keyState.b, this.keyState.l, this.keyState.r,
            this.keyState.start, this.keyState.select
        ];
        
        const scale = 2;
        const startX = offsetX + 20;
        const startY = offsetY + 60;
        
        this.ctx.font = '12px monospace';
        
        for (let i = 0; i < keyNames.length; i++) {
            const x = startX + (i % 5) * 40;
            const y = startY + Math.floor(i / 5) * 25;
            
            this.ctx.fillStyle = keyStates[i] ? '#4CAF50' : '#666';
            this.ctx.fillRect(x - 15, y - 10, 30, 20);
            
            this.ctx.fillStyle = keyStates[i] ? '#fff' : '#999';
            this.ctx.fillText(keyNames[i], x, y + 4);
        }
    }
    
    drawUI() {
        // 绘制文件信息
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`文件: ${this.fileName || '未加载'}`, 10, 20);
        this.ctx.fillText(`帧数: ${this.frameCount}`, 10, 35);
        
        // 绘制按键提示
        this.ctx.textAlign = 'right';
        this.ctx.fillText('方向键: 移动', this.canvas.width - 10, 20);
        this.ctx.fillText('Z: A键  X: B键', this.canvas.width - 10, 35);
        this.ctx.fillText('A: L键  S: R键', this.canvas.width - 10, 50);
        this.ctx.fillText('Enter: 开始  Shift: 选择', this.canvas.width - 10, 65);
    }
    
    saveState() {
        if (!this.romData) return null;
        
        this.saveStateData = {
            frameCount: this.frameCount,
            keyState: { ...this.keyState },
            timestamp: new Date().toISOString(),
            fileName: this.fileName
        };
        
        return this.saveStateData;
    }
    
    loadState(stateData) {
        if (stateData) {
            this.frameCount = stateData.frameCount;
            this.keyState = { ...stateData.keyState };
            return true;
        }
        return false;
    }
    
    updateKeyMapping(newMapping) {
        this.keyMapping = { ...this.keyMapping, ...newMapping };
        this.saveKeyMapping();
    }
    
    getKeyMapping() {
        return { ...this.keyMapping };
    }
}

// 导出模拟器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GBAEmulator;
} else {
    window.GBAEmulator = GBAEmulator;
}