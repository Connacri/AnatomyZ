import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EntityData } from '../types';

export interface Interactive3DControllerHandle {
  clearSelections: () => void;
  resetAllMaterialOverrides: () => void;
  setCameraZoomLevel: (factor: number) => void;
  setPartVisibility: (name: string, visible: boolean) => void;
  setEntityTransparency: (name: string) => void;
  resetEntityMaterial: (name: string) => void;
  selectByName: (name: string) => void;
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
  heightClass = 'h-full min-h-[460px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [availableNodes, setAvailableNodes] = useState<string[]>([]);
  const [nodeFilter, setNodeFilter] = useState<string>('');
  const [activeNodeName, setActiveNodeName] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());
  const originalMaterialsRef = useRef<
    Map<string, THREE.Material | THREE.Material[]>
  >(new Map());
  const activeNodeRef = useRef<string | null>(null);

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
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!camera || !controls) return;
      const dir = new THREE.Vector3()
        .subVectors(camera.position, controls.target)
        .multiplyScalar(1 / factor);
      camera.position.copy(controls.target).add(dir);
      controls.update();
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

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 2000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controlsRef.current = controls;

    // Balanced anatomical lighting
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

    // Configure DRACOLoader for Anatria-3D KHR_draco_mesh_compression GLB assets
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

        // Compute bounding box of real GLB anatomy model and frame camera accurately
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        controls.target.copy(center);
        const fovRad = (camera.fov * Math.PI) / 180;
        const cameraDist = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.15;
        camera.near = Math.max(0.001, maxDim / 1000);
        camera.far = maxDim * 100;
        camera.position.set(
          center.x,
          center.y + maxDim * 0.05,
          center.z + cameraDist
        );
        camera.updateProjectionMatrix();
        controls.minDistance = maxDim * 0.05;
        controls.maxDistance = maxDim * 6;
        controls.update();

        const namesSet = new Set<string>();
        let partCounter = 1;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            // Find the meaningful anatomical node name from mesh or parent hierarchy
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
      if (dist > 6) return;

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

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || 800;
      const h = containerRef.current.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

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
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      domElem.removeEventListener('pointerup', handlePointerUp);
      dracoLoader.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, [modelUrl, preselectedEntityName]);

  const filteredNodes = nodeFilter.trim()
    ? availableNodes.filter((n) =>
        n.toLowerCase().includes(nodeFilter.trim().toLowerCase())
      )
    : availableNodes;

  return (
    <div
      className={`relative w-full ${heightClass} bg-[#06090e] overflow-hidden`}
    >
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#06090e]/85 backdrop-blur-xs z-10">
          <div className="w-10 h-10 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-[#eef4ff]">
            Chargement du modèle anatomique 3D GLB (Draco)…{' '}
            {loadProgress > 0 ? `${loadProgress}%` : ''}
          </p>
          <p className="text-xs text-[#71839b] mt-1 max-w-md text-center px-4 truncate">
            {modelUrl}
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

      {!loading && !loadError && availableNodes.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 py-1.5 px-3 bg-[#0d1a2b]/90 border border-[#203651] rounded-xl backdrop-blur-xs">
          <input
            type="text"
            value={nodeFilter}
            onChange={(e) => setNodeFilter(e.target.value)}
            placeholder={`Filtrer ${availableNodes.length} nœuds GLB…`}
            className="w-40 sm:w-48 px-2.5 py-1 rounded-lg bg-[#08111f] border border-[#2c4a70] text-xs text-[#eef4ff] placeholder-[#71839b] focus:outline-hidden focus:border-[#8fc5ff] shrink-0"
          />
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {filteredNodes.slice(0, 25).map((nodeName) => {
              const isSelected = activeNodeName === nodeName;
              return (
                <button
                  key={nodeName}
                  type="button"
                  onClick={() => selectNode(nodeName, true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition cursor-pointer ${
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
  );
};
