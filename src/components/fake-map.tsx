
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { cn } from '@/lib/utils';

// --- TYPES ---
export type LngLat = { lng: number; lat: number };
type Point = { x: number; y: number };
type Tile = { x: number; y: number; z: number };

interface FakeMapProps {
  center: LngLat;
  onCenterChange: (center: LngLat) => void;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
}

// --- CONSTANTS ---
const TILE_SIZE = 256;
const INITIAL_ZOOM = 8;
const MIN_ZOOM = 4;
const MAX_ZOOM = 12;

// --- UTILITY FUNCTIONS ---
const lngLatToPoint = ({ lng, lat }: LngLat, zoom: number): Point => {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = scale * (0.5 + lng / 360);
  const y = scale * (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI));
  return { x, y };
};

const pointToLngLat = ({ x, y }: Point, zoom: number): LngLat => {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const lng = (x / scale - 0.5) * 360;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale)));
  const lat = (latRad * 180) / Math.PI;
  return { lng, lat };
};

// --- TILE COMPONENT ---
const MapTile = React.memo(({ tile, style }: { tile: Tile; style: React.CSSProperties }) => {
  const url = `https://a.tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;
  return <animated.img src={url} alt={`Map tile ${tile.z}/${tile.x}/${tile.y}`} className="absolute pointer-events-none" style={style} />;
});
MapTile.displayName = 'MapTile';

// --- MAIN MAP COMPONENT ---
export function FakeMap({
  center,
  onCenterChange,
  zoom: controlledZoom = INITIAL_ZOOM,
  minZoom = MIN_ZOOM,
  maxZoom = MAX_ZOOM,
  className,
}: FakeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const isDragging = useRef(false);

  const [{ x, y, zoom }, api] = useSpring(() => {
    const initialPoint = lngLatToPoint(center, controlledZoom);
    return {
        zoom: controlledZoom,
        x: -initialPoint.x + size.width / 2,
        y: -initialPoint.y + size.height / 2,
        config: { tension: 250, friction: 30, clamp: true },
    }
  });

  // Update spring when controlled center prop changes from outside
  useEffect(() => {
    if (size.width === 0) return;
    const point = lngLatToPoint(center, zoom.get());
    api.start({ 
        x: -point.x + size.width / 2, 
        y: -point.y + size.height / 2, 
        immediate: true 
    });
  }, [center, api, zoom, size]);

  // Update map center when spring values change (e.g., after drag/zoom)
  useEffect(() => {
    const handleSpringUpdate = () => {
        if (isDragging.current || size.width === 0) return;
        const currentZoom = zoom.get();
        const worldPoint = {
            x: size.width / 2 - x.get(),
            y: size.height / 2 - y.get()
        };
        const newCenter = pointToLngLat(worldPoint, currentZoom);
        onCenterChange(newCenter);
    };

    const unsubscribe = to([x, y, zoom]).onChange(handleSpringUpdate);
    return () => unsubscribe();
  }, [x, y, zoom, onCenterChange, size]);

  // Update map size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        const { clientWidth, clientHeight } = mapRef.current;
        setSize({ width: clientWidth, height: clientHeight });
        
        // Recenter map on resize
        const point = lngLatToPoint(center, zoom.get());
        api.start({
            x: -point.x + clientWidth / 2,
            y: -point.y + clientHeight / 2,
            immediate: true,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [center, zoom, api]);

  // Gesture handling for pan and zoom
  useGesture(
    {
      onDrag: ({ active, offset: [dx, dy] }) => {
        isDragging.current = active;
        api.start({ x: dx, y: dy });
      },
      onWheel: ({ event, delta: [, dy] }) => {
        event.preventDefault();
        const currentZoom = zoom.get();
        const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom - dy / 250));
        
        const { x: mouseX, y: mouseY } = mapRef.current!.getBoundingClientRect();
        const mousePoint = { x: event.clientX - mouseX, y: event.clientY - mouseY };

        const currentMapX = x.get();
        const currentMapY = y.get();
        
        const worldPoint = {
            x: (mousePoint.x - currentMapX) / Math.pow(2, currentZoom),
            y: (mousePoint.y - currentMapY) / Math.pow(2, currentZoom),
        };
        
        const newMapX = mousePoint.x - worldPoint.x * Math.pow(2, newZoom);
        const newMapY = mousePoint.y - worldPoint.y * Math.pow(2, newZoom);
        
        api.start({ zoom: newZoom, x: newMapX, y: newMapY });
      },
    },
    {
      target: mapRef,
      eventOptions: { passive: false },
      drag: { from: () => [x.get(), y.get()] },
      wheel: { from: () => [0, zoom.get()], axis: 'y' }
    }
  );

  // Calculate which tiles are visible
  const getVisibleTiles = useCallback(
    (width: number, height: number, transform: { x: number, y: number, zoom: number }): Tile[] => {
      if (width === 0 || height === 0) return [];

      const z = Math.floor(transform.zoom);
      const scale = Math.pow(2, z);
      const tiles: Tile[] = [];

      const topLeftWorld = { x: -transform.x / scale, y: -transform.y / scale };
      const bottomRightWorld = { x: (width - transform.x) / scale, y: (height - transform.y) / scale };

      const startX = Math.floor(topLeftWorld.x / TILE_SIZE);
      const startY = Math.floor(topLeftWorld.y / TILE_SIZE);
      const endX = Math.ceil(bottomRightWorld.x / TILE_SIZE);
      const endY = Math.ceil(bottomRightWorld.y / TILE_SIZE);
      
      const maxTile = Math.pow(2, z) - 1;

      for (let i = startX; i < endX; i++) {
        for (let j = startY; j < endY; j++) {
            if(i >= 0 && i <= maxTile && j >=0 && j <= maxTile)
                tiles.push({ x: i, y: j, z });
        }
      }
      return tiles;
    },
    []
  );

  const renderTiles = (zInt: number, currentZoom: number) => {
    const tiles = getVisibleTiles(
      size.width,
      size.height,
      { x: x.get(), y: y.get(), zoom: zInt }
    );
    const scale = Math.pow(2, currentZoom - zInt);

    return tiles.map((tile) => {
      const tileId = `${tile.x}-${tile.y}-${tile.z}`;
      const tileStyle: React.CSSProperties = {
        position: 'absolute',
        left: tile.x * TILE_SIZE,
        top: tile.y * TILE_SIZE,
        width: TILE_SIZE + 1,
        height: TILE_SIZE + 1,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        opacity: currentZoom > zInt + 1 || currentZoom < zInt ? 0.3 : 1,
      };
      return <MapTile key={tileId} tile={tile} style={tileStyle} />;
    });
  };

  return (
    <div
      ref={mapRef}
      className={cn('w-full h-full bg-muted cursor-grab active:cursor-grabbing touch-none overflow-hidden relative', className)}
    >
      <animated.div
        className="absolute inset-0"
        style={{
            x: to(x, (val) => val),
            y: to(y, (val) => val),
            transform: zoom.to(z => `scale(${Math.pow(2, z - Math.floor(z))})`),
            transformOrigin: '0 0'
        }}
      >
        {size.width > 0 && renderTiles(Math.floor(zoom.get()), zoom.get())}
      </animated.div>
    </div>
  );
}


    