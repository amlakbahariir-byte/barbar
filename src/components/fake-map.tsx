
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
  children?: React.ReactNode;
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
  children,
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
        onRest: ({ value }) => {
            // This is called when any spring animation (pan, zoom) settles.
            if (!isDragging.current) {
                const currentZoom = value.zoom;
                const worldPoint = {
                    x: size.width / 2 - value.x,
                    y: size.height / 2 - value.y,
                };
                const newCenter = pointToLngLat(worldPoint, currentZoom);
                onCenterChange(newCenter);
            }
        },
    }
  });

  // Update spring when controlled center prop changes from outside
  useEffect(() => {
    if (size.width === 0 || isDragging.current) return;
    const point = lngLatToPoint(center, zoom.get());
    api.start({ 
        x: -point.x + size.width / 2, 
        y: -point.y + size.height / 2, 
        immediate: true 
    });
  }, [center, api, zoom, size]);


  // Update map size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        const { clientWidth, clientHeight } = mapRef.current;
        setSize({ width: clientWidth, height: clientHeight });
        
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
      onDrag: ({ active, offset: [dx, dy], pinching }) => {
        if (pinching) return;
        isDragging.current = active;
        api.start({ x: dx, y: dy, immediate: active });
        if(!active) {
            // After drag ends, onRest will fire and update the center.
        }
      },
      onWheel: ({ event, delta: [, dy], memo }) => {
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
       onPinch: ({ offset: [d], origin: [ox, oy], event, memo }) => {
        event.preventDefault();
        const currentZoom = zoom.get();
        const newZoom = Math.max(minZoom, Math.min(maxZoom, memo + d / 100));

        const { x: mouseX, y: mouseY } = mapRef.current!.getBoundingClientRect();
        const pinchOriginPoint = { x: ox - mouseX, y: oy - mouseY };

        const currentMapX = x.get();
        const currentMapY = y.get();

        const worldPoint = {
            x: (pinchOriginPoint.x - currentMapX) / Math.pow(2, currentZoom),
            y: (pinchOriginPoint.y - currentMapY) / Math.pow(2, currentZoom),
        };

        const newMapX = pinchOriginPoint.x - worldPoint.x * Math.pow(2, newZoom);
        const newMapY = pinchOriginPoint.y - worldPoint.y * Math.pow(2, newZoom);

        api.start({ zoom: newZoom, x: newMapX, y: newMapY, immediate: true });
        return memo;
      },
    },
    {
      target: mapRef,
      eventOptions: { passive: false },
      drag: { from: () => [x.get(), y.get()] },
      wheel: { from: () => [0, zoom.get()], axis: 'y' },
      pinch: { from: () => [zoom.get(), 0], memo: zoom.get() },
    }
  );

  // Calculate which tiles are visible
  const getVisibleTiles = useCallback(
    (width: number, height: number, transform: { x: number, y: number, z: number }): Tile[] => {
      if (width === 0 || height === 0) return [];

      const z = Math.round(transform.z);
      const tiles: Tile[] = [];
      const scale = Math.pow(2, transform.z);
      const TILE_SCALED_SIZE = TILE_SIZE;

      const worldTopLeft = {
        x: -transform.x / TILE_SCALED_SIZE,
        y: -transform.y / TILE_SCALED_SIZE,
      };
      const worldBottomRight = {
        x: (width - transform.x) / TILE_SCALED_SIZE,
        y: (height - transform.y) / TILE_SCALED_SIZE,
      };
      
      const startX = Math.max(0, Math.floor(worldTopLeft.x));
      const startY = Math.max(0, Math.floor(worldTopLeft.y));
      const endX = Math.ceil(worldBottomRight.x);
      const endY = Math.ceil(worldBottomRight.y);

      for (let i = startX; i < endX; i++) {
        for (let j = startY; j < endY; j++) {
            tiles.push({ x: i, y: j, z });
        }
      }
      return tiles;
    },
    []
  );
  
  const renderTiles = (currentZoomValue: number, currentX: number, currentY: number) => {
    const zInt = Math.round(currentZoomValue);
    const tileScale = Math.pow(2, currentZoomValue - zInt);
    const scaledTileSize = TILE_SIZE * tileScale;

    const tiles = getVisibleTiles(size.width, size.height, {
      x: currentX,
      y: currentY,
      z: currentZoomValue,
    });
    
    return tiles.map((tile) => {
      const tileId = `${tile.z}-${tile.x}-${tile.y}`;
      const baseTile = { ...tile, z: zInt };
      const tileIdInt = `${baseTile.x}-${baseTile.y}-${baseTile.z}`;

      const tileStyle = {
        width: scaledTileSize + 0.5,
        height: scaledTileSize + 0.5,
        left: baseTile.x * scaledTileSize,
        top: baseTile.y * scaledTileSize,
      };
      return <MapTile key={tileIdInt} tile={baseTile} style={tileStyle} />;
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
            x,
            y,
            scale: to(zoom, z => Math.pow(2, z - Math.round(z))),
            transformOrigin: '0 0'
        }}
      >
          {size.width > 0 && renderTiles(zoom.get(), x.get(), y.get())}
      </animated.div>
      {children}
    </div>
  );
}

