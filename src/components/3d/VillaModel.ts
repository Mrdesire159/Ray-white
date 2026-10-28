import * as THREE from 'three';
import {
  createWoodDeckTexture,
  createStoneWallTexture,
  createConcretePanelTexture,
  createPoolWaterNormal,
  createAbstractArtTexture,
} from './VillaTextures';

export interface VillaModelObjects {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  spaWaterMesh: THREE.Mesh;
  poolLights: THREE.PointLight[];
  interiorLights: THREE.PointLight[];
  soffitLights: THREE.PointLight[];
  update: (time: number) => void;
}

export function buildVillaModel(): VillaModelObjects {
  const group = new THREE.Group();

  // Load procedural textures
  const woodDeckTex = createWoodDeckTexture();
  const stoneWallTex = createStoneWallTexture();
  const concreteTex = createConcretePanelTexture();
  const waterNormalTex = createPoolWaterNormal();
  const abstractArtTex = createAbstractArtTexture();

  // Materials
  const whiteFacadeMat = new THREE.MeshStandardMaterial({
    color: 0xfafbfc,
    map: concreteTex,
    roughness: 0.25,
    metalness: 0.05,
  });

  const darkAccentMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    roughness: 0.35,
    metalness: 0.2,
  });

  const woodDeckMat = new THREE.MeshStandardMaterial({
    map: woodDeckTex,
    roughness: 0.5,
    metalness: 0.05,
  });

  const stoneWallMat = new THREE.MeshStandardMaterial({
    map: stoneWallTex,
    roughness: 0.7,
    metalness: 0.05,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.32,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.5,
    reflectivity: 0.9,
  });

  const balconyGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8f4f8,
    transparent: true,
    opacity: 0.38,
    roughness: 0.04,
    metalness: 0.05,
    transmission: 0.9,
    ior: 1.52,
  });

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.78,
    roughness: 0.06,
    metalness: 0.1,
    transmission: 0.6,
    ior: 1.333,
    reflectivity: 0.8,
    normalMap: waterNormalTex,
  });

  const poolTileMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.2,
    metalness: 0.1,
  });

  const interiorFloorMat = new THREE.MeshStandardMaterial({
    color: 0xdddbd5,
    roughness: 0.2,
    metalness: 0.1,
  });

  const ceilingSoffitMat = new THREE.MeshStandardMaterial({
    color: 0x1e1c1a,
    roughness: 0.45,
    metalness: 0.1,
  });

  // Array trackers
  const poolLights: THREE.PointLight[] = [];
  const interiorLights: THREE.PointLight[] = [];
  const soffitLights: THREE.PointLight[] = [];

  // ==========================================
  // 1. GROUND & SITE
  // ==========================================
  // Lawn
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x4d7c38,
    roughness: 0.85,
    metalness: 0.0,
  });
  const lawnGeo = new THREE.PlaneGeometry(60, 60);
  const lawn = new THREE.Mesh(lawnGeo, grassMat);
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.set(0, -0.05, 0);
  lawn.receiveShadow = true;
  group.add(lawn);

  // Patio / Paving surround on the right and rear
  const patioGeo = new THREE.BoxGeometry(26, 0.2, 24);
  const patioMat = new THREE.MeshStandardMaterial({
    color: 0xd6d3cb,
    roughness: 0.6,
  });
  const patio = new THREE.Mesh(patioGeo, patioMat);
  patio.position.set(2, -0.05, -2);
  patio.receiveShadow = true;
  group.add(patio);

  // ==========================================
  // 2. VILLA ARCHITECTURE (GROUND FLOOR)
  // ==========================================
  const villaOriginX = -2;
  const villaOriginZ = -8;

  // Ground floor slab & interior floor
  const groundFloorGeo = new THREE.BoxGeometry(16, 0.4, 10);
  const groundFloor = new THREE.Mesh(groundFloorGeo, interiorFloorMat);
  groundFloor.position.set(villaOriginX, 0.15, villaOriginZ);
  groundFloor.receiveShadow = true;
  group.add(groundFloor);

  // Main dark timber terrace deck (in front of living room)
  const terraceGeo = new THREE.BoxGeometry(16.5, 0.35, 6);
  const terrace = new THREE.Mesh(terraceGeo, woodDeckMat);
  terrace.position.set(villaOriginX, 0.12, villaOriginZ + 7.8);
  terrace.receiveShadow = true;
  group.add(terrace);

  // Back wall (solid)
  const backWallGeo = new THREE.BoxGeometry(16, 3.4, 0.4);
  const backWall = new THREE.Mesh(backWallGeo, new THREE.MeshStandardMaterial({ color: 0xf0efe9, roughness: 0.4 }));
  backWall.position.set(villaOriginX, 1.85, villaOriginZ - 4.8);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Abstract art on the back wall
  const artGeo = new THREE.PlaneGeometry(3.6, 2.2);
  const artMat = new THREE.MeshBasicMaterial({ map: abstractArtTex });
  const artMesh = new THREE.Mesh(artGeo, artMat);
  artMesh.position.set(villaOriginX - 1.5, 2.2, villaOriginZ - 4.58);
  group.add(artMesh);

  // Left solid structural wall with dark charcoal accent
  const leftWallGeo = new THREE.BoxGeometry(0.4, 3.4, 10);
  const leftWall = new THREE.Mesh(leftWallGeo, whiteFacadeMat);
  leftWall.position.set(villaOriginX - 7.8, 1.85, villaOriginZ);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Dark accent vertical block on front-left (from photo)
  const darkColGeo = new THREE.BoxGeometry(1.2, 3.4, 0.8);
  const darkCol = new THREE.Mesh(darkColGeo, darkAccentMat);
  darkCol.position.set(villaOriginX - 7.2, 1.85, villaOriginZ + 4.6);
  darkCol.castShadow = true;
  group.add(darkCol);

  // Right feature textured stone column (prominent in photo)
  const stoneColGeo = new THREE.BoxGeometry(1.4, 3.4, 1.2);
  const stoneCol = new THREE.Mesh(stoneColGeo, stoneWallMat);
  stoneCol.position.set(villaOriginX + 7.1, 1.85, villaOriginZ + 4.4);
  stoneCol.castShadow = true;
  stoneCol.receiveShadow = true;
  group.add(stoneCol);

  // Right solid wall behind column
  const rightWallGeo = new THREE.BoxGeometry(0.4, 3.4, 9);
  const rightWall = new THREE.Mesh(rightWallGeo, whiteFacadeMat);
  rightWall.position.set(villaOriginX + 7.8, 1.85, villaOriginZ - 0.5);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Ground floor sliding glass doors (framed)
  const glassPanel1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 0.08), glassMat);
  glassPanel1.position.set(villaOriginX - 4.2, 1.75, villaOriginZ + 4.7);
  group.add(glassPanel1);

  // Second glass panel - partially slid open to reveal luxury interior!
  const glassPanel2 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.2, 0.08), glassMat);
  glassPanel2.position.set(villaOriginX + 0.5, 1.75, villaOriginZ + 4.7);
  group.add(glassPanel2);

  // Thin black aluminum door mullions
  const mullionMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
  [-6.3, -2.1, 2.5, 6.2].forEach((xPos) => {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.3, 0.12), mullionMat);
    mullion.position.set(villaOriginX + xPos, 1.75, villaOriginZ + 4.72);
    group.add(mullion);
  });

  // ==========================================
  // 3. GROUND FLOOR INTERIOR FURNISHINGS
  // ==========================================
  // Modern sectional L-sofa
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0xe5e2dc, roughness: 0.7 });
  const sofaBase1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.45, 1.2), sofaMat);
  sofaBase1.position.set(villaOriginX - 1.8, 0.45, villaOriginZ - 0.5);
  sofaBase1.castShadow = true;
  group.add(sofaBase1);

  const sofaBack1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.3), sofaMat);
  sofaBack1.position.set(villaOriginX - 1.8, 0.85, villaOriginZ - 1.0);
  group.add(sofaBack1);

  const sofaChaise = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 2.0), sofaMat);
  sofaChaise.position.set(villaOriginX - 3.0, 0.45, villaOriginZ + 0.5);
  sofaChaise.castShadow = true;
  group.add(sofaChaise);

  // Designer low marble coffee table
  const tableMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1 });
  const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 1.0), tableMat);
  coffeeTable.position.set(villaOriginX - 1.2, 0.35, villaOriginZ + 0.8);
  coffeeTable.castShadow = true;
  group.add(coffeeTable);

  // Modern kitchen island in background
  const islandMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.3 });
  const island = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.95, 1.2), islandMat);
  island.position.set(villaOriginX + 4.2, 0.65, villaOriginZ - 1.5);
  island.castShadow = true;
  group.add(island);

  // Bar stools
  for (let s = -0.9; s <= 0.9; s += 0.9) {
    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 16), darkAccentMat);
    stool.position.set(villaOriginX + 4.2 + s, 0.5, villaOriginZ - 0.4);
    group.add(stool);
  }

  // Interior warm point lights
  const interiorLight1 = new THREE.PointLight(0xffecc4, 1.8, 12);
  interiorLight1.position.set(villaOriginX - 1.5, 2.8, villaOriginZ);
  interiorLight1.castShadow = true;
  group.add(interiorLight1);
  interiorLights.push(interiorLight1);

  const interiorLight2 = new THREE.PointLight(0xffdfaa, 1.5, 10);
  interiorLight2.position.set(villaOriginX + 3.8, 2.8, villaOriginZ - 1.5);
  group.add(interiorLight2);
  interiorLights.push(interiorLight2);

  // ==========================================
  // 4. SECOND FLOOR & CANTILEVERED ROOF/BALCONY
  // ==========================================
  // Intermediate slab / upper balcony floor
  const upperFloorGeo = new THREE.BoxGeometry(16.8, 0.5, 11.2);
  const upperFloor = new THREE.Mesh(upperFloorGeo, whiteFacadeMat);
  upperFloor.position.set(villaOriginX, 3.65, villaOriginZ + 0.6);
  upperFloor.castShadow = true;
  upperFloor.receiveShadow = true;
  group.add(upperFloor);

  // Upper balcony deck surface (dark teak wood)
  const upperDeckGeo = new THREE.BoxGeometry(15.6, 0.05, 3.4);
  const upperDeck = new THREE.Mesh(upperDeckGeo, woodDeckMat);
  upperDeck.position.set(villaOriginX, 3.92, villaOriginZ + 4.2);
  group.add(upperDeck);

  // Upper walls & recessed master suite
  const upperBackWall = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 0.4), whiteFacadeMat);
  upperBackWall.position.set(villaOriginX, 5.5, villaOriginZ - 4.8);
  upperBackWall.castShadow = true;
  group.add(upperBackWall);

  const upperLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 7.5), whiteFacadeMat);
  upperLeftWall.position.set(villaOriginX - 8.0, 5.5, villaOriginZ - 1.2);
  upperLeftWall.castShadow = true;
  group.add(upperLeftWall);

  const upperRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 7.5), whiteFacadeMat);
  upperRightWall.position.set(villaOriginX + 8.0, 5.5, villaOriginZ - 1.2);
  upperRightWall.castShadow = true;
  group.add(upperRightWall);

  // Master bedroom furniture (visible through glass)
  const bedHeadboard = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 0.2), darkAccentMat);
  bedHeadboard.position.set(villaOriginX, 4.6, villaOriginZ - 4.5);
  group.add(bedHeadboard);

  const bedMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.55, 2.4), bedMat);
  bed.position.set(villaOriginX, 4.25, villaOriginZ - 3.2);
  group.add(bed);

  // Upper floor panoramic sliding glass wall
  const upperGlassGeo = new THREE.BoxGeometry(15.4, 3.0, 0.06);
  const upperGlass = new THREE.Mesh(upperGlassGeo, glassMat);
  upperGlass.position.set(villaOriginX, 5.4, villaOriginZ + 2.5);
  group.add(upperGlass);

  // Prominent Cantilevered White Roof Box Framing (From Photo)
  const roofBoxGeo = new THREE.BoxGeometry(17.2, 1.2, 12);
  const roofBox = new THREE.Mesh(roofBoxGeo, whiteFacadeMat);
  roofBox.position.set(villaOriginX, 7.5, villaOriginZ + 0.5);
  roofBox.castShadow = true;
  group.add(roofBox);

  // Dark charcoal soffit ceiling under the upper cantilever roof
  const soffitGeo = new THREE.BoxGeometry(15.8, 0.1, 4.6);
  const soffit = new THREE.Mesh(soffitGeo, ceilingSoffitMat);
  soffit.position.set(villaOriginX, 6.85, villaOriginZ + 3.8);
  group.add(soffit);

  // Integrated warm recessed spotlights under the dark soffit (visible in reference photo)
  const soffitSpotPositions = [-5.5, -2.0, 2.0, 5.5];
  soffitSpotPositions.forEach((xOffset) => {
    // Glowing lens disc
    const spotDiscGeo = new THREE.CircleGeometry(0.12, 16);
    const spotDiscMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    const spotDisc = new THREE.Mesh(spotDiscGeo, spotDiscMat);
    spotDisc.rotation.x = Math.PI / 2;
    spotDisc.position.set(villaOriginX + xOffset, 6.83, villaOriginZ + 3.8);
    group.add(spotDisc);

    // Warm downlight
    const soffitLight = new THREE.PointLight(0xffe2a3, 1.6, 8, 1.5);
    soffitLight.position.set(villaOriginX + xOffset, 6.75, villaOriginZ + 3.8);
    group.add(soffitLight);
    soffitLights.push(soffitLight);
  });

  // Seamless Frameless Tempered Glass Balustrade on Second Floor
  const balustradeFrontGeo = new THREE.BoxGeometry(15.8, 1.1, 0.04);
  const balustradeFront = new THREE.Mesh(balustradeFrontGeo, balconyGlassMat);
  balustradeFront.position.set(villaOriginX, 4.5, villaOriginZ + 5.95);
  group.add(balustradeFront);

  const balustradeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.1, 3.5), balconyGlassMat);
  balustradeLeft.position.set(villaOriginX - 7.9, 4.5, villaOriginZ + 4.2);
  group.add(balustradeLeft);

  const balustradeRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.1, 3.5), balconyGlassMat);
  balustradeRight.position.set(villaOriginX + 7.9, 4.5, villaOriginZ + 4.2);
  group.add(balustradeRight);

  // Modern sleek aluminum top handrail for glass railing
  const railMat = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, metalness: 0.9, roughness: 0.2 });
  const railTop = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.04, 0.06), railMat);
  railTop.position.set(villaOriginX, 5.06, villaOriginZ + 5.95);
  group.add(railTop);

  // ==========================================
  // 5. SUNKEN MULTI-TIER POOL & SPA (CRUCIAL TO MATCH IMAGE)
  // ==========================================
  const poolCenter = new THREE.Vector3(1.5, 0, 7.5);
  const poolWidth = 10.5;
  const poolLength = 5.2;
  const poolDepth = 1.4;

  // Pool Basin Floor & Walls
  const poolBasinGeo = new THREE.BoxGeometry(poolWidth, poolDepth, poolLength);
  // Invert normals or create inner shell
  const poolLiningMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // vibrant cyan mosaic
    roughness: 0.15,
    metalness: 0.05,
    side: THREE.BackSide,
  });
  const poolBasin = new THREE.Mesh(poolBasinGeo, poolLiningMat);
  poolBasin.position.set(poolCenter.x, -poolDepth / 2, poolCenter.z);
  group.add(poolBasin);

  // Main Pool Water Surface
  const waterGeo = new THREE.PlaneGeometry(poolWidth - 0.2, poolLength - 0.2, 32, 32);
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(poolCenter.x, -0.15, poolCenter.z);
  group.add(waterMesh);

  // Submerged steps in main pool (as seen in photo)
  for (let step = 0; step < 3; step++) {
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.25, 0.6),
      poolTileMat
    );
    stepMesh.position.set(poolCenter.x - 2.8, -0.4 - step * 0.25, poolCenter.z - 1.6 + step * 0.6);
    stepMesh.receiveShadow = true;
    group.add(stepMesh);
  }

  // Elevated Corner Spa / Jacuzzi Plunge Pool (seen in right foreground of pool in photo)
  const spaWidth = 3.6;
  const spaLength = 3.0;
  const spaHeight = 0.5;
  const spaPosX = poolCenter.x + 3.2;
  const spaPosZ = poolCenter.z + 0.8;

  // Spa exterior curb / divider wall
  const spaWallGeo = new THREE.BoxGeometry(spaWidth, spaHeight, 0.3);
  const spaWallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const spaWall = new THREE.Mesh(spaWallGeo, spaWallMat);
  spaWall.position.set(spaPosX, -0.05, spaPosZ - 1.4);
  group.add(spaWall);

  const spaDivider = new THREE.Mesh(new THREE.BoxGeometry(0.3, spaHeight, spaLength), spaWallMat);
  spaDivider.position.set(spaPosX - 1.7, -0.05, spaPosZ);
  group.add(spaDivider);

  // Spa water surface
  const spaWaterGeo = new THREE.PlaneGeometry(spaWidth - 0.4, spaLength - 0.4, 16, 16);
  const spaWaterMat = waterMat.clone();
  (spaWaterMat as THREE.MeshPhysicalMaterial).color.setHex(0x38bdf8);
  const spaWaterMesh = new THREE.Mesh(spaWaterGeo, spaWaterMat);
  spaWaterMesh.rotation.x = -Math.PI / 2;
  spaWaterMesh.position.set(spaPosX, -0.02, spaPosZ);
  group.add(spaWaterMesh);

  // Distinctive Left Stacked Stone Retaining Wall & Water Trench (Signature feature in photo)
  const retainingWallGeo = new THREE.BoxGeometry(1.2, 1.8, poolLength + 2.4);
  const retainingWall = new THREE.Mesh(retainingWallGeo, stoneWallMat);
  retainingWall.position.set(poolCenter.x - poolWidth / 2 - 0.7, 0.2, poolCenter.z);
  retainingWall.castShadow = true;
  retainingWall.receiveShadow = true;
  group.add(retainingWall);

  // Retaining wall white coping cap
  const retainingCap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, poolLength + 2.5), whiteFacadeMat);
  retainingCap.position.set(poolCenter.x - poolWidth / 2 - 0.7, 1.15, poolCenter.z);
  group.add(retainingCap);

  // Lower cascade water trench beside stone wall
  const trenchWater = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, poolLength + 1.2),
    waterMat
  );
  trenchWater.rotation.x = -Math.PI / 2;
  trenchWater.position.set(poolCenter.x - poolWidth / 2 - 1.6, -0.3, poolCenter.z);
  group.add(trenchWater);

  // White Limestone Pool Coping Ledge
  const poolCopingMat = new THREE.MeshStandardMaterial({ color: 0xf1f3f5, roughness: 0.3 });
  // Front coping
  const copingFront = new THREE.Mesh(new THREE.BoxGeometry(poolWidth + 1.2, 0.15, 0.6), poolCopingMat);
  copingFront.position.set(poolCenter.x, 0.03, poolCenter.z + poolLength / 2 + 0.3);
  group.add(copingFront);

  // Back coping (adjacent to wooden deck)
  const copingBack = new THREE.Mesh(new THREE.BoxGeometry(poolWidth + 1.2, 0.15, 0.6), poolCopingMat);
  copingBack.position.set(poolCenter.x, 0.03, poolCenter.z - poolLength / 2 - 0.3);
  group.add(copingBack);

  // Right coping
  const copingRight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, poolLength + 0.6), poolCopingMat);
  copingRight.position.set(poolCenter.x + poolWidth / 2 + 0.3, 0.03, poolCenter.z);
  group.add(copingRight);

  // Underwater LED Point Lights in pool (glows turquoise at twilight)
  const poolLight1 = new THREE.PointLight(0x38bdf8, 2.5, 9);
  poolLight1.position.set(poolCenter.x - 2, -0.6, poolCenter.z);
  group.add(poolLight1);
  poolLights.push(poolLight1);

  const poolLight2 = new THREE.PointLight(0x38bdf8, 2.5, 9);
  poolLight2.position.set(poolCenter.x + 2.5, -0.6, poolCenter.z);
  group.add(poolLight2);
  poolLights.push(poolLight2);

  // ==========================================
  // 6. POOLSIDE SUN LOUNGERS & PATIO DECOR (MATCHING PHOTO)
  // ==========================================
  const loungerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const loungerCushionMat = new THREE.MeshStandardMaterial({ color: 0xe0e3e7, roughness: 0.6 });

  [-1.1, 1.1].forEach((zOffset) => {
    const loungerX = poolCenter.x + 7.5;
    const loungerZ = poolCenter.z + zOffset;

    // Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.7), loungerMat);
    frame.position.set(loungerX, 0.18, loungerZ);
    frame.rotation.y = -Math.PI / 10;
    frame.castShadow = true;
    group.add(frame);

    // Cushion
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.65), loungerCushionMat);
    cushion.position.set(loungerX, 0.26, loungerZ);
    cushion.rotation.y = -Math.PI / 10;
    group.add(cushion);

    // Reclined headrest
    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.65), loungerCushionMat);
    headrest.position.set(loungerX + 0.7, 0.42, loungerZ - 0.2);
    headrest.rotation.y = -Math.PI / 10;
    headrest.rotation.z = -0.35;
    group.add(headrest);
  });

  // Small drinks side table between loungers
  const sideTable = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 16), darkAccentMat);
  sideTable.position.set(poolCenter.x + 7.6, 0.2, poolCenter.z);
  sideTable.castShadow = true;
  group.add(sideTable);

  // Cocktail glass on table
  const glassCup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.15, 8), glassMat);
  glassCup.position.set(poolCenter.x + 7.6, 0.46, poolCenter.z);
  group.add(glassCup);

  // ==========================================
  // 7. LUSH SURROUNDING VEGETATION & TREES
  // ==========================================
  // Tropical broad-leaf banana palm on foreground right (prominent in photo)
  const palmGroup = new THREE.Group();
  palmGroup.position.set(poolCenter.x + 9.5, 0, poolCenter.z + 4.5);
  const palmLeafMat = new THREE.MeshStandardMaterial({
    color: 0x559e2f,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.2;
    const leafGeo = new THREE.PlaneGeometry(1.2, 3.2, 4, 8);
    const leaf = new THREE.Mesh(leafGeo, palmLeafMat);
    leaf.position.set(0, 1.8, 0);
    leaf.rotation.order = 'YXZ';
    leaf.rotation.y = angle;
    leaf.rotation.x = 0.55 + Math.random() * 0.2;
    leaf.rotation.z = 0.15;
    leaf.scale.set(1, 1 + Math.random() * 0.3, 1);
    palmGroup.add(leaf);
  }
  const palmTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.4, 8), darkAccentMat);
  palmTrunk.position.set(0, 1.2, 0);
  palmGroup.add(palmTrunk);
  group.add(palmGroup);

  // Dense green shrubbery on foreground left (as in photo)
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x3e7b27, roughness: 0.9 });
  const bushPositions = [
    [poolCenter.x - poolWidth / 2 - 3.2, 1.2, poolCenter.z + 4.0, 2.0],
    [poolCenter.x - poolWidth / 2 - 3.8, 1.0, poolCenter.z + 1.5, 1.8],
    [poolCenter.x - poolWidth / 2 - 3.0, 0.9, poolCenter.z - 1.5, 1.6],
    [poolCenter.x - poolWidth / 2 - 2.5, 0.8, poolCenter.z + 6.0, 1.7],
  ];
  bushPositions.forEach(([bx, by, bz, bscale]) => {
    const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(bscale, 1), bushMat);
    bush.position.set(bx, by, bz);
    bush.scale.set(1.2, 0.9, 1.1);
    bush.castShadow = true;
    group.add(bush);
  });

  // Background tall trees canopy behind the villa (as seen in photo)
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
  const treeCanopyMat = new THREE.MeshStandardMaterial({ color: 0x3b6e2d, roughness: 0.85 });

  for (let t = -16; t <= 16; t += 4.5) {
    const treeGroup = new THREE.Group();
    const treeZ = villaOriginZ - 8.5 + (Math.sin(t) * 2.5);
    treeGroup.position.set(t, 0, treeZ);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 5, 8), treeTrunkMat);
    trunk.position.y = 2.5;
    treeGroup.add(trunk);

    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2 + Math.random() * 0.8, 1), treeCanopyMat);
    canopy.position.y = 6.2;
    canopy.scale.set(1.2, 1.0, 1.1);
    canopy.castShadow = true;
    treeGroup.add(canopy);

    group.add(treeGroup);
  }

  // Animation update function for pool ripples
  const update = (time: number) => {
    if (waterNormalTex) {
      waterNormalTex.offset.x = (time * 0.04) % 1;
      waterNormalTex.offset.y = (time * 0.03) % 1;
    }
    // Gentle water surface undulating
    waterMesh.position.y = -0.15 + Math.sin(time * 1.5) * 0.015;
    spaWaterMesh.position.y = -0.02 + Math.cos(time * 2.0) * 0.01;
  };

  return {
    group,
    waterMesh,
    spaWaterMesh,
    poolLights,
    interiorLights,
    soffitLights,
    update,
  };
}
