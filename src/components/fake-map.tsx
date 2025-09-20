
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

  const [viewState, setViewState] = useSpring(() => {
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
    const unsubscribe = viewState.x.onChange((x) => {
      if (isDragging.current) return;
      const newCenter = pointToLngLat({ x: -x, y: -viewState.y.get() }, viewState.zoom.get());
      onCenterChange(newCenter);
    });
    const unsubscribeY = viewState.y.onChange((y) => {
        if (isDragging.current) return;
        const newCenter = pointToLngLat({ x: -viewState.x.get(), y: -y }, viewState.zoom.get());
        onCenterChange(newCenter);
    });
    const unsubscribeZoom = viewState.zoom.onChange((zoom) => {
        const newCenter = pointToLngLat({ x: -viewState.x.get(), y: -viewState.y.get() }, zoom);
        onCenterChange(newCenter);
    });

    return () => {
      unsubscribe();
      unsubscribeY();
      unsubscribeZoom();
    };
  }, [viewState, onCenterChange]);


  // Update spring when controlled center prop changes from outside
  useEffect(() => {
    const point = lngLatToPoint(center, viewState.zoom.get());
    setViewState.start({ x: -point.x, y: -point.y, immediate: true });
  }, [center, setViewState, viewState.zoom]);
  
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
        const newCenter = pointToLngLat({ x: -viewState.x.get(), y: -viewState.y.get() }, viewState.zoom.get());
        onCenterChange(newCenter);
      },
      onPinch: ({ offset: [d] }) => {
          const newZoom = controlledZoom + d/100;
          setViewState.start({ zoom: newZoom });
      },
      onWheel: ({ event, movement: [, dy] }) => {
        event.preventDefault();
        const currentZoom = viewState.zoom.get();
        const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom - dy / 100));
        
        const { x: mouseX, y: mouseY } = mapRef.current!.getBoundingClientRect();
        const mousePoint = { x: event.clientX - mouseX, y: event.clientY - mouseY };

        const currentMapX = viewState.x.get();
        const currentMapY = viewState.y.get();
        
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
      drag: { from: () => [viewState.x.get(), viewState.y.get()] },
      wheel: {
          from: () => [0, viewState.zoom.get()],
          axis: 'y'
      },
      pinch: {
          from: () => [0, viewState.zoom.get()],
          scaleBounds: { min: minZoom, max: maxZoom },
          rubberband: true
      }
    }
  );

  // Calculate which tiles are visible
  const getVisibleTiles = useCallback(
    ({ width, height, x, y, zoom }: { width: number; height: number; x: number; y: number; zoom: number }): Tile[] => {
      if (width === 0 || height === 0) return [];

      const z = Math.round(zoom);
      const tiles: Tile[] = [];

      const startX = Math.floor(-x / TILE_SIZE);
      const startY = Math.floor(-y / TILE_SIZE);
      const endX = Math.ceil((-x + width) / TILE_SIZE);
      const endY = Math.ceil((-y + height) / TILE_SIZE);
      
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

  const tiles = getVisibleTiles({
    width: size.width,
    height: size.height,
    x: viewState.x.get(),
    y: viewState.y.get(),
    zoom: viewState.zoom.get(),
  });

  return (
    <div
      ref={mapRef}
      className={cn('w-full h-full bg-muted cursor-grab active:cursor-grabbing touch-none overflow-hidden relative', className)}
    >
      <animated.div
        className="absolute inset-0"
        style={{
          transform: viewState.zoom.to(z => `scale(${Math.pow(2, z) / Math.pow(2, Math.round(z))})`),
          x: viewState.x,
          y: viewState.y,
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
