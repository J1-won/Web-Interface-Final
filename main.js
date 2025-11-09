// Three.js 모듈 import
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 전역 변수
let scene, camera, renderer, controls;
let earthModel = null;

// Scene 초기화
function init() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) {
        console.error('canvas-container element not found');
        return;
    }
    // Scene 생성
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);

    // Camera 설정
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 5);

    // Renderer 설정
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    // OrbitControls 설정 (드래그, 줌)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // earth.glb 모델 로드
    loadEarthModel();

    // 윈도우 리사이즈 이벤트
    window.addEventListener('resize', onWindowResize);

    // 애니메이션 시작
    animate();
}

// earth.glb 모델 로드
function loadEarthModel() {
    const loader = new GLTFLoader();
    
    // 로딩 상태 표시
    updateLoadingStatus('Loading earth.glb...');
    
    loader.load(
        './earth.glb',
        (gltf) => {
            earthModel = gltf.scene;
            scene.add(earthModel);
            
            // 모델 크기 조정
            const box = new THREE.Box3().setFromObject(earthModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // 모델을 원점으로 이동
            earthModel.position.x = -center.x;
            earthModel.position.y = -center.y;
            earthModel.position.z = -center.z;
            
            // 적절한 크기로 스케일 조정
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            earthModel.scale.multiplyScalar(scale);
            
            console.log('Earth model loaded successfully', { center, size, scale });
            updateLoadingStatus('Earth loaded!');
            
            // 2초 후 로딩 메시지 숨기기
            setTimeout(() => {
                updateLoadingStatus('');
            }, 2000);
        },
        (progress) => {
            // 로딩 진행 상황
            if (progress.total > 0) {
                const percent = (progress.loaded / progress.total * 100).toFixed(1);
                updateLoadingStatus(`Loading: ${percent}%`);
                console.log(`Loading: ${percent}%`);
            }
        },
        (error) => {
            console.error('Error loading earth.glb:', error);
            updateLoadingStatus('Error loading model. Check console for details.');
            
            // CORS 에러 체크
            if (error.message && error.message.includes('CORS')) {
                updateLoadingStatus('CORS Error: Please use a local server (e.g., python -m http.server)');
            } else if (error.message && error.message.includes('404')) {
                updateLoadingStatus('File not found: earth.glb');
            } else {
                updateLoadingStatus(`Error: ${error.message || 'Unknown error'}`);
            }
        }
    );
}

// 로딩 상태 업데이트 함수
function updateLoadingStatus(message) {
    const info = document.getElementById('info');
    if (info) {
        const statusEl = info.querySelector('#loading-status') || document.createElement('p');
        statusEl.id = 'loading-status';
        statusEl.style.color = message.includes('Error') ? '#ff6b6b' : '#4ecdc4';
        statusEl.style.marginTop = '8px';
        statusEl.style.fontSize = '12px';
        statusEl.textContent = message;
        if (!info.querySelector('#loading-status')) {
            info.appendChild(statusEl);
        }
    }
}

// 윈도우 리사이즈 핸들러
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    // OrbitControls 업데이트
    controls.update();
    
    // 지구 회전 (선택사항)
    if (earthModel) {
        earthModel.rotation.y += 0.001;
    }
    
    renderer.render(scene, camera);
}

// DOM이 로드된 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

