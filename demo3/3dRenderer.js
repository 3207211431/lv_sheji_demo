// 3D渲染器类
class Factory3DRenderer {
    constructor() {
        // 场景设置
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0c121e);
        
        // 相机设置
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.set(0, 100, 100);
        this.camera.lookAt(0, 0, 0);
        
        // 渲染器设置
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('factory-canvas'),
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // 控制器设置
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 50;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // 光照设置
        this.setupLights();
        
        // 模型存储
        this.areaObjects = {};
        this.deviceObjects = {};
        this.areaLabels = {};
        
        // 交互设置
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedDevice = null;
        
        // 时间计数器
        this.clock = new THREE.Clock();
        
        // 粒子和背景效果
        this.particles = [];
        
        // 绑定事件
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this), false);
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        
        // 初始化场景
        this.init();
    }
    
    // 设置光照
    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x333344, 0.5);
        this.scene.add(ambientLight);
        
        // 主光源
        const mainLight = new THREE.DirectionalLight(0xeeffff, 1.2);
        mainLight.position.set(50, 100, 50);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.left = -100;
        mainLight.shadow.camera.right = 100;
        mainLight.shadow.camera.top = 100;
        mainLight.shadow.camera.bottom = -100;
        mainLight.shadow.camera.far = 300;
        mainLight.shadow.bias = -0.001;
        
        // 添加光晕效果
        const mainLightHelper = new THREE.PointLight(0x7794ff, 2, 50);
        mainLightHelper.position.copy(mainLight.position);
        this.scene.add(mainLightHelper);
        
        this.scene.add(mainLight);
        
        // 补光1
        const fillLight1 = new THREE.DirectionalLight(0x7799ff, 0.7);
        fillLight1.position.set(-50, 50, -50);
        this.scene.add(fillLight1);
        
        // 补光2 - 下方柔光
        const fillLight2 = new THREE.PointLight(0x00aaff, 0.5, 150);
        fillLight2.position.set(0, 5, 0);
        this.scene.add(fillLight2);
        
        // 辅助点光源 - 在场景四周添加柔和的光源
        const cornerLights = [
            { pos: [150, 20, 150], color: 0x4488ff, intensity: 0.4 },
            { pos: [-150, 20, 150], color: 0x4488ff, intensity: 0.4 },
            { pos: [150, 20, -150], color: 0x4488ff, intensity: 0.4 },
            { pos: [-150, 20, -150], color: 0x4488ff, intensity: 0.4 }
        ];
        
        cornerLights.forEach(light => {
            const pointLight = new THREE.PointLight(light.color, light.intensity, 200);
            pointLight.position.set(...light.pos);
            this.scene.add(pointLight);
        });
    }
    
    // 初始化3D场景
    init() {
        // 创建天空盒
        this.createSkybox();
        
        // 创建地板网格
        this.createGridFloor();
        
        // 创建背景粒子系统
        this.createParticleSystem();
        
        // 创建环境装饰
        this.createEnvironmentDecorations();
        
        // 创建区域
        this.createAreas();
        
        // 创建设备
        this.createDevices();
        
        // 创建区域标签
        this.createAreaLabels();
        
        // 创建3D饼图
        this.create3DPieChart();
        
        // 创建全息投影效果
        this.createHolographicEffects();
        
        // 添加后期处理效果
        this.setupPostProcessing();
        
        // 动画循环
        this.animate();
    }
    
    // 创建天空盒
    createSkybox() {
        // 使用立方体贴图创建天空盒
        const skyboxGeometry = new THREE.BoxGeometry(1500, 1500, 1500);
        
        // 创建自定义科技感渐变材质
        const skyboxMaterials = [];
        const colors = [
            new THREE.Color(0x0a0e16), // 底部深色
            new THREE.Color(0x0a0e16), // 顶部深色
            new THREE.Color(0x101624), // 四个侧面稍亮
            new THREE.Color(0x101624),
            new THREE.Color(0x101624),
            new THREE.Color(0x101624)
        ];
        
        // 为每个面创建渐变画布
        for (let i = 0; i < 6; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const context = canvas.getContext('2d');
            
            // 创建渐变
            let gradient;
            if (i === 0) { // 底部
                gradient = context.createLinearGradient(0, 0, 0, 512);
                gradient.addColorStop(0, '#0a0e16');
                gradient.addColorStop(1, '#000508');
            } else if (i === 1) { // 顶部
                gradient = context.createLinearGradient(0, 0, 0, 512);
                gradient.addColorStop(0, '#1a2436');
                gradient.addColorStop(1, '#0a1020');
            } else { // 侧面
                gradient = context.createRadialGradient(256, 256, 50, 256, 256, 500);
                gradient.addColorStop(0, '#101624');
                gradient.addColorStop(1, '#060c18');
            }
            
            // 绘制渐变背景
            context.fillStyle = gradient;
            context.fillRect(0, 0, 512, 512);
            
            // 添加随机星星点缀
            if (i > 0) { // 除了底部，其他面都添加星星
                context.fillStyle = 'white';
                for (let j = 0; j < 100; j++) {
                    const size = Math.random() * 2;
                    const x = Math.floor(Math.random() * 512);
                    const y = Math.floor(Math.random() * 512);
                    const alpha = Math.random() * 0.8 + 0.2;
                    
                    context.globalAlpha = alpha;
                    context.beginPath();
                    context.arc(x, y, size, 0, Math.PI * 2);
                    context.fill();
                }
                
                // 绘制一些网格线以增强科技感
                context.strokeStyle = 'rgba(76, 211, 255, 0.1)';
                context.lineWidth = 1;
                
                // 水平线
                for (let y = 0; y < 512; y += 64) {
                    context.beginPath();
                    context.moveTo(0, y);
                    context.lineTo(512, y);
                    context.stroke();
                }
                
                // 垂直线
                for (let x = 0; x < 512; x += 64) {
                    context.beginPath();
                    context.moveTo(x, 0);
                    context.lineTo(x, 512);
                    context.stroke();
                }
            }
            
            // 创建材质
            const texture = new THREE.CanvasTexture(canvas);
            skyboxMaterials.push(new THREE.MeshBasicMaterial({ 
                map: texture,
                side: THREE.BackSide
            }));
        }
        
        // 创建天空盒
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
        this.scene.add(skybox);
    }
    
    // 创建地板网格
    createGridFloor() {
        // 1. 基础网格地板
        const gridHelper = new THREE.GridHelper(300, 60, 0x444444, 0x222222);
        gridHelper.position.y = 0.1; // 略微抬高以避免z-fighting
        this.scene.add(gridHelper);
        
        // 2. 添加半透明地板平面
        const floorGeometry = new THREE.PlaneGeometry(300, 300);
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a2a3a,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            shininess: 90,
            specular: 0x3377ff
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // 3. 添加发光圆环（中心向外扩散的光环）
        const ringGeometry = new THREE.RingGeometry(10, 11, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x4cebff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.2;
        ring.userData.isExpanding = true;
        this.scene.add(ring);
        
        // 存储环形引用以便动画
        this.pulseRing = ring;
        
        // 4. 添加中心圆盘
        const centerDiskGeometry = new THREE.CircleGeometry(10, 32);
        const centerDiskMaterial = new THREE.MeshPhongMaterial({
            color: 0x1e324a,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            shininess: 50
        });
        
        const centerDisk = new THREE.Mesh(centerDiskGeometry, centerDiskMaterial);
        centerDisk.rotation.x = -Math.PI / 2;
        centerDisk.position.y = 0.15;
        this.scene.add(centerDisk);
    }
    
    // 创建粒子系统
    createParticleSystem() {
        // 减少粒子数量
        const particleCount = 100; // 从300减少到100
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesPositions = new Float32Array(particleCount * 3);
        const particlesSizes = new Float32Array(particleCount);
        const particlesColors = new Float32Array(particleCount * 3);
        
        // 创建粒子
        for (let i = 0; i < particleCount; i++) {
            // 位置随机分布在整个场景范围内，但更多地集中在中央区域
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 150 + 20;
            const x = Math.cos(angle) * radius;
            const y = Math.random() * 80 + 10; // 高度降低
            const z = Math.sin(angle) * radius;
            
            particlesPositions[i * 3] = x;
            particlesPositions[i * 3 + 1] = y;
            particlesPositions[i * 3 + 2] = z;
            
            // 随机大小，稍微减小
            particlesSizes[i] = Math.random() * 1.5 + 0.5;
            
            // 颜色 - 从蓝色到青色范围
            const hue = 0.5 + Math.random() * 0.1; // 青蓝色范围
            const saturation = 0.7 + Math.random() * 0.3;
            const lightness = 0.5 + Math.random() * 0.3;
            
            const color = new THREE.Color().setHSL(hue, saturation, lightness);
            particlesColors[i * 3] = color.r;
            particlesColors[i * 3 + 1] = color.g;
            particlesColors[i * 3 + 2] = color.b;
            
            // 存储粒子信息用于动画
            this.particles.push({
                index: i,
                speed: Math.random() * 0.15 + 0.03, // 降低速度
                initialY: y
            });
        }
        
        // 设置属性
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particlesSizes, 1));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particlesColors, 3));
        
        // 创建着色器材质
        const particlesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / length(mvPosition.xyz));
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    // 创建圆形粒子
                    float r = 0.5;
                    vec2 uv = gl_PointCoord - vec2(0.5);
                    float d = length(uv);
                    float opacity = 1.0 - smoothstep(r * 0.8, r, d);
                    
                    gl_FragColor = vec4(vColor, opacity * 0.7); // 降低总体透明度
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        // 创建粒子系统
        this.particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particleSystem);
    }
    
    // 创建环境装饰元素
    createEnvironmentDecorations() {
        // 移除四周的发光柱子和环形装饰，保留其他元素
        
        // 在中央添加一些简单装饰 - 用环代替发光柱
        const centralRingGeometry = new THREE.RingGeometry(120, 121, 64);
        const centralRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x4cebff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        const centralRing = new THREE.Mesh(centralRingGeometry, centralRingMaterial);
        centralRing.rotation.x = -Math.PI / 2;
        centralRing.position.y = 0.1;
        this.scene.add(centralRing);
    }
    
    // 创建全息投影效果
    createHolographicEffects() {
        // 创建中央全息投影区域
        const holoGeometry = new THREE.CylinderGeometry(15, 15, 0.1, 32, 1, true);
        const holoMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                
                void main() {
                    float dist = length(vUv - vec2(0.5, 0.5)) * 2.0;
                    float alpha = 0.0;
                    
                    // 圆环效果
                    float ringWidth = 0.05;
                    float ringRadius = mod(time * 0.3, 1.0);
                    if (abs(dist - ringRadius) < ringWidth) {
                        alpha = 0.5 * (1.0 - abs(dist - ringRadius) / ringWidth);
                    }
                    
                    // 扫描线效果
                    float scanLine = mod(vUv.y + time * 0.2, 1.0);
                    if (scanLine < 0.01) {
                        alpha = max(alpha, 0.5);
                    }
                    
                    // 网格线效果
                    float gridX = mod(vUv.x * 20.0, 1.0);
                    float gridY = mod(vUv.y * 20.0, 1.0);
                    if (gridX < 0.05 || gridY < 0.05) {
                        alpha = max(alpha, 0.1);
                    }
                    
                    gl_FragColor = vec4(0.3, 0.8, 1.0, alpha * (1.0 - dist * 0.8));
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const holoDisc = new THREE.Mesh(holoGeometry, holoMaterial);
        holoDisc.position.y = 0.2;
        holoDisc.rotation.x = Math.PI / 2;
        this.scene.add(holoDisc);
        
        // 存储供动画使用
        this.holoDisc = holoDisc;
    }
    
    // 设置后期处理效果
    setupPostProcessing() {
        // 使用简单的后期处理实现辉光效果
        // 在实际项目中可以按需启用更复杂的后期处理效果
    }
    
    // 更新粒子系统
    updateParticles(deltaTime) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const time = Date.now() * 0.001;
        
        // 更新粒子位置
        this.particles.forEach(particle => {
            // 缓慢上升移动
            positions[particle.index * 3 + 1] -= particle.speed * deltaTime * 10;
            
            // 如果粒子降到底部，重置到顶部
            if (positions[particle.index * 3 + 1] < 0) {
                positions[particle.index * 3 + 1] = Math.random() * 120;
                // 同时随机调整水平位置
                positions[particle.index * 3] = (Math.random() - 0.5) * 400;
                positions[particle.index * 3 + 2] = (Math.random() - 0.5) * 400;
            }
        });
        
        // 更新着色器时间
        this.particleSystem.material.uniforms.time.value = time;
        
        // 标记位置需要更新
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // 更新环境装饰元素
    updateEnvironmentDecorations(deltaTime) {
        const time = Date.now() * 0.001;
        
        // 更新脉冲环
        if (this.pulseRing) {
            if (this.pulseRing.userData.isExpanding) {
                this.pulseRing.scale.x += deltaTime * 0.5;
                this.pulseRing.scale.z += deltaTime * 0.5;
                this.pulseRing.material.opacity -= deltaTime * 0.15;
                
                if (this.pulseRing.scale.x > 10) {
                    this.pulseRing.scale.set(1, 1, 1);
                    this.pulseRing.material.opacity = 0.5;
                }
            }
        }
        
        // 更新全息投影
        if (this.holoDisc) {
            this.holoDisc.material.uniforms.time.value = time;
        }
    }
    
    // 动画循环
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // 更新控制器
        this.controls.update();
        
        // 计算时间增量
        const deltaTime = this.clock.getDelta();
        
        // 更新粒子效果
        this.updateParticles(deltaTime);
        
        // 更新环境装饰动画
        this.updateEnvironmentDecorations(deltaTime);
        
        // 更新设备动画效果
        this.updateDeviceAnimations(deltaTime);
        
        // 更新标签位置
        this.updateLabelPositions();
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }
    
    // 创建3D饼图
    create3DPieChart() {
        // 移除旧的Chart.js饼图
        const oldChart = document.getElementById('status-chart');
        while (oldChart.firstChild) {
            oldChart.removeChild(oldChart.firstChild);
        }
        
        // 创建饼图容器
        const pieChartContainer = document.createElement('div');
        pieChartContainer.style.width = '100%';
        pieChartContainer.style.height = '100%';
        pieChartContainer.style.position = 'relative';
        pieChartContainer.style.display = 'flex';
        pieChartContainer.style.flexDirection = 'column';
        pieChartContainer.style.alignItems = 'center';
        pieChartContainer.style.justifyContent = 'center';
        pieChartContainer.style.padding = '10px';
        pieChartContainer.style.boxSizing = 'border-box';
        oldChart.appendChild(pieChartContainer);
        
        // 获取设备统计数据
        const devices = FACTORY_DATA.generateDevices();
        const stats = getDeviceStatistics(devices);
        
        // 饼图数据
        const data = [
            { name: '运行', value: stats.RUNNING, color: '#4caf50' },
            { name: '待机', value: stats.WAITING, color: '#ffc107' },
            { name: '掉线', value: stats.OFFLINE, color: '#9c27b0' },
            { name: '维修', value: stats.MAINTENANCE, color: '#2196f3' },
            { name: '报警', value: stats.ALARM, color: '#f44336' },
            { name: '停机', value: stats.STOPPED, color: '#9e9e9e' }
        ];
        
        // 计算总量
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        // 测量容器大小
        const containerWidth = pieChartContainer.clientWidth || 230;
        const containerHeight = 200; // 固定高度，为图例留出空间
        
        // 创建SVG饼图，调整为适应容器的大小
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", containerHeight);
        svg.setAttribute("viewBox", `-100 -100 200 200`);
        svg.style.filter = "drop-shadow(0px 0px 8px rgba(0,0,0,0.3))";
        svg.style.display = "block";
        svg.style.maxWidth = "100%";
        
        // 创建饼图组
        const pieGroup = document.createElementNS(svgNS, "g");
        svg.appendChild(pieGroup);
        
        // 设置饼图参数 - 确保饼图在视口内完全显示
        const radius = 80;
        let startAngle = 0;
        
        // 绘制饼图切片
        data.forEach((item, index) => {
            if (item.value <= 0) return; // 跳过数值为0的项
            
            const angle = (item.value / total) * Math.PI * 2;
            const endAngle = startAngle + angle;
            
            // 计算路径
            const x1 = Math.cos(startAngle) * radius;
            const y1 = Math.sin(startAngle) * radius;
            const x2 = Math.cos(endAngle) * radius;
            const y2 = Math.sin(endAngle) * radius;
            
            // 创建大弧标志
            const largeArcFlag = angle > Math.PI ? 1 : 0;
            
            // 构建路径字符串
            const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            // 创建路径元素
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", item.color);
            path.setAttribute("stroke", "#0c121e");
            path.setAttribute("stroke-width", "1");
            path.setAttribute("data-name", item.name);
            path.setAttribute("data-value", item.value);
            
            // 添加3D效果 - 简单的渐变
            const gradientId = `gradient-${index}`;
            const gradient = document.createElementNS(svgNS, "linearGradient");
            gradient.setAttribute("id", gradientId);
            gradient.setAttribute("x1", "0%");
            gradient.setAttribute("y1", "0%");
            gradient.setAttribute("x2", "100%");
            gradient.setAttribute("y2", "100%");
            
            const stop1 = document.createElementNS(svgNS, "stop");
            stop1.setAttribute("offset", "0%");
            stop1.setAttribute("stop-color", item.color);
            stop1.setAttribute("stop-opacity", "1");
            
            const stop2 = document.createElementNS(svgNS, "stop");
            stop2.setAttribute("offset", "100%");
            stop2.setAttribute("stop-color", this.shadeColor(item.color, -20));
            stop2.setAttribute("stop-opacity", "1");
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            
            svg.appendChild(gradient);
            path.setAttribute("fill", `url(#${gradientId})`);
            
            // 为每个扇区添加动画
            const animateTransform = document.createElementNS(svgNS, "animateTransform");
            animateTransform.setAttribute("attributeName", "transform");
            animateTransform.setAttribute("attributeType", "XML");
            animateTransform.setAttribute("type", "scale");
            animateTransform.setAttribute("from", "1 1");
            animateTransform.setAttribute("to", "1.05 1.05");
            animateTransform.setAttribute("begin", "mouseover");
            animateTransform.setAttribute("end", "mouseout");
            animateTransform.setAttribute("dur", "0.3s");
            animateTransform.setAttribute("fill", "freeze");
            path.appendChild(animateTransform);
            
            // 为每个扇区添加提示工具
            path.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'pie-tooltip';
                tooltip.innerHTML = `${item.name}: ${item.value}台 (${Math.round((item.value / total) * 100)}%)`;
                tooltip.style.position = 'absolute';
                tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
                tooltip.style.color = '#fff';
                tooltip.style.padding = '5px 10px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '12px';
                tooltip.style.pointerEvents = 'none';
                tooltip.style.zIndex = '1000';
                tooltip.style.whiteSpace = 'nowrap';
                tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                
                document.body.appendChild(tooltip);
                
                document.addEventListener('mousemove', (e) => {
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY + 10}px`;
                });
                
                path.addEventListener('mouseleave', () => {
                    tooltip.remove();
                }, { once: true });
            });
            
            pieGroup.appendChild(path);
            
            // 添加百分比标签（仅对较大的扇区）
            if (item.value / total > 0.05) { // 降低阈值，显示更多标签
                const midAngle = startAngle + angle / 2;
                const labelRadius = radius * 0.6;
                const labelX = Math.cos(midAngle) * labelRadius;
                const labelY = Math.sin(midAngle) * labelRadius;
                
                const text = document.createElementNS(svgNS, "text");
                text.setAttribute("x", labelX);
                text.setAttribute("y", labelY);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("fill", "#ffffff");
                text.setAttribute("font-size", "14");
                text.setAttribute("font-weight", "bold");
                text.setAttribute("text-shadow", "0 0 3px #000");
                text.textContent = `${item.value}`;
                
                pieGroup.appendChild(text);
            }
            
            startAngle = endAngle;
        });
        
        // 添加中心圆
        const centerCircle = document.createElementNS(svgNS, "circle");
        centerCircle.setAttribute("cx", "0");
        centerCircle.setAttribute("cy", "0");
        centerCircle.setAttribute("r", radius * 0.3);
        centerCircle.setAttribute("fill", "#0c121e");
        centerCircle.setAttribute("stroke", "#4cebff");
        centerCircle.setAttribute("stroke-width", "2");
        pieGroup.appendChild(centerCircle);
        
        // 添加总数文本
        const totalText = document.createElementNS(svgNS, "text");
        totalText.setAttribute("x", "0");
        totalText.setAttribute("y", "-5");
        totalText.setAttribute("text-anchor", "middle");
        totalText.setAttribute("fill", "#ffffff");
        totalText.setAttribute("font-size", "18");
        totalText.setAttribute("font-weight", "bold");
        totalText.textContent = total;
        pieGroup.appendChild(totalText);
        
        // 添加"设备"文本
        const deviceText = document.createElementNS(svgNS, "text");
        deviceText.setAttribute("x", "0");
        deviceText.setAttribute("y", "15");
        deviceText.setAttribute("text-anchor", "middle");
        deviceText.setAttribute("fill", "#88ddff");
        deviceText.setAttribute("font-size", "12");
        deviceText.textContent = "设备";
        pieGroup.appendChild(deviceText);
        
        // 添加简洁的动画效果 - 整体旋转
        const animateGroup = document.createElementNS(svgNS, "animateTransform");
        animateGroup.setAttribute("attributeName", "transform");
        animateGroup.setAttribute("attributeType", "XML");
        animateGroup.setAttribute("type", "rotate");
        animateGroup.setAttribute("from", "0 0 0");
        animateGroup.setAttribute("to", "360 0 0");
        animateGroup.setAttribute("dur", "60s");
        animateGroup.setAttribute("repeatCount", "indefinite");
        pieGroup.appendChild(animateGroup);
        
        // 将SVG添加到容器
        pieChartContainer.appendChild(svg);
        
        // 创建图例 - 采用网格布局使其更紧凑
        const legendContainer = document.createElement('div');
        legendContainer.style.display = 'grid';
        legendContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        legendContainer.style.gap = '5px';
        legendContainer.style.marginTop = '10px';
        legendContainer.style.width = '100%';
        legendContainer.style.justifyItems = 'center';
        
        data.forEach(item => {
            if (item.value <= 0) return; // 跳过数值为0的项
            
            const legendItem = document.createElement('div');
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            
            const colorBox = document.createElement('span');
            colorBox.style.display = 'inline-block';
            colorBox.style.width = '10px';
            colorBox.style.height = '10px';
            colorBox.style.backgroundColor = item.color;
            colorBox.style.marginRight = '4px';
            colorBox.style.borderRadius = '2px';
            colorBox.style.boxShadow = '0 0 2px rgba(0,0,0,0.3)';
            
            const textSpan = document.createElement('span');
            textSpan.style.fontSize = '11px';
            textSpan.style.color = '#ffffff';
            textSpan.style.whiteSpace = 'nowrap';
            textSpan.textContent = `${item.name}:${item.value}`;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(textSpan);
            legendContainer.appendChild(legendItem);
        });
        
        pieChartContainer.appendChild(legendContainer);
    }
    
    // 辅助函数 - 调整颜色明暗
    shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }
    
    // 创建HTML区域标签
    createAreaLabels() {
        // 移除旧的标签容器
        const oldContainer = document.getElementById('area-labels-container');
        if (oldContainer) {
            oldContainer.remove();
        }
        
        // 创建标签容器
        const container = document.createElement('div');
        container.id = 'area-labels-container';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '2';
        document.querySelector('.visualization-container').appendChild(container);
        
        // 为每个区域创建标签
        FACTORY_DATA.areas.forEach(areaData => {
            const label = document.createElement('div');
            label.className = 'area-label';
            label.textContent = areaData.name;
            label.style.position = 'absolute';
            label.style.padding = '5px 10px';
            label.style.backgroundColor = 'rgba(30, 50, 74, 0.7)';
            label.style.color = '#4cebff';
            label.style.fontWeight = 'bold';
            label.style.borderRadius = '5px';
            label.style.textShadow = '0 0 8px rgba(76, 235, 255, 0.8)';
            label.style.boxShadow = '0 0 15px rgba(76, 235, 255, 0.5)';
            label.style.userSelect = 'none';
            label.style.border = '1px solid rgba(76, 235, 255, 0.5)';
            label.style.transition = 'transform 0.3s ease';
            
            // 添加动画效果
            const glowKeyframes = `
                @keyframes glow-${areaData.id} {
                    0% { box-shadow: 0 0 10px rgba(76, 235, 255, 0.3); }
                    50% { box-shadow: 0 0 20px rgba(76, 235, 255, 0.7); }
                    100% { box-shadow: 0 0 10px rgba(76, 235, 255, 0.3); }
                }
            `;
            
            const style = document.createElement('style');
            style.textContent = glowKeyframes;
            document.head.appendChild(style);
            
            label.style.animation = `glow-${areaData.id} 3s infinite`;
            
            // 将标签添加到DOM
            container.appendChild(label);
            
            // 存储标签引用
            this.areaLabels[areaData.id] = label;
        });
        
        // 初始更新标签位置
        this.updateLabelPositions();
    }
    
    // 更新标签位置
    updateLabelPositions() {
        const width = this.renderer.domElement.clientWidth;
        const height = this.renderer.domElement.clientHeight;
        
        // 更新每个区域标签的位置
        FACTORY_DATA.areas.forEach(areaData => {
            const label = this.areaLabels[areaData.id];
            if (!label) return;
            
            // 计算3D空间中标签位置
            const position = new THREE.Vector3(
                areaData.position.x,
                areaData.position.y + 12, // 在区域上方12单位
                areaData.position.z
            );
            
            // 将3D位置投影到屏幕坐标
            position.project(this.camera);
            
            // 转换为CSS像素坐标
            const x = (position.x * 0.5 + 0.5) * width;
            const y = (-position.y * 0.5 + 0.5) * height;
            
            // 设置标签位置，仅当在视野内时显示
            if (position.z < 1) {
                label.style.display = 'block';
                label.style.transform = `translate(-50%, -50%) scale(1)`;
                label.style.left = `${x}px`;
                label.style.top = `${y}px`;
                
                // 根据距离调整大小
                const distance = this.camera.position.distanceTo(
                    new THREE.Vector3(areaData.position.x, areaData.position.y, areaData.position.z)
                );
                const scale = Math.max(1.0, Math.min(2.0, 120 / distance));
                label.style.fontSize = `${16 * scale}px`;
                
                // 添加鼠标悬停效果
                label.onmouseover = () => {
                    label.style.transform = `translate(-50%, -50%) scale(1.1)`;
                    label.style.boxShadow = '0 0 25px rgba(76, 235, 255, 0.8)';
                };
                
                label.onmouseout = () => {
                    label.style.transform = `translate(-50%, -50%) scale(1)`;
                    label.style.boxShadow = '0 0 15px rgba(76, 235, 255, 0.5)';
                };
            } else {
                label.style.display = 'none';
            }
        });
    }
    
    // 创建区域
    createAreas() {
        FACTORY_DATA.areas.forEach(areaData => {
            // 创建区域平面
            const geometry = new THREE.BoxGeometry(
                areaData.size.width, 
                areaData.size.height, 
                areaData.size.depth
            );
            
            const material = new THREE.MeshBasicMaterial({
                color: areaData.color,
                transparent: true,
                opacity: areaData.opacity,
                wireframe: false
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(areaData.position.x, areaData.position.y, areaData.position.z);
            
            // 添加边框
            const edges = new THREE.EdgesGeometry(geometry);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4cebff });
            const wireframe = new THREE.LineSegments(edges, lineMaterial);
            mesh.add(wireframe);
            
            this.scene.add(mesh);
            this.areaObjects[areaData.id] = mesh;
        });
    }
    
    // 创建设备
    createDevices() {
        const devices = FACTORY_DATA.generateDevices();
        
        devices.forEach(deviceData => {
            // 所有设备使用统一的温度设备样式
            const mesh = this.createTemperatureDevice(deviceData);
            
            // 设置位置
            mesh.position.set(
                deviceData.position.x, 
                deviceData.position.y + 2, // 放置在平面上
                deviceData.position.z
            );
            
            // 存储设备关联数据
            mesh.userData = deviceData;
            
            this.scene.add(mesh);
            this.deviceObjects[deviceData.id] = mesh;
        });
    }
    
    // 创建温度测试设备
    createTemperatureDevice(deviceData) {
        const group = new THREE.Group();
        
        // 主体
        const deviceColor = FACTORY_DATA.deviceStatuses[deviceData.status].color;
        const size = FACTORY_DATA.deviceTypes[deviceData.type].size;
        
        const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
        const material = new THREE.MeshPhongMaterial({ 
            color: deviceColor,
            specular: 0x333333,
            shininess: 30
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        
        // 添加科技感面板，替换原来的灰色面板
        const detailGeometry = new THREE.BoxGeometry(size.width * 0.8, size.height * 0.3, size.depth * 0.2);
        
        // 科技感材质 - 使用辉光材质
        const detailMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00aaff,
            emissive: 0x00aaff,
            emissiveIntensity: 0.5,
            specular: 0xffffff,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        
        const detailMesh = new THREE.Mesh(detailGeometry, detailMaterial);
        detailMesh.position.set(0, size.height * 0.5, size.depth * 0.3);
        
        // 添加脉冲动画属性
        detailMesh.userData.isPulsing = true;
        
        group.add(detailMesh);
        
        return group;
    }
    
    // 窗口大小调整
    onWindowResize() {
        const container = document.querySelector('.visualization-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        // 更新标签位置
        this.updateLabelPositions();
    }
    
    // 鼠标点击处理
    onMouseClick(event) {
        // 计算鼠标在归一化设备坐标中的位置
        const container = document.querySelector('.visualization-container');
        const rect = container.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        // 设置射线的起点和方向
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // 计算物体和射线的交点
        const deviceMeshes = Object.values(this.deviceObjects);
        const intersects = this.raycaster.intersectObjects(deviceMeshes, true);
        
        if (intersects.length > 0) {
            // 找到包含userData的父对象
            let targetObj = intersects[0].object;
            while (targetObj && !targetObj.userData?.id) {
                targetObj = targetObj.parent;
            }
            
            if (targetObj && targetObj.userData) {
                this.selectDevice(targetObj);
            }
        } else {
            this.deselectDevice();
        }
    }
    
    // 鼠标移动处理
    onMouseMove(event) {
        // 计算鼠标在归一化设备坐标中的位置
        const container = document.querySelector('.visualization-container');
        const rect = container.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        // 设置射线的起点和方向
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // 计算物体和射线的交点
        const deviceMeshes = Object.values(this.deviceObjects);
        const intersects = this.raycaster.intersectObjects(deviceMeshes, true);
        
        // 鼠标悬停效果
        this.renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    }
    
    // 选择设备
    selectDevice(deviceMesh) {
        // 恢复之前选择的设备外观
        if (this.selectedDevice) {
            this.deselectDevice();
        }
        
        // 设置新选择的设备
        this.selectedDevice = deviceMesh;
        const deviceData = deviceMesh.userData;
        
        // 修改外观以显示选择状态
        deviceMesh.userData.selected = true;
        
        // 创建高亮轮廓
        const geometry = deviceMesh.children[0].geometry.clone();
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.5
        });
        
        const highlight = new THREE.Mesh(geometry, material);
        highlight.scale.multiplyScalar(1.1);
        highlight.position.copy(deviceMesh.children[0].position);
        deviceMesh.add(highlight);
        deviceMesh.userData.highlight = highlight;
        
        // 更新设备详情面板
        updateDeviceDetails(deviceData);
        
        // 高亮表格中对应的行
        highlightTableRow(deviceData.id);
    }
    
    // 取消选择设备
    deselectDevice() {
        if (this.selectedDevice) {
            // 移除高亮效果
            if (this.selectedDevice.userData.highlight) {
                this.selectedDevice.remove(this.selectedDevice.userData.highlight);
                this.selectedDevice.userData.highlight = null;
            }
            
            this.selectedDevice.userData.selected = false;
            this.selectedDevice = null;
            
            // 清除设备详情面板
            clearDeviceDetails();
            
            // 清除表格高亮
            clearTableHighlight();
        }
    }
    
    // 更新设备状态
    updateDeviceStatus(deviceId, newStatus) {
        const deviceMesh = this.deviceObjects[deviceId];
        if (deviceMesh) {
            // 更新数据
            deviceMesh.userData.status = newStatus;
            
            // 更新材质颜色
            const newColor = FACTORY_DATA.deviceStatuses[newStatus].color;
            deviceMesh.children[0].material.color.setHex(newColor);
            
            // 如果设备是被选中状态，更新详情
            if (deviceMesh.userData.selected) {
                updateDeviceDetails(deviceMesh.userData);
            }
        }
    }
    
    // 更新设备动画效果
    updateDeviceAnimations(deltaTime) {
        const time = Date.now() * 0.001;
        
        Object.values(this.deviceObjects).forEach(device => {
            // 根据设备状态添加不同的动画效果
            const status = device.userData.status;
            
            // 运行状态 - 添加轻微脉动
            if (status === 'RUNNING') {
                const scale = 1 + Math.sin(time * 2) * 0.02;
                device.scale.set(1, scale, 1);
                
                // 更新科技感面板颜色 - 脉动颜色效果
                device.children.forEach(child => {
                    if (child.userData && child.userData.isPulsing) {
                        // 颜色从蓝色到青色脉动
                        const hue = (Math.sin(time * 2) * 0.1) + 0.5; // 0.4-0.6范围内的色相
                        const color = new THREE.Color().setHSL(hue, 1, 0.5);
                        
                        child.material.color.copy(color);
                        child.material.emissive.copy(color);
                        child.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
                    }
                });
            }
            
            // 报警状态 - 添加闪烁效果
            else if (status === 'ALARM') {
                const intensity = (Math.sin(time * 5) + 1) / 2;
                device.children[0].material.emissiveIntensity = intensity;
                device.rotation.y += 0.01;
            }
        });
    }
}

// 添加设备到表格
function addDeviceToTable(deviceData) {
    const tbody = document.querySelector('#device-table tbody');
    const row = document.createElement('tr');
    row.id = `device-row-${deviceData.id}`;
    
    // 设备编号列
    const idCell = document.createElement('td');
    idCell.textContent = deviceData.id;
    row.appendChild(idCell);
    
    // 设备名称列
    const nameCell = document.createElement('td');
    nameCell.textContent = deviceData.name;
    row.appendChild(nameCell);
    
    // 设备状态列
    const statusCell = document.createElement('td');
    const statusCode = FACTORY_DATA.deviceStatuses[deviceData.status].code;
    const statusName = FACTORY_DATA.deviceStatuses[deviceData.status].name;
    
    const statusSpan = document.createElement('span');
    statusSpan.className = `status-icon ${statusCode}`;
    statusCell.appendChild(statusSpan);
    statusCell.appendChild(document.createTextNode(` ${statusName}`));
    row.appendChild(statusCell);
    
    // 放置区域列
    const areaCell = document.createElement('td');
    const areaInfo = FACTORY_DATA.areas.find(area => area.id === deviceData.area);
    areaCell.textContent = areaInfo ? areaInfo.name : deviceData.area;
    row.appendChild(areaCell);
    
    tbody.appendChild(row);
}

// 高亮表格行
function highlightTableRow(deviceId) {
    clearTableHighlight();
    const row = document.getElementById(`device-row-${deviceId}`);
    if (row) {
        row.classList.add('selected');
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 清除表格高亮
function clearTableHighlight() {
    const selectedRows = document.querySelectorAll('#device-table tbody tr.selected');
    selectedRows.forEach(row => row.classList.remove('selected'));
}

// 更新设备详情
function updateDeviceDetails(deviceData) {
    // 可以在这里添加代码显示设备详情面板
    console.log('设备详情:', deviceData);
}

// 清除设备详情
function clearDeviceDetails() {
    // 可以在这里添加代码清除设备详情面板
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

// 此方法不再使用，由create3DPieChart替代
function updateStatusChart(stats) {
    // 此方法保留但不再使用
} 