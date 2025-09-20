
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { cn } from '@/lib/utils';

// --- TYPES ---
export type LngLat = { lng: number; lat: number };
type Point = { x: number; y: number };
type Tile = { x: number; y: number; z: number };
type ViewState = { center: LngLat; zoom: number };

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
  const x = TILE_SIZE * (0.5 + lng / 360) * Math.pow(2, zoom);
  const y = TILE_SIZE * (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * Math.pow(2, zoom);
  return { x, y };
};

const pointToLngLat = ({ x, y }: Point, zoom: number): LngLat => {
  const n = Math.pow(2, zoom);
  const lng = (x / (TILE_SIZE * n) - 0.5) * 360;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / (TILE_SIZE * n))));
  const lat = (latRad * 180) / Math.PI;
  return { lng, lat };
};

// --- TILE COMPONENT ---
const MapTile = React.memo(({ tile, style }: { tile: Tile; style: React.CSSProperties }) => {
  const url = `https://a.tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;
  // Add pointer-events-none to prevent browser's default image drag behavior
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

  const [{ x, y, zoom }, setViewState] = useSpring(() => {
    const initialPoint = lngLatToPoint(center, controlledZoom);
    return {
        zoom: controlledZoom,
        x: -initialPoint.x,
        y: -initialPoint.y,
        config: { tension: 250, friction: 30, clamp: true },
    }
  });

  // Update map center when spring values change (e.g., after drag/zoom)
  useEffect(() => {
    const unsubscribeX = x.onChange(val => {
        if (isDragging.current) return;
        const newCenter = pointToLngLat({ x: -val, y: -y.get() }, zoom.get());
        onCenterChange(newCenter);
    });

    const unsubscribeY = y.onChange(val => {
        if (isDragging.current) return;
        const newCenter = pointToLngLat({ x: -x.get(), y: -val }, zoom.get());
        onCenterChange(newCenter);
    });
    
     const unsubscribeZoom = zoom.onChange(val => {
        const newCenter = pointToLngLat({ x: -x.get(), y: -y.get() }, val);
        onCenterChange(newCenter);
    });

    return () => {
      unsubscribeX();
      unsubscribeY();
      unsubscribeZoom();
    };
  }, [x, y, zoom, onCenterChange]);


  // Update spring when controlled center prop changes from outside
  useEffect(() => {
    const point = lngLatToPoint(center, zoom.get());
    setViewState.start({ x: -point.x, y: -point.y, immediate: true });
  }, [center, setViewState, zoom]);
  
  // Update map size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        setSize({
          width: mapRef.current.clientWidth,
          height: mapRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Gesture handling for pan and zoom
  useGesture(
    {
      onDrag: ({ offset: [dx, dy] }) => {
        setViewState.start({ x: dx, y: dy });
      },
      onDragStart: () => { isDragging.current = true; },
      onDragEnd: () => { 
        isDragging.current = false;
        // Manually trigger onCenterChange at the end of the drag
        const newCenter = pointToLngLat({ x: -x.get(), y: -y.get() }, zoom.get());
        onCenterChange(newCenter);
      },
      onPinch: ({ offset: [d] }) => {
          const newZoom = controlledZoom + d/100;
          setViewState.start({ zoom: newZoom });
      },
      onWheel: ({ event, movement: [, dy] }) => {
        event.preventDefault();
        const currentZoom = zoom.get();
        const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom - dy / 100));
        
        const { x: mouseX, y: mouseY } = mapRef.current!.getBoundingClientRect();
        const mousePoint = { x: event.clientX - mouseX, y: event.clientY - mouseY };

        const currentMapX = x.get();
        const currentMapY = y.get();
        
        const mouseOnMap = { x: mousePoint.x - currentMapX, y: mousePoint.y - currentMapY };
        
        const zoomFactor = Math.pow(2, newZoom) / Math.pow(2, currentZoom);
        
        const newMapX = mousePoint.x - mouseOnMap.x * zoomFactor;
        const newMapY = mousePoint.y - mouseOnMap.y * zoomFactor;

        setViewState.start({ zoom: newZoom, x: newMapX, y: newMapY });
      },
    },
    {
      target: mapRef,
      eventOptions: { passive: false },
      drag: { from: () => [x.get(), y.get()] },
      wheel: {
          from: () => [0, zoom.get()],
          axis: 'y'
      },
      pinch: {
          from: () => [0, zoom.get()],
          scaleBounds: { min: minZoom, max: maxZoom },
          rubberband: true
      }
    }
  );

  // Calculate which tiles are visible
  const getVisibleTiles = useCallback(
    (width: number, height: number, currentX: number, currentY: number, currentZoom: number): Tile[] => {
      if (width === 0 || height === 0) return [];

      const z = Math.round(currentZoom);
      const tiles: Tile[] = [];

      const startX = Math.floor(-currentX / TILE_SIZE);
      const startY = Math.floor(-currentY / TILE_SIZE);
      const endX = Math.ceil((-currentX + width) / TILE_SIZE);
      const endY = Math.ceil((-currentY + height) / TILE_SIZE);
      
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

  const tiles = getVisibleTiles(
    size.width,
    size.height,
    x.get(),
    y.get(),
    zoom.get(),
  );

  return (
    <div
      ref={mapRef}
      className={cn('w-full h-full bg-muted cursor-grab active:cursor-grabbing touch-none overflow-hidden relative', className)}
    >
      <animated.div
        className="absolute inset-0"
        style={{
          transform: zoom.to(z => `scale(${Math.pow(2, z) / Math.pow(2, Math.round(z))})`),
          x,
          y,
        }}
      >
        {tiles.map((tile) => {
          const tileId = `${tile.x}-${tile.y}-${tile.z}`;
          const tileStyle: React.CSSProperties = {
            position: 'absolute',
            left: tile.x * TILE_SIZE,
            top: tile.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          };
          return <MapTile key={tileId} tile={tile} style={tileStyle} />;
        })}
      </animated.div>
    </div>
  );
}
