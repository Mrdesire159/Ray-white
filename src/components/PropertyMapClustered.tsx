import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Supercluster, { PointFeature } from 'supercluster';
import { Property } from '../types/property';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  MapPin,
  Bed,
  Bath,
  Car,
  Eye,
  Camera,
  Heart,
  Scale,
  Sparkles,
  Info,
  ChevronRight,
  X,
  Home,
  KeyRound,
  Tag
} from 'lucide-react';

interface PropertyMapClusteredProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onTourInside?: (property: Property) => void;
  savedIds?: string[];
  onToggleSave?: (id: string) => void;
  comparedIds?: string[];
  onToggleCompare?: (id: string) => void;
  currentStatus?: 'sale' | 'rent';
  onStatusChange?: (status: 'sale' | 'rent') => void;
  saleCount?: number;
  rentCount?: number;
}

// Map tile layers available
const TILE_LAYERS = {
  light: {
    name: 'Carto Positron (Prestige Light)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    name: 'Carto Dark Matter (Prestige Night)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

// Region presets for instant focus
const REGIONS = [
  { name: 'All Australia', bounds: null },
  { name: 'Sydney Harbour & Coast', center: [-33.87, 151.24] as [number, number], zoom: 12 },
  { name: 'Southern Highlands', center: [-34.55, 150.45] as [number, number], zoom: 11 },
  { name: 'Victoria Metro & Peninsula', center: [-38.0, 145.0] as [number, number], zoom: 9 },
  { name: 'SE Queensland & Byron', center: [-27.5, 153.2] as [number, number], zoom: 8 },
];

export const PropertyMapClustered: React.FC<PropertyMapClusteredProps> = ({
  properties,
  onSelectProperty,
  onTourInside,
  savedIds = [],
  onToggleSave,
  comparedIds = [],
  onToggleCompare,
  currentStatus = 'sale',
  onStatusChange,
  saleCount,
  rentCount,
}) => {
  const [internalStatus, setInternalStatus] = useState<'sale' | 'rent'>(currentStatus);
  const activeStatus = currentStatus ?? internalStatus;

  useEffect(() => {
    if (currentStatus) {
      setInternalStatus(currentStatus);
    }
  }, [currentStatus]);

  const handleStatusChange = (newStatus: 'sale' | 'rent') => {
    setInternalStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeTileStyle, setActiveTileStyle] = useState<'light' | 'dark' | 'osm'>('light');
  const [clusterRadius, setClusterRadius] = useState<number>(55);
  const [selectedClusterProperties, setSelectedClusterProperties] = useState<Property[] | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [hoveredClusterInfo, setHoveredClusterInfo] = useState<{
    count: number;
    suburbs: string[];
    priceRange: string;
    x: number;
    y: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [totalClustersCount, setTotalClustersCount] = useState<number>(0);

  // Filter properties with valid coordinates
  const validProperties = useMemo(() => {
    return properties.filter((p) => p.coords && typeof p.coords.lat === 'number' && typeof p.coords.lng === 'number');
  }, [properties]);

  // Convert properties into GeoJSON FeatureCollection for Supercluster
  const geojsonFeatures = useMemo(() => {
    return validProperties.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.coords.lng, p.coords.lat] as [number, number],
      },
      properties: p,
    }));
  }, [validProperties]);

  // Initialize Supercluster instance
  const superclusterIndex = useMemo(() => {
    const sc = new Supercluster<Property>({
      radius: clusterRadius,
      maxZoom: 16,
      minPoints: 2,
    });
    sc.load(geojsonFeatures);
    return sc;
  }, [geojsonFeatures, clusterRadius]);

  // Helper to calculate price range string for clusters
  const getClusterPriceRange = (leaves: PointFeature<Property>[]): string => {
    if (!leaves.length) return '';
    const prices = leaves.map((l) => l.properties.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const formatPriceShort = (num: number) => {
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
      }
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`;
      }
      return `$${num}`;
    };

    if (minPrice === maxPrice) {
      return formatPriceShort(minPrice);
    }
    return `${formatPriceShort(minPrice)} - ${formatPriceShort(maxPrice)}`;
  };

  // Render clusters and markers onto Leaflet layer
  const renderMarkersAndClusters = useCallback(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || !superclusterIndex) return;

    markersLayer.clearLayers();

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());
    setMapZoom(zoom);

    // Get Supercluster bounding box: [westLng, southLat, eastLng, northLat]
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const clusters = superclusterIndex.getClusters(bbox, zoom);
    let activeClusterGroups = 0;

    clusters.forEach((cluster) => {
      const [lng, lat] = cluster.geometry.coordinates;
      const isCluster = (cluster.properties as any).cluster;

      if (isCluster) {
        activeClusterGroups++;
        const clusterId = (cluster.properties as any).cluster_id;
        const pointCount = (cluster.properties as any).point_count;
        const leaves = superclusterIndex.getLeaves(clusterId, Infinity);
        const priceRange = getClusterPriceRange(leaves);
        const suburbs = Array.from(new Set(leaves.map((l) => l.properties.suburb)));

        // Distinct styling based on size
        const isLarge = pointCount >= 6;
        const isMedium = pointCount >= 4;

        const clusterHtml = `
          <div class="group relative flex items-center justify-center cursor-pointer select-none">
            <!-- Pulsing outer halo -->
            <div class="absolute -inset-1.5 rounded-full ${
              isLarge ? 'bg-amber-400/30 animate-ping' : 'bg-amber-300/20'
            } pointer-events-none"></div>

            <!-- Cluster Container Badge -->
            <div class="relative flex items-center justify-center rounded-full shadow-xl transition-transform duration-200 group-hover:scale-110 active:scale-95 border-2 ${
              isLarge
                ? 'w-12 h-12 bg-neutral-950 border-amber-400 text-white'
                : isMedium
                ? 'w-11 h-11 bg-neutral-900 border-[#FFD200] text-white'
                : 'w-10 h-10 bg-white border-neutral-900 text-neutral-950 font-black'
            }">
              <div class="flex flex-col items-center justify-center leading-none">
                <span class="text-sm font-black ${
                  isLarge || isMedium ? 'text-amber-400' : 'text-neutral-950'
                }">${pointCount}</span>
                <span class="text-[9px] font-bold uppercase tracking-tighter opacity-80 ${
                  isLarge || isMedium ? 'text-neutral-200' : 'text-neutral-700'
                }">homes</span>
              </div>
            </div>

            <!-- Hover tooltip preview attached to cluster -->
            <div class="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap bg-neutral-950/95 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-neutral-800">
              <div class="font-bold text-amber-300 flex items-center gap-1">
                <span>📍 ${pointCount} Residences Cluster</span>
              </div>
              <div class="text-[11px] text-neutral-300">${suburbs.slice(0, 3).join(', ')}${suburbs.length > 3 ? ` +${suburbs.length - 3}` : ''}</div>
              <div class="text-[10px] text-amber-400/90 font-mono mt-0.5">${priceRange}</div>
              <div class="text-[9px] text-neutral-400 italic mt-0.5">Click to zoom in or inspect</div>
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: 'custom-cluster-marker',
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const marker = L.marker([lat, lng], { icon: clusterIcon });

        marker.on('click', () => {
          const expansionZoom = superclusterIndex.getClusterExpansionZoom(clusterId);
          // If we can zoom in further, smooth fly in
          if (expansionZoom > zoom && expansionZoom <= 18) {
            map.flyTo([lat, lng], expansionZoom, {
              duration: 0.8,
              easeLinearity: 0.25,
            });
          } else {
            // Already at max zoom or multiple residences at exact same spot: open cluster modal/drawer
            setSelectedClusterProperties(leaves.map((l) => l.properties));
          }
        });

        marker.on('mouseover', (e) => {
          const containerPoint = map.latLngToContainerPoint([lat, lng]);
          setHoveredClusterInfo({
            count: pointCount,
            suburbs,
            priceRange,
            x: containerPoint.x,
            y: containerPoint.y,
          });
        });

        marker.on('mouseout', () => {
          setHoveredClusterInfo(null);
        });

        markersLayer.addLayer(marker);
      } else {
        // Individual Property Marker
        const prop = cluster.properties as Property;
        const isRent = prop.status === 'rent';

        const markerHtml = `
          <div class="group relative cursor-pointer select-none">
            <!-- Property Price Pill -->
            <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border transition-all duration-200 group-hover:scale-110 group-hover:z-30 ${
              isRent
                ? 'bg-neutral-900 text-white border-emerald-400/80 hover:border-emerald-300'
                : 'bg-neutral-950 text-white border-amber-400/90 hover:border-amber-300'
            }">
              <div class="w-2 h-2 rounded-full ${isRent ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse shrink-0"></div>
              <span class="text-xs font-black tracking-tight whitespace-nowrap text-white">
                ${prop.priceDisplay}
              </span>
            </div>

            <!-- Pointer arrow stem -->
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-neutral-950 mx-auto -mt-[1px]"></div>
          </div>
        `;

        const singleIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-single-marker',
          iconSize: [110, 32],
          iconAnchor: [55, 32],
        });

        const marker = L.marker([lat, lng], { icon: singleIcon });

        marker.on('click', () => {
          onSelectProperty(prop);
        });

        marker.on('mouseover', () => {
          setHoveredProperty(prop);
        });

        marker.on('mouseout', () => {
          setHoveredProperty((current) => (current?.id === prop.id ? null : current));
        });

        markersLayer.addLayer(marker);
      }
    });

    setTotalClustersCount(activeClusterGroups);
  }, [superclusterIndex, onSelectProperty]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Default view over South Eastern Australia
      const map = L.map(mapContainerRef.current, {
        center: [-33.8688, 151.2093],
        zoom: 7,
        zoomControl: false,
        attributionControl: true,
      });

      const tileLayer = L.tileLayer(TILE_LAYERS[activeTileStyle].url, {
        attribution: TILE_LAYERS[activeTileStyle].attribution,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapRef.current = map;

      // Event listeners for recalculating clusters
      map.on('moveend', () => {
        renderMarkersAndClusters();
      });

      map.on('zoomend', () => {
        renderMarkersAndClusters();
      });

      // Force layout invalidation once DOM dimensions stabilize
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          renderMarkersAndClusters();
        }
      }, 150);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer if user toggles style
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_LAYERS[activeTileStyle].url);
  }, [activeTileStyle]);

  // Re-render markers whenever properties or superclusterIndex changes
  useEffect(() => {
    renderMarkersAndClusters();
  }, [renderMarkersAndClusters]);

  // Fit bounds to current filtered properties
  const fitAllListingsBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map || validProperties.length === 0) return;

    map.invalidateSize();
    const latLngs = validProperties.map((p) => [p.coords.lat, p.coords.lng] as [number, number]);
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 14,
    });
  }, [validProperties]);

  // Initial auto-fit when valid properties are loaded
  useEffect(() => {
    fitAllListingsBounds();
  }, [validProperties.length]);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm flex flex-col">
      {/* Top Map Control Bar */}
      <div className="p-4 bg-neutral-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white">Geographic Property Clustering</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
                {validProperties.length} Mapped Listings
              </span>
              {totalClustersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold">
                  {totalClustersCount} Proximity {totalClustersCount === 1 ? 'Cluster' : 'Clusters'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Nearby residences automatically cluster into high-density markers to keep the map uncluttered.
            </p>
          </div>
        </div>

        {/* Region Presets & Clustering Radius Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Region Selector */}
          <div className="flex items-center gap-1 bg-neutral-800/90 p-1 rounded-lg border border-neutral-700 text-xs">
            <span className="text-[10px] font-bold text-neutral-400 px-1.5 uppercase">Focus:</span>
            {REGIONS.map((reg) => (
              <button
                key={reg.name}
                type="button"
                onClick={() => {
                  if (reg.bounds === null) {
                    fitAllListingsBounds();
                  } else if (reg.center && reg.zoom && mapRef.current) {
                    mapRef.current.flyTo(reg.center, reg.zoom, { duration: 1 });
                  }
                }}
                className="px-2 py-1 rounded text-[11px] font-semibold text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {reg.name}
              </button>
            ))}
          </div>

          {/* Map Layer Style Toggle */}
          <div className="flex items-center bg-neutral-800 p-1 rounded-lg border border-neutral-700">
            <button
              type="button"
              onClick={() => setActiveTileStyle('light')}
              className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                activeTileStyle === 'light'
                  ? 'bg-amber-400 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Carto Positron"
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setActiveTileStyle('dark')}
              className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                activeTileStyle === 'dark'
                  ? 'bg-amber-400 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Dark Matter"
            >
              Dark
            </button>
          </div>

          {/* Fit all bounds button */}
          <button
            type="button"
            onClick={fitAllListingsBounds}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
            title="Reset Map to All Properties"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative h-[560px] w-full bg-neutral-100">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="h-full w-full z-10" />

        {/* Floating Listing Status Control Panel (Top Left) */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-white/95 backdrop-blur-md dark:bg-neutral-900/95 p-1 rounded-2xl shadow-xl border border-neutral-200/90 dark:border-neutral-700/80 flex items-center gap-1 transition-all">
            <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-500 hidden sm:flex items-center gap-1 border-r border-neutral-200 dark:border-neutral-700">
              <Home className="w-3.5 h-3.5 text-amber-500" />
              <span>Listing</span>
            </div>

            {/* For Sale Toggle Button */}
            <button
              type="button"
              onClick={() => handleStatusChange('sale')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeStatus === 'sale'
                  ? 'bg-neutral-950 text-white shadow-md border border-amber-400/80 scale-[1.02]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
              title="Filter map to properties for sale"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activeStatus === 'sale' ? 'bg-amber-400 animate-pulse' : 'bg-neutral-400'
                }`}
              />
              <span>For Sale</span>
              {saleCount !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeStatus === 'sale'
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {saleCount}
                </span>
              )}
            </button>

            {/* For Rent Toggle Button */}
            <button
              type="button"
              onClick={() => handleStatusChange('rent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeStatus === 'rent'
                  ? 'bg-neutral-950 text-white shadow-md border border-emerald-400/80 scale-[1.02]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
              title="Filter map to properties for rent"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activeStatus === 'rent' ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-400'
                }`}
              />
              <span>For Rent</span>
              {rentCount !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeStatus === 'rent'
                      ? 'bg-emerald-400/20 text-emerald-300'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {rentCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Floating Custom Map Controls (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {/* Zoom In/Out */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-neutral-200 overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => mapRef.current?.zoomIn()}
              className="p-2.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer border-b border-neutral-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => mapRef.current?.zoomOut()}
              className="p-2.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Fit Bounds */}
          <button
            type="button"
            onClick={fitAllListingsBounds}
            className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center justify-center"
            title="Fit All Properties in View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Legend / Quick Status (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-neutral-200 text-xs text-neutral-700 hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-neutral-900 inline-block"></span>
            <span className="font-semibold text-[11px]">For Sale Pin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 border border-neutral-900 inline-block"></span>
            <span className="font-semibold text-[11px]">For Rent Pin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-neutral-950 text-amber-400 border border-amber-400 text-[9px] font-black inline-flex items-center justify-center">
              #
            </span>
            <span className="font-semibold text-[11px]">Multi-Home Cluster</span>
          </div>
          <div className="text-[11px] text-neutral-500 pl-2 border-l border-neutral-200">
            Zoom level: <span className="font-mono font-bold text-neutral-800">{mapZoom}</span>
          </div>
        </div>

        {/* Hover Property Preview Card (Bottom Center) */}
        {hoveredProperty && !selectedClusterProperties && (
          <div
            onClick={() => onSelectProperty(hoveredProperty)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-neutral-950/95 text-white p-3 rounded-2xl shadow-2xl border border-amber-400/40 w-[340px] max-w-[90vw] cursor-pointer hover:border-amber-300 transition-all flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2"
          >
            <img
              src={hoveredProperty.images[0]}
              alt={hoveredProperty.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-amber-400 text-xs font-black tracking-tight">
                  {hoveredProperty.priceDisplay}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                  {hoveredProperty.status === 'sale' ? 'Sale' : 'Rent'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate mt-0.5">{hoveredProperty.title}</h4>
              <p className="text-[11px] text-neutral-400 truncate">
                {hoveredProperty.address}, {hoveredProperty.suburb}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-neutral-300 mt-1">
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3 text-amber-400" /> {hoveredProperty.bedrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-3 h-3 text-amber-400" /> {hoveredProperty.bathrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3 text-amber-400" /> {hoveredProperty.carSpaces}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 shrink-0" />
          </div>
        )}

        {/* Selected Cluster Drawer / Inspector Popover (When clicking a dense cluster at max zoom or for direct inspection) */}
        {selectedClusterProperties && (
          <div className="absolute inset-y-0 right-0 z-40 w-full sm:w-96 bg-white shadow-2xl border-l border-neutral-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-neutral-950 font-black flex items-center justify-center text-xs">
                  {selectedClusterProperties.length}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Cluster Residences</h3>
                  <p className="text-[10px] text-neutral-400">
                    Properties grouped in close geographic proximity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClusterProperties(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of properties in this cluster */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selectedClusterProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-neutral-50 hover:bg-neutral-100 rounded-xl p-3 border border-neutral-200 transition-all flex gap-3 group"
                >
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 cursor-pointer"
                    onClick={() => onSelectProperty(prop)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-neutral-900">{prop.priceDisplay}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 uppercase">
                        {prop.type}
                      </span>
                    </div>
                    <h5
                      onClick={() => onSelectProperty(prop)}
                      className="text-xs font-bold text-neutral-800 truncate mt-0.5 cursor-pointer group-hover:text-amber-600 transition-colors"
                    >
                      {prop.title}
                    </h5>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {prop.address}, {prop.suburb}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-600 mt-1">
                      <span className="flex items-center gap-0.5">
                        <Bed className="w-3 h-3 text-amber-600" /> {prop.bedrooms}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Bath className="w-3 h-3 text-amber-600" /> {prop.bathrooms}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Car className="w-3 h-3 text-amber-600" /> {prop.carSpaces}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => onSelectProperty(prop)}
                        className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        View Details
                      </button>
                      {onTourInside && (
                        <button
                          type="button"
                          onClick={() => onTourInside(prop)}
                          className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Tour</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with summary */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-center">
              <button
                type="button"
                onClick={() => setSelectedClusterProperties(null)}
                className="w-full py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close Cluster Inspector
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Strip */}
      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            Click any numbered cluster to zoom into that micro-market. Click individual price pins to view residence details.
          </span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-neutral-700">
          <span>{validProperties.length} residences displayed</span>
          <span>•</span>
          <button
            type="button"
            onClick={fitAllListingsBounds}
            className="text-neutral-900 hover:text-amber-600 underline cursor-pointer"
          >
            Reset View
          </button>
        </div>
      </div>
    </div>
  );
};
