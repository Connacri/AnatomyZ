import React, { useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Compass,
  ZoomIn,
  ZoomOut,
  Move,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';
import { EntityData } from '../types';
import { AnatomyCatalogRepository } from '../data/repositories';
import { useAppPreferences } from '../i18n';

const catalogRepo = new AnatomyCatalogRepository();
const structureNameLookup = new Map<string, { fr: string; en: string }>();
catalogRepo.all.forEach((s) => {
  [s.nameEn, s.nameFr, ...(s.synonymsEn || []), ...(s.synonymsFr || [])].forEach(
    (key) => {
      structureNameLookup.set(key.toLowerCase().trim(), {
        fr: s.nameFr,
        en: s.nameEn,
      });
    }
  );
});

function lookupBilingualName(name: string): { fr: string; en: string } {
  const hit = structureNameLookup.get(name.toLowerCase().trim());
  if (hit) return hit;
  const loose = Array.from(structureNameLookup.keys()).find(
    (k) =>
      k.includes(name.toLowerCase()) || name.toLowerCase().includes(k)
  );
  return loose
    ? structureNameLookup.get(loose)!
    : { fr: name, en: name };
}

export interface Interactive3DControllerHandle {
  clearSelections: () => void;
  resetAllMaterialOverrides: () => void;
  setCameraZoomLevel: (factor: number) => void;
  setPartVisibility: (name: string, visible: boolean) => void;
  setEntityTransparency: (name: string) => void;
  resetEntityMaterial: (name: string) => void;
  selectByName: (name: string) => void;
  pan: (deltaX: number, deltaY: number) => void;
  rotate: (deltaAzimuth: number, deltaPolar: number) => void;
  flip180: () => void;
  flipVertical: () => void;
  resetView: () => void;
  setViewPreset: (preset: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom') => void;
}

interface Interactive3DViewerProps {
  modelUrl: string;
  preselectedEntityName?: string | null;
  selectionColor?: [number, number, number, number];
  onSelectionChanged?: (entities: EntityData[]) => void;
  controllerRef?: React.Ref<Interactive3DControllerHandle>;
  heightClass?: string;
}

export const Interactive3DViewer: React.FC<Interactive3DViewerProps> = ({
  modelUrl,
  preselectedEntityName,
  selectionColor = [0.15, 0.65, 1.0, 1.0],
  onSelectionChanged,
  controllerRef,
  heightClass = 'h-full min-h-[360px] sm:min-h-[480px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [availableNodes, setAvailableNodes] = useState<string[]>([]);
  const [nodeFilter, setNodeFilter] = useState<string>('');
  const [activeNodeName, setActiveNodeName] = useState<string | null>(null);
  const [nodesTrayOpen, setNodesTrayOpen] = useState<boolean>(false);
  const { lang, t } = useAppPreferences();
  const [showControlsPad, setShowControlsPad] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('front');
  const [interactionMode, setInteractionMode] = useState<'rotate' | 'pan'>(
    'rotate'
  );
  const [selectedBilingual, setSelectedBilingual] = useState<{
    fr: string;
    en: string;
  } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());
  const originalMaterialsRef = useRef<
    Map<string, THREE.Material | THREE.Material[]>
  >(new Map());
  const activeNodeRef = useRef<string | null>(null);

  const defaultTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const defaultCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const modelRadiusRef = useRef<number>(1);

  const applyHighlightMaterial = (name: string) => {
    const meshes = meshesMapRef.current.get(name);
    if (!meshes) return;
    const [r, g, b] = selectionColor;
    meshes.forEach((mesh) => {
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(r, g, b),
        roughness: 0.45,
        metalness: 0.1,
        emissive: new THREE.Color(r * 0.25, g * 0.25, b * 0.25),
        side: THREE.DoubleSide,
      });
    });
  };

  const restoreMaterialFor = (name: string) => {
    const meshes = meshesMapRef.current.get(name);
    if (!meshes) return;
    meshes.forEach((mesh) => {
      const orig = originalMaterialsRef.current.get(mesh.uuid);
      if (orig) {
        mesh.material = orig;
      }
      mesh.visible = true;
    });
  };

  const focusCameraOnMeshes = (meshes: THREE.Mesh[]) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || meshes.length === 0) return;

    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
    controls.update();
  };

  const selectNode = (name: string | null, focusCamera = false) => {
    const prevName = activeNodeRef.current;
    if (prevName && prevName !== name) {
      const prevMeshes = meshesMapRef.current.get(prevName);
      if (prevMeshes) {
        prevMeshes.forEach((mesh) => {
          const orig = originalMaterialsRef.current.get(mesh.uuid);
          const currentMat = mesh.material as THREE.Material;
          if (orig && !currentMat.transparent) {
            mesh.material = orig;
          }
        });
      }
    }

    activeNodeRef.current = name;
    setActiveNodeName(name);
    setSelectedBilingual(name ? lookupBilingualName(name) : null);
    if (name) {
      applyHighlightMaterial(name);
      if (focusCamera) {
        const meshes = meshesMapRef.current.get(name);
        if (meshes) focusCameraOnMeshes(meshes);
      }
      onSelectionChanged?.([{ id: name, name }]);
    } else {
      onSelectionChanged?.([]);
    }
  };

  // Pan / translate camera & target in screen-space
  const panCamera = useCallback((deltaX: number, deltaY: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const factor = modelRadiusRef.current * 0.15;
    const vRight = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(deltaX * factor);
    const vUp = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(deltaY * factor);

    camera.position.add(vRight).add(vUp);
    controls.target.add(vRight).add(vUp);
    controls.update();
  }, []);

  // Rotate camera around current target in 3D
  const rotateCamera = useCallback((deltaAzimuth: number, deltaPolar: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta += deltaAzimuth;
    spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi + deltaPolar));

    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
    controls.update();
  }, []);

  // Flip 180 degrees horizontally (opposite view)
  const flip180 = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    // Rotate 180 degrees around world Y
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
    controls.update();
  }, []);

  // Flip vertically (upside down / return)
  const flipVertical = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.phi = Math.PI - spherical.phi;
    spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));
    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
    controls.update();
  }, []);

  // Anatomical view presets
  const setViewPreset = useCallback((preset: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setActivePreset(preset);
    const target = controls.target;
    const dist = camera.position.distanceTo(target) || modelRadiusRef.current * 1.5;

    switch (preset) {
      case 'front':
        camera.position.set(target.x, target.y, target.z + dist);
        camera.up.set(0, 1, 0);
        break;
      case 'back':
        camera.position.set(target.x, target.y, target.z - dist);
        camera.up.set(0, 1, 0);
        break;
      case 'left':
        camera.position.set(target.x - dist, target.y, target.z);
        camera.up.set(0, 1, 0);
        break;
      case 'right':
        camera.position.set(target.x + dist, target.y, target.z);
        camera.up.set(0, 1, 0);
        break;
      case 'top':
        camera.position.set(target.x, target.y + dist, target.z + 0.0001);
        camera.up.set(0, 0, -1);
        break;
      case 'bottom':
        camera.position.set(target.x, target.y - dist, target.z + 0.0001);
        camera.up.set(0, 0, 1);
        break;
    }
    camera.lookAt(target);
    controls.update();
  }, []);

  // Zoom factor
  const zoomCamera = useCallback((factor: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const dir = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .multiplyScalar(factor);
    camera.position.copy(controls.target).add(dir);
    controls.update();
  }, []);

  // Complete reset to initial view
  const resetView = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    controls.target.copy(defaultTargetRef.current);
    camera.position.copy(defaultCameraPosRef.current);
    camera.up.set(0, 1, 0);
    camera.lookAt(controls.target);
    controls.update();
    setActivePreset('front');
  }, []);

  useImperativeHandle(controllerRef, () => ({
    clearSelections: () => {
      selectNode(null);
    },
    resetAllMaterialOverrides: () => {
      meshesMapRef.current.forEach((meshes) => {
        meshes.forEach((mesh) => {
          const orig = originalMaterialsRef.current.get(mesh.uuid);
          if (orig) mesh.material = orig;
          mesh.visible = true;
        });
      });
      activeNodeRef.current = null;
      setActiveNodeName(null);
    },
    setCameraZoomLevel: (factor: number) => {
      zoomCamera(1 / factor);
    },
    setPartVisibility: (name: string, visible: boolean) => {
      const meshes = meshesMapRef.current.get(name);
      if (!meshes) return;
      meshes.forEach((mesh) => {
        mesh.visible = visible;
      });
    },
    setEntityTransparency: (name: string) => {
      const meshes = meshesMapRef.current.get(name);
      if (!meshes) return;
      meshes.forEach((mesh) => {
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.15, 0.65, 1.0),
          roughness: 0.7,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
      });
    },
    resetEntityMaterial: (name: string) => {
      restoreMaterialFor(name);
    },
    selectByName: (name: string) => {
      selectNode(name, true);
    },
    pan: (deltaX: number, deltaY: number) => panCamera(deltaX, deltaY),
    rotate: (deltaAzimuth: number, deltaPolar: number) => rotateCamera(deltaAzimuth, deltaPolar),
    flip180: () => flip180(),
    flipVertical: () => flipVertical(),
    resetView: () => resetView(),
    setViewPreset: (preset) => setViewPreset(preset),
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setLoadProgress(0);
    setLoadError(null);
    setActiveNodeName(null);
    activeNodeRef.current = null;
    meshesMapRef.current.clear();
    originalMaterialsRef.current.clear();

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 3000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // OrbitControls with full 360 freedom in all directions
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.75;
    controls.zoomSpeed = 0.45;
    controls.panSpeed = 0.7;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.screenSpacePanning = true; // Pan up/down/left/right in screen plane
    controls.minPolarAngle = 0; // Allow looking from straight top
    controls.maxPolarAngle = Math.PI; // Allow looking from straight bottom and full vertical inversion
    controls.minAzimuthAngle = -Infinity; // Full 360 degree azimuthal rotation
    controls.maxAzimuthAngle = Infinity;

    // Mouse bindings: Left = Rotate, Right = Pan, Wheel = Zoom
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };

    // Touch bindings: 1 finger = Rotate, 2 fingers = Pan & Pinch Zoom
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // Three-point studio anatomical lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    fillLight.position.set(-4, 3, -4);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xe2e8f0, 0.8);
    backLight.position.set(0, -4, -3);
    scene.add(backLight);

    let isDisposed = false;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'
    );
    dracoLoader.setDecoderConfig({ type: 'wasm' });

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      modelUrl,
      (gltf) => {
        if (isDisposed) return;
        const root = gltf.scene;
        scene.add(root);

        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        modelRadiusRef.current = maxDim;

        controls.target.copy(center);
        defaultTargetRef.current.copy(center);

        const fovRad = (camera.fov * Math.PI) / 180;
        const aspect = (container.clientWidth || 360) / (container.clientHeight || 420);
        const fitMultiplier = aspect < 0.8 ? 1.35 : 1.15;
        const cameraDist = (maxDim / (2 * Math.tan(fovRad / 2))) * fitMultiplier;

        camera.near = Math.max(0.001, maxDim / 1000);
        camera.far = maxDim * 100;
        camera.position.set(
          center.x,
          center.y + maxDim * 0.05,
          center.z + cameraDist
        );
        defaultCameraPosRef.current.copy(camera.position);
        camera.updateProjectionMatrix();

        controls.minDistance = maxDim * 0.03;
        controls.maxDistance = maxDim * 8;
        controls.update();

        const namesSet = new Set<string>();
        let partCounter = 1;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            let curr: THREE.Object3D | null = mesh;
            let resolvedName = '';
            while (curr && curr !== root) {
              if (
                curr.name &&
                !curr.name.startsWith('Mesh') &&
                !curr.name.startsWith('Primitive') &&
                !curr.name.startsWith('Object_')
              ) {
                resolvedName = curr.name;
                break;
              }
              curr = curr.parent;
            }
            if (!resolvedName) {
              resolvedName =
                mesh.name ||
                mesh.parent?.name ||
                `Structure_${partCounter++}`;
            }

            mesh.userData.anatomicalName = resolvedName;
            namesSet.add(resolvedName);
            originalMaterialsRef.current.set(
              mesh.uuid,
              Array.isArray(mesh.material)
                ? mesh.material.map((m) => m.clone())
                : mesh.material.clone()
            );
            const list = meshesMapRef.current.get(resolvedName) || [];
            list.push(mesh);
            meshesMapRef.current.set(resolvedName, list);
          }
        });

        const sortedNodes = Array.from(namesSet).sort((a, b) =>
          a.localeCompare(b)
        );
        setAvailableNodes(sortedNodes);
        setLoading(false);

        if (preselectedEntityName) {
          const targetLower = preselectedEntityName.toLowerCase();
          const exact =
            sortedNodes.find((n) => n.toLowerCase() === targetLower) ||
            sortedNodes.find((n) => n.toLowerCase().includes(targetLower));
          if (exact) {
            selectNode(exact, true);
          }
        }
      },
      (event) => {
        if (isDisposed) return;
        if (event.total > 0) {
          setLoadProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
      (err) => {
        if (isDisposed) return;
        console.error('GLB load error:', err);
        setLoadError(
          `Impossible de charger le modèle 3D (${modelUrl.split('/').pop()}).`
        );
        setLoading(false);
      }
    );

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 8) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const visibleMeshes: THREE.Mesh[] = [];
      meshesMapRef.current.forEach((list) => {
        list.forEach((m) => {
          if (m.visible) visibleMeshes.push(m);
        });
      });

      const intersects = raycaster.intersectObjects(visibleMeshes, false);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const name = hitMesh.userData.anatomicalName || hitMesh.name;
        if (name) {
          selectNode(name, false);
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', handlePointerDown);
    domElem.addEventListener('pointerup', handlePointerUp);

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || 360;
      const h = containerRef.current.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', updateDimensions);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      domElem.removeEventListener('pointerup', handlePointerUp);
      dracoLoader.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, [modelUrl, preselectedEntityName]);

  // Switch the primary drag between 3D rotation and 2D panning
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (interactionMode === 'pan') {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controls.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    } else {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    }
    controls.update();
  }, [interactionMode, modelUrl]);

  const filteredNodes = nodeFilter.trim()
    ? availableNodes.filter((n) =>
        n.toLowerCase().includes(nodeFilter.trim().toLowerCase())
      )
    : availableNodes;

  return (
    <div
      className={`relative w-full ${heightClass} bg-[#06090e] overflow-hidden select-none touch-none`}
    >
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#06090e]/85 backdrop-blur-xs z-10 px-4">
          <div className="w-10 h-10 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-[#eef4ff] text-center tabular-nums">
            Chargement du modèle anatomique 3D…{' '}
            {loadProgress > 0 ? `${loadProgress}%` : ''}
          </p>
          <p className="text-xs text-[#71839b] mt-1 max-w-xs sm:max-w-md text-center truncate">
            {modelUrl.split('/').pop()}
          </p>
        </div>
      )}

      {loadError && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#06090e]/90 p-6 text-center z-10">
          <p className="text-sm font-semibold text-rose-400 mb-2">
            {loadError}
          </p>
          <p className="text-xs text-[#71839b] max-w-md">
            Aucune géométrie 3D fictive n’est générée conformément à la
            politique AnatomyZ. Vérifiez votre connexion réseau.
          </p>
        </div>
      )}

      {/* Top-Left Clinical Anatomical Orientation Gizmo */}
      {!loading && !loadError && (
        <div className="absolute top-3 left-3 z-20 pointer-events-auto flex items-center gap-2">
          <div className="px-2.5 py-1.5 rounded-xl bg-[#1E242C]/90 backdrop-blur-md border border-[#323B46] shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-[#DACBA9] tracking-wide">
              {lang === 'en' ? '3D ATLAS' : 'ATLAS 3D'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#15191E] border border-[#323B46] text-[#FAF6F0] font-mono uppercase">
              {activePreset === 'front'
                ? lang === 'en'
                  ? 'Anterior (Front)'
                  : 'Antérieur (Face)'
                : activePreset === 'back'
                ? lang === 'en'
                  ? 'Posterior (Back)'
                  : 'Postérieur (Dos)'
                : activePreset === 'left'
                ? lang === 'en'
                  ? 'Left Lateral'
                  : 'Latéral Gauche'
                : activePreset === 'right'
                ? lang === 'en'
                  ? 'Right Lateral'
                  : 'Latéral Droit'
                : activePreset === 'top'
                ? lang === 'en'
                  ? 'Superior (Cranial)'
                  : 'Supérieur (Crânial)'
                : lang === 'en'
                ? 'Inferior (Caudal)'
                : 'Inférieur (Caudal)'}
            </span>
          </div>
        </div>
      )}

      {/* Floating 3D Navigation Controls Dock (Haut, Bas, Gauche, Droite, Tourner & Retourner dans tous les sens) */}
      {!loading && !loadError && (
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2 pointer-events-auto">
          {/* Toggle button for controls dock */}
          <button
            type="button"
            onClick={() => setShowControlsPad((v) => !v)}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#1E242C]/95 backdrop-blur-md border border-[#323B46] hover:border-[#DACBA9] text-xs font-semibold text-[#DACBA9] hover:text-[#FAF6F0] shadow-xl flex items-center gap-1.5 transition cursor-pointer"
            title={lang === 'en' ? 'Toggle 3D Controls' : 'Afficher / Masquer la manette 3D'}
          >
            <Compass className="w-4 h-4 text-[#DACBA9]" />
            <span className="hidden sm:inline">{lang === 'en' ? '3D Controls' : 'Commandes 3D'}</span>
            <span className="text-[10px] text-[#8F9CAE]">{showControlsPad ? '▲' : '▼'}</span>
          </button>

          {showControlsPad && (
            <div className="p-3 rounded-2xl bg-[#1E242C]/95 backdrop-blur-md border border-[#323B46] shadow-2xl space-y-2.5 w-64 text-[#FAF6F0] text-xs animate-in fade-in zoom-in-95 duration-200">
              {/* Interaction mode: 3D rotate vs 2D pan */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setInteractionMode('rotate')}
                  className={`min-h-[40px] py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    interactionMode === 'rotate'
                      ? 'bg-[#DACBA9] text-[#15191E] border-[#DACBA9] shadow-sm'
                      : 'bg-[#15191E] text-[#BAC3CE] border-[#323B46] hover:text-[#FAF6F0]'
                  }`}
                  title={lang === 'en' ? '3D Rotation mode (drag to rotate)' : 'Mode rotation 3D (glisser pour tourner)'}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Rotate' : 'Rotation'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInteractionMode('pan')}
                  className={`min-h-[40px] py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    interactionMode === 'pan'
                      ? 'bg-[#DACBA9] text-[#15191E] border-[#DACBA9] shadow-sm'
                      : 'bg-[#15191E] text-[#BAC3CE] border-[#323B46] hover:text-[#FAF6F0]'
                  }`}
                  title={lang === 'en' ? '2D Pan mode (drag to pan view)' : 'Mode déplacement 2D (glisser pour paner la vue)'}
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Pan 2D' : 'Déplacer 2D'}</span>
                </button>
              </div>

              {/* 1. Translation / Pan: Haut, Bas, Gauche, Droite */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#DACBA9]">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3 text-[#DACBA9]" />
                    <span>{lang === 'en' ? 'Pan (Translate)' : 'Déplacer (Pan)'}</span>
                  </span>
                  <span className="text-[10px] text-[#8F9CAE]">H / B / G / D</span>
                </div>

                <div className="grid grid-cols-3 gap-1 w-32 mx-auto">
                  <div />
                  <button
                    type="button"
                    onClick={() => panCamera(0, 0.25)}
                    className="min-h-[40px] p-2 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[#FAF6F0] flex items-center justify-center transition cursor-pointer active:scale-95"
                    title={lang === 'en' ? 'Move Up' : 'Déplacer vers le haut'}
                  >
                    <ArrowUp className="w-4 h-4 text-[#DACBA9]" />
                  </button>
                  <div />

                  <button
                    type="button"
                    onClick={() => panCamera(-0.25, 0)}
                    className="min-h-[40px] p-2 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[#FAF6F0] flex items-center justify-center transition cursor-pointer active:scale-95"
                    title={lang === 'en' ? 'Move Left' : 'Déplacer vers la gauche'}
                  >
                    <ArrowLeft className="w-4 h-4 text-[#DACBA9]" />
                  </button>
                  <button
                    type="button"
                    onClick={resetView}
                    className="min-h-[40px] p-2 rounded-xl bg-[#232C3A] hover:bg-[#2D3847] border border-[#DACBA9]/40 text-[#DACBA9] flex items-center justify-center transition cursor-pointer"
                    title={lang === 'en' ? 'Recenter model' : 'Recentrer le modèle'}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => panCamera(0.25, 0)}
                    className="min-h-[40px] p-2 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[#FAF6F0] flex items-center justify-center transition cursor-pointer active:scale-95"
                    title={lang === 'en' ? 'Move Right' : 'Déplacer vers la droite'}
                  >
                    <ArrowRight className="w-4 h-4 text-[#DACBA9]" />
                  </button>

                  <div />
                  <button
                    type="button"
                    onClick={() => panCamera(0, -0.25)}
                    className="min-h-[40px] p-2 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[#FAF6F0] flex items-center justify-center transition cursor-pointer active:scale-95"
                    title={lang === 'en' ? 'Move Down' : 'Déplacer vers le bas'}
                  >
                    <ArrowDown className="w-4 h-4 text-[#DACBA9]" />
                  </button>
                  <div />
                </div>
              </div>

              {/* 2. Full 360 Rotation: Tourner et Retourner dans tous les sens */}
              <div className="space-y-1.5 pt-1 border-t border-[#323B46]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#DACBA9]">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-[#DACBA9]" />
                    <span>{lang === 'en' ? 'Rotation & Flip' : 'Rotation & Renversement'}</span>
                  </span>
                  <span className="text-[10px] text-[#8F9CAE]">360°</span>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => rotateCamera(-0.35, 0)}
                    className="min-h-[36px] py-1 px-1 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[11px] font-medium text-[#BAC3CE] hover:text-[#FAF6F0] flex items-center justify-center gap-0.5 transition cursor-pointer"
                    title={lang === 'en' ? 'Rotate Left' : 'Tourner vers la gauche'}
                  >
                    <RotateCcw className="w-3 h-3 text-amber-300" />
                    <span>{lang === 'en' ? 'Left' : 'Gauche'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => rotateCamera(0.35, 0)}
                    className="min-h-[36px] py-1 px-1 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[11px] font-medium text-[#BAC3CE] hover:text-[#FAF6F0] flex items-center justify-center gap-0.5 transition cursor-pointer"
                    title={lang === 'en' ? 'Rotate Right' : 'Tourner vers la droite'}
                  >
                    <RotateCw className="w-3 h-3 text-amber-300" />
                    <span>{lang === 'en' ? 'Right' : 'Droite'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => rotateCamera(0, -0.3)}
                    className="min-h-[36px] py-1 px-1 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[11px] font-medium text-[#BAC3CE] hover:text-[#FAF6F0] flex items-center justify-center gap-0.5 transition cursor-pointer"
                    title={lang === 'en' ? 'Tilt Up' : 'Basculer vers le haut'}
                  >
                    <ArrowUp className="w-3 h-3 text-amber-300" />
                    <span>{lang === 'en' ? 'Up' : 'Haut'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => rotateCamera(0, 0.3)}
                    className="min-h-[36px] py-1 px-1 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[11px] font-medium text-[#BAC3CE] hover:text-[#FAF6F0] flex items-center justify-center gap-0.5 transition cursor-pointer"
                    title={lang === 'en' ? 'Tilt Down' : 'Basculer vers le bas'}
                  >
                    <ArrowDown className="w-3 h-3 text-amber-300" />
                    <span>{lang === 'en' ? 'Down' : 'Bas'}</span>
                  </button>
                </div>

                {/* Flip 180 buttons (Retourner dans tous les sens) */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={flip180}
                    className="min-h-[38px] py-1.5 px-2 rounded-xl bg-[#232C3A] hover:bg-[#2E3A49] border border-amber-400/40 text-[11px] font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title={lang === 'en' ? 'Flip 180° (Invert Front/Back)' : 'Retourner à 180° (Inverser face / dos)'}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'en' ? 'Flip 180°' : 'Retourner 180°'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={flipVertical}
                    className="min-h-[38px] py-1.5 px-2 rounded-xl bg-[#232C3A] hover:bg-[#2E3A49] border border-amber-400/40 text-[11px] font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title={lang === 'en' ? 'Invert Vertical' : 'Inverser haut / bas'}
                  >
                    <FlipVertical className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'en' ? 'Invert Vert.' : 'Inverser Vert.'}</span>
                  </button>
                </div>
              </div>

              {/* 3. Anatomical View Presets */}
              <div className="space-y-1 pt-1 border-t border-[#323B46]">
                <div className="text-[10px] font-semibold text-[#8F9CAE] uppercase tracking-wider">
                  {lang === 'en' ? 'Clinical Anatomical Planes' : 'Vues Anatomiques Fixes'}
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setViewPreset('front')}
                    className={`min-h-[34px] py-1 px-1.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                      activePreset === 'front'
                        ? 'bg-[#DACBA9] text-[#15191E] border-[#DACBA9] font-bold shadow-xs'
                        : 'bg-[#15191E] text-[#BAC3CE] hover:text-[#FAF6F0] border-[#323B46]'
                    }`}
                  >
                    {lang === 'en' ? 'Anterior' : 'Face'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('back')}
                    className={`min-h-[34px] py-1 px-1.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                      activePreset === 'back'
                        ? 'bg-[#DACBA9] text-[#15191E] border-[#DACBA9] font-bold shadow-xs'
                        : 'bg-[#15191E] text-[#BAC3CE] hover:text-[#FAF6F0] border-[#323B46]'
                    }`}
                  >
                    {lang === 'en' ? 'Posterior' : 'Dos'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('left')}
                    className={`min-h-[34px] py-1 px-1.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                      activePreset === 'left'
                        ? 'bg-[#DACBA9] text-[#15191E] border-[#DACBA9] font-bold shadow-xs'
                        : 'bg-[#15191E] text-[#BAC3CE] hover:text-[#FAF6F0] border-[#323B46]'
                    }`}
                  >
                    {lang === 'en' ? 'Left Lat.' : 'Profil G'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('right')}
                    className={`min-h-[34px] py-1 px-1.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                      activePreset === 'right'
                        ? 'bg-[#DACBA9] text-[#15191E] border-[#DACBA9] font-bold shadow-xs'
                        : 'bg-[#15191E] text-[#BAC3CE] hover:text-[#FAF6F0] border-[#323B46]'
                    }`}
                  >
                    {lang === 'en' ? 'Right Lat.' : 'Profil D'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('top')}
                    className={`min-h-[34px] py-1 px-1.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                      activePreset === 'top'
                        ? 'bg-[#DACBA9] text-[#15191E] border-[#DACBA9] font-bold shadow-xs'
                        : 'bg-[#15191E] text-[#BAC3CE] hover:text-[#FAF6F0] border-[#323B46]'
                    }`}
                  >
                    {lang === 'en' ? 'Superior' : 'Dessus'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('bottom')}
                    className={`min-h-[34px] py-1 px-1.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                      activePreset === 'bottom'
                        ? 'bg-[#DACBA9] text-[#15191E] border-[#DACBA9] font-bold shadow-xs'
                        : 'bg-[#15191E] text-[#BAC3CE] hover:text-[#FAF6F0] border-[#323B46]'
                    }`}
                  >
                    {lang === 'en' ? 'Inferior' : 'Dessous'}
                  </button>
                </div>
              </div>

              {/* 4. Zoom & Reset row */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#323B46]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => zoomCamera(0.85)}
                    className="min-h-[38px] min-w-[38px] p-2 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[#FAF6F0] flex items-center justify-center transition cursor-pointer"
                    title={lang === 'en' ? 'Zoom in (+)' : 'Zoom avant (+)'}
                  >
                    <ZoomIn className="w-4 h-4 text-[#DACBA9]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => zoomCamera(1.18)}
                    className="min-h-[38px] min-w-[38px] p-2 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] text-[#FAF6F0] flex items-center justify-center transition cursor-pointer"
                    title={lang === 'en' ? 'Zoom out (-)' : 'Zoom arrière (-)'}
                  >
                    <ZoomOut className="w-4 h-4 text-[#DACBA9]" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetView}
                  className="min-h-[38px] py-1.5 px-3 rounded-xl bg-[#15191E] hover:bg-[#2A323D] border border-[#323B46] hover:border-[#DACBA9] text-[11px] font-semibold text-[#DACBA9] hover:text-[#FAF6F0] transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Reset View' : 'Vue Initiale'}</span>
                </button>
              </div>

              {/* Legend Help info */}
              <div className="text-[10px] text-[#8F9CAE] leading-tight pt-0.5">
                {lang === 'en'
                  ? 'Mouse / Touch: Drag to rotate, 2 fingers to pan & pinch zoom.'
                  : 'Souris / Tactile : Glisser pour tourner, 2 doigts pour déplacer & zoomer.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible mobile-friendly 3D node explorer HUD */}
      {!loading && !loadError && availableNodes.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-auto">
          {!nodesTrayOpen ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setNodesTrayOpen(true)}
                className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#1E242C]/95 backdrop-blur-md border border-[#323B46] text-xs font-semibold text-[#FAF6F0] hover:border-[#DACBA9] inline-flex items-center gap-2.5 shadow-xl cursor-pointer transition"
              >
                <Layers className="w-4 h-4 text-[#DACBA9]" />
                <span className="tabular-nums">
                  {lang === 'en'
                    ? `3D Structures (${availableNodes.length})`
                    : `Structures du modèle (${availableNodes.length})`}
                </span>
                <ChevronUp className="w-4 h-4 text-[#BAC3CE]" />
              </button>

              {activeNodeName && selectedBilingual && (
                <div className="min-h-[46px] px-4 py-2 rounded-2xl bg-[#1E242C]/95 backdrop-blur-md border border-[#DACBA9]/60 text-xs font-semibold text-[#FAF6F0] flex flex-col justify-center truncate max-w-[60%] shadow-xl">
                  <span className="truncate text-[#DACBA9] font-bold">
                    {lang === 'en' ? selectedBilingual.en : selectedBilingual.fr}
                  </span>
                  <span className="truncate text-[#BAC3CE] text-[11px]">
                    {lang === 'en' ? selectedBilingual.fr : selectedBilingual.en}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#1E242C]/95 backdrop-blur-md border border-[#323B46] shadow-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#DACBA9] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={nodeFilter}
                    onChange={(e) => setNodeFilter(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? `Filter among ${availableNodes.length} 3D structures…`
                        : `Filtrer parmi ${availableNodes.length} structures 3D…`
                    }
                    className="w-full min-h-[42px] pl-10 pr-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-xs text-[#FAF6F0] placeholder-[#8F9CAE] focus:outline-hidden focus:border-[#DACBA9]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setNodesTrayOpen(false)}
                  className="min-h-[42px] min-w-[42px] px-2.5 rounded-xl bg-[#15191E] text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#2A323D] border border-[#323B46] inline-flex items-center justify-center cursor-pointer transition"
                  title={lang === 'en' ? 'Collapse list' : 'Réduire la liste'}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {filteredNodes.slice(0, 40).map((nodeName) => {
                  const isSelected = activeNodeName === nodeName;
                  return (
                    <button
                      key={nodeName}
                      type="button"
                      onClick={() => selectNode(nodeName, true)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
                          : 'bg-[#15191E] text-[#BAC3CE] hover:bg-[#2A323D] hover:text-[#FAF6F0] border border-[#323B46]'
                      }`}
                    >
                      {nodeName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
