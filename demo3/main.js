// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 添加CSS样式，确保选中的表格行有高亮效果
    const style = document.createElement('style');
    style.textContent = `
        #device-table tbody tr.selected {
            background-color: rgba(76, 175, 80, 0.2);
        }
        
        #device-table tbody tr:hover {
            background-color: rgba(30, 50, 74, 0.5);
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
    
    // 等待一小段时间确保Three.js和其他依赖项完全加载
    setTimeout(function() {
        try {
            // 初始化3D渲染器
            const renderer = new Factory3DRenderer();
            
            // 调整窗口大小时重新渲染
            renderer.onWindowResize();
            
            // 为表格行添加点击事件
            setupTableInteraction(renderer);
            
            // 在控制台显示初始化完成信息
            console.log('汽零车间设备状态监控系统初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            
            // 显示错误信息
            const container = document.querySelector('.visualization-container');
            if (container) {
                container.innerHTML = `
                    <div style="color: #f44336; text-align: center; padding: 20px;">
                        <h3>初始化失败</h3>
                        <p>${error.message}</p>
                        <p>请检查浏览器是否支持WebGL或刷新页面重试。</p>
                    </div>
                `;
            }
        }
    }, 500);
});

// 设置表格交互
function setupTableInteraction(renderer) {
    const tbody = document.querySelector('#device-table tbody');
    
    // 为表格行添加点击事件
    tbody.addEventListener('click', function(event) {
        let target = event.target;
        
        // 查找所属的行
        while (target && target.nodeName !== 'TR') {
            target = target.parentNode;
            if (!target || target === tbody) return;
        }
        
        if (target && target.id) {
            const deviceId = target.id.replace('device-row-', '');
            const deviceMesh = renderer.deviceObjects[deviceId];
            
            if (deviceMesh) {
                // 将相机聚焦到设备
                focusCameraOnDevice(renderer, deviceMesh);
                
                // 选择设备
                renderer.selectDevice(deviceMesh);
            }
        }
    });
}

// 将相机聚焦到设备
function focusCameraOnDevice(renderer, deviceMesh) {
    const position = deviceMesh.position.clone();
    const target = position.clone();
    
    // 计算当前相机位置到目标的方向向量
    const direction = new THREE.Vector3().subVectors(
        renderer.camera.position,
        renderer.controls.target
    ).normalize().multiplyScalar(50);
    
    // 设置新的相机位置，保持相同的观察角度
    const newPosition = target.clone().add(direction);
    
    // 使用动画平滑过渡到新的相机位置
    animateCameraMove(renderer, newPosition, target, 1000);
}

// 相机移动动画
function animateCameraMove(renderer, targetPosition, targetLookAt, duration) {
    const startPosition = renderer.camera.position.clone();
    const startLookAt = renderer.controls.target.clone();
    
    const startTime = Date.now();
    
    function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数使动画更自然
        const easeProgress = easeInOutCubic(progress);
        
        // 计算当前位置
        const currentPosition = new THREE.Vector3().lerpVectors(
            startPosition,
            targetPosition,
            easeProgress
        );
        
        // 计算当前观察点
        const currentLookAt = new THREE.Vector3().lerpVectors(
            startLookAt,
            targetLookAt,
            easeProgress
        );
        
        // 更新相机和控制器
        renderer.camera.position.copy(currentPosition);
        renderer.controls.target.copy(currentLookAt);
        renderer.controls.update();
        
        // 继续动画或结束
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        }
    }
    
    // 开始动画
    updateCamera();
}

// 缓动函数
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
} 