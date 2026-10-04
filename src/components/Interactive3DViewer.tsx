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

      {/* Floating 3D Navigation Controls Dock (Haut, Bas, Gauche, Droite, Tourner & Retourner dans tous les sens) */}
      {!loading && !loadError && (
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2 pointer-events-auto">
          {/* Toggle button for controls dock */}
          <button
            type="button"
            onClick={() => setShowControlsPad((v) => !v)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0d1a2b]/90 backdrop-blur-md border border-[#2c4a70] text-xs font-semibold text-[#8fc5ff] hover:text-white hover:bg-[#152a45] shadow-lg flex items-center gap-1.5 transition cursor-pointer"
            title="Afficher / Masquer la manette 3D"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Commandes 3D</span>
            <span className="text-[10px] text-[#71839b]">{showControlsPad ? '▲' : '▼'}</span>
          </button>

          {showControlsPad && (
            <div className="p-2.5 rounded-2xl bg-[#0a1320]/95 backdrop-blur-md border border-[#233852] shadow-2xl space-y-2.5 w-60 text-[#eef4ff] text-xs animate-in fade-in zoom-in-95 duration-200">
              {/* Interaction mode: 3D rotate vs 2D pan */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setInteractionMode('rotate')}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    interactionMode === 'rotate'
                      ? 'bg-sky-600 text-white border-sky-400'
                      : 'bg-[#142338] text-[#b8c7da] border-[#2a4468] hover:text-white'
                  }`}
                  title="Mode rotation 3D (glisser pour tourner)"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Rotation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInteractionMode('pan')}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    interactionMode === 'pan'
                      ? 'bg-sky-600 text-white border-sky-400'
                      : 'bg-[#142338] text-[#b8c7da] border-[#2a4468] hover:text-white'
                  }`}
                  title="Mode déplacement 2D (glisser pour paner la vue)"
                >
                  <Move className="w-3 h-3" />
                  <span>Déplacer 2D</span>
                </button>
              </div>

              {/* 1. Translation / Pan: Haut, Bas, Gauche, Droite */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#8fc5ff]">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3 text-sky-400" />
                    <span>Déplacer (Pan)</span>
                  </span>
                  <span className="text-[10px] text-[#71839b]">Haut / Bas / G / D</span>
                </div>

                <div className="grid grid-cols-3 gap-1 w-28 mx-auto">
                  <div />
                  <button
                    type="button"
                    onClick={() => panCamera(0, 0.25)}
                    className="p-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-white flex items-center justify-center transition cursor-pointer active:scale-95"
                    title="Déplacer vers le haut"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-sky-300" />
                  </button>
                  <div />

                  <button
                    type="button"
                    onClick={() => panCamera(-0.25, 0)}
                    className="p-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-white flex items-center justify-center transition cursor-pointer active:scale-95"
                    title="Déplacer vers la gauche"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-sky-300" />
                  </button>
                  <button
                    type="button"
                    onClick={resetView}
                    className="p-1.5 rounded-lg bg-[#1a2f4c] hover:bg-[#23416b] border border-sky-500/40 text-sky-300 flex items-center justify-center transition cursor-pointer"
                    title="Recentrer le modèle"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => panCamera(0.25, 0)}
                    className="p-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-white flex items-center justify-center transition cursor-pointer active:scale-95"
                    title="Déplacer vers la droite"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-sky-300" />
                  </button>

                  <div />
                  <button
                    type="button"
                    onClick={() => panCamera(0, -0.25)}
                    className="p-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-white flex items-center justify-center transition cursor-pointer active:scale-95"
                    title="Déplacer vers le bas"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-sky-300" />
                  </button>
                  <div />
                </div>
              </div>

              {/* 2. Full 360 Rotation: Tourner et Retourner dans tous les sens */}
              <div className="space-y-1.5 pt-1 border-t border-[#1d3148]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#8fc5ff]">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-sky-400" />
                    <span>Rotation &amp; Renversement</span>
                  </span>
                  <span className="text-[10px] text-[#71839b]">Tous sens</span>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => rotateCamera(-0.35, 0)}
                    className="py-1 px-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-[11px] font-medium text-[#b8c7da] hover:text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Tourner vers la gauche (Azimuth -20°)"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-300" />
                    <span>Gauche</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => rotateCamera(0.35, 0)}
                    className="py-1 px-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-[11px] font-medium text-[#b8c7da] hover:text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Tourner vers la droite (Azimuth +20°)"
                  >
                    <RotateCw className="w-3 h-3 text-amber-300" />
                    <span>Droite</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => rotateCamera(0, -0.3)}
                    className="py-1 px-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-[11px] font-medium text-[#b8c7da] hover:text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Basculer vers le haut"
                  >
                    <ArrowUp className="w-3 h-3 text-amber-300" />
                    <span>Haut</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => rotateCamera(0, 0.3)}
                    className="py-1 px-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-[11px] font-medium text-[#b8c7da] hover:text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Basculer vers le bas"
                  >
                    <ArrowDown className="w-3 h-3 text-amber-300" />
                    <span>Bas</span>
                  </button>
                </div>

                {/* Flip 180 buttons (Retourner dans tous les sens) */}
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={flip180}
                    className="py-1.5 px-2 rounded-lg bg-[#172c46] hover:bg-[#203c61] border border-amber-400/40 text-[11px] font-semibold text-amber-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Retourner à 180° (Inverser face / dos)"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-amber-300" />
                    <span>Retourner 180°</span>
                  </button>

                  <button
                    type="button"
                    onClick={flipVertical}
                    className="py-1.5 px-2 rounded-lg bg-[#172c46] hover:bg-[#203c61] border border-amber-400/40 text-[11px] font-semibold text-amber-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Inverser haut / bas"
                  >
                    <FlipVertical className="w-3.5 h-3.5 text-amber-300" />
                    <span>Inverser Vert.</span>
                  </button>
                </div>
              </div>

              {/* 3. Anatomical View Presets */}
              <div className="space-y-1 pt-1 border-t border-[#1d3148]">
                <div className="text-[10px] font-semibold text-[#71839b] uppercase tracking-wider">
                  Vues Anatomiques Fixes
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setViewPreset('front')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                      activePreset === 'front'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-[#142338] text-[#b8c7da] hover:text-white border-[#2a4468]'
                    }`}
                  >
                    Face
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('back')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                      activePreset === 'back'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-[#142338] text-[#b8c7da] hover:text-white border-[#2a4468]'
                    }`}
                  >
                    Dos
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('left')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                      activePreset === 'left'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-[#142338] text-[#b8c7da] hover:text-white border-[#2a4468]'
                    }`}
                  >
                    Profil G
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('right')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                      activePreset === 'right'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-[#142338] text-[#b8c7da] hover:text-white border-[#2a4468]'
                    }`}
                  >
                    Profil D
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('top')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                      activePreset === 'top'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-[#142338] text-[#b8c7da] hover:text-white border-[#2a4468]'
                    }`}
                  >
                    Dessus
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPreset('bottom')}
                    className={`py-1 px-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                      activePreset === 'bottom'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-[#142338] text-[#b8c7da] hover:text-white border-[#2a4468]'
                    }`}
                  >
                    Dessous
                  </button>
                </div>
              </div>

              {/* 4. Zoom & Reset row */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#1d3148]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => zoomCamera(0.9)}
                    className="p-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-white flex items-center justify-center transition cursor-pointer"
                    title="Zoom avant (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-sky-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => zoomCamera(1.1)}
                    className="p-1.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-white flex items-center justify-center transition cursor-pointer"
                    title="Zoom arrière (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5 text-sky-300" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetView}
                  className="py-1 px-2.5 rounded-lg bg-[#142338] hover:bg-[#1d3556] border border-[#2a4468] text-[11px] font-semibold text-[#8fc5ff] hover:text-white transition cursor-pointer inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Vue Initiale</span>
                </button>
              </div>

              {/* Legend Help info */}
              <div className="text-[10px] text-[#71839b] leading-tight pt-0.5">
                Souris : Clic gauche ({interactionMode === 'pan' ? 'Déplacer' : 'Tourner'}), Clic droit (Déplacer), Molette (Zoom doux).
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible mobile-friendly 3D node explorer HUD */}
      {!loading && !loadError && availableNodes.length > 0 && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-auto">
          {!nodesTrayOpen ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setNodesTrayOpen(true)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0d1a2b]/90 backdrop-blur-md border border-[#2c4a70] text-xs font-semibold text-[#eef4ff] inline-flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#8fc5ff]" />
                <span className="tabular-nums">
                  Structures du modèle ({availableNodes.length})
                </span>
                <ChevronUp className="w-4 h-4 text-[#8fc5ff]" />
              </button>

              {activeNodeName && selectedBilingual && (
                <div className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-950/90 backdrop-blur-md border border-indigo-400/40 text-xs font-semibold text-[#eef4ff] flex flex-col justify-center truncate max-w-[60%] shadow-lg">
                  <span className="truncate">{selectedBilingual.en}</span>
                  <span className="truncate text-[#8fc5ff] text-[11px]">
                    {selectedBilingual.fr}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#0d1a2b]/95 backdrop-blur-md border border-[#2c4a70] shadow-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#8fc5ff] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={nodeFilter}
                    onChange={(e) => setNodeFilter(e.target.value)}
                    placeholder={`Filtrer parmi ${availableNodes.length} structures 3D…`}
                    className="w-full min-h-[38px] pl-8 pr-3 py-1.5 rounded-xl bg-[#08111f] border border-[#203651] text-xs text-[#eef4ff] placeholder-[#71839b] focus:outline-hidden focus:border-[#8fc5ff]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setNodesTrayOpen(false)}
                  className="min-h-[38px] min-w-[38px] px-2.5 rounded-xl bg-[#13253d] text-[#b8c7da] hover:text-white inline-flex items-center justify-center cursor-pointer"
                  title="Réduire la liste"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {filteredNodes.slice(0, 35).map((nodeName) => {
                  const isSelected = activeNodeName === nodeName;
                  return (
                    <button
                      key={nodeName}
                      type="button"
                      onClick={() => selectNode(nodeName, true)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-[#13253d] text-[#b8c7da] hover:bg-[#1c3454] hover:text-white'
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
