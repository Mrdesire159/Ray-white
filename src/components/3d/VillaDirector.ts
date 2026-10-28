import * as THREE from 'three';

export interface CameraWaypoint {
  pos: THREE.Vector3;
  lookAt: THREE.Vector3;
  label: string;
  time: number; // 0 to 1
  description: string;
}

export const TOUR_CHAPTERS: { id: string; label: string; time: number; sub: string }[] = [
  { id: 'arrival', label: 'Aerial Fly-In', time: 0.02, sub: 'Approaching the estate over pool & gardens' },
  { id: 'slowmo_above', label: 'Slow-Mo Above House', time: 0.28, sub: 'High crane sweep showing roof, pool & grounds' },
  { id: 'pool_terrace', label: 'Pool & Sun Terrace', time: 0.52, sub: 'Gliding low past turquoise lap pool & stone wall' },
  { id: 'interior_reveal', label: 'Interior Living Reveal', time: 0.74, sub: 'Sliding through glass doors to modern salon' },
  { id: 'panoramic_vista', label: 'Living to Pool Vista', time: 0.92, sub: 'Interior look-back out across the deck & waters' },
];

export class VillaCameraDirector {
  private camera: THREE.PerspectiveCamera;
  private pathPoints: THREE.Vector3[] = [];
  private lookPoints: THREE.Vector3[] = [];
  private pathCurve: THREE.CatmullRomCurve3;
  private lookCurve: THREE.CatmullRomCurve3;

  public progress: number = 0; // 0.0 to 1.0
  public isPlaying: boolean = true;
  public speedMultiplier: number = 1.0;
  public isFreeOrbit: boolean = false;

  // Damped targets for silky camera motion
  private currentPos = new THREE.Vector3();
  private currentLookAt = new THREE.Vector3();
  private targetPos = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;

    // Define cinematic spline trajectory matching user instructions:
    // 1. Fly towards villa
    // 2. Slow-motion above the building showing pool & exterior
    // 3. Move down to reveal interior
    this.pathPoints = [
      // 0.0: Far aerial approach
      new THREE.Vector3(10.0, 10.5, 26.0),
      // 0.12: Gliding closer over the palm trees & pool
      new THREE.Vector3(6.5, 7.8, 18.0),
      // 0.25: Rising in slow-motion above the house
      new THREE.Vector3(2.5, 13.5, 9.5),
      // 0.38: Slow-motion crane high above the roofline looking down at the house and pool
      new THREE.Vector3(-2.0, 14.8, 0.5),
      // 0.50: Descending diagonally above the sun terrace and loungers
      new THREE.Vector3(5.5, 6.2, 8.5),
      // 0.62: Low banking glide along the pool edge and stone retaining wall
      new THREE.Vector3(1.0, 2.5, 8.2),
      // 0.72: Approaching timber deck and open sliding glass doors
      new THREE.Vector3(-0.8, 1.85, 2.2),
      // 0.82: Gliding inside living room interior past the modern sofa & art
      new THREE.Vector3(-1.8, 1.8, -3.2),
      // 0.92: Inside living room circling toward window framing the pool view
      new THREE.Vector3(-0.5, 1.8, -4.0),
      // 1.0: Seamless return to approach point
      new THREE.Vector3(10.0, 10.5, 26.0),
    ];

    this.lookPoints = [
      // 0.0: Looking at the front facade & pool
      new THREE.Vector3(-1.5, 3.2, 0.0),
      // 0.12: Looking at the pool and entrance
      new THREE.Vector3(-1.0, 2.8, 2.0),
      // 0.25: Looking down at the roofline & courtyard
      new THREE.Vector3(-0.5, 3.5, 2.5),
      // 0.38: Looking down at the entire pool & exterior grounds
      new THREE.Vector3(1.0, 0.5, 6.5),
      // 0.50: Looking at the timber deck & loungers
      new THREE.Vector3(2.0, 1.2, 5.0),
      // 0.62: Looking toward the open glass door of the living room
      new THREE.Vector3(-1.5, 1.8, -3.0),
      // 0.72: Looking straight into the illuminated interior salon
      new THREE.Vector3(-1.5, 1.8, -4.5),
      // 0.82: Looking at the designer sofa, table and kitchen island
      new THREE.Vector3(1.5, 1.6, -2.5),
      // 0.92: Looking out from interior through the glass at the pool
      new THREE.Vector3(1.2, 1.2, 7.0),
      // 1.0: Back to exterior
      new THREE.Vector3(-1.5, 3.2, 0.0),
    ];

    this.pathCurve = new THREE.CatmullRomCurve3(this.pathPoints, true, 'centripetal', 0.5);
    this.lookCurve = new THREE.CatmullRomCurve3(this.lookPoints, true, 'centripetal', 0.5);

    this.currentPos.copy(this.pathPoints[0]);
    this.currentLookAt.copy(this.lookPoints[0]);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }

  public setProgress(p: number) {
    this.progress = (p % 1 + 1) % 1;
    this.updateCameraInstant();
  }

  public jumpToChapter(chapterTime: number) {
    this.isFreeOrbit = false;
    this.progress = chapterTime;
    this.updateCameraInstant();
  }

  private updateCameraInstant() {
    this.pathCurve.getPoint(this.progress, this.targetPos);
    this.lookCurve.getPoint(this.progress, this.targetLookAt);
    this.currentPos.copy(this.targetPos);
    this.currentLookAt.copy(this.targetLookAt);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }

  public update(delta: number) {
    if (this.isFreeOrbit) {
      // Free orbit mode: Orbit controls takes charge of the camera
      return;
    }

    if (this.isPlaying) {
      // Calculate slow-motion progress increment
      // In regions above the house (0.22 - 0.48), slow motion kicks in for an extra-smooth scenic flyover!
      let localSpeed = 0.024 * this.speedMultiplier;
      if (this.progress > 0.20 && this.progress < 0.48) {
        // Slow motion above the building showing pool & exterior
        localSpeed *= 0.65;
      } else if (this.progress > 0.68 && this.progress < 0.88) {
        // Slow motion gliding into the interior
        localSpeed *= 0.75;
      }

      this.progress = (this.progress + delta * localSpeed) % 1.0;
    }

    // Sample spline
    this.pathCurve.getPoint(this.progress, this.targetPos);
    this.lookCurve.getPoint(this.progress, this.targetLookAt);

    // Smooth exponential dampening for cinema quality
    const dampFactor = 1.0 - Math.exp(-8.0 * delta);
    this.currentPos.lerp(this.targetPos, dampFactor);
    this.currentLookAt.lerp(this.targetLookAt, dampFactor);

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }
}
