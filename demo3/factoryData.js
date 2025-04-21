// 工厂布局和设备数据
const FACTORY_DATA = {
    // 区域配置
    areas: [
        {
            id: 'entrance',
            name: '入口',
            position: { x: -80, y: 0, z: -10 },
            size: { width: 10, height: 1, depth: 40 },
            color: 0x1e324a,
            opacity: 0.2
        },
        {
            id: 'performance',
            name: '性能区',
            position: { x: -55, y: 0, z: 10 },
            size: { width: 40, height: 1, depth: 80 },
            color: 0x1e324a,
            opacity: 0.2
        },
        {
            id: 'temperature',
            name: '温度区',
            position: { x: -20, y: 0, z: 0 },
            size: { width: 45, height: 1, depth: 60 },
            color: 0x1e324a,
            opacity: 0.2
        },
        {
            id: 'durability1',
            name: '耐久1区',
            position: { x: 20, y: 0, z: 0 },
            size: { width: 45, height: 1, depth: 60 },
            color: 0x1e324a,
            opacity: 0.2
        },
        {
            id: 'durability2',
            name: '耐久2区',
            position: { x: 60, y: 0, z: -15 },
            size: { width: 45, height: 1, depth: 30 },
            color: 0x1e324a,
            opacity: 0.2
        },
        {
            id: 'durability3',
            name: '耐久3区',
            position: { x: 100, y: 0, z: -15 },
            size: { width: 45, height: 1, depth: 30 },
            color: 0x1e324a,
            opacity: 0.2
        }
    ],
    
    // 设备状态定义
    deviceStatuses: {
        RUNNING: { name: '运行', color: 0x4caf50, code: 'running' },
        WAITING: { name: '待机', color: 0xffc107, code: 'waiting' },
        OFFLINE: { name: '掉线', color: 0x9c27b0, code: 'offline' },
        MAINTENANCE: { name: '维修', color: 0x2196f3, code: 'maintenance' },
        ALARM: { name: '报警', color: 0xf44336, code: 'alarm' },
        STOPPED: { name: '停机', color: 0x9e9e9e, code: 'stopped' }
    },
    
    // 设备类型定义
    deviceTypes: {
        TEMPERATURE_DEVICE: { 
            name: '温度测试设备', 
            model: 'cube', 
            size: { width: 5, height: 3, depth: 5 } 
        },
        DURABILITY_DEVICE: { 
            name: '耐久测试设备', 
            model: 'cube', 
            size: { width: 5, height: 3, depth: 5 } 
        },
        PERFORMANCE_DEVICE: { 
            name: '性能测试设备', 
            model: 'cube', 
            size: { width: 5, height: 3, depth: 5 } 
        }
    },
    
    // 生成设备数据
    generateDevices: function() {
        const devices = [];
        let deviceCount = 0;
        
        // 获取区域信息，用于控制设备放置范围
        const getAreaBounds = (areaId) => {
            const area = this.areas.find(a => a.id === areaId);
            return {
                minX: area.position.x - area.size.width/2 + 3,
                maxX: area.position.x + area.size.width/2 - 3,
                minZ: area.position.z - area.size.depth/2 + 3,
                maxZ: area.position.z + area.size.depth/2 - 3
            };
        };
        
        // 生成温度区设备 - 15台运行, 2台掉线
        const tempBounds = getAreaBounds('temperature');
        const tempDevices = 17;
        const tempCols = 4;
        for (let i = 0; i < tempDevices; i++) {
            const row = Math.floor(i / tempCols);
            const col = i % tempCols;
            
            const status = i < 15 ? 'RUNNING' : 'OFFLINE';
            const spacing = (tempBounds.maxX - tempBounds.minX) / tempCols;
            const offset = (tempBounds.maxZ - tempBounds.minZ) / Math.ceil(tempDevices / tempCols);
            
            devices.push(createDevice(
                `T${String(++deviceCount).padStart(3, '0')}`,
                '温度测试仪',
                'TEMPERATURE_DEVICE',
                status,
                'temperature',
                {
                    x: tempBounds.minX + col * spacing + spacing/2,
                    y: 0,
                    z: tempBounds.minZ + row * offset + offset/2
                }
            ));
        }
        
        // 生成耐久1区设备 - 12台运行, 2台待机, 1台掉线
        const dur1Bounds = getAreaBounds('durability1');
        const dur1Devices = 15;
        const dur1Cols = 5;
        for (let i = 0; i < dur1Devices; i++) {
            const row = Math.floor(i / dur1Cols);
            const col = i % dur1Cols;
            
            let status = 'RUNNING';
            if (i >= 12 && i < 14) status = 'WAITING';
            else if (i >= 14) status = 'OFFLINE';
            
            const spacing = (dur1Bounds.maxX - dur1Bounds.minX) / dur1Cols;
            const offset = (dur1Bounds.maxZ - dur1Bounds.minZ) / Math.ceil(dur1Devices / dur1Cols);
            
            devices.push(createDevice(
                `D1${String(++deviceCount).padStart(3, '0')}`,
                '耐久测试仪',
                'DURABILITY_DEVICE',
                status,
                'durability1',
                {
                    x: dur1Bounds.minX + col * spacing + spacing/2,
                    y: 0,
                    z: dur1Bounds.minZ + row * offset + offset/2
                }
            ));
        }
        
        // 生成耐久2区设备 - 12台运行, 3台待机, 2台掉线
        const dur2Bounds = getAreaBounds('durability2');
        const dur2Devices = 17;
        const dur2Cols = 5;
        for (let i = 0; i < dur2Devices; i++) {
            const row = Math.floor(i / dur2Cols);
            const col = i % dur2Cols;
            
            let status = 'RUNNING';
            if (i >= 12 && i < 15) status = 'WAITING';
            else if (i >= 15) status = 'OFFLINE';
            
            const spacing = (dur2Bounds.maxX - dur2Bounds.minX) / dur2Cols;
            const offset = (dur2Bounds.maxZ - dur2Bounds.minZ) / Math.ceil(dur2Devices / dur2Cols);
            
            devices.push(createDevice(
                `D2${String(++deviceCount).padStart(3, '0')}`,
                '耐久冲击仪',
                'DURABILITY_DEVICE',
                status,
                'durability2',
                {
                    x: dur2Bounds.minX + col * spacing + spacing/2,
                    y: 0,
                    z: dur2Bounds.minZ + row * offset + offset/2
                }
            ));
        }
        
        // 生成耐久3区设备 - 10台运行, 2台待机, 2台掉线
        const dur3Bounds = getAreaBounds('durability3');
        const dur3Devices = 14;
        const dur3Cols = 5;
        for (let i = 0; i < dur3Devices; i++) {
            const row = Math.floor(i / dur3Cols);
            const col = i % dur3Cols;
            
            let status = 'RUNNING';
            if (i >= 10 && i < 12) status = 'WAITING';
            else if (i >= 12) status = 'OFFLINE';
            
            const spacing = (dur3Bounds.maxX - dur3Bounds.minX) / dur3Cols;
            const offset = (dur3Bounds.maxZ - dur3Bounds.minZ) / Math.ceil(dur3Devices / dur3Cols);
            
            devices.push(createDevice(
                `D3${String(++deviceCount).padStart(3, '0')}`,
                '强度测试仪',
                'DURABILITY_DEVICE',
                status,
                'durability3',
                {
                    x: dur3Bounds.minX + col * spacing + spacing/2,
                    y: 0,
                    z: dur3Bounds.minZ + row * offset + offset/2
                }
            ));
        }
        
        // 生成性能区设备 - 5台运行, 0台待机, 2台掉线
        const perfBounds = getAreaBounds('performance');
        const perfDevices = 7;
        const perfCols = 3;
        for (let i = 0; i < perfDevices; i++) {
            const row = Math.floor(i / perfCols);
            const col = i % perfCols;
            
            let status = 'RUNNING';
            if (i >= 5) status = 'OFFLINE';
            
            const spacing = (perfBounds.maxX - perfBounds.minX) / perfCols;
            const offset = (perfBounds.maxZ - perfBounds.minZ) / Math.ceil(perfDevices / perfCols);
            
            devices.push(createDevice(
                `P${String(++deviceCount).padStart(3, '0')}`,
                '性能测试仪',
                'PERFORMANCE_DEVICE',
                status,
                'performance',
                {
                    x: perfBounds.minX + col * spacing + spacing/2,
                    y: 0,
                    z: perfBounds.minZ + row * offset + offset/2
                }
            ));
        }
        
        return devices;
    }
};

// 辅助函数 - 创建设备对象
function createDevice(id, name, type, status, area, position) {
    return {
        id: id,
        name: name,
        type: type,
        status: status,
        area: area,
        position: position,
        selected: false,
        data: {
            temperature: Math.round(Math.random() * 40 + 20), // 20-60°C
            runningTime: Math.round(Math.random() * 10000), // 运行时间(小时)
            powerConsumption: Math.round(Math.random() * 100) / 10, // 功耗(kW)
            efficiency: Math.round(Math.random() * 40 + 60) // 效率(60-100%)
        }
    };
}

// 获取设备统计数据
function getDeviceStatistics(devices) {
    const stats = {
        RUNNING: 0,
        WAITING: 0,
        OFFLINE: 0,
        MAINTENANCE: 0,
        ALARM: 0,
        STOPPED: 0
    };
    
    devices.forEach(device => {
        stats[device.status]++;
    });
    
    return stats;
} 