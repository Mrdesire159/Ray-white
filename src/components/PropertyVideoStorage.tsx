import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Upload,
  HardDrive,
  Film,
  Search,
  Filter,
  Trash2,
  Download,
  Share2,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Plus,
  Compass,
  ArrowUpDown,
  Tag,
  Eye,
  Cloud,
  Database,
  Server,
  FileVideo,
  Copy,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Radio,
  Lock,
  Unlock,
  ShieldAlert,
  Image as ImageIcon,
  Camera,
  AlertCircle,
  EyeOff,
} from 'lucide-react';
import { PropertyVideo, PropertyVideoCategory } from '../types/video';
import { INITIAL_PROPERTY_VIDEOS } from '../data/propertyVideos';
import { Property } from '../types/property';
import { PROPERTIES } from '../data/properties';
import { AGENTS } from '../data/agents';
import { useRequests } from '../context/RequestContext';

interface PropertyVideoStorageProps {
  onSelectProperty?: (property: Property) => void;
  onOpenAppraisal?: () => void;
  autoOpenUpload?: boolean;
}

const STORAGE_KEY = 'raywhite_property_videos_vault';

export const PropertyVideoStorage: React.FC<PropertyVideoStorageProps> = ({
  onSelectProperty,
  onOpenAppraisal,
  autoOpenUpload = false,
}) => {
  const { isAdminAuthenticated, loginAdmin } = useRequests();

  // Admin authentication gate modal state
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminAuthShake, setAdminAuthShake] = useState<boolean>(false);
  const [showAdminPasscode, setShowAdminPasscode] = useState<boolean>(false);

  // Photo viewer modal state
  const [photoPreviewModalAsset, setPhotoPreviewModalAsset] = useState<PropertyVideo | null>(null);

  // Video library state
  const [videos, setVideos] = useState<PropertyVideo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PROPERTY_VIDEOS.map((v) => ({
      ...v,
      cloudStorageProvider: v.cloudStorageProvider || 'AWS S3 (ap-southeast-2 Sydney)',
      cloudBucket: v.cloudBucket || 'raywhite-property-vault-prod',
      cloudKey: v.cloudKey || `production-assets/videos/${v.id}.mp4`,
      cloudEtag: v.cloudEtag || `etag-${v.id.substring(4)}-9f2b8`,
      cloudCdnUrl: v.cloudCdnUrl || `https://cdn.raywhite.com/vault/videos/${v.id}.mp4`,
    }));
  });

  // Active / featured playing video
  const [activeVideo, setActiveVideo] = useState<PropertyVideo>(videos[0] || INITIAL_PROPERTY_VIDEOS[0]);

  // Tab View Mode: 'gallery' vs 'cloud_storage'
  const [activeTabMode, setActiveTabMode] = useState<'gallery' | 'cloud_storage'>('gallery');

  // Player controls state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.8);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showBoundaryOverlay, setShowBoundaryOverlay] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'size' | 'land'>('newest');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Admin Media Upload to Mocked Cloud Storage Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(autoOpenUpload);
  const [mediaUploadType, setMediaUploadType] = useState<'video' | 'photo'>('video');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-1');
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<'AWS S3' | 'Google Cloud Storage' | 'Ray White Edge Vault'>('AWS S3');
  const [selectedBucket, setSelectedBucket] = useState<string>('raywhite-property-vault-prod');
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<PropertyVideoCategory>('landed');
  const [uploadAddress, setUploadAddress] = useState<string>('');
  const [uploadSuburb, setUploadSuburb] = useState<string>('');
  const [uploadState, setUploadState] = useState<string>('NSW');
  const [uploadPrice, setUploadPrice] = useState<string>('');
  const [uploadLandSize, setUploadLandSize] = useState<string>('');
  const [uploadVideoUrl, setUploadVideoUrl] = useState<string>('');
  const [uploadThumbnailUrl, setUploadThumbnailUrl] = useState<string>('');
  const [uploadIsDrone, setUploadIsDrone] = useState<boolean>(true);
  const [uploadHasBoundary, setUploadHasBoundary] = useState<boolean>(true);
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<string>('02:30');
  const [detectedResolution, setDetectedResolution] = useState<string>('4K 60fps HDR');
  const [uploadValidationError, setUploadValidationError] = useState<string | null>(null);

  // Cloud upload simulation phases
  const [isSimulatingUpload, setIsSimulatingUpload] = useState<boolean>(false);
  const [uploadingProgress, setUploadingProgress] = useState<number>(0);
  const [uploadStageText, setUploadStageText] = useState<string>('');

  // Persist videos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch {
      // ignore
    }
  }, [videos]);

  // Video element sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeVideo]);

  // Handle existing listing prefill
  const handleSelectListing = (listingId: string) => {
    setSelectedListingId(listingId);
    if (!listingId) return;
    const prop = PROPERTIES.find((p) => p.id === listingId);
    if (prop) {
      setUploadTitle(`${prop.title} (Cinematic Walkthrough)`);
      setUploadAddress(prop.address);
      setUploadSuburb(prop.suburb);
      setUploadState(prop.state);
      setUploadPrice(prop.priceDisplay);
      if (prop.landSizeM2) {
        setUploadLandSize(
          prop.landSizeM2 >= 10000
            ? `${prop.landSizeM2.toLocaleString()} m² (${(prop.landSizeM2 / 10000).toFixed(1)} Hectares)`
            : `${prop.landSizeM2.toLocaleString()} m²`
        );
      }
      if (prop.type === 'Land' || (prop.landSizeM2 && prop.landSizeM2 > 5000)) {
        setUploadCategory('landed');
        setUploadIsDrone(true);
        setUploadHasBoundary(true);
      } else {
        setUploadCategory('house');
      }
      if (prop.images && prop.images[0]) {
        setUploadThumbnailUrl(prop.images[0]);
      }
    }
  };

  // Toggle Play
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Change Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  // Change Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Select video to play
  const handleSelectVideo = (vid: PropertyVideo) => {
    setActiveVideo(vid);
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
    // Switch to gallery to show player
    if (activeTabMode !== 'gallery') {
      setActiveTabMode('gallery');
    }
    // Scroll player into view
    const playerEl = document.getElementById('featured-video-player');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Copy share link
  const handleShare = (vid: PropertyVideo) => {
    navigator.clipboard.writeText(`${window.location.origin}/#videos?id=${vid.id}`);
    setCopiedShareId(vid.id);
    setTimeout(() => setCopiedShareId(null), 2500);
  };

  // Copy Cloud Object Key
  const handleCopyCloudKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  // Delete video from mocked cloud storage (Admin only)
  const handleDeleteVideo = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdminAuthenticated) {
      setAdminPasscodeInput('');
      setAdminAuthError('Administrative authorization required to delete cloud storage objects.');
      setIsAdminAuthModalOpen(true);
      return;
    }
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    if (activeVideo.id === id && updated.length > 0) {
      setActiveVideo(updated[0]);
    }
  };

  // Open upload modal with admin security check
  const handleOpenUpload = () => {
    if (isAdminAuthenticated) {
      setUploadValidationError(null);
      setIsUploadModalOpen(true);
    } else {
      setAdminPasscodeInput('');
      setAdminAuthError(null);
      setIsAdminAuthModalOpen(true);
    }
  };

  // Verify Admin Passcode (000333999) to grant immediate upload privileges
  const handleVerifyAdminPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasscodeInput.trim()) {
      setAdminAuthError('Please enter the administrative master passcode.');
      return;
    }
    const isSuccess = loginAdmin(adminPasscodeInput);
    if (isSuccess) {
      setAdminAuthError(null);
      setIsAdminAuthModalOpen(false);
      setIsUploadModalOpen(true);
    } else {
      setAdminAuthError('Invalid passcode. Only authorized administrators can upload photos and videos to this website.');
      setAdminAuthShake(true);
      setTimeout(() => setAdminAuthShake(false), 500);
    }
  };

  // Extract thumbnail & metadata from uploaded photo or video file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      const url = URL.createObjectURL(file);
      setUploadVideoUrl(url);

      if (!uploadTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setUploadTitle(cleanName);
      }

      if (file.type.startsWith('image/')) {
        setMediaUploadType('photo');
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setUploadThumbnailUrl(dataUrl);
        };
        reader.readAsDataURL(file);

        const img = new Image();
        img.onload = () => {
          const w = img.width;
          const h = img.height;
          const mp = ((w * h) / 1000000).toFixed(1);
          setDetectedResolution(`${mp}MP Ultra-HD Photo (${w}x${h})`);
          setDetectedDuration('High-Res Still Photo');
        };
        img.src = url;
      } else {
        setMediaUploadType('video');
        // Read real duration & resolution and extract thumbnail
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.src = url;
        videoElement.muted = true;
        videoElement.playsInline = true;

        videoElement.onloadedmetadata = () => {
          const durSecs = Math.round(videoElement.duration || 120);
          const mins = Math.floor(durSecs / 60);
          const secs = durSecs % 60;
          setDetectedDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

          const width = videoElement.videoWidth || 1920;
          const height = videoElement.videoHeight || 1080;
          if (width >= 3840 || height >= 2160) {
            setDetectedResolution('4K 60fps HDR (UHD)');
          } else if (width >= 2560) {
            setDetectedResolution('2K QHD 60fps');
          } else {
            setDetectedResolution('1080p Full HD');
          }

          videoElement.currentTime = Math.min(1.5, durSecs / 2);
        };

        videoElement.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(800, videoElement.videoWidth || 640);
            canvas.height = Math.round((canvas.width * 9) / 16);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              const thumb = canvas.toDataURL('image/jpeg', 0.85);
              setUploadThumbnailUrl(thumb);
            }
          } catch {
            // ignore canvas security exceptions if any
          }
        };
      }
    }
  };

  // Execute Mocked Cloud Storage Upload (Strictly Restricted to Admin)
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminAuthenticated) {
      setUploadValidationError('Access Denied: Only authenticated administrators are permitted to upload photos and videos.');
      return;
    }

    if (!uploadTitle.trim() || (!uploadVideoUrl && !uploadFile)) {
      setUploadValidationError('Please provide a title and select a photo or video file to upload.');
      return;
    }

    const agent = AGENTS.find((a) => a.id === selectedAgentId) || AGENTS[0];
    const sanitizedFilename = (
      uploadFile
        ? uploadFile.name
        : `${uploadTitle.toLowerCase().replace(/\s+/g, '-')}.${mediaUploadType === 'photo' ? 'jpg' : 'mp4'}`
    ).replace(/[^a-zA-Z0-9.-]/g, '_');
    const cloudKeyPath = `s3://${selectedBucket}/admin-media/${agent.id}/${Date.now()}-${sanitizedFilename}`;
    const generatedEtag = `etag-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}`;

    setIsSimulatingUpload(true);
    setUploadingProgress(10);
    setUploadStageText(`Step 1/4: Verifying Administrator credentials and scanning ${mediaUploadType === 'photo' ? 'image' : 'video'} payload...`);

    setTimeout(() => {
      setUploadingProgress(35);
      setUploadStageText(`Step 2/4: Provisioning presigned admin multipart upload for ${selectedBucket}...`);
    }, 400);

    setTimeout(() => {
      setUploadingProgress(70);
      setUploadStageText(`Step 3/4: Streaming ${mediaUploadType === 'photo' ? 'high-res photo bytes' : '4K video chunks'} into ${selectedCloudProvider} Sydney Edge...`);
    }, 850);

    setTimeout(() => {
      setUploadingProgress(92);
      setUploadStageText('Step 4/4: Generating Cloud CDN edge distribution & attaching cryptographic ETag...');
    }, 1250);

    setTimeout(() => {
      setUploadingProgress(100);
      setUploadStageText(`Upload verified! ${mediaUploadType === 'photo' ? 'Photo' : 'Video'} asset successfully published by Administrator.`);

      const categoryLabels: Record<PropertyVideoCategory, string> = {
        landed: 'Landed Property & Acreage',
        house: 'House & Villa',
        acreage: 'Rural Acreage & Farm',
        villa: 'Architectural Villa',
        drone: 'Drone & Boundary Survey',
      };

      const newVideo: PropertyVideo = {
        id: `user-cloud-${mediaUploadType === 'photo' ? 'photo' : 'vid'}-${Date.now()}`,
        title: uploadTitle,
        category: uploadCategory,
        categoryLabel: categoryLabels[uploadCategory],
        mediaType: mediaUploadType,
        propertyAddress: uploadAddress || 'Custom Stored Parcel',
        suburb: uploadSuburb || 'Sydney Region',
        state: uploadState || 'NSW',
        propertyPrice: uploadPrice || 'Contact Agent',
        landSize: uploadLandSize || (uploadCategory === 'landed' ? '15,000 m² (1.5 Ha)' : '850 m²'),
        videoUrl:
          uploadVideoUrl ||
          (mediaUploadType === 'photo'
            ? (uploadThumbnailUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80')
            : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
        photoUrl: mediaUploadType === 'photo' ? (uploadThumbnailUrl || uploadVideoUrl) : undefined,
        thumbnailUrl:
          uploadThumbnailUrl ||
          (uploadCategory === 'landed'
            ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
            : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'),
        duration: mediaUploadType === 'photo' ? 'High-Res Still' : (detectedDuration || '02:40'),
        resolution: detectedResolution || (mediaUploadType === 'photo' ? '24MP Ultra-HD Photo' : (uploadIsDrone ? '4K Drone 60fps' : '1080p 60fps')),
        droneAerial: uploadIsDrone,
        boundarySurveyOverlay: uploadHasBoundary,
        description:
          uploadDescription ||
          `Published by Administrator to ${selectedCloudProvider} bucket ${selectedBucket}. Verified high-resolution ${mediaUploadType === 'photo' ? 'architectural photograph' : 'architectural & landscape footage'}.`,
        dateAdded: new Date().toISOString().split('T')[0],
        fileSizeBytes: uploadFile ? uploadFile.size : (mediaUploadType === 'photo' ? 18000000 : 210000000),
        agentName: 'Ray White Master Administrator',
        agentPhone: agent.phone,
        propertyId: selectedListingId || undefined,
        isUserUploaded: true,
        uploadedByAdmin: true,
        adminTitle: 'Authorized System Administrator',
        cloudStorageProvider: selectedCloudProvider,
        cloudBucket: selectedBucket,
        cloudKey: cloudKeyPath,
        cloudEtag: generatedEtag,
        cloudCdnUrl: `https://cdn.raywhite.com/vault/admin-uploads/${sanitizedFilename}`,
      };

      setVideos([newVideo, ...videos]);
      setActiveVideo(newVideo);
      setIsSimulatingUpload(false);
      setIsUploadModalOpen(false);

      // Reset form
      setUploadTitle('');
      setUploadAddress('');
      setUploadSuburb('');
      setUploadPrice('');
      setUploadLandSize('');
      setUploadVideoUrl('');
      setUploadThumbnailUrl('');
      setUploadDescription('');
      setUploadFile(null);
      setUploadingProgress(0);
      setUploadStageText('');
      setUploadValidationError(null);
      setSelectedListingId('');
    }, 1600);
  };

  // Filtered & Sorted Videos
  const filteredVideos = videos.filter((vid) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'my_uploads'
        ? vid.isUserUploaded === true
        : selectedCategory === 'drone'
        ? vid.droneAerial || vid.category === 'drone'
        : selectedCategory === 'landed'
        ? vid.category === 'landed' || vid.category === 'acreage'
        : selectedCategory === 'house'
        ? vid.category === 'house' || vid.category === 'villa'
        : vid.category === selectedCategory;

    const matchesSearch =
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vid.landSize && vid.landSize.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vid.agentName && vid.agentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vid.cloudKey && vid.cloudKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
      vid.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sort
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
    if (sortBy === 'size') {
      return b.fileSizeBytes - a.fileSizeBytes;
    }
    if (sortBy === 'land') {
      const getNum = (str?: string) => {
        if (!str) return 0;
        const match = str.replace(/,/g, '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      return getNum(b.landSize) - getNum(a.landSize);
    }
    return 0;
  });

  // Calculate storage stats
  const totalSizeBytes = videos.reduce((acc, v) => acc + (v.fileSizeBytes || 180000000), 0);
  const totalSizeGB = (totalSizeBytes / 1073741824).toFixed(2);
  const landedCount = videos.filter((v) => v.category === 'landed' || v.category === 'acreage').length;
  const houseCount = videos.filter((v) => v.category === 'house' || v.category === 'villa').length;
  const droneCount = videos.filter((v) => v.droneAerial).length;
  const agentUploadedCount = videos.filter((v) => v.isUserUploaded).length;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find linked property in PROPERTIES if available
  const linkedProperty = activeVideo.propertyId
    ? PROPERTIES.find((p) => p.id === activeVideo.propertyId)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Header & Storage Health Bar */}
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFD200] text-neutral-950 font-black text-xs uppercase tracking-wider shadow-2xs">
                Ray White Cinema &amp; Cloud Storage
              </span>
              <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
                <Cloud className="w-4 h-4 text-sky-600" />
                <span>Mocked S3 / Cloud Bucket Connected</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Landed Property &amp; House Video Storage
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
              Explore high-definition 4K cinematic walkthroughs, high-altitude drone boundary surveys for landed acreage, and architectural tours. Agents can upload and manage property video files directly in our mocked cloud storage space.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            {/* Direct Admin Cloud Upload Button (Admin Only) */}
            <button
              type="button"
              onClick={handleOpenUpload}
              className={`px-4 py-2.5 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                isAdminAuthenticated
                  ? 'bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 ring-2 ring-amber-400/40 active:scale-95'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 active:scale-95'
              }`}
              title={isAdminAuthenticated ? 'Admin Authenticated: Upload Property Photos & Videos' : 'Admin Security Gate: Passcode required to upload'}
            >
              {isAdminAuthenticated ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-neutral-950" />
                  <span>Admin Upload (Photos &amp; Videos)</span>
                  <span className="text-[10px] bg-neutral-950 text-[#FFD200] px-1.5 py-0.5 rounded font-black ml-1">
                    ACTIVE
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Admin Only: Upload Media</span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-semibold ml-1">
                    GATED
                  </span>
                </>
              )}
            </button>

            {/* View Mode Toggle: Cinema Gallery vs Cloud Storage Space */}
            <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTabMode('gallery')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTabMode === 'gallery'
                    ? 'bg-neutral-950 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Cinema Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTabMode('cloud_storage')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTabMode === 'cloud_storage'
                    ? 'bg-neutral-950 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                <span>Cloud File Space ({videos.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mock Cloud Storage Telemetry Panel */}
        <div className="mt-6 p-4 sm:p-5 bg-neutral-900 text-white rounded-2xl shadow-sm border border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-[#FFD200] shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>Mock Cloud Bucket:</span>
                  <span className="text-[#FFD200] font-mono">s3://raywhite-property-vault-prod</span>
                  <span className="text-neutral-400 text-xs">({totalSizeGB} GB used / 50.0 GB quota)</span>
                </div>
                <div className="text-neutral-400 text-[11px] mt-0.5 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sydney (ap-southeast-2) Edge Online</span>
                  </span>
                  <span>·</span>
                  <span>Low-Latency 4K HLS Streaming</span>
                  <span>·</span>
                  <span>{agentUploadedCount} Agent Uploaded Objects</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-neutral-300 font-medium text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFD200]" />
                <strong>{landedCount}</strong> Landed &amp; Acreage
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <strong>{houseCount}</strong> Houses &amp; Villas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <strong>{droneCount}</strong> Drone Surveys
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-neutral-800 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-[#FFD200] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (parseFloat(totalSizeGB) / 50) * 100)}%` }}
              title="Storage used"
            />
          </div>
        </div>
      </div>

      {/* 2. Featured Active Video Cinema Player (Always available for playback) */}
      <div id="featured-video-player" className="scroll-mt-6">
        <div className="bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 grid grid-cols-1 lg:grid-cols-12">
          {/* Main Video Viewport (8 Cols) */}
          <div
            ref={playerContainerRef}
            className="lg:col-span-8 relative bg-black flex items-center justify-center overflow-hidden aspect-video group"
          >
            <video
              ref={videoRef}
              src={activeVideo.videoUrl}
              poster={activeVideo.thumbnailUrl}
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
              onClick={togglePlay}
            />

            {/* Simulated Topographic Boundary Overlay (Toggleable for landed property) */}
            {showBoundaryOverlay && activeVideo.boundarySurveyOverlay && (
              <div className="absolute inset-0 pointer-events-none z-10 border-2 border-emerald-400/80 m-4 sm:m-8 rounded-lg bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-70 animate-in fade-in duration-300">
                <div className="absolute top-2 left-2 bg-emerald-950/80 backdrop-blur-sm border border-emerald-500 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded shadow">
                  BOUNDARIES: {activeVideo.landSize || '18,500 m²'} • LAT: -34.7333 • ELEV: 185M
                </div>
                <div className="absolute bottom-2 right-2 bg-emerald-950/80 backdrop-blur-sm border border-emerald-500 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded shadow">
                  TOPOGRAPHIC CADASTRE OVERLAY ACTIVE
                </div>
                {/* Crosshairs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-dashed border-emerald-400/70 rounded-full" />
              </div>
            )}

            {/* Big Play Button Overlay when paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-[#FFD200] hover:bg-[#E5BC00] active:scale-95 text-neutral-950 flex items-center justify-center shadow-2xl transition-all cursor-pointer z-20 group-hover:scale-105"
                aria-label="Play video"
              >
                <Play className="w-9 h-9 fill-neutral-950 ml-1" />
              </button>
            )}

            {/* Badges on Top of Video */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-[#FFD200] border border-white/20 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow">
                <Film className="w-3.5 h-3.5" />
                <span>{activeVideo.categoryLabel}</span>
              </span>
              {activeVideo.droneAerial && (
                <span className="px-2 py-1 bg-sky-950/80 backdrop-blur-md text-sky-300 border border-sky-500/40 rounded-lg text-xs font-bold flex items-center gap-1 shadow">
                  <Compass className="w-3.5 h-3.5" />
                  <span>4K Drone Flyover</span>
                </span>
              )}
              {activeVideo.resolution && (
                <span className="px-2 py-1 bg-neutral-900/80 backdrop-blur-md text-neutral-200 border border-white/10 rounded-lg text-[11px] font-mono font-bold">
                  {activeVideo.resolution}
                </span>
              )}
              {activeVideo.cloudStorageProvider && (
                <span className="px-2 py-1 bg-black/80 backdrop-blur-md text-sky-400 border border-sky-600/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>{activeVideo.cloudStorageProvider.split(' ')[0]}</span>
                </span>
              )}
            </div>

            {/* Custom Video Control Bar (Overlay on hover / active) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20 space-y-2 opacity-95 transition-opacity">
              {/* Progress Scrubber */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#FFD200]"
              />

              <div className="flex items-center justify-between text-white text-xs gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg text-white hover:text-[#FFD200] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg text-white hover:text-[#FFD200] hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-20 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-[#FFD200] hidden sm:block"
                    />
                  </div>

                  <span className="font-mono text-[11px] text-neutral-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Boundary Overlay Button (if applicable) */}
                  {activeVideo.boundarySurveyOverlay && (
                    <button
                      type="button"
                      onClick={() => setShowBoundaryOverlay(!showBoundaryOverlay)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                        showBoundaryOverlay
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-black/40 text-neutral-300 border-white/20 hover:text-white'
                      }`}
                      title="Toggle Topographic Boundary Cadastre Overlay"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Boundary Grid</span>
                    </button>
                  )}

                  {/* Playback speed selector */}
                  <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[10px] font-bold">
                    {[1, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          playbackSpeed === spd ? 'bg-[#FFD200] text-neutral-950' : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg text-white hover:text-[#FFD200] hover:bg-white/10 transition-colors cursor-pointer"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Video Info & Actions Panel (4 Cols) */}
          <div className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between text-white border-t lg:border-t-0 lg:border-l border-neutral-800 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFD200]">
                  Now Playing in Cinema
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {(activeVideo.fileSizeBytes / 1048576).toFixed(0)} MB MP4
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {activeVideo.title}
              </h2>

              <div className="text-xs text-neutral-300 flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-[#FFD200] shrink-0" />
                <span>
                  {activeVideo.propertyAddress}, {activeVideo.suburb} {activeVideo.state}
                </span>
              </div>

              {/* Specs Matrix */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {activeVideo.landSize && (
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Land / Lot Area</div>
                    <div className="text-sm font-extrabold text-[#FFD200] mt-0.5 truncate">
                      {activeVideo.landSize}
                    </div>
                  </div>
                )}
                {activeVideo.propertyPrice && (
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Guide / Value</div>
                    <div className="text-sm font-extrabold text-white mt-0.5 truncate">
                      {activeVideo.propertyPrice}
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Attribution & Cloud Key */}
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                  <span>Uploaded By:</span>
                  <span className="font-bold text-neutral-200">{activeVideo.agentName || 'Ray White Media Agent'}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400 text-[11px] font-mono truncate">
                  <span>Cloud Object:</span>
                  <span className="text-sky-400 truncate max-w-[180px]" title={activeVideo.cloudKey}>
                    {activeVideo.cloudKey || 's3://raywhite-vault/default.mp4'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {activeVideo.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-800">
              {linkedProperty && onSelectProperty && (
                <button
                  type="button"
                  onClick={() => onSelectProperty(linkedProperty)}
                  className="w-full py-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Listing &amp; Photos</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={activeVideo.videoUrl}
                  download={`${activeVideo.title}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#FFD200]" />
                  <span>Download MP4</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleShare(activeVideo)}
                  className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedShareId === activeVideo.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#FFD200]" />
                      <span>Share Video</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODE: MOCK CLOUD STORAGE SPACE (S3 / GCS Object Browser) */}
      {activeTabMode === 'cloud_storage' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-lg text-neutral-900">
                  Agent Cloud Storage Space (Mocked S3 / GCS)
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Direct view into stored video objects, cloud etags, presigned edge URLs, and agent-attributed footage.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenUpload}
              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all ${
                isAdminAuthenticated
                  ? 'bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 active:scale-95'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 active:scale-95'
              }`}
            >
              {isAdminAuthenticated ? (
                <>
                  <Upload className="w-4 h-4 text-neutral-950" />
                  <span>Admin Upload Media (Photo/Video)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Admin Only: Upload Media</span>
                </>
              )}
            </button>
          </div>

          {/* Cloud Object Browser Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Cloud Object URI / Key</th>
                    <th className="py-3 px-4">Property / Category</th>
                    <th className="py-3 px-4">Uploaded By</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Cloud Provider</th>
                    <th className="py-3 px-4">Date Stored</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {videos.map((vid) => {
                    const isPlayingCurrent = activeVideo.id === vid.id;
                    return (
                      <tr
                        key={vid.id}
                        className={`hover:bg-neutral-50/80 transition-colors ${
                          isPlayingCurrent ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="flex items-center gap-2">
                            {vid.mediaType === 'photo' ? (
                              <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <FileVideo className="w-4 h-4 text-neutral-500 shrink-0" />
                            )}
                            <span className="font-bold text-neutral-900 truncate max-w-xs" title={vid.cloudKey || vid.title}>
                              {vid.cloudKey || `s3://raywhite-vault/${vid.id}.${vid.mediaType === 'photo' ? 'jpg' : 'mp4'}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCloudKey(vid.cloudKey || `s3://raywhite-vault/${vid.id}.${vid.mediaType === 'photo' ? 'jpg' : 'mp4'}`, vid.id)}
                              className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                              title="Copy Cloud URI"
                            >
                              {copiedKeyId === vid.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {vid.cloudEtag && (
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              ETag: {vid.cloudEtag}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-neutral-900 truncate max-w-[200px]" title={vid.title}>
                            {vid.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            {vid.mediaType === 'photo' && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                                Photo
                              </span>
                            )}
                            <span>{vid.categoryLabel}</span>
                            {vid.landSize && <span>· {vid.landSize}</span>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-neutral-900">
                            {vid.agentName || 'Ray White Agent'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono tabular-nums text-neutral-700">
                          {(vid.fileSizeBytes / 1048576).toFixed(1)} MB
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200 text-[10px] font-bold">
                            <Cloud className="w-3 h-3 text-sky-600" />
                            <span>{vid.cloudStorageProvider?.split(' ')[0] || 'AWS S3'}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-500">
                          {vid.dateAdded}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {vid.mediaType === 'photo' ? (
                              <button
                                type="button"
                                onClick={() => setPhotoPreviewModalAsset(vid)}
                                className="px-2.5 py-1 bg-neutral-900 hover:bg-[#FFD200] hover:text-neutral-950 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Camera className="w-3 h-3 text-[#FFD200]" />
                                <span>View Photo</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectVideo(vid)}
                                className="px-2.5 py-1 bg-neutral-900 hover:bg-[#FFD200] hover:text-neutral-950 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Stream</span>
                              </button>
                            )}

                            {vid.isUserUploaded && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteVideo(vid.id, e)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete from mock cloud storage"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODE: CINEMA GALLERY VIEW */}
      {activeTabMode === 'gallery' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
              {[
                { id: 'all', label: `All Videos (${videos.length})` },
                { id: 'landed', label: `🌳 Landed & Acreage (${landedCount})` },
                { id: 'house', label: `🏡 Houses & Estates (${houseCount})` },
                { id: 'drone', label: `🚁 Drone Surveys (${droneCount})` },
                {
                  id: 'my_uploads',
                  label: `📁 Agent Uploads (${agentUploadedCount})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-neutral-950 text-[#FFD200] shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search landed lots, suburbs, agents..."
                  className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#FFD200] cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="land">Sort: Land Size (Max)</option>
                <option value="size">Sort: File Size</option>
              </select>
            </div>
          </div>

          {/* Video Cards Grid */}
          {sortedVideos.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
              <Film className="w-12 h-12 text-neutral-400 mx-auto" />
              <h3 className="font-extrabold text-base text-neutral-900">No videos found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No property videos match your filter criteria. Try choosing &quot;All Videos&quot; or upload a new property video file to the cloud.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedVideos.map((video) => {
                const isCurrent = activeVideo.id === video.id;
                const hasLinkedListing = video.propertyId
                  ? PROPERTIES.some((p) => p.id === video.propertyId)
                  : false;

                return (
                  <div
                    key={video.id}
                    onClick={() => {
                      if (video.mediaType === 'photo') {
                        setPhotoPreviewModalAsset(video);
                      } else {
                        handleSelectVideo(video);
                      }
                    }}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between cursor-pointer group hover:shadow-lg ${
                      isCurrent
                        ? 'border-[#FFD200] ring-2 ring-[#FFD200]/50 shadow-md'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      {/* Thumbnail Zone */}
                      <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />

                        {/* Play/View overlay button */}
                        <div className="absolute inset-0 bg-neutral-950/30 group-hover:bg-neutral-950/15 flex items-center justify-center transition-colors">
                          <div className="w-11 h-11 rounded-full bg-[#FFD200] text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            {video.mediaType === 'photo' ? (
                              <Camera className="w-5 h-5 text-neutral-950" />
                            ) : (
                              <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                            )}
                          </div>
                        </div>

                        {/* Duration & Resolution */}
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                          <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                            {video.duration}
                          </span>
                          <span className="bg-[#FFD200] text-neutral-950 text-[10px] font-black px-1.5 py-0.5 rounded">
                            {video.mediaType === 'photo' ? 'PHOTO' : (video.resolution.includes('4K') ? '4K' : 'HD')}
                          </span>
                        </div>

                        {/* Category Pill */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                          {video.mediaType === 'photo' ? (
                            <span className="bg-[#FFD200] text-neutral-950 text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-neutral-950" />
                              <span>Photo Stills</span>
                            </span>
                          ) : (
                            <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                              {video.category === 'landed' || video.category === 'acreage'
                                ? '🌳 Landed Property'
                                : '🏡 House Video'}
                            </span>
                          )}
                          {video.uploadedByAdmin && (
                            <span className="bg-neutral-950/90 text-[#FFD200] text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                              Admin Verified
                            </span>
                          )}
                          {video.boundarySurveyOverlay && (
                            <span className="bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/50">
                              Cadastre
                            </span>
                          )}
                        </div>

                        {/* Delete button if user uploaded */}
                        {video.isUserUploaded && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteVideo(video.id, e)}
                            className="absolute top-2.5 right-2.5 p-1 bg-neutral-950/80 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer z-10"
                            title="Delete from cloud vault"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                          <span className="truncate">{video.suburb}, {video.state}</span>
                          <span className="font-mono">{(video.fileSizeBytes / 1048576).toFixed(0)} MB</span>
                        </div>

                        <h4 className="font-extrabold text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                          {video.title}
                        </h4>

                        {/* Agent attribution */}
                        {video.agentName && (
                          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span className="truncate font-semibold">{video.agentName}</span>
                          </div>
                        )}

                        {/* Land & Price Specs */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          {video.landSize && (
                            <div className="font-bold text-neutral-800 truncate" title={video.landSize}>
                              <span className="text-[10px] text-neutral-400 block font-normal">Land Area</span>
                              {video.landSize}
                            </div>
                          )}
                          {video.propertyPrice && (
                            <div className="text-right font-extrabold text-neutral-950 truncate">
                              <span className="text-[10px] text-neutral-400 block font-normal">Price</span>
                              {video.propertyPrice}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom CTA */}
                    <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-neutral-100 text-xs font-bold mt-2">
                      <span className="text-[#E5BC00] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{video.mediaType === 'photo' ? 'View High-Res Photo' : 'Stream in Cinema'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      {hasLinkedListing && onSelectProperty && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const p = PROPERTIES.find((prop) => prop.id === video.propertyId);
                            if (p) onSelectProperty(p);
                          }}
                          className="text-neutral-500 hover:text-neutral-900 underline text-[11px] cursor-pointer"
                        >
                          Listing Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Admin File Upload to Mocked Cloud Storage Modal (Admin Only) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-neutral-200">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-neutral-950 text-[#FFD200] flex items-center justify-center font-bold shadow-xs">
                <Cloud className="w-6 h-6 text-[#FFD200]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg sm:text-xl text-neutral-900">
                    Admin Media Vault Upload
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 text-[10px] font-mono font-bold flex items-center gap-1 border border-amber-300">
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    <span>Admin Authorized</span>
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Securely ingest high-resolution property photography, 4K video tours, and drone surveys into the cloud vault.
                </p>
              </div>
            </div>

            {/* Media Type Switcher: Video vs Photo */}
            <div className="p-1 bg-neutral-100 rounded-2xl flex items-center gap-1 mb-4 border border-neutral-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMediaUploadType('video')}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mediaUploadType === 'video'
                    ? 'bg-neutral-950 text-[#FFD200] shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>🎥 4K Property Video Tour</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaUploadType('photo')}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mediaUploadType === 'photo'
                    ? 'bg-neutral-950 text-[#FFD200] shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>📸 High-Res Photo / Aerial</span>
              </button>
            </div>

            {/* Admin Verification Notice */}
            <div className="p-3 bg-neutral-900 text-neutral-200 rounded-xl mb-4 text-xs flex items-center justify-between border border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Administrator Access Verified:</span>
                <span className="text-neutral-300">Master Cloud Storage Edge Pipeline</span>
              </div>
              <span className="text-[10px] font-mono text-[#FFD200] bg-neutral-800 px-2 py-0.5 rounded">
                RW-SYS-ADMIN
              </span>
            </div>

            {uploadValidationError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadValidationError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Agent & Cloud Configuration Strip */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Managing Agent Attribution *
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  >
                    {AGENTS.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.office})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Cloud Storage Destination Provider *
                  </label>
                  <select
                    value={selectedCloudProvider}
                    onChange={(e) => setSelectedCloudProvider(e.target.value as any)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  >
                    <option value="AWS S3">AWS S3 (ap-southeast-2 Sydney)</option>
                    <option value="Google Cloud Storage">Google Cloud Storage (australia-southeast1)</option>
                    <option value="Ray White Edge Vault">Ray White Dedicated Media Edge Vault</option>
                  </select>
                </div>
              </div>

              {/* Link to existing Ray White Property (Optional shortcut) */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Associate with Existing Property Listing (Optional)
                </label>
                <select
                  value={selectedListingId}
                  onChange={(e) => handleSelectListing(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                >
                  <option value="">-- Choose a property listing (auto-fills details) or custom --</option>
                  {PROPERTIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address}, {p.suburb} — {p.title.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* File upload drag-and-drop box */}
              <div className="border-2 border-dashed border-neutral-300 hover:border-[#FFD200] rounded-2xl p-5 text-center transition-colors bg-neutral-50">
                <input
                  type="file"
                  id="admin-media-file-input"
                  accept={
                    mediaUploadType === 'photo'
                      ? 'image/jpeg,image/png,image/webp,image/avif'
                      : 'video/mp4,video/webm,video/quicktime,video/m4v'
                  }
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="admin-media-file-input"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  {mediaUploadType === 'photo' ? (
                    <Camera className="w-9 h-9 text-neutral-500 hover:text-neutral-900 transition-colors" />
                  ) : (
                    <Upload className="w-9 h-9 text-neutral-500 hover:text-neutral-900 transition-colors" />
                  )}
                  <div className="text-xs font-bold text-neutral-800">
                    {uploadFile ? (
                      <div className="space-y-1">
                        <div className="text-emerald-700 font-extrabold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Selected File: {uploadFile.name}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Size: {(uploadFile.size / 1048576).toFixed(1)} MB · Format: {uploadFile.type || (mediaUploadType === 'photo' ? 'image/jpeg' : 'video/mp4')} · Detected: {detectedResolution}
                        </div>
                      </div>
                    ) : (
                      <span>
                        {mediaUploadType === 'photo'
                          ? 'Drag & drop high-resolution property photo (.jpg, .png, .webp)'
                          : 'Drag & drop video file here, or click to browse (.mp4, .mov, .webm)'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {mediaUploadType === 'photo'
                      ? 'Supports RAW/High-Res Architectural stills up to 50MB per photo'
                      : 'Supports up to 4K 60fps drone surveys and house walkthroughs (Max 2GB per file)'}
                  </span>
                </label>
              </div>

              {/* Or Direct Media URL */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Or Direct {mediaUploadType === 'photo' ? 'Photo' : 'Video'} Stream URL (Fallback)
                </label>
                <input
                  type="url"
                  value={uploadVideoUrl}
                  onChange={(e) => setUploadVideoUrl(e.target.value)}
                  placeholder={mediaUploadType === 'photo' ? 'https://.../photo.jpg' : 'https://.../video.mp4'}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                />
              </div>

              {/* Media Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Property {mediaUploadType === 'photo' ? 'Photo' : 'Video'} Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={
                    mediaUploadType === 'photo'
                      ? 'e.g. Architectural Masterpiece Sunset Façade & Land Survey'
                      : 'e.g. Ridgeview Homestead & 10-Acre Grazing Land Drone Tour'
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                />
              </div>

              {/* Category & Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  >
                    <option value="landed">Landed Property &amp; Acreage</option>
                    <option value="house">House &amp; Residential Estate</option>
                    <option value="drone">Drone Topographic Survey</option>
                    <option value="villa">Architectural Villa</option>
                    <option value="acreage">Rural Farmland / Estate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Land / Lot Area (m² or Hectares)
                  </label>
                  <input
                    type="text"
                    value={uploadLandSize}
                    onChange={(e) => setUploadLandSize(e.target.value)}
                    placeholder="e.g. 25,000 m² (2.5 Ha) or 900 m²"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  />
                </div>
              </div>

              {/* Address & Suburb */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={uploadAddress}
                    onChange={(e) => setUploadAddress(e.target.value)}
                    placeholder="e.g. 45 Valley Road"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Suburb
                  </label>
                  <input
                    type="text"
                    value={uploadSuburb}
                    onChange={(e) => setUploadSuburb(e.target.value)}
                    placeholder="e.g. Bowral"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Price / Guide
                  </label>
                  <input
                    type="text"
                    value={uploadPrice}
                    onChange={(e) => setUploadPrice(e.target.value)}
                    placeholder="e.g. $2,950,000"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  />
                </div>
              </div>

              {/* Feature checkboxes */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadIsDrone}
                    onChange={(e) => setUploadIsDrone(e.target.checked)}
                    className="rounded accent-[#FFD200]"
                  />
                  <span>Includes 4K Drone Aerial</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadHasBoundary}
                    onChange={(e) => setUploadHasBoundary(e.target.checked)}
                    className="rounded accent-[#FFD200]"
                  />
                  <span>Landed Cadastre / Boundary Overlay</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Media Notes &amp; Architectural Highlights
                </label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Key features of the land, terrain, boundary lines, or internal residence walkthrough..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200] resize-none"
                />
              </div>

              {/* Simulated Cloud Upload Progress Pipeline */}
              {isSimulatingUpload && (
                <div className="p-4 bg-neutral-950 text-white rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-[#FFD200] animate-spin" />
                      <span>{uploadStageText}</span>
                    </span>
                    <span className="text-[#FFD200] font-mono">{uploadingProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#FFD200] h-full transition-all duration-300"
                      style={{ width: `${uploadingProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    Target: s3://{selectedBucket}/admin-media/{selectedAgentId}/...
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulatingUpload}
                  className="flex-1 py-3 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-98 disabled:opacity-50 text-neutral-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Cloud className="w-4 h-4 text-neutral-950" />
                  <span>
                    {isSimulatingUpload
                      ? `Uploading ${mediaUploadType === 'photo' ? 'Photo' : 'Video'}...`
                      : `Publish ${mediaUploadType === 'photo' ? 'Photo' : 'Video'} as Admin`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Admin Security Gate Passcode Modal (Enforces Only Admin Can Upload/Delete) */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-neutral-200 ${
              adminAuthShake ? 'animate-bounce' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsAdminAuthModalOpen(false);
                setAdminAuthError(null);
                setAdminPasscodeInput('');
              }}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/20">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
              Administrator Security Gate
            </h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Only authorized Ray White administrators are permitted to upload photos, videos, or modify media files in the cloud vault.
            </p>

            <div className="mt-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Master Passcode Required</span>
                <span className="text-[11px] text-amber-800">
                  Authorized Admin Passcode: <code className="font-mono font-bold bg-amber-200/80 px-1 py-0.5 rounded text-neutral-950">000333999</code>
                </span>
              </div>
            </div>

            {adminAuthError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAdminPasscode} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Enter Administrator Passcode
                </label>
                <div className="relative">
                  <input
                    type={showAdminPasscode ? 'text' : 'password'}
                    value={adminPasscodeInput}
                    onChange={(e) => {
                      setAdminPasscodeInput(e.target.value);
                      if (adminAuthError) setAdminAuthError(null);
                    }}
                    placeholder="Enter master passcode (000333999)"
                    autoFocus
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {showAdminPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminAuthModalOpen(false);
                    setAdminAuthError(null);
                    setAdminPasscodeInput('');
                  }}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FFD200] hover:bg-[#E5BC00] active:scale-98 text-neutral-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4 text-neutral-950" />
                  <span>Verify Admin Access</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. High-Res Photo Lightbox Modal */}
      {photoPreviewModalAsset && (
        <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-neutral-900 text-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative border border-neutral-800 max-h-[94vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FFD200] text-neutral-950 font-bold">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white">
                    {photoPreviewModalAsset.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    {photoPreviewModalAsset.propertyAddress}, {photoPreviewModalAsset.suburb} · {photoPreviewModalAsset.resolution}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPhotoPreviewModalAsset(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Image Canvas */}
            <div className="flex-1 min-h-0 py-4 flex items-center justify-center overflow-hidden bg-black/40 rounded-2xl my-2">
              <img
                src={photoPreviewModalAsset.photoUrl || photoPreviewModalAsset.thumbnailUrl}
                alt={photoPreviewModalAsset.title}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Photo Footer Actions & Metadata */}
            <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-neutral-400 text-[11px] flex items-center gap-3 font-mono">
                <span>{(photoPreviewModalAsset.fileSizeBytes / 1048576).toFixed(1)} MB</span>
                <span>•</span>
                <span>{photoPreviewModalAsset.cloudStorageProvider || 'AWS S3'}</span>
                <span>•</span>
                <span>Admin Uploaded</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={photoPreviewModalAsset.photoUrl || photoPreviewModalAsset.thumbnailUrl}
                  download={`${photoPreviewModalAsset.title}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#FFD200]" />
                  <span>Download High-Res</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPhotoPreviewModalAsset(null)}
                  className="px-3 py-1.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
