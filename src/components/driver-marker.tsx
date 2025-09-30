
import { Truck, Car, Move } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

interface DriverMarkerProps {
  vehicleType: 'کامیون' | 'وانت' | 'موتور' | 'سواری';
  avatar: string;
}

const MotorcycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm12 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/>
        <path d="M12 17h-5l-3-6 2-4h3l3 6h3V6h2v3h1"/>
        <path d="m14 6-2-4"/>
    </svg>
);


const vehicleIconMap = {
  'کامیون': Truck,
  'وانت': Car,
  'موتور': MotorcycleIcon,
  'سواری': Car,
};

const vehicleColorMap = {
  'کامیون': 'bg-blue-500',
  'وانت': 'bg-orange-500',
  'موتور': 'bg-green-500',
  'سواری': 'bg-purple-500',
};

// This component is not a true React component.
// It's a helper function that returns an HTML string for Leaflet's divIcon.
export const DriverMarker = ({ vehicleType, avatar }: DriverMarkerProps): string => {
  const Icon = vehicleIconMap[vehicleType] || Move;
  const color = vehicleColorMap[vehicleType] || 'bg-gray-500';

  return ReactDOMServer.renderToString(
    <div style={{
      position: 'relative',
      width: '60px',
      height: '75px',
      fontFamily: 'sans-serif'
    }}>
      <svg
        width="60"
        height="75"
        viewBox="0 0 60 75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
        }}
      >
        <path d="M30 75C30 75 60 55 60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 55 30 75 30 75Z" fill="white"/>
      </svg>
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        width: '50px',
        height: '50px',
        borderRadius: '9999px',
        overflow: 'hidden',
        border: '3px solid white',
      }}>
        <img src={avatar} alt="driver" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div className={`${color}`} style={{
        position: 'absolute',
        bottom: '22px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '30px',
        height: '30px',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid white',
      }}>
        <Icon />
      </div>
    </div>
  );
};
