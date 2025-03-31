import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import backgroundMusic from './sounds/background.mp3';
import jumpSound from './sounds/jump.mp3';
import coinSound from './sounds/coin.mp3';
import dashSound from './sounds/dash.mp3';
import noSound from './sounds/no.mp3';
import rawrSound from './sounds/rawr.mp3';
import nipplejs from 'nipplejs';

class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private player: THREE.Group;
    private dogezilla: THREE.Group;
    private buildings: THREE.Group[];
    private clock: THREE.Clock;
    private score: number;
    private isGameOver: boolean;
    private moveSpeed: number;  
    private keys: { [key: string]: boolean };
    private cameraOffset: THREE.Vector3;
    private mouseX: number;
    private mouseY: number;
    private mouseSensitivity: number;
    private playerRotation: THREE.Euler;
    private velocity: THREE.Vector3;
    private isGrounded: boolean;
    private canWallJump: boolean;
    private lastWallNormal: THREE.Vector3;
    private gravity: number;
    private jumpForce: number;
    private wallJumpForce: number;
    private wallPushForce: number;
    private wallSlideSpeed: number;
    private particles: THREE.Points[];
    private particleLifetimes: number[];
    private characterModel: THREE.Group | null;
    private animationMixer: THREE.AnimationMixer | null;
    private runningAnimation: THREE.AnimationAction | null;
    private idleAnimation: THREE.AnimationAction | null;
    private jumpStartAnimation: THREE.AnimationAction | null;
    private jumpLandAnimation: THREE.AnimationAction | null;
    private groundLevel: number;
    private backgroundMusic: HTMLAudioElement | null = null;
    private isMusicPlaying: boolean = false;
    private musicInstructionElement: HTMLDivElement | null = null;
    private jumpSoundEffect: HTMLAudioElement | null = null;
    private coinSoundEffect: HTMLAudioElement | null = null;
    private dashSoundEffect: HTMLAudioElement | null = null;
    private playerParts: {
        leftArm: THREE.Object3D;
        rightArm: THREE.Object3D;
        leftLeg: THREE.Object3D;
        rightLeg: THREE.Object3D;
    } = {
        leftArm: null!,
        rightArm: null!,
        leftLeg: null!,
        rightLeg: null!
    };
    private originalCameraPosition: THREE.Vector3;
    private originalCameraTarget: THREE.Vector3;
    private isViewingFront: boolean = false;
    private isMouseMoving: boolean = false;
    private mouseStopTimeout: number | null = null;
    private wasMoving: boolean = false;
    private wasIdle: boolean = true;
    private joints: {
        leftElbow: THREE.Mesh;
        rightElbow: THREE.Mesh;
        leftKnee: THREE.Mesh;
        rightKnee: THREE.Mesh;
    } = {
        leftElbow: null!,
        rightElbow: null!,
        leftKnee: null!,
        rightKnee: null!
    };
    private isZoomedIn: boolean = false;
    private normalCameraDistance: number = 20; // Current distance
    private zoomedCameraDistance: number = 10; // 50% closer
    private normalCameraHeight: number = 10;   // Current height
    private zoomedCameraHeight: number = 5;    // Lower height for zoom mode
    private characterBody: THREE.Group | null = null;
    private smokeTexture: THREE.Texture | null = null;
    // private audioContext: AudioContext | null = null;
    // private jumpSound: AudioBuffer | null = null;
    private baseSpeed: number = 0.2;
    private currentSpeed: number = 0.2;
    private lastSpeedChange: number = 0;
    private movementState: 'normal' | 'dash' | 'slow' = 'normal';
    private maxSpeedMultiplier: number = 2.0;  // Maximum 200% of base speed
    private dashDuration: number = 200; // Duration in milliseconds (0.2 seconds)
    private dashStartTime: number | null = null;  // Use union type
    private dogeHead: THREE.Group | null = null;  // Add this to store head group reference
    private headRotation: number = 0;
    private headRotationDirection: number = 1;
    private headRotationSpeed: number = 0.01;  // Slow head turning speed
    private maxHeadRotation: number = Math.PI / 4;  // 45 degrees max rotation
    private headState: 'turning' | 'pausing' | 'returning' = 'turning';
    private targetRotation: number = 0;
    private currentHeadSpeed: number = 0.05;
    private lastStateChange: number = 0;
    private pauseDuration: number = 0;
    private dogeLegRotation: number = 0;
    private dogeLegSpeed: number = 1;
    // Add these properties to the Game class
    private isEndScreenPlaying: boolean = false;
    private endScreenStartTime: number | null = null;
    private endScreenDuration: number = 3000; // 3 seconds for the whole animation
    private screenCrackTexture: THREE.Texture | null = null;
    private screenCrackOverlay: THREE.Mesh | null = null;
    // Add these properties to the Game class
    private ninjaDashCounter: number = 0;
    private ninjaDashCounterElement: HTMLDivElement;
    // Add these properties to the Game class near the top with other properties
    private isNinjaDashing: boolean = false;
    private ninjaDashSpeed: number = 2.0;    // Increased dash speed for ninja
    private ninjaDashStartTime: number | null = null;
    // Change Dogezilla's dash-related properties to have 'doge' prefix
    private dogeMovementState: 'normal' | 'dash' | 'slow' = 'normal';
    private dogeDashStartTime: number | null = null;  // Renamed from dashStartTime
    private dogeDashDuration: number = 200;          // Renamed from dashDuration
    // Add this with other ninja dash properties
    private ninjaDashLevel: number = 1;  // Starting level
    private ninjaDashDuration: number = 100 * this.ninjaDashLevel;  // Duration scales with level
    // Add these new properties to the Game class
    private dashParticles: THREE.Points[] = [];
    private dashParticleLifetimes: number[] = [];
    private dashAfterglowDuration: number = 300; // Duration of afterglow
    private isDashingOrAfterglowing: boolean = false;
    // Add these properties to the Game class
    private level: number = 1;
    private lastLevelTime: number = 0;
    private levelMessageElement: HTMLDivElement;
    // Add these properties to the Game class
    private dogeSpeedMultiplier: number = 1;
    private targetSpeedMultiplier: number = 1;
    private levelSpeedWeight: number = 0.35; // Adjust this to control speed progression
    // Add these new properties
    private fireParticles: THREE.Points[] = [];
    private fireParticleLifetimes: number[] = [];
    private mapBoundary: number = 95; // Match with your grass placement (95 units from center)
    private fireHeight: number = 25;  // Height of the fire wall
    // Add these properties to the Game class
    private coins: THREE.Mesh[] = [];
    private coinRotationSpeed: number = 0.02;
    private speedLevel: number = 1;
    private speedExp: number = 0;  // 0-100%
    private speedLevelElement!: HTMLDivElement;
    private speedBarElement!: HTMLDivElement;
    private speedMessageElement!: HTMLDivElement;
    private basePlayerSpeed: number = 0.3;  // Store original move speed
    private totalCoins: number = 30;
    // Add these properties to the Game class if they don't exist
    private readonly MAX_FIRE_PARTICLES = 1000; // Adjust this number based on performance
    private readonly FIRE_PARTICLE_LIFETIME = 0.5; // Seconds each particle lives
    // Add these new properties for speed boost
    private isSpeedBoosted: boolean = false;
    private speedBoostEndTime: number = 0;
    private readonly SPEED_BOOST_DURATION: number = 300; // 0.3 seconds in milliseconds
    private readonly SPEED_BOOST_MULTIPLIER: number = 2.0; // 2x speed boost
    private readonly PHYSICS_SPEED_MULTIPLIER: number = 65; // Global physics speed multiplier
    private goldAuraParticles: THREE.Points[] = []; // Array to store particle systems
    private goldAuraLifetimes: number[] = []; // Array to store particle lifetimes
    private endScreenElement: HTMLDivElement | null = null;
    private isEndScreenVisible: boolean = false;
    private noSoundEffect: HTMLAudioElement | null = null;  // Add this property
    private rawrSoundEffect: HTMLAudioElement | null = null;  // Add this property
    private joystick: any = null; 
    private joystickContainer: HTMLDivElement | null = null;
    private isMobile: boolean = false;
    private touchControls: boolean = false;
    private joystickDirection: THREE.Vector2 = new THREE.Vector2(0, 0);

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.player = new THREE.Group();
        this.dogezilla = new THREE.Group();
        this.buildings = [];
        this.clock = new THREE.Clock();
        this.score = 0;
        this.isGameOver = false;
        this.moveSpeed = 0.3;
        this.keys = {};
        this.cameraOffset = new THREE.Vector3(0, 8, 15);
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseSensitivity = 0.0022;
        this.playerRotation = new THREE.Euler(0, Math.PI, 0);
        this.velocity = new THREE.Vector3();
        this.isGrounded = true;
        this.canWallJump = false;
        this.lastWallNormal = new THREE.Vector3();
        this.gravity = 0.015;
        this.jumpForce = 0.4;
        this.wallJumpForce = 0.4;
        this.wallPushForce = 0.4;
        this.wallSlideSpeed = 0.05;
        this.particles = [];
        this.particleLifetimes = [];
        this.characterModel = null;
        this.animationMixer = null;
        this.runningAnimation = null;
        this.idleAnimation = null;
        this.jumpStartAnimation = null;
        this.jumpLandAnimation = null;
        this.groundLevel = 0;
        this.originalCameraPosition = new THREE.Vector3(0, 10, -20);
        this.originalCameraTarget = new THREE.Vector3(0, 0, 0);

        // Adjust jump values
        this.gravity = 0.015;
        this.jumpForce = 0.4;      // Increased to 0.4
        this.wallJumpForce = 0.4;  // Match regular jump force
        this.wallPushForce = 0.4;  // Stronger push from wall
        
        // Initialize player position above ground
        this.player.position.set(0, 1.0, 0);  // Raise player off ground slightly
        
        this.init();
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('click', this.lockPointer.bind(this));

        // 3. Comment out audio initialization
        // this.audioContext = new AudioContext();
        // this.loadJumpSound();

        this.smokeTexture = this.createSmokeTexture();
        this.createScreenCrackEffect();

        // Create ninja dash counter UI with updated name
        this.ninjaDashCounterElement = document.createElement('div');
        this.ninjaDashCounterElement.style.position = 'fixed';
        this.ninjaDashCounterElement.style.bottom = '20px';
        this.ninjaDashCounterElement.style.left = '20px';
        this.ninjaDashCounterElement.style.color = 'white';
        this.ninjaDashCounterElement.style.fontSize = '24px';
        this.ninjaDashCounterElement.style.fontFamily = 'Arial, sans-serif';
        this.ninjaDashCounterElement.textContent = 'Dash: 0';
        document.body.appendChild(this.ninjaDashCounterElement);

        // Create level message element
        this.levelMessageElement = document.createElement('div');
        this.levelMessageElement.style.position = 'fixed';
        this.levelMessageElement.style.top = '50%';
        this.levelMessageElement.style.left = '50%';
        this.levelMessageElement.style.transform = 'translate(-50%, -50%)';
        this.levelMessageElement.style.color = 'white';
        this.levelMessageElement.style.fontSize = '48px';
        this.levelMessageElement.style.fontFamily = 'Arial, sans-serif';
        this.levelMessageElement.style.textAlign = 'center';
        this.levelMessageElement.style.opacity = '0';
        this.levelMessageElement.style.transition = 'opacity 0.5s';
        this.levelMessageElement.style.pointerEvents = 'none';
        this.levelMessageElement.style.zIndex = '1000';
        document.body.appendChild(this.levelMessageElement);

        // Initialize background music
        this.backgroundMusic = new Audio(backgroundMusic);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5;
        
        // Initialize jump sound effect
        this.jumpSoundEffect = new Audio(jumpSound);
        this.jumpSoundEffect.volume = 0.2;
        
        // Initialize coin sound effect
        this.coinSoundEffect = new Audio(coinSound);
        this.coinSoundEffect.volume = 0.3; // Increased from 0.2 to 0.3 (50% louder)
        
        // Initialize dash sound effect
        this.dashSoundEffect = new Audio(dashSound);
        this.dashSoundEffect.volume = 0.5;  // Increased from 0.2 to 0.5
        this.dashSoundEffect.loop = false;
        
        // Create music instruction text
        this.createMusicInstruction();
        
        // Add event listener for user interaction to start music
        document.addEventListener('click', () => {
            if (!this.isMusicPlaying && this.backgroundMusic) {
                this.backgroundMusic.play().catch(error => {
                    console.log('Autoplay prevented:', error);
                    this.isMusicPlaying = false;
                });
                this.isMusicPlaying = true;
            }
        }, { once: true });

        // Create end screen element
        this.createEndScreen();

        // Initialize no sound effect
        this.noSoundEffect = new Audio(noSound);
        this.noSoundEffect.volume = 1.0;  // Changed from 1.3 to 1.0 (max allowed)
        this.noSoundEffect.loop = false;

        // Initialize rawr sound effect
        this.rawrSoundEffect = new Audio(rawrSound);
        this.rawrSoundEffect.volume = 0.5;  // Changed from 1.0 to 0.5 (half volume)
        this.rawrSoundEffect.loop = false;

        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (this.isMobile) {
            this.createMobileControls();
        }
    }

    private init(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container')?.appendChild(this.renderer.domElement);

        // Initialize screen crack effect
        this.createScreenCrackEffect();  // Add this line here

        // Initial camera setup
        this.updateCamera();

        // Sunset atmosphere
        this.scene.background = new THREE.Color(0xFFA07A);  // Warm sunset color
        this.scene.fog = new THREE.Fog(0xFFA07A, 30, 150);  // Atmospheric fog

        // Ground with grass texture
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x91785c,  // Warm earth tone
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add scattered ruins and vegetation
        this.createRuins();
        
        // Adjust lighting for sunset
        const ambientLight = new THREE.AmbientLight(0xffd4b3, 0.4);  // Warm ambient light
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xff8c66, 1);  // Sunset-colored light
        sunLight.position.set(-50, 30, -20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        this.scene.add(sunLight);

        this.scene.add(this.player);

        this.createPlayer();
        this.createDogezilla();
        this.createBuildings();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.animate();

        // Add fire wall initialization
        this.createFireWall();

        // Initialize coins and UI
        this.spawnCoins();
        this.createSpeedUI();
        
        // Store initial move speed
        this.basePlayerSpeed = this.moveSpeed;
    }

    private createPlayer(): void {
        this.player = new THREE.Group();
        this.characterBody = new THREE.Group();

        // Colors
        const bodyColor = 0x2c2c2c;  // Dark gray/black for ninja outfit
        const eyeColor = 0xffffff;   // White for eyes
        const beltColor = 0xff0000;  // Bright red for waistbelt
        const blushColor = 0xff9999;  // Light pink for blush

        // Head (larger and more spherical for Mega Man style)
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.scale.setZ(0.8);
        head.castShadow = true;

        // Body (shorter and wider)
        const bodyGeometry = new THREE.BoxGeometry(0.9, 0.7, 0.6);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;

        // Eyes (larger and more pronounced)
        const eyeGeometry = new THREE.BoxGeometry(0.12, 0.18, 0.1);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: eyeColor });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 1.4, 0.35);
        rightEye.position.set(0.15, 1.4, 0.35);
        leftEye.castShadow = true;
        rightEye.castShadow = true;

        // Adjust waistbelt dimensions (reduced height from 0.15 to 0.1)
        const beltGeometry = new THREE.BoxGeometry(1.0, 0.1, 0.7); // Height reduced to 2/3 (0.15 -> 0.1)
        const beltMaterial = new THREE.MeshStandardMaterial({ 
            color: beltColor,
            metalness: 0.3,
            roughness: 0.7
        });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.9;
        belt.castShadow = true;

        // Add blush marks on cheeks (reduced size from 0.1 to 0.07)
        const blushGeometry = new THREE.CircleGeometry(0.07, 16); // Reduced radius by 70%
        const blushMaterial = new THREE.MeshStandardMaterial({ 
            color: blushColor,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });

        // Left blush
        const leftBlush = new THREE.Mesh(blushGeometry, blushMaterial);
        leftBlush.position.set(-0.25, 1.35, 0.41);

        // Right blush
        const rightBlush = new THREE.Mesh(blushGeometry, blushMaterial);
        rightBlush.position.set(0.25, 1.35, 0.41);

        // Add ninja sword with better proportions
        const createSword = () => {
            const swordGroup = new THREE.Group();

            // Total length around 1.4 units (reduced from 2.8)
            // Blade is about 5/6 of total length
            const bladeGeometry = new THREE.BoxGeometry(0.06, 1.15, 0.12); // Blade length
            const bladeMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xc0c0c0,
                metalness: 0.8,
                roughness: 0.2
            });
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.y = 0.15; // Adjusted to align with handle
            blade.castShadow = true;

            // Handle is about 1/6 of total length
            const handleGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.08); // Handle length
            const handleMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x000000,
                metalness: 0.3,
                roughness: 0.7
            });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.castShadow = true;

            // Guard slightly wider than handle but thin
            const guardGeometry = new THREE.BoxGeometry(0.2, 0.04, 0.04);
            const guardMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xb87333,
                metalness: 0.5,
                roughness: 0.5
            });
            const guard = new THREE.Mesh(guardGeometry, guardMaterial);
            guard.position.y = 0.1;
            guard.castShadow = true;

            swordGroup.add(blade);
            swordGroup.add(handle);
            swordGroup.add(guard);

            // Moved to character's left side (positive X)
            swordGroup.position.set(0.7, 0.5, 0.3);
            
            // Keeping same rotations
            swordGroup.rotation.z = -Math.PI / -5;  //  degrees, tilting downward
            swordGroup.rotation.y = Math.PI / 15;  // 15 degrees, angling slightly forward
            
            return swordGroup;
        };

        const sword = createSword();

        // Legs with knee joints
        const createLeg = (isLeft: boolean) => {
            const legGroup = new THREE.Group();
            const thigh = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, 0.3, 0.25),
                new THREE.MeshStandardMaterial({ color: bodyColor })
            );
            thigh.position.y = -0.15;  // Move thigh up
            thigh.castShadow = true;
            
            const shin = new THREE.Mesh(
                new THREE.BoxGeometry(0.23, 0.2, 0.23),
                new THREE.MeshStandardMaterial({ color: bodyColor })
            );
            shin.position.y = -0.35;  // Adjust shin position relative to thigh
            shin.castShadow = true;
            
            const boot = new THREE.Mesh(
                new THREE.BoxGeometry(0.35, 0.2, 0.4),
                new THREE.MeshStandardMaterial({ color: bodyColor })
            );
            boot.position.y = -0.5;  // Adjust boot position relative to shin
            boot.castShadow = true;

            legGroup.add(thigh);
            legGroup.add(shin);
            legGroup.add(boot);
            legGroup.position.set(isLeft ? -0.2 : 0.2, 0.7, 0);  // Raise leg group position
            return legGroup;
        };

        const leftLeg = createLeg(true);
        const rightLeg = createLeg(false);

        // Add ALL parts to the characterBody group, including legs
        this.characterBody.add(head);
        this.characterBody.add(body);
        this.characterBody.add(leftEye);
        this.characterBody.add(rightEye);
        this.characterBody.add(belt);
        this.characterBody.add(leftBlush);
        this.characterBody.add(rightBlush);
        this.characterBody.add(sword);
        this.characterBody.add(leftLeg);    // Now adding legs to characterBody
        this.characterBody.add(rightLeg);   // Now adding legs to characterBody

        // Add the characterBody to the player group
        this.player.add(this.characterBody);

        // Update playerParts references
        this.playerParts = {
            leftArm: null!,
            rightArm: null!,
            leftLeg: leftLeg,
            rightLeg: rightLeg
        };

        // Also store joint references for animation
        this.joints = {
            leftElbow: null!,
            rightElbow: null!,
            leftKnee: leftLeg.children[0] as THREE.Mesh,
            rightKnee: rightLeg.children[0] as THREE.Mesh
        };

        // Initial rotation to face away from camera
        this.player.rotation.y = Math.PI;

        // Set initial position - adjust to match collision box
        this.player.position.set(0, 0, 0);  // Start at ground level

        // Add to scene
        this.scene.add(this.player);
    }

    private createDogezilla(): void {
        const dogezilla = new THREE.Group();

        // Body (cylinder)
        const bodyGeometry = new THREE.CylinderGeometry(
            2,      // radiusTop
            1.4,      // radiusBottom
            3.6,    // height
            32,     // radialSegments
            4,      // heightSegments
            true    // openEnded
        );
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf4c542,  // Doge yellow/tan color
            roughness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 2, -0.3);
        body.rotation.x = Math.PI / 2;
        body.castShadow = true;

        // Caps
        const frontCapGeometry = new THREE.SphereGeometry(2, 32, 32);
        const backCapGeometry = new THREE.SphereGeometry(1.6, 32, 32);  // Smaller radius for back
        
        // Front cap (cream colored, stays the same)
        const frontCapMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFF5E6,
            roughness: 0.7
        });
        const frontCap = new THREE.Mesh(frontCapGeometry, frontCapMaterial);
        frontCap.position.set(0, 2, 1.8);
        frontCap.scale.set(1, 1, 0.5);
        
        // Back cap (modified to be more dog-like)
        const backCap = new THREE.Mesh(backCapGeometry, bodyMaterial);
        backCap.position.set(0, 2, -1.6);
        backCap.scale.set(1, 0.9, 0.7);  // Squished slightly vertically and back-to-front
        
        // Create a group for the body parts
        const dogezillaBody = new THREE.Group();
        dogezillaBody.add(body);
        dogezillaBody.add(frontCap);
        dogezillaBody.add(backCap);

        // Add the body group to dogezilla
        dogezilla.add(dogezillaBody);

        // Head
        const headGeometry = new THREE.SphereGeometry(1.8, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf4c542
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 4.5, 2);
        head.scale.set(1.2, 1.1, 1);
        head.castShadow = true;

        // Snout
        const snoutGroup = new THREE.Group();
        const snoutGeometry = new THREE.BoxGeometry(1.5, 1, 1.2);
        const snoutMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff
        });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.position.z = 0.6;
        
        const noseGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const noseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            roughness: 0.3
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.scale.set(1, 0.8, 0.8);
        nose.position.z = 1.2;
        
        snoutGroup.add(snout);
        snoutGroup.add(nose);
        snoutGroup.position.set(0, 4, 3);

        // Mouth
        const mouthGeometry = new THREE.TorusGeometry(0.3, 0.08, 8, 12, Math.PI); // Half circle
        const mouthMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.6
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);

        // By default, TorusGeometry creates the torus in the XY plane
        // To make it face forward (along Z), we need to rotate it around the X axis by 90 degrees
        mouth.rotation.x = Math.PI ;
        mouth.rotation.z = 0;            // Clear any Z rotation
        mouth.rotation.y = 0;            // Clear any Y rotation
        mouth.position.set(0, -0.3, 0.5);  // Keep position the same

        // Adjust tongue to match mouth orientation
        const tongueGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.2);
        const tongueMaterial = new THREE.MeshStandardMaterial({
            color: 0xff9999,
            roughness: 0.6
        });
        const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
        tongue.position.set(0, -0.5, 0.5); // Slightly lower and forward

        // Add both to snoutGroup
        snoutGroup.add(mouth);
        snoutGroup.add(tongue);

        // Dogezilla Eyes
        const dogezillaEyeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const dogezillaEyeWhiteMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.2
        });
        
        // Increased pupil size to 70% of eye size
        const dogezillaPupilGeometry = new THREE.SphereGeometry(0.35, 32, 32);
        const dogezillaPupilMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            roughness: 0.2
        });

        // Create left eye
        const dogezillaLeftEyeWhite = new THREE.Mesh(dogezillaEyeGeometry, dogezillaEyeWhiteMaterial);
        const dogezillaLeftPupil = new THREE.Mesh(dogezillaPupilGeometry, dogezillaPupilMaterial);
        dogezillaLeftPupil.position.z = 0.35;
        const dogezillaLeftEye = new THREE.Group();
        dogezillaLeftEye.add(dogezillaLeftEyeWhite);
        dogezillaLeftEye.add(dogezillaLeftPupil);
        dogezillaLeftEye.position.set(-1, 4.8, 3.2);
        dogezillaLeftEye.rotation.x = -0.2;
        dogezillaLeftEye.rotation.y = -0.2;

        // Create right eye
        const dogezillaRightEyeWhite = new THREE.Mesh(dogezillaEyeGeometry, dogezillaEyeWhiteMaterial);
        const dogezillaRightPupil = new THREE.Mesh(dogezillaPupilGeometry, dogezillaPupilMaterial);
        dogezillaRightPupil.position.z = 0.35;
        const dogezillaRightEye = new THREE.Group();
        dogezillaRightEye.add(dogezillaRightEyeWhite);
        dogezillaRightEye.add(dogezillaRightPupil);
        dogezillaRightEye.position.set(1, 4.8, 3.2);
        dogezillaRightEye.rotation.x = -0.2;
        dogezillaRightEye.rotation.y = 0.2;

        // Eyebrows
        const eyebrowGeometry = new THREE.BoxGeometry(0.8, 0.15, 0.15);
        const eyebrowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513
        });
        
        const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        
        leftEyebrow.position.set(-1, 5.3, 3);
        rightEyebrow.position.set(1, 5.3, 3);
        
        leftEyebrow.rotation.z = 0.3;
        rightEyebrow.rotation.z = -0.3;

        // Cheeks (spherical)
        const cheekGeometry = new THREE.SphereGeometry(0.9, 24, 24);
        const cheekMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff9999,
            transparent: true,
            opacity: 0.3,
            roughness: 0.9,
            metalness: 0.0,
            blending: THREE.AdditiveBlending
        });
        
        const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        
        // Same positions as before
        leftCheek.position.set(-1.1, 4.0, 3.0);
        rightCheek.position.set(1.1, 4.0, 3.0);
        
        // More balanced scaling (changed from 1, 0.8, 0.4 to 0.7, 0.7, 0.6)
        // This makes them smaller overall but more evenly spherical
        leftCheek.scale.set(0.7, 0.7, 0.6);
        rightCheek.scale.set(0.7, 0.7, 0.6);

        // Ears (adjusted position and rotation)
        const earGeometry = new THREE.ConeGeometry(0.6, 1.2, 32);
        const earMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf4c542
        });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        
        // Moved ears outward (increased x position from ±1.2 to ±1.5)
        // Moved ears slightly back (decreased z from 1.5 to 1.2)
        leftEar.position.set(-1.5, 5.8, 1.2);
        rightEar.position.set(1.5, 5.8, 1.2);
        
        // Adjusted rotations to make ears stick out more
        leftEar.rotation.z = -0.4;  // Increased from -0.3 to -0.4
        leftEar.rotation.x = -0.1;  // Reduced from -0.2 to -0.1
        leftEar.rotation.y = 0.2;   // Added slight Y rotation
        
        rightEar.rotation.z = 0.4;  // Increased from 0.3 to 0.4
        rightEar.rotation.x = -0.1; // Reduced from -0.2 to -0.1
        rightEar.rotation.y = -0.2; // Added slight Y rotation

        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.3, 0.1, 2, 32);
        const tailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf4c542
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 2.5, -2.5);
        tail.rotation.x = Math.PI / 4;
        tail.castShadow = true;

        // Legs
        const legGeometry = new THREE.CylinderGeometry(
            0.5,    // radiusTop
            0.4,    // radiusBottom (slightly tapered)
            3,      // height (increased from 2 to 3)
            8,      // radialSegments
            1,      // heightSegments
            false,  // openEnded
            0,      // thetaStart
            Math.PI * 2
        );
        const legMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf4c542
        });
        
        const legs = [];
        const legPositions = [
            [-1, 0.5, -1.5],  // Adjusted Y position down from 1 to 0.5
            [1  , 0.5, -1.5],   // to compensate for longer legs
            [-1.5, 0.5, 1.5],
            [1.5, 0.5, 1.5]
        ];
        
        for (const pos of legPositions) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            legs.push(leg);
        }

        // Create a group for the head and its features
        const headGroup = new THREE.Group();
        
        // Reset the head's position to 0,0,0 since it will be positioned by the group
        head.position.set(0, 0, 0);
        head.scale.set(1.2, 1.1, 1);
        head.castShadow = true;
        headGroup.add(head);

        // Adjust all head feature positions relative to 0,0,0
        // (subtract the original head position of (0, 4.5, 2) from their current positions)
        snoutGroup.position.set(0, -0.5, 1);      // Was (0, 4, 3)
        dogezillaLeftEye.position.set(-1, 0.3, 1.2);   // Was (-1, 4.8, 3.2)
        dogezillaRightEye.position.set(1, 0.3, 1.2);   // Was (1, 4.8, 3.2)
        leftEyebrow.position.set(-1, 0.8, 1);     // Was (-1, 5.3, 3)
        rightEyebrow.position.set(1, 0.8, 1);     // Was (1, 5.3, 3)
        leftCheek.position.set(-1.1, -0.5, 1);    // Was (-1.1, 4.0, 3.0)
        rightCheek.position.set(1.1, -0.5, 1);    // Was (1.1, 4.0, 3.0)
        leftEar.position.set(-1.5, 1.3, -0.8);    // Was (-1.5, 5.8, 1.2)
        rightEar.position.set(1.5, 1.3, -0.8);    // Was (1.5, 5.8, 1.2)

        // Add all features to headGroup
        headGroup.add(snoutGroup);
        headGroup.add(dogezillaLeftEye);
        headGroup.add(dogezillaRightEye);
        headGroup.add(leftEyebrow);
        headGroup.add(rightEyebrow);
        headGroup.add(leftCheek);
        headGroup.add(rightCheek);
        headGroup.add(leftEar);
        headGroup.add(rightEar);

        // Position the entire head group
        headGroup.position.set(0, 4.5, 2);
        
        // Store reference to head group
        this.dogeHead = headGroup;
        
        // Add headGroup to dogezilla
        dogezilla.add(headGroup);

        // Add remaining parts
        dogezilla.add(tail);
        legs.forEach(leg => dogezilla.add(leg));

        // Adjust final position and scale
        dogezilla.position.set(20, 3, 20);  // Changed Y from 0 to 3
        dogezilla.scale.set(2, 2, 2);

        this.dogezilla = dogezilla;
        this.scene.add(this.dogezilla);
    }

    private createRuins(): void {
        // Create fallen pillars and ruins
        for (let i = 0; i < 30; i++) {
            // Fallen pillars
            if (Math.random() > 0.5) {
                const pillarGeometry = new THREE.CylinderGeometry(1, 1, 8, 8);
                const pillarMaterial = new THREE.MeshStandardMaterial({
                    color: 0xd3d3d3,
                    roughness: 0.7,
                    metalness: 0.1
                });
                const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
                
                // Random position and rotation for fallen pillars
                const x = Math.random() * 160 - 80;
                const z = Math.random() * 160 - 80;
                pillar.position.set(x, 2, z);
                pillar.rotation.set(Math.random() * Math.PI / 2, Math.random() * Math.PI, 0);
                pillar.castShadow = true;
                pillar.receiveShadow = true;
                this.scene.add(pillar);
                } else {
                // Broken pillar bases
                const baseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 2, 8);
                const baseMaterial = new THREE.MeshStandardMaterial({
                    color: 0xc0c0c0,
                    roughness: 0.8,
                    metalness: 0.1
                });
                const base = new THREE.Mesh(baseGeometry, baseMaterial);
                
                const x = Math.random() * 160 - 80;
                const z = Math.random() * 160 - 80;
                base.position.set(x, 1, z);
                base.castShadow = true;
                base.receiveShadow = true;
                this.scene.add(base);
            }
        }

        // Add stone debris
        for (let i = 0; i < 50; i++) {
            const debrisGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.8 + 0.2);
            const debrisMaterial = new THREE.MeshStandardMaterial({
                color: 0xbebebe,
                roughness: 0.9,
                metalness: 0.1
            });
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            
            const x = Math.random() * 180 - 90;
            const z = Math.random() * 180 - 90;
            debris.position.set(x, 0.2, z);
            debris.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            debris.castShadow = true;
            debris.receiveShadow = true;
            this.scene.add(debris);
        }

        // Add some vegetation (simple grass tufts)
        for (let i = 0; i < 200; i++) {
            const grassGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
            const grassMaterial = new THREE.MeshStandardMaterial({
                color: 0x567d46,
                roughness: 1,
                metalness: 0
            });
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            
            const x = Math.random() * 190 - 95;
            const z = Math.random() * 190 - 95;
            grass.position.set(x, 0.4, z);
            grass.rotation.y = Math.random() * Math.PI;
            grass.rotation.x = Math.random() * 0.2 - 0.1;
            grass.castShadow = true;
            this.scene.add(grass);
        }
    }

    private createBuildings(): void {
        for (let i = 0; i < 40; i++) {
            const height = Math.random() * 20 + 10;
            // Create ancient-looking pillars instead of modern buildings
            const geometry = new THREE.CylinderGeometry(2.5, 3, height, 8);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0xd3d3d3,
                roughness: 0.7,
                metalness: 0.1
            });
            
            const building = new THREE.Group();
            const pillar = new THREE.Mesh(geometry, material);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            
            // Add some architectural details
            const capitalGeometry = new THREE.CylinderGeometry(3.5, 2.5, 2, 8);
            const capital = new THREE.Mesh(capitalGeometry, material);
            capital.position.y = height / 2;
            pillar.add(capital);
            
            building.add(pillar);
            
            let x = Math.random() * 160 - 80;
            let z = Math.random() * 160 - 80;
            
            while (Math.sqrt(x * x + z * z) <= 15) {
                x = Math.random() * 160 - 80;
                z = Math.random() * 160 - 80;
            }
            
            building.position.set(x, height/2, z);
            this.buildings.push(building);
            this.scene.add(building);
        }
    }

    private checkBuildingCollision(position: THREE.Vector3): { collision: boolean; normal?: THREE.Vector3; isWall?: boolean; surfaceY: number } {
        // Initialize with default ground level
        const result = { 
            collision: false, 
            isWall: false, 
            surfaceY: this.groundLevel 
        };

        // Adjust collision box to match ninja's visual model
        const playerRadius = 0.4;  // Match ninja's width
        const playerHeight = 2.2;  // Match ninja's height from ground to top of head
        
        for (const building of this.buildings) {
            // Get the pillar mesh (first child of the building group)
            const pillar = building.children[0] as THREE.Mesh;
            if (!pillar || !(pillar.geometry instanceof THREE.CylinderGeometry)) continue;

            // Get building's world position (this is the center of the pillar)
            const buildingPosition = new THREE.Vector3();
            building.getWorldPosition(buildingPosition);
            
            // Get pillar's actual height from geometry
            const pillarHeight = pillar.geometry.parameters.height;
            const pillarRadius = 3; // Increased from 2.5 to 3 to make hitbox wider
            const capitalHeight = 2; // Height of the capital (curved top part)

            // Calculate distance from player to pillar center
            const dx = position.x - buildingPosition.x;
            const dz = position.z - buildingPosition.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            // Calculate pillar's bottom and top positions, including capital
            const pillarBottom = buildingPosition.y - pillarHeight/2;
            const pillarTop = buildingPosition.y + pillarHeight/2 + capitalHeight; // Add capital height to top

            // Use player's actual position for collision checks
            const playerBottom = position.y;
            const playerTop = position.y + playerHeight;

            // Check if player is within pillar's radius
            if (distance < pillarRadius + playerRadius) {
                // Calculate normal vector for wall collision
                const normal = new THREE.Vector3(dx, 0, dz).normalize();
                
                // Check if we're on top of the pillar (including capital)
                // Increased the collision detection range for the top surface
                if (playerBottom >= pillarTop - 0.2 && playerBottom <= pillarTop + 0.2) {
                    // For top surface collision, return the surface Y position
                    return {
                        collision: true,
                        normal: new THREE.Vector3(0, 1, 0),
                        isWall: false,
                        surfaceY: pillarTop
                    };
                }
                
                // Check for wall collision at any height
                if (playerTop > pillarBottom && playerBottom < pillarTop) {
                    // For wall collision, push the player away from the pillar
                    const pushDistance = pillarRadius + playerRadius - distance;
                    position.x += normal.x * pushDistance;
                    position.z += normal.z * pushDistance;
                    
                    return { 
                        collision: true, 
                        normal: normal,
                        isWall: true,
                        surfaceY: playerBottom // Keep current Y position for wall collisions
                    };
                }
            }
        }
        
        return result;
    }

    private handleKeyDown(event: KeyboardEvent): void {
        // Handle space key for restart only when end screen is visible
        if (event.key.toLowerCase() === ' ' && this.isEndScreenVisible) {
            window.location.reload();
            return;
        }

        // Don't process other keys if game is over or end screen is visible
        if (this.isGameOver || this.isEndScreenVisible) {
            return;
        }

        this.keys[event.key.toLowerCase()] = true;

        // Add music toggle with 'M' key
        if (event.key.toLowerCase() === 'm') {
            this.toggleMusic();
        }

        // Add dash with 'E' key
        if (event.key.toLowerCase() === 'e' && this.ninjaDashCounter > 0) {
            // Play dash sound effect
            if (this.dashSoundEffect) {
                console.log('Playing dash sound effect');
                this.dashSoundEffect.currentTime = 0;
                this.dashSoundEffect.play().catch(error => {
                    console.log('Dash sound playback failed:', error);
                });
            }

            this.isNinjaDashing = true;
            this.ninjaDashStartTime = performance.now();
            this.ninjaDashCounter = 0;
            this.updateNinjaDashCounter();
            this.createNinjaDashEffect();
        }

        // Both 'r' and 'o' keys trigger front view
        if (event.key.toLowerCase() === 'r' || event.key.toLowerCase() === 'o') {
            this.isViewingFront = true;
        }
        
        // Add realignment on Y press
        if (event.key.toLowerCase() === 'y') {
            this.realignOrientation();
            console.log('Character realigned to camera direction'); // Debug message
        }

        // Add zoom toggle for 'i' key
        if (event.key.toLowerCase() === 'i') {
            this.isZoomedIn = !this.isZoomedIn; // Toggle zoom state
            console.log(`Camera ${this.isZoomedIn ? 'zoomed in' : 'zoomed out'}`); // Debug message
        }

        if (event.code === 'Space') {
            if (this.isGrounded) {
                // Play jump sound effect
                if (this.jumpSoundEffect) {
                    this.jumpSoundEffect.currentTime = 0; // Reset sound to start
                    this.jumpSoundEffect.play().catch(error => {
                        console.log('Jump sound playback failed:', error);
                    });
                }

                // Normal jump
                this.velocity.y = this.jumpForce;
                this.isGrounded = false;
                
                // Add the jump effect here
                this.createJumpEffect();
                
                if (this.jumpStartAnimation) {
                    this.idleAnimation?.fadeOut(0.1);
                    this.runningAnimation?.fadeOut(0.1);
                    this.jumpStartAnimation.reset().fadeIn(0.1).play().setLoop(THREE.LoopOnce, 1);
                }
            } else if (this.canWallJump) {
                // Play jump sound effect for wall jump too
                if (this.jumpSoundEffect) {
                    this.jumpSoundEffect.currentTime = 0;
                    this.jumpSoundEffect.play().catch(error => {
                        console.log('Jump sound playback failed:', error);
                    });
                }

                this.velocity.y = this.wallJumpForce;
                
                if (this.lastWallNormal) {
                    this.velocity.x = this.lastWallNormal.x * this.wallPushForce * 1.5;
                    this.velocity.z = this.lastWallNormal.z * this.wallPushForce * 1.5;
                    
                    this.startWallJumpAnimation();
                    
                    this.createWallJumpEffect(
                        this.player.position.clone(),
                        this.lastWallNormal
                    );
                }
                
                this.canWallJump = false;
            }
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.keys[event.key.toLowerCase()] = false;
        
        // Both 'r' and 'o' keys release front view
        if (event.key.toLowerCase() === 'r' || event.key.toLowerCase() === 'o') {
            this.isViewingFront = false;
        }
    }

    private lockPointer(): void {
        // Don't lock pointer on mobile devices
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            return;
        }
        
        const gameContainer = document.getElementById('game-container');
        if (gameContainer && gameContainer.requestPointerLock) {
            gameContainer.requestPointerLock();
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        // Don't handle mouse movement on mobile devices
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            return;
        }
        
        if (document.pointerLockElement) {
            this.mouseX = event.movementX * this.mouseSensitivity;
            this.mouseY = event.movementY * this.mouseSensitivity;
            
            // Update rotation
            this.playerRotation.y -= this.mouseX;
            this.playerRotation.x -= this.mouseY;
            
            // Limit vertical look angle
            this.playerRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.playerRotation.x));
            
            // Set mouse moving flag
            this.isMouseMoving = true;

            // Clear existing timeout if there is one
            if (this.mouseStopTimeout !== null) {
                window.clearTimeout(this.mouseStopTimeout);
            }

            // Set new timeout to detect when mouse stops moving
            this.mouseStopTimeout = window.setTimeout(() => {
                this.isMouseMoving = false;
                this.realignOrientation();
            }, 100); // Adjust this delay (in milliseconds) as needed
        }
    }

    private realignOrientation(): void {
        // Reset to camera-relative forward direction
        this.player.rotation.y = this.playerRotation.y;
    }

    private updatePlayerMovement(deltaTime: number): void {
        if (this.isGameOver) return;

        const currentTime = performance.now();
        const scaledDeltaTime = deltaTime * this.PHYSICS_SPEED_MULTIPLIER;

        // Check if speed boost has expired
        if (this.isSpeedBoosted && currentTime >= this.speedBoostEndTime) {
            this.isSpeedBoosted = false;
            this.moveSpeed = this.basePlayerSpeed * (1 + (this.speedLevel - 1) * 0.15);
            this.removeGoldAuraGlow();
        }

        // Update gold aura glow if active
        if (this.isSpeedBoosted) {
            this.updateGoldAuraGlow();
        }

        // Update dash state
        if (this.isNinjaDashing && this.ninjaDashStartTime) {
            const dashElapsed = currentTime - this.ninjaDashStartTime;
            
            if (dashElapsed < this.ninjaDashDuration) {
                // During dash
                const direction = new THREE.Vector3(0, 0, 1);
                direction.applyEuler(new THREE.Euler(0, this.player.rotation.y, 0));
                
                // Add forward lean during dash
                if (this.characterBody) {
                    const dashLeanAngle = Math.PI / 4;
                    this.characterBody.rotation.x = dashLeanAngle;
                }
                
                // Calculate next position with dash movement (scaled by delta time)
                const nextPosition = this.player.position.clone();
                nextPosition.x += direction.x * this.ninjaDashSpeed * scaledDeltaTime;
                nextPosition.z += direction.z * this.ninjaDashSpeed * scaledDeltaTime;
                
                // Check collision before applying movement
                const collision = this.checkBuildingCollision(nextPosition);
                if (!collision.collision) {
                    this.player.position.copy(nextPosition);
                } else {
                    // End dash early if we hit something
                    this.isNinjaDashing = false;
                    if (this.characterBody) {
                        this.characterBody.rotation.x = 0;
                    }
                }
                
                // Create particles during dash
                this.createNinjaDashEffect();
                this.isDashingOrAfterglowing = true;
            } else if (dashElapsed < this.ninjaDashDuration + this.dashAfterglowDuration) {
                // During afterglow
                if (this.characterBody) {
                    const afterglowProgress = (dashElapsed - this.ninjaDashDuration) / this.dashAfterglowDuration;
                    const dashLeanAngle = (Math.PI / 4) * (1 - afterglowProgress);
                    this.characterBody.rotation.x = dashLeanAngle;
                }
                
                // Stop the dash movement but continue particles
                this.isNinjaDashing = false;
                
                // Continue creating particles
                this.createNinjaDashEffect();
            } else {
                // End both dash and afterglow
                this.isNinjaDashing = false;
                this.isDashingOrAfterglowing = false;
                if (this.characterBody) {
                    this.characterBody.rotation.x = 0;
                }
            }
        }

        const moveDistance = this.moveSpeed * scaledDeltaTime;
        const playerDirection = new THREE.Vector3();

        // Always calculate fresh camera-relative directions
        const cameraForward = new THREE.Vector3();
        const cameraRight = new THREE.Vector3();
        
        // Get forward direction from camera (ignore vertical rotation)
        cameraForward.set(0, 0, 1).applyEuler(new THREE.Euler(0, this.playerRotation.y, 0));
        cameraRight.set(1, 0, 0).applyEuler(new THREE.Euler(0, this.playerRotation.y, 0));

        // Simple movement inputs
        if (this.keys['w'] || this.keys['arrowup']) {
            playerDirection.add(cameraForward);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            playerDirection.sub(cameraForward);
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            playerDirection.add(cameraRight);
            this.player.rotation.y = this.playerRotation.y + Math.PI / 2;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            playerDirection.sub(cameraRight);
            this.player.rotation.y = this.playerRotation.y - Math.PI / 2;
        }

        // If not strafing (A/D), face the movement direction or forward
        if (!this.keys['a'] && !this.keys['d']) {
            if (this.keys['s']) {
                this.player.rotation.y = this.playerRotation.y + Math.PI;
            } else {
                this.player.rotation.y = this.playerRotation.y;
            }
        }

        // Normalize movement direction
        if (playerDirection.length() > 0) {
            playerDirection.normalize();
            
            // Calculate next position
            const nextPosition = this.player.position.clone();
            nextPosition.x += playerDirection.x * moveDistance;
            nextPosition.z += playerDirection.z * moveDistance;
            
            // Check collision at current height
            nextPosition.y = this.player.position.y;
            const horizontalCollision = this.checkBuildingCollision(nextPosition);
            
            // Always update position if not hitting a wall
            if (!horizontalCollision.isWall) {
                this.player.position.x = nextPosition.x;
                this.player.position.z = nextPosition.z;
                
                // If we're on a surface, maintain that height
                if (horizontalCollision.collision) {
                    this.player.position.y = horizontalCollision.surfaceY;
                    this.isGrounded = true;
                    this.velocity.y = 0;
                    
                    // Reset any accumulated movement state when landing
                    this.player.rotation.x = 0;
                    this.player.rotation.z = 0;
                    if (this.characterBody) {
                        this.characterBody.rotation.x = 0;
                    }
                }
            } else if (horizontalCollision.isWall && horizontalCollision.normal) {
                this.canWallJump = true;
                this.lastWallNormal = horizontalCollision.normal;
            }
        }

        // Apply gravity (scaled by delta time)
        if (!this.isGrounded) {
            this.velocity.y -= this.gravity * scaledDeltaTime;
        }

        // Vertical movement (scaled by delta time)
        const verticalPosition = this.player.position.clone();
        verticalPosition.y += this.velocity.y * scaledDeltaTime;
        
        const verticalCollision = this.checkBuildingCollision(verticalPosition);
        if (!verticalCollision.collision) {
            this.player.position.y = verticalPosition.y;
            this.isGrounded = false;
        } else {
            if (this.velocity.y < 0) {
                this.isGrounded = true;
                this.velocity.y = 0;
                this.player.position.y = verticalCollision.surfaceY;
                
                // Reset any accumulated movement state when landing
                this.player.rotation.x = 0;
                this.player.rotation.z = 0;
                if (this.characterBody) {
                    this.characterBody.rotation.x = 0;
                }
            } else {
                this.velocity.y = 0;
            }
        }

        // Ground check
        if (this.player.position.y <= this.groundLevel) {
            this.player.position.y = this.groundLevel;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.canWallJump = false;
            
            // Reset any accumulated movement state when landing on ground
            this.player.rotation.x = 0;
            this.player.rotation.z = 0;
            if (this.characterBody) {
                this.characterBody.rotation.x = 0;
            }
        }

        // Update animations
        if (this.animationMixer && this.characterModel) {
            this.animationMixer.update(deltaTime);

            if (!this.isGrounded) {
                // Keep current jump animation playing
            } else if (playerDirection.length() > 0) {
                if (this.runningAnimation && !this.runningAnimation.isRunning()) {
                    this.idleAnimation?.fadeOut(0.1);
                    this.jumpLandAnimation?.fadeOut(0.1);
                    this.runningAnimation.reset().fadeIn(0.1).play();
                }
            } else {
                if (this.idleAnimation && !this.idleAnimation.isRunning() && !this.jumpLandAnimation?.isRunning()) {
                    this.runningAnimation?.fadeOut(0.1);
                    this.idleAnimation.reset().fadeIn(0.1).play();
                }
            }
        }

        // Animate legs while running on ground and handle directional lean
        if (this.isGrounded && (this.keys['w'] || this.keys['a'] || this.keys['s'] || this.keys['d'])) {
            const runSpeed = 14;
            const time = currentTime * 0.001;
            const legRotation = Math.sin(time * runSpeed) * 0.48;

            // Alternate legs
            if (this.playerParts.leftLeg && this.playerParts.rightLeg) {
                this.playerParts.leftLeg.rotation.x = legRotation;
                this.playerParts.rightLeg.rotation.x = -legRotation;
            }

            // Reset previous rotations
            this.player.rotation.x = 0;
            this.player.rotation.z = 0;

            // Handle forward/backward lean
            if (this.keys['w'] || this.keys['s']) {
                const forwardLean = Math.PI / 9;
                this.player.rotateOnAxis(new THREE.Vector3(1, 0, 0), this.keys['s'] ? -forwardLean : forwardLean);
            }

            // Handle sideways lean for strafing
            if (this.keys['a'] || this.keys['d']) {
                const sideLean = Math.PI / 12;
                this.player.rotateOnAxis(new THREE.Vector3(0, 0, 1), this.keys['a'] ? sideLean : -sideLean);
            }
        } else {
            // Reset legs and body rotation when not running or in air
            if (this.playerParts.leftLeg && this.playerParts.rightLeg) {
                this.playerParts.leftLeg.rotation.x = 0;
                this.playerParts.rightLeg.rotation.x = 0;
            }
            // Reset all body lean
            this.player.rotation.x = 0;
            this.player.rotation.z = 0;
        }

        // After velocity and position updates, add this aerial animation
        if (!this.isGrounded) {
            const jumpLeanAngle = Math.PI / 5.14;
            const maxBackwardLean = -Math.PI / 36;
            
            if (this.characterBody && !this.canWallJump) {
                // Smoothly transition to forward lean
                const currentLean = this.characterBody.rotation.x;
                const targetLean = jumpLeanAngle;
                
                // Smooth interpolation
                this.characterBody.rotation.x += (targetLean - currentLean) * 0.15;
                
                // Add vertical tilt with limits
                const verticalTiltFactor = 0.3;
                const tiltAdjustment = this.velocity.y * verticalTiltFactor;
                
                // Apply tilt but clamp the final rotation
                this.characterBody.rotation.x += tiltAdjustment;
                
                // Clamp rotation between maxBackwardLean and jumpLeanAngle
                this.characterBody.rotation.x = Math.max(
                    maxBackwardLean,
                    Math.min(jumpLeanAngle, this.characterBody.rotation.x)
                );
            }
        } else {
            // Reset rotation when grounded
            if (this.characterBody) {
                this.characterBody.rotation.x = 0;
            }
        }

        // Add joystick movement (scaled by delta time)
        if (this.isMobile && this.joystickDirection.length() > 0) {
            const moveDirection = new THREE.Vector3(
                this.joystickDirection.x,
                0,
                this.joystickDirection.y
            );
            moveDirection.applyEuler(new THREE.Euler(0, this.playerRotation.y, 0));
            this.player.position.add(moveDirection.multiplyScalar(this.moveSpeed * scaledDeltaTime));
        }
    }

    private updateCamera(): void {
        // Calculate current target distance and height based on zoom state
        const targetDistance = this.isZoomedIn ? this.zoomedCameraDistance : this.normalCameraDistance;
        const targetHeight = this.isZoomedIn ? this.zoomedCameraHeight : this.normalCameraHeight;
        
        if (this.isViewingFront) {
            // Front view position (positive Z)
            const frontOffset = new THREE.Vector3(0, targetHeight, targetDistance);
            frontOffset.applyEuler(new THREE.Euler(0, this.playerRotation.y, 0));
            
            const targetPosition = this.player.position.clone().add(frontOffset);
            this.camera.position.lerp(targetPosition, 0.1);
        } else {
            // Normal behind view (negative Z)
            const behindOffset = new THREE.Vector3(0, targetHeight, -targetDistance);
            behindOffset.applyEuler(new THREE.Euler(0, this.playerRotation.y, 0));
            
            const targetPosition = this.player.position.clone().add(behindOffset);
            this.camera.position.lerp(targetPosition, 0.1);
        }
        
        // Always look at the player
        this.camera.lookAt(this.player.position);
    }

    private updateDogezilla(deltaTime: number): void {
        if (!this.dogeHead) return;

        const currentTime = performance.now();
        const scaledDeltaTime = deltaTime * this.PHYSICS_SPEED_MULTIPLIER;
        
        // Handle dash end
        if (this.dogeMovementState === 'dash' && currentTime - (this.dogeDashStartTime || currentTime) > this.dogeDashDuration) {
            this.dogeMovementState = 'normal';
            this.currentSpeed = this.baseSpeed * this.dogeSpeedMultiplier;
            this.lastSpeedChange = currentTime;
        }
        // State changes
        else if (currentTime - this.lastSpeedChange > Math.random() * 1000 + 1000) {
            const rand = Math.random();
            
            if (rand < 0.3) {  // 30% chance to dash
                if (this.dogeMovementState !== 'dash') {
                    // Snap head back to center before dashing
                    this.headRotation = 0;
                    this.dogeHead.rotation.y = 0;
                    
                    this.dogeMovementState = 'dash';
                    this.currentSpeed = Math.min(
                        this.baseSpeed * this.maxSpeedMultiplier * this.dogeSpeedMultiplier,
                        this.baseSpeed * 2.5 * this.dogeSpeedMultiplier
                    );
                    this.dogeDashStartTime = currentTime;
                }
            } else if (rand < 0.5) {  // 20% chance to move slowly
                this.dogeMovementState = 'slow';
                this.currentSpeed = this.baseSpeed * 0.6 * this.dogeSpeedMultiplier;
            } else {  // 50% chance to move at normal speed
                this.dogeMovementState = 'normal';
                this.currentSpeed = this.baseSpeed * this.dogeSpeedMultiplier;
            }
            
            this.lastSpeedChange = currentTime;
        }

        // Update head rotation with more natural behavior
        if (this.dogeMovementState !== 'dash') {
            const deltaTime = 0.016; // Approximate for 60fps

            switch (this.headState) {
                case 'turning':
                    const quickTurnSpeed = 0.1;
                    this.targetRotation = this.headRotationDirection * this.maxHeadRotation;
                    this.currentHeadSpeed = quickTurnSpeed;
                    
                    if (Math.abs(this.headRotation - this.targetRotation) < 0.01) {
                        this.headState = 'pausing';
                        this.lastStateChange = currentTime;
                        this.pauseDuration = 1000 + Math.random() * 1000;
                    }
                    break;

                case 'pausing':
                    if (currentTime - this.lastStateChange > this.pauseDuration) {
                        this.headState = 'returning';
                        this.lastStateChange = currentTime;
                        this.currentHeadSpeed = 0.008;
                    }
                    break;

                case 'returning':
                    this.targetRotation = 0;
                    this.currentHeadSpeed = Math.min(0.015, this.currentHeadSpeed + 0.00005);
                    
                    if (Math.abs(this.headRotation) < 0.1) {
                        this.currentHeadSpeed *= 0.95;
                    }
                    
                    if (Math.abs(this.headRotation) < 0.001) {
                        this.headRotation = 0;
                        this.headState = 'turning';
                        this.lastStateChange = currentTime;
                        this.headRotationDirection *= -1;
                    }
                    break;
            }

            const targetDiff = this.targetRotation - this.headRotation;
            if (Math.abs(targetDiff) > 0.001) {
                const ease = this.headState === 'returning' ? 0.95 : 1.0;
                this.headRotation += Math.sign(targetDiff) * 
                    Math.min(Math.abs(targetDiff), this.currentHeadSpeed) * ease;
            }

            this.dogeHead.rotation.y = this.headRotation;
        } else {
            this.headRotation *= 0.9;
            this.dogeHead.rotation.y = this.headRotation;
            if (Math.abs(this.headRotation) < 0.001) {
                this.headRotation = 0;
                this.dogeHead.rotation.y = 0;
                this.headState = 'turning';
            }
        }

        // Add leg animation
        const legs = this.dogezilla.children.filter(child => 
            child instanceof THREE.Mesh && 
            child.geometry instanceof THREE.CylinderGeometry &&
            child !== this.dogezilla.children[0]
        );

        // Calculate animation speed based on current movement speed (scaled by delta time)
        this.dogeLegSpeed = this.currentSpeed * 2;
        this.dogeLegRotation += this.dogeLegSpeed * scaledDeltaTime;

        // Animate each leg
        legs.forEach((leg, index) => {
            if (leg instanceof THREE.Mesh) {
                if (index < 2) {
                    leg.rotation.x = Math.sin(this.dogeLegRotation + (index * Math.PI)) * 0.4;
                } else {
                    leg.rotation.x = Math.sin(this.dogeLegRotation + ((index - 2) * Math.PI)) * 0.4;
                }
            }
        });

        // Calculate movement direction
        const direction = new THREE.Vector3()
            .subVectors(this.player.position, this.dogezilla.position)
            .normalize();
        
        // Move directly towards player (scaled by delta time)
        const nextPosition = this.dogezilla.position.clone();
        nextPosition.add(direction.multiplyScalar(this.currentSpeed * scaledDeltaTime));

        // Only check ground collision
        const groundRaycaster = new THREE.Raycaster();
        groundRaycaster.ray.direction.set(0, -1, 0);
        groundRaycaster.ray.origin.copy(nextPosition).add(new THREE.Vector3(0, 5, 0));

        // Filter to only check collision with the ground plane
        const ground = this.scene.children.find(child => 
            child instanceof THREE.Mesh && 
            child.geometry instanceof THREE.PlaneGeometry
        );

        if (ground) {
            const groundIntersects = groundRaycaster.intersectObject(ground);
            const minHeight = 3;

            if (groundIntersects.length > 0) {
                const groundHeight = groundIntersects[0].point.y;
                nextPosition.y = Math.max(groundHeight + minHeight, nextPosition.y);
            } else {
                nextPosition.y = Math.max(minHeight, nextPosition.y);
            }
        }

        // Apply the new position
        this.dogezilla.position.copy(nextPosition);

        // Body rotation (scaled by delta time)
        const targetRotation = Math.atan2(direction.x, direction.z);
        const currentRotation = this.dogezilla.rotation.y;
        
        let angleDiff = targetRotation - currentRotation;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        const rotationSpeed = this.dogeMovementState === 'dash' ? 0.2 :
                             this.dogeMovementState === 'slow' ? 0.05 : 0.1;
        
        this.dogezilla.rotation.y += Math.min(
            rotationSpeed * scaledDeltaTime,
            Math.abs(angleDiff)
        ) * Math.sign(angleDiff);
    }

    private checkCollision(): boolean {
        // Create bounding box for the player with reduced size
        const playerBox = new THREE.Box3().setFromObject(this.player);
        const playerShrinkFactor = 0.4;
        const playerCenter = new THREE.Vector3();
        playerBox.getCenter(playerCenter);
        playerBox.min.lerp(playerCenter, 1 - playerShrinkFactor);
        playerBox.max.lerp(playerCenter, 1 - playerShrinkFactor);

        // Get Dogezilla's rotation
        const dogeRotation = this.dogezilla.rotation.y;

        // Check main body and head collisions
        const mainParts = [
            { object: this.dogezilla, scaleFactor: 0.5 },
            { object: this.dogeHead, scaleFactor: 0.6 }
        ];

        for (const { object, scaleFactor } of mainParts) {
            if (!object) continue;
            
            const dogePartBox = new THREE.Box3().setFromObject(object);
            const partCenter = new THREE.Vector3();
            dogePartBox.getCenter(partCenter);
            dogePartBox.min.lerp(partCenter, 1 - scaleFactor);
            dogePartBox.max.lerp(partCenter, 1 - scaleFactor);
            
            if (playerBox.intersectsBox(dogePartBox)) {
                return true;
            }
        }

        // Get legs with world positions
        const legs = this.dogezilla.children.filter(child => 
            child instanceof THREE.Mesh && 
            child.geometry instanceof THREE.CylinderGeometry &&
            child !== this.dogezilla.children[0]
        );

        if (legs.length >= 4) {
            // Check individual leg collisions using world positions
            for (const leg of legs) {
                const legBox = new THREE.Box3().setFromObject(leg);
                const legCenter = new THREE.Vector3();
                legBox.getCenter(legCenter);
                legBox.min.lerp(legCenter, 0.8);
                legBox.max.lerp(legCenter, 0.8);
                
                if (playerBox.intersectsBox(legBox)) {
                    return true;
                }
            }

            // Get world positions of legs
            const legPositions = legs.map(leg => {
                const pos = new THREE.Vector3();
                leg.getWorldPosition(pos);
                return pos;
            });

            // Calculate rotated box dimensions
            const dogeForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), dogeRotation);
            const dogeRight = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), dogeRotation);

            // Create boxes that follow Dogezilla's rotation
            const boxWidth = 3; // Adjust as needed
            const boxLength = 4; // Adjust as needed

            const createRotatedBox = (yMin: number, yMax: number) => {
                const center = this.dogezilla.position.clone();
                const box = new THREE.Box3();
                
                // Calculate corners based on rotated directions
                const halfWidth = boxWidth / 2;
                const halfLength = boxLength / 2;
                
                const corner1 = center.clone()
                    .add(dogeRight.clone().multiplyScalar(halfWidth))
                    .add(dogeForward.clone().multiplyScalar(halfLength));
                const corner2 = center.clone()
                    .sub(dogeRight.clone().multiplyScalar(halfWidth))
                    .sub(dogeForward.clone().multiplyScalar(halfLength));
                    
                box.min.set(
                    Math.min(corner1.x, corner2.x),
                    yMin,
                    Math.min(corner1.z, corner2.z)
                );
                box.max.set(
                    Math.max(corner1.x, corner2.x),
                    yMax,
                    Math.max(corner1.z, corner2.z)
                );
                
                return box;
            };

            // Create the three main collision boxes
            const underbellyBox = createRotatedBox(
                this.dogezilla.position.y + 1,
                this.dogezilla.position.y + 3
            );
            const underBodyBox = createRotatedBox(
                this.dogezilla.position.y - 1,
                this.dogezilla.position.y + 1.5
            );
            const bottomBox = createRotatedBox(
                this.dogezilla.position.y - 3,
                this.dogezilla.position.y
            );

            if (playerBox.intersectsBox(underbellyBox) || 
                playerBox.intersectsBox(underBodyBox) || 
                playerBox.intersectsBox(bottomBox)) {
                return true;
            }
        }

        return false;
    }

    private updateScore(): void {
        this.score = Math.floor(this.clock.getElapsedTime());
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.score}`;
        }
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `Time: ${this.score}s`;
        }
    }

    private gameOver(): void {
        this.isGameOver = true;
        this.endScreenStartTime = performance.now();
        
        // Play rawr sound before end animation
        if (this.rawrSoundEffect) {
            console.log('Attempting to play rawr sound...');
            this.rawrSoundEffect.currentTime = 0;
            this.rawrSoundEffect.play().then(() => {
                console.log('Rawr sound started playing successfully');
            }).catch(error => {
                console.log('Rawr sound playback failed:', error);
            });
        } else {
            console.log('Rawr sound effect not initialized');
        }

        // Play end animation
        this.playEndAnimation();
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private createWallJumpEffect(position: THREE.Vector3, normal: THREE.Vector3): void {
        
        // Create debris particles
        const particleCount = 15;  // More particles
        const particles = new Float32Array(particleCount * 3);
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xcccccc,
            size: 0.2,        // Larger particles
            transparent: true,
            opacity: 1
        });

        // Set initial particle positions
        const offsetPosition = position.clone().add(normal.clone().multiplyScalar(0.5));
        for (let i = 0; i < particleCount; i++) {
            particles[i * 3] = offsetPosition.x + (Math.random() - 0.5) * 0.5;
            particles[i * 3 + 1] = offsetPosition.y + (Math.random() - 0.5) * 0.5;
            particles[i * 3 + 2] = offsetPosition.z + (Math.random() - 0.5) * 0.5;
        }

        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        
        // Add velocities for particles
        const velocities = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            velocities[i * 3] = normal.x * 0.2 + (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 1] = 0.2 + Math.random() * 0.1;
            velocities[i * 3 + 2] = normal.z * 0.2 + (Math.random() - 0.5) * 0.1;
        }
        particleSystem.userData.velocities = velocities;

        this.particles.push(particleSystem);
        this.particleLifetimes.push(1.0); // Longer lifetime
        this.scene.add(particleSystem);
    }

    private updateParticles(): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const positions = particle.geometry.attributes.position.array;
            const velocities = particle.userData.velocities;
            
            for (let j = 0; j < positions.length; j += 3) {
                positions[j] += velocities[j];
                positions[j + 1] += velocities[j + 1];
                positions[j + 2] += velocities[j + 2];
                
                velocities[j + 1] -= 0.005;
                velocities[j] += (Math.random() - 0.5) * 0.002;
                velocities[j + 2] += (Math.random() - 0.5) * 0.002;
            }
            
            particle.geometry.attributes.position.needsUpdate = true;
            
            this.particleLifetimes[i] -= 0.008;
            const normalizedLifetime = this.particleLifetimes[i] / 2.0;
            
            const material = particle.material as THREE.PointsMaterial;
            material.opacity = 0.3 * Math.pow(normalizedLifetime, 0.5);
            material.size = 0.3 + (1 - normalizedLifetime) * 0.3;
            
            if (this.particleLifetimes[i] <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
                this.particleLifetimes.splice(i, 1);
            }
        }
    }

    private animate(): void {
        if (!this.isGameOver) {
            const deltaTime = this.clock.getDelta();
            this.updatePlayerMovement(deltaTime);
            this.updateCamera();
            this.updateDogeSpeed();
            this.updateDogezilla(deltaTime);
            this.updateParticles();
            this.updateDashParticles();
            this.updateFireParticles();
            this.updateScore();
            this.updateLevel();
            this.updateCoins();
            
            if (this.checkCollision()) {
                this.gameOver();
                return;
            }
            
            if (this.checkFireCollision()) {
                this.gameOver();
                return;
            }
        }
        
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }

    private startWallJumpAnimation(): void {
        if (!this.characterBody) return;
        
        // Reset dash counter on wall jump
        this.ninjaDashCounter = 1;
        this.updateNinjaDashCounter();
        
        console.log('New ninja dash counter:', this.ninjaDashCounter);
        
        const startTime = performance.now();
        const animationDuration = 233; // 1.5x speed flip
        let previousRotation = 0;
        
        const animate = () => {
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            if (progress < 1) {
                // Complete 360-degree rotation
                const rotationAmount = Math.PI * 2 * progress;
                
                // Store the change in rotation
                const rotationDelta = rotationAmount - previousRotation;
                previousRotation = rotationAmount;
                
                // Add to current rotation instead of setting directly
                this.characterBody!.rotation.x += rotationDelta;
                
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    private createJumpEffect(): void {
        try {
            const particleCount = 30;
            const radius = 0.4;
            const particles = new Float32Array(particleCount * 3);
            const velocities = new Float32Array(particleCount * 3);
            
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const randomRadius = radius * (0.8 + Math.random() * 0.4);
                
                particles[i * 3] = Math.cos(angle) * randomRadius;
                particles[i * 3 + 1] = 0.05;
                particles[i * 3 + 2] = Math.sin(angle) * randomRadius;
                
                velocities[i * 3] = Math.cos(angle) * 0.05 * (0.8 + Math.random() * 0.4);
                velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;
                velocities[i * 3 + 2] = Math.sin(angle) * 0.05 * (0.8 + Math.random() * 0.4);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
            
            const material = new THREE.PointsMaterial({
                color: 0xaaaaaa,
                size: 0.3,
                transparent: true,
                opacity: 0.3,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                map: this.smokeTexture
            });

            const particleSystem = new THREE.Points(geometry, material);
            particleSystem.position.copy(this.player.position);
            particleSystem.userData.velocities = velocities;
            particleSystem.userData.lifetime = 2.0;

            this.particles.push(particleSystem);
            this.particleLifetimes.push(2.0);
            this.scene.add(particleSystem);
        } catch (error) {
            console.error('Error creating jump effect:', error);
        }
    }

    private createSmokeTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        
        const context = canvas.getContext('2d')!;
        const gradient = context.createRadialGradient(
            16, 16, 0,    // Inner circle center and radius
            16, 16, 16    // Outer circle center and radius
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    // Add this new method for the end animation
    private playEndAnimation(): void {
        // Create HTML overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '9998';  // Just below the end screen
        document.body.appendChild(overlay);

        // Store initial positions
        const initialDogePosition = this.dogezilla.position.clone();
        const initialPlayerPosition = this.player.position.clone();

        // Move camera to a better viewing angle
        const cameraAnimation = () => {
            this.camera.position.lerp(
                new THREE.Vector3(
                    initialPlayerPosition.x + 15,
                    initialPlayerPosition.y + 10,
                    initialPlayerPosition.z + 15
                ),
                0.05
            );
            this.camera.lookAt(initialPlayerPosition);
        };

        // Animate the end sequence
        const animate = () => {
            if (!this.endScreenStartTime) return;

            const currentTime = performance.now();
            const elapsed = currentTime - this.endScreenStartTime;
            const progress = Math.min(elapsed / this.endScreenDuration, 1);

            // Update camera
            cameraAnimation();

            if (progress < 0.3) {
                // Phase 1: Doge winds up
                this.dogezilla.position.y = initialDogePosition.y + Math.sin(progress * Math.PI) * 2;
                this.dogezilla.rotation.x = -progress * Math.PI * 4;
                overlay.style.opacity = '0';
            } else if (progress < 0.5) {
                // Phase 2: Doge hits ninja
                const flipProgress = (progress - 0.3) / 0.2;
                this.dogezilla.rotation.x = (-0.1 * Math.PI) + (flipProgress * Math.PI * 4.08);
                this.dogezilla.position.lerp(this.player.position, 0.1);
                overlay.style.opacity = '0';
            } else if (progress < 1) {
                // Phase 3: Ninja flies and screen fades
                const flyProgress = (progress - 0.5) / 0.5;

                // Ninja flies towards camera
                this.player.position.y = initialPlayerPosition.y + Math.sin(flyProgress * Math.PI) * 30;
                this.player.position.z = initialPlayerPosition.z - flyProgress * 40;
                this.player.position.x = initialPlayerPosition.x + Math.sin(flyProgress * Math.PI * 2) * 10;
                
                // Ninja spins
                this.player.rotation.x += 0.3;
                this.player.rotation.y += 0.4;
                this.player.rotation.z += 0.35;

                // Fade to black
                overlay.style.opacity = Math.min(flyProgress * 2, 1).toString();
            }

            // Render the scene
            this.renderer.render(this.scene, this.camera);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Show end screen
                this.showEndScreen();
                this.isEndScreenVisible = true;  // Set this only after animation is complete
            }
        };

        animate();
    }

    // Renamed method to avoid any naming conflicts
    private createScreenCrackEffect(): void {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // Draw crack pattern
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;

        // Center point of impact
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw multiple crack lines from center
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
            const length = 200 + Math.random() * 300;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);

            let x = centerX;
            let y = centerY;
            let currentAngle = angle;

            // Create jagged crack line
            for (let j = 0; j < length; j += 5) {
                currentAngle += (Math.random() - 0.5) * 0.5;
                x += Math.cos(currentAngle) * 5;
                y += Math.sin(currentAngle) * 5;
                ctx.lineTo(x, y);

                // Add random branches
                if (Math.random() < 0.1) {
                    const branchAngle = currentAngle + (Math.random() - 0.5) * 2;
                    const branchLength = 20 + Math.random() * 50;
                    const endX = x + Math.cos(branchAngle) * branchLength;
                    const endY = y + Math.sin(branchAngle) * branchLength;
                    
                    ctx.moveTo(x, y);
                    ctx.lineTo(endX, endY);
                    ctx.moveTo(x, y);
                }
            }
            ctx.stroke();
        }

        // Add radial gradient for impact point
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.screenCrackTexture = new THREE.Texture(canvas);
        this.screenCrackTexture.needsUpdate = true;
    }

    // Add new method to update the dash counter display
    private updateNinjaDashCounter(): void {
        this.ninjaDashCounterElement.textContent = `Lv.${this.ninjaDashLevel} Dash: ${this.ninjaDashCounter}`;
    }

    // Add this new method to create the dash effect
    private createNinjaDashEffect(): void {
        try {
            const particleCount = 40;
            const particles = new Float32Array(particleCount * 3);
            const velocities = new Float32Array(particleCount * 3);
            
            const direction = new THREE.Vector3(0, 0, 1);
            direction.applyEuler(new THREE.Euler(0, this.player.rotation.y, 0));
            
            for (let i = 0; i < particleCount; i++) {
                const spread = 0.8;
                
                particles[i * 3] = this.player.position.x + (Math.random() - 0.5) * spread;
                particles[i * 3 + 1] = this.player.position.y + 0.5 + Math.random() * 1.5;
                particles[i * 3 + 2] = this.player.position.z + (Math.random() - 0.5) * spread;
                
                velocities[i * 3] = (Math.random() - 0.5) * 0.3;
                velocities[i * 3 + 1] = Math.random() * 0.15;
                velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
            
            const material = new THREE.PointsMaterial({
                color: 0x4169E1,
                size: 1,
                transparent: true,
                opacity: 0.3,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                map: this.smokeTexture
            });

            const particleSystem = new THREE.Points(geometry, material);
            particleSystem.userData.velocities = velocities;
            
            this.dashParticles.push(particleSystem);
            this.dashParticleLifetimes.push(0.4);
            this.scene.add(particleSystem);
        } catch (error) {
            console.error('Error creating dash effect:', error);
        }
    }

    // Add a new method to update dash particles separately
    private updateDashParticles(): void {
        for (let i = this.dashParticles.length - 1; i >= 0; i--) {
            const particle = this.dashParticles[i];
            const positions = particle.geometry.attributes.position.array;
            const velocities = particle.userData.velocities;
            
            for (let j = 0; j < positions.length; j += 3) {
                positions[j] += velocities[j];
                positions[j + 1] += velocities[j + 1];
                positions[j + 2] += velocities[j + 2];
                
                velocities[j + 1] -= 0.005;
                velocities[j] += (Math.random() - 0.5) * 0.002;
                velocities[j + 2] += (Math.random() - 0.5) * 0.002;
            }
            
            particle.geometry.attributes.position.needsUpdate = true;
            
            this.dashParticleLifetimes[i] -= 0.016; // Decrease based on roughly 60fps
            const normalizedLifetime = this.dashParticleLifetimes[i] / 1.2;
            
            const material = particle.material as THREE.PointsMaterial;
            material.opacity = normalizedLifetime;
            
            if (this.dashParticleLifetimes[i] <= 0) {
                this.scene.remove(particle);
                this.dashParticles.splice(i, 1);
                this.dashParticleLifetimes.splice(i, 1);
            }
        }
    }

    // Add this new method to handle level updates
    private updateLevel(): void {
        const currentTime = this.clock.getElapsedTime();
        if (currentTime - this.lastLevelTime >= 20) { // Check every 20 seconds
            this.level++;
            this.lastLevelTime = currentTime;
            this.showLevelMessage();
        }
    }

    // Add this new method to show the level message
    private showLevelMessage(): void {
        this.levelMessageElement.textContent = `Level ${this.level}!! Dogezilla is getting faster!`;
        this.levelMessageElement.style.opacity = '1';
        
        // Hide the message after 3 seconds
        setTimeout(() => {
            this.levelMessageElement.style.opacity = '0';
        }, 3000);
    }

    // Add this new method to handle speed ramping
    private updateDogeSpeed(): void {
        // Calculate target multiplier based on current level and weight
        // Formula: 1 + (level - 1) * weight
        // This ensures level 1 starts at normal speed (multiplier = 1)
        this.targetSpeedMultiplier = 1 + (this.level - 1) * this.levelSpeedWeight;
        
        // Smoothly interpolate towards target speed
        if (this.dogeSpeedMultiplier !== this.targetSpeedMultiplier) {
            const rampSpeed = 0.001;
            this.dogeSpeedMultiplier += (this.targetSpeedMultiplier - this.dogeSpeedMultiplier) * rampSpeed;
        }
    }

    private createFireWall(): void {
        // Create fire particles along the boundary
        const spacing = 5; // Space between fire sources
        const particlesPerSource = 20;
        
        // Create fire sources around the perimeter
        for (let x = -this.mapBoundary; x <= this.mapBoundary; x += spacing) {
            this.createFireSource(x, -this.mapBoundary); // South wall
            this.createFireSource(x, this.mapBoundary);  // North wall
        }
        for (let z = -this.mapBoundary; z <= this.mapBoundary; z += spacing) {
            this.createFireSource(-this.mapBoundary, z); // West wall
            this.createFireSource(this.mapBoundary, z);  // East wall
        }
    }

    private createFireSource(x: number, z: number): void {
        const particleCount = 20;
        const particles = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        // Initialize particles at the base
        for (let i = 0; i < particleCount; i++) {
            particles[i * 3] = x + (Math.random() - 0.5) * 2;     // X position
            particles[i * 3 + 1] = Math.random() * 2;             // Y position
            particles[i * 3 + 2] = z + (Math.random() - 0.5) * 2; // Z position

            // Upward velocity with some spread
            velocities[i * 3] = (Math.random() - 0.5) * 0.1;      // X velocity
            velocities[i * 3 + 1] = 0.2 + Math.random() * 0.2;    // Y velocity
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;  // Z velocity
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));

        const material = new THREE.PointsMaterial({
            color: 0xff4500,  // Orange-red color
            size: 2,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            map: this.smokeTexture
        });

        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData.velocities = velocities;
        particleSystem.userData.basePosition = { x, z };

        this.fireParticles.push(particleSystem);
        this.fireParticleLifetimes.push(1.0);
        this.scene.add(particleSystem);
    }

    private updateFireParticles(): void {
        // Only create new fire particles if we're under the limit
        const totalParticles = this.fireParticles.reduce((sum, particle) => 
            sum + particle.geometry.attributes.position.count, 0);
            
        if (totalParticles < this.MAX_FIRE_PARTICLES && Math.random() < 0.2) {
            const spacing = 5;
            const x = (Math.random() < 0.5 ? -1 : 1) * this.mapBoundary;
            const z = (Math.random() * 2 - 1) * this.mapBoundary;
            this.createFireSource(x, z);
            
            // Only create second source if we're still under the limit
            if (totalParticles + 20 < this.MAX_FIRE_PARTICLES) {
                const x2 = (Math.random() * 2 - 1) * this.mapBoundary;
                const z2 = (Math.random() < 0.5 ? -1 : 1) * this.mapBoundary;
                this.createFireSource(x2, z2);
            }
        }

        // Update existing particles
        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const particle = this.fireParticles[i];
            const positions = particle.geometry.attributes.position.array;
            const velocities = particle.userData.velocities;
            
            for (let j = 0; j < positions.length; j += 3) {
                // Update positions
                positions[j] += velocities[j];
                positions[j + 1] += velocities[j + 1];
                positions[j + 2] += velocities[j + 2];
                
                // Add some random movement
                velocities[j] += (Math.random() - 0.5) * 0.01;
                velocities[j + 2] += (Math.random() - 0.5) * 0.01;
                
                // Reset particles that go too high
                if (positions[j + 1] > this.fireHeight) {
                    const base = particle.userData.basePosition;
                    positions[j] = base.x + (Math.random() - 0.5) * 2;
                    positions[j + 1] = Math.random() * 2;
                    positions[j + 2] = base.z + (Math.random() - 0.5) * 2;
                    velocities[j + 1] = 0.2 + Math.random() * 0.2;
                }
            }
            
            particle.geometry.attributes.position.needsUpdate = true;
            
            // Update color based on height
            const material = particle.material as THREE.PointsMaterial;
            material.color.setHSL(0.05, 1, 0.5 + Math.random() * 0.2);
        }
    }

    private checkFireCollision(): boolean {
        const playerPos = this.player.position;
        const buffer = 2; // Give a small buffer zone
        
        return Math.abs(playerPos.x) > this.mapBoundary - buffer || 
               Math.abs(playerPos.z) > this.mapBoundary - buffer;
    }

    // Add this method to create a coin
    private createCoin(position: THREE.Vector3): void {
        // Create main coin geometry with smaller height
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFD700,  // Changed to gold color
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0xFFD700,
            emissiveIntensity: 0.2  // Slight glow
        });
        const coin = new THREE.Mesh(geometry, material);
        
        coin.position.copy(position);
        coin.rotation.x = Math.PI / 2;  // Make coin flat
        coin.castShadow = true;         // Add shadow casting
        coin.receiveShadow = true;      // Allow coin to receive shadows
        
        // Add rim for more detail
        const rimGeometry = new THREE.TorusGeometry(0.5, 0.05, 16, 32);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 0.9,
            roughness: 0.2,
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.castShadow = true;
        coin.add(rim);
        
        // Add glow effect
        const glowGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,  // Yellow glow
            transparent: true,
            opacity: 0.3,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        coin.add(glow);
        
        this.coins.push(coin);
        this.scene.add(coin);
    }

    // Add this method to spawn coins
    private spawnCoins(): void {
        // First, spawn some coins on top of pillars
        const pillarCoins = Math.floor(this.totalCoins * 0.4); // 40% of coins on pillars
        for (let i = 0; i < pillarCoins; i++) {
            if (this.buildings.length > 0) {
                const randomBuilding = this.buildings[Math.floor(Math.random() * this.buildings.length)];
                const pillar = randomBuilding.children[0] as THREE.Mesh;
                const pillarHeight = (pillar.geometry as THREE.CylinderGeometry).parameters.height;
                
                // Position coin on top of pillar, higher above the capital
                const coinPosition = new THREE.Vector3(
                    randomBuilding.position.x,
                    pillarHeight + 2.5, // Increased from 1 to 2.5 to place coin higher above the capital
                    randomBuilding.position.z
                );
                
                this.createCoin(coinPosition);
            }
        }
        
        // Then spawn the remaining coins randomly in the map
        const remainingCoins = this.totalCoins - pillarCoins;
        for (let i = 0; i < remainingCoins; i++) {
            // Random position within map bounds
            const radius = Math.random() * (this.mapBoundary - 10);  // Keep away from fire
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Randomly decide if coin should be elevated
            const elevated = Math.random() < 0.3;  // 30% chance for elevated coins
            let y = elevated ? 5 + Math.random() * 5 : 1.5;  // Either elevated or just above ground
            
            this.createCoin(new THREE.Vector3(x, y, z));
        }
    }

    // Add this method to create UI elements
    private createSpeedUI(): void {
        // Speed Level Container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '20px';
        container.style.bottom = '50px';  // Below dash counter
        container.style.color = 'white';
        container.style.fontFamily = 'Arial, sans-serif';
        
        // Speed Level Text
        this.speedLevelElement = document.createElement('div');
        this.speedLevelElement.textContent = `Speed Lvl ${this.speedLevel}`;
        this.speedLevelElement.style.marginBottom = '5px';
        container.appendChild(this.speedLevelElement);
        
        // Speed Bar Container
        const barContainer = document.createElement('div');
        barContainer.style.width = '150px';
        barContainer.style.height = '15px';
        barContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        barContainer.style.border = '1px solid white';
        barContainer.style.borderRadius = '3px';
        
        // Speed Bar Fill
        this.speedBarElement = document.createElement('div');
        this.speedBarElement.style.width = '0%';
        this.speedBarElement.style.height = '100%';
        this.speedBarElement.style.backgroundColor = '#FFD700';  // Changed from '#4CAF50' to gold color
        this.speedBarElement.style.borderRadius = '5px';
        this.speedBarElement.style.transition = 'width 0.3s';
        barContainer.appendChild(this.speedBarElement);
        container.appendChild(barContainer);
        
        // Level Up Message
        this.speedMessageElement = document.createElement('div');
        this.speedMessageElement.style.position = 'fixed';
        this.speedMessageElement.style.top = '50%';
        this.speedMessageElement.style.left = '50%';
        this.speedMessageElement.style.transform = 'translate(-50%, -50%)';
        this.speedMessageElement.style.color = 'white';
        this.speedMessageElement.style.fontSize = '48px';
        this.speedMessageElement.style.fontFamily = 'Arial, sans-serif';
        this.speedMessageElement.style.textAlign = 'center';
        this.speedMessageElement.style.opacity = '0';
        this.speedMessageElement.style.transition = 'opacity 0.5s';
        this.speedMessageElement.style.pointerEvents = 'none';
        this.speedMessageElement.style.zIndex = '1000';
        
        document.body.appendChild(container);
        document.body.appendChild(this.speedMessageElement);
    }

    // Add this method to update coin rotations and check collection
    private updateCoins(): void {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            
            // Rotate coin
            coin.rotation.y += this.coinRotationSpeed;
            
            // Bob up and down with larger amplitude
            coin.position.y += Math.sin(performance.now() * 0.003) * 0.002;
            
            // Check collection with larger radius and height check
            const distance = new THREE.Vector2(
                this.player.position.x - coin.position.x,
                this.player.position.z - coin.position.z
            ).length();
            
            const heightDiff = Math.abs(this.player.position.y - coin.position.y);
            
            // Increased collection radius from 1.5 to 2.5 and added height check
            if (distance < 2.5 && heightDiff < 3) {
                // Play coin collection sound
                if (this.coinSoundEffect) {
                    this.coinSoundEffect.currentTime = 0;
                    this.coinSoundEffect.play().catch(error => {
                        console.log('Coin sound playback failed:', error);
                    });
                }

                // Create collection effect
                this.createCoinCollectionEffect(coin.position.clone());
                
                // Remove coin
                this.scene.remove(coin);
                this.coins.splice(i, 1);
                
                // Increase speed exp
                this.gainSpeedExp(10);  // Changed from 3 to 10
                
                // Activate speed boost
                this.activateSpeedBoost();
                
                // Spawn new coin
                const radius = Math.random() * (this.mapBoundary - 10);
                const angle = Math.random() * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const elevated = Math.random() < 0.3;
                const y = elevated ? 5 + Math.random() * 5 : 1.5;
                
                this.createCoin(new THREE.Vector3(x, y, z));
            }
        }
    }

    // Add a collection effect method
    private createCoinCollectionEffect(position: THREE.Vector3): void {
        const particleCount = 20;
        const particles = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        // Create particle geometry
        const geometry = new THREE.BufferGeometry();
        
        // Set initial positions in a circle
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.5;
            
            particles[i * 3] = position.x + Math.cos(angle) * radius;
            particles[i * 3 + 1] = position.y;
            particles[i * 3 + 2] = position.z + Math.sin(angle) * radius;
            
            // Set velocities outward and upward
            velocities[i * 3] = Math.cos(angle) * 0.1;
            velocities[i * 3 + 1] = 0.1 + Math.random() * 0.1;
            velocities[i * 3 + 2] = Math.sin(angle) * 0.1;
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xFFD700,
            size: 0.2,
            transparent: true,
            opacity: 1,
            map: this.smokeTexture
        });
        
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData.velocities = velocities;
        
        this.particles.push(particleSystem);
        this.particleLifetimes.push(1.0);
        this.scene.add(particleSystem);
    }

    // Add this method to handle speed exp gain
    private gainSpeedExp(amount: number): void {
        this.speedExp += amount;
        
        // Check for level up
        if (this.speedExp >= 100) {
            this.speedLevel++;
            this.speedExp = 0;
            
            // Update base speed, respecting current speed boost
            const baseSpeed = this.basePlayerSpeed * (1 + (this.speedLevel - 1) * 0.15);
            this.moveSpeed = this.isSpeedBoosted ? baseSpeed * this.SPEED_BOOST_MULTIPLIER : baseSpeed;
            
            // Show level up message
            this.speedMessageElement.textContent = "You're getting faster!";
            this.speedMessageElement.style.opacity = '1';
            setTimeout(() => {
                this.speedMessageElement.style.opacity = '0';
            }, 2000);
        }
        
        // Update UI
        this.speedLevelElement.textContent = `Speed Lvl ${this.speedLevel}`;
        this.speedBarElement.style.width = `${this.speedExp}%`;
    }

    // Add this new method to handle speed boost
    private activateSpeedBoost(): void {
        this.isSpeedBoosted = true;
        this.speedBoostEndTime = performance.now() + this.SPEED_BOOST_DURATION;
        this.moveSpeed = this.basePlayerSpeed * (1 + (this.speedLevel - 1) * 0.15) * this.SPEED_BOOST_MULTIPLIER;
        this.createGoldAuraGlow(); // Add this line
    }

    private createGoldAuraGlow(): void {
        // Create a single large particle
        const particleCount = 1;
        const particles = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        // Set initial position at player's position
        particles[0] = this.player.position.x;
        particles[1] = this.player.position.y;
        particles[2] = this.player.position.z;
        
        // Set initial velocity (expand outward)
        velocities[0] = 0;
        velocities[1] = 0;
        velocities[2] = 0;
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xFFD700,
            size: 2,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            map: this.smokeTexture
        });
        
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData.velocities = velocities;
        
        this.goldAuraParticles.push(particleSystem);
        this.goldAuraLifetimes.push(1.0);
        this.scene.add(particleSystem);
    }

    private removeGoldAuraGlow(): void {
        // Remove all particle systems
        for (const particle of this.goldAuraParticles) {
            this.scene.remove(particle);
        }
        this.goldAuraParticles = [];
        this.goldAuraLifetimes = [];
    }

    private updateGoldAuraGlow(): void {
        for (let i = this.goldAuraParticles.length - 1; i >= 0; i--) {
            const particle = this.goldAuraParticles[i];
            const lifetime = this.goldAuraLifetimes[i];
            
            // Update lifetime
            this.goldAuraLifetimes[i] = lifetime - 0.02;
            
            // Update particle position and size
            const positions = particle.geometry.attributes.position.array as Float32Array;
            const velocities = particle.userData.velocities as Float32Array;
            
            // Expand outward
            velocities[0] *= 1.1;
            velocities[1] *= 1.1;
            velocities[2] *= 1.1;
            
            positions[0] += velocities[0];
            positions[1] += velocities[1];
            positions[2] += velocities[2];
            
            // Update material
            const material = particle.material as THREE.PointsMaterial;
            material.size = 2 * (1 + lifetime * 2); // Grow in size
            material.opacity = 0.8 * lifetime; // Fade out
            
            // Remove particle when lifetime is up
            if (lifetime <= 0) {
                this.scene.remove(particle);
                this.goldAuraParticles.splice(i, 1);
                this.goldAuraLifetimes.splice(i, 1);
            }
        }
    }

    private createMusicInstruction(): void {
        this.musicInstructionElement = document.createElement('div');
        this.musicInstructionElement.style.position = 'fixed';
        this.musicInstructionElement.style.bottom = '20px';
        this.musicInstructionElement.style.right = '20px';
        this.musicInstructionElement.style.color = '#ffffff';
        this.musicInstructionElement.style.fontSize = '16px';
        this.musicInstructionElement.style.fontFamily = 'Arial, sans-serif';
        this.musicInstructionElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        this.musicInstructionElement.style.zIndex = '1000';
        this.musicInstructionElement.innerHTML = `
            <div style="margin-bottom: 10px;">I to toggle zoom</div>
            <div>M to toggle music</div>    
        `;
        document.body.appendChild(this.musicInstructionElement);
    }

    private toggleMusic(): void {
        if (this.backgroundMusic) {
            if (this.isMusicPlaying) {
                this.backgroundMusic.pause();
            } else {
                this.backgroundMusic.play().catch(error => {
                    console.log('Playback failed:', error);
                    this.isMusicPlaying = false;
                });
            }
            this.isMusicPlaying = !this.isMusicPlaying;
        }
    }

    private createEndScreen(): void {
        console.log('Creating end screen...');
        this.endScreenElement = document.createElement('div');
        this.endScreenElement.id = 'end-screen';
        this.endScreenElement.style.position = 'fixed';
        this.endScreenElement.style.top = '0';
        this.endScreenElement.style.left = '0';
        this.endScreenElement.style.width = '100%';
        this.endScreenElement.style.height = '100%';
        this.endScreenElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.endScreenElement.style.display = 'flex';
        this.endScreenElement.style.flexDirection = 'column';
        this.endScreenElement.style.justifyContent = 'center';
        this.endScreenElement.style.alignItems = 'center';
        this.endScreenElement.style.zIndex = '99999';
        this.endScreenElement.style.opacity = '0';
        this.endScreenElement.style.transition = 'opacity 0.5s ease-in-out';
        this.endScreenElement.style.pointerEvents = 'none';
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const restartText = isMobile ? 'Tap screen to play again' : 'Press space to play again';
        const controlsText = isMobile ? 
            'Use joystick to move<br>↑ to jump, ⚡ to dash<br>Wall Jump charges dash, Pick up coins to upgrade your speed' :
            'WASD to move, Space to jump, Mouse to move camera<br>Wall Jump charges dash, Pick up coins to upgrade your speed';
        
        this.endScreenElement.innerHTML = `
            <div class="game-over-text" style="color: #ff0000; font-size: 72px; font-weight: bold; text-align: center; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); position: relative; z-index: 100000; display: block; opacity: 1; font-family: Arial, sans-serif;">YOU GOT REKTT</div>
            <div class="final-score" style="color: #ffffff; font-size: 36px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); position: relative; z-index: 100000; display: block; opacity: 1; font-family: Arial, sans-serif;">Final Score: <span id="final-score-value">0</span></div>
            <div class="instructions" style="color: #ffffff; font-size: 24px; margin-bottom: 50px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); position: relative; z-index: 100000; display: block; opacity: 1; text-align: center; line-height: 1.5; font-family: Arial, sans-serif;">Survive against Dogezilla for as long as possible!!<br>${controlsText}</div>
            <div class="restart-text" style="color: #ffd700; font-size: 32px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); position: relative; z-index: 100000; display: block; opacity: 1; font-family: Arial, sans-serif;">${restartText}</div>
        `;
        
        // Add touch event listener for mobile
        this.endScreenElement.addEventListener('touchstart', (e) => {
            if (this.isEndScreenVisible) {
                e.preventDefault(); // Prevent double-firing on some devices
                this.restartGame();
            }
        });
        
        // Add to body to ensure it's on top of everything
        document.body.appendChild(this.endScreenElement);
        console.log('End screen added to body');
    }

    private showEndScreen(): void {
        console.log('Showing end screen...');
        if (this.endScreenElement) {
            const scoreElement = document.getElementById('final-score-value');
            if (scoreElement) {
                scoreElement.textContent = `${this.score} (Level ${this.level})`;
            }
            this.endScreenElement.style.opacity = '1';
            this.endScreenElement.style.pointerEvents = 'auto';
            this.isEndScreenVisible = true;

            // Play the no sound effect
            if (this.noSoundEffect) {
                this.noSoundEffect.currentTime = 0;
                this.noSoundEffect.play().catch(error => {
                    console.log('No sound playback failed:', error);
                });
            }

            console.log('End screen shown, opacity:', this.endScreenElement.style.opacity);
        } else {
            console.log('End screen element not found');
        }
    }

    private hideEndScreen(): void {
        if (this.endScreenElement) {
            this.endScreenElement.classList.remove('visible');
            this.isEndScreenVisible = false;
        }
    }

    private restartGame(): void {
        // Reset game state
        this.score = 0;
        this.isGameOver = false;
        this.isEndScreenVisible = false;
        this.hideEndScreen();
        
        // Reset player position and state
        this.player.position.set(0, 5, 0);
        this.player.rotation.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.isGrounded = true;
        this.canWallJump = false;
        
        // Reset dogezilla position and state
        if (this.dogezilla) {
            this.dogezilla.position.set(0, 0, 20);
            this.dogezilla.rotation.set(0, 0, 0);
        }
        
        // Reset coins
        this.coins.forEach(coin => {
            this.scene.remove(coin);
        });
        this.coins = [];
        this.spawnCoins();
        
        // Reset speed level
        this.speedLevel = 1;
        this.speedExp = 0;
        if (this.speedBarElement) {
            this.speedBarElement.style.width = '0%';
        }
        
        // Reset camera
        this.camera.position.copy(this.originalCameraPosition);
        this.camera.lookAt(this.originalCameraTarget);
        
        // Reset ninja dash counter
        this.ninjaDashCounter = 1;
        this.updateNinjaDashCounter();
        
        // Reset level
        this.level = 1;
        this.lastLevelTime = performance.now();
        
        // Reset doge speed
        this.dogeSpeedMultiplier = 1;
        this.targetSpeedMultiplier = 1;
        
        // Reset fire wall
        this.createFireWall();
    }

    private createMobileControls(): void {
        // Create container for joystick
        this.joystickContainer = document.createElement('div');
        this.joystickContainer.style.position = 'fixed';
        this.joystickContainer.style.bottom = '20px';
        this.joystickContainer.style.left = '20px';
        this.joystickContainer.style.width = '150px';
        this.joystickContainer.style.height = '150px';
        this.joystickContainer.style.zIndex = '1000';
        document.body.appendChild(this.joystickContainer);

        // Create joystick
        this.joystick = nipplejs.create({
            zone: this.joystickContainer,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 120
        });

        // Handle joystick events
        this.joystick.on('move', (evt: any, data: any) => {
            if (data && data.force && data.angle && data.angle.radian) {
                const force = Math.min(data.force / 50, 1); // Normalize force
                const angle = data.angle.radian;
                this.joystickDirection.x = Math.cos(angle) * force;
                this.joystickDirection.y = Math.sin(angle) * force;
            }
        });

        this.joystick.on('end', () => {
            this.joystickDirection.set(0, 0);
        });

        // Add jump button
        const jumpButton = document.createElement('button');
        jumpButton.style.position = 'fixed';
        jumpButton.style.bottom = '20px';
        jumpButton.style.right = '20px';
        jumpButton.style.width = '80px';
        jumpButton.style.height = '80px';
        jumpButton.style.borderRadius = '50%';
        jumpButton.style.border = 'none';
        jumpButton.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        jumpButton.style.color = 'white';
        jumpButton.style.fontSize = '24px';
        jumpButton.style.zIndex = '1000';
        jumpButton.innerHTML = '↑';
        jumpButton.addEventListener('touchstart', () => {
            if (this.isGrounded) {
                this.velocity.y = this.jumpForce;
                this.isGrounded = false;
                if (this.jumpSoundEffect) {
                    this.jumpSoundEffect.currentTime = 0;
                    this.jumpSoundEffect.play().catch(error => {
                        console.log('Jump sound playback failed:', error);
                    });
                }
            }
        });
        document.body.appendChild(jumpButton);

        // Add dash button
        const dashButton = document.createElement('button');
        dashButton.style.position = 'fixed';
        dashButton.style.bottom = '120px';
        dashButton.style.right = '20px';
        dashButton.style.width = '80px';
        dashButton.style.height = '80px';
        dashButton.style.borderRadius = '50%';
        dashButton.style.border = 'none';
        dashButton.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        dashButton.style.color = 'white';
        dashButton.style.fontSize = '24px';
        dashButton.style.zIndex = '1000';
        dashButton.innerHTML = '⚡';
        dashButton.addEventListener('touchstart', () => {
            if (this.ninjaDashCounter > 0) {
                this.isNinjaDashing = true;
                this.ninjaDashStartTime = performance.now();
                this.ninjaDashCounter = 0;
                this.updateNinjaDashCounter();
                this.createNinjaDashEffect();
                if (this.dashSoundEffect) {
                    this.dashSoundEffect.currentTime = 0;
                    this.dashSoundEffect.play().catch(error => {
                        console.log('Dash sound playback failed:', error);
                    });
                }
            }
        });
        document.body.appendChild(dashButton);
    }

    private playJumpSound(): void {
        if (this.jumpSoundEffect) {
            this.jumpSoundEffect.currentTime = 0;
            this.jumpSoundEffect.play().catch(error => {
                console.log('Jump sound playback failed:', error);
            });
        }
    }
}

window.addEventListener('load', () => {
    new Game();
});