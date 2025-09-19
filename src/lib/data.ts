export type Driver = {
  id: string;
  name: string;
  avatar: string;
  vehicle: string;
  rating: number;
};

export type Bid = {
  id: string;
  driver: Driver;
  amount: number;
  timestamp: string;
};

export type Shipment = {
  id: string;
  origin: string;
  destination: string;
  weight: number; // in kg
  volume: number; // in m³
  date: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered';
  bids?: Bid[];
  acceptedDriver?: Driver;
};

const drivers: Driver[] = [
  { id: 'd1', name: 'رضا احمدی', avatar: 'https://i.pravatar.cc/150?u=d1', vehicle: 'کامیون تک', rating: 4.8 },
  { id: 'd2', name: 'مریم حسینی', avatar: 'https://i.pravatar.cc/150?u=d2', vehicle: 'وانت نیسان', rating: 4.9 },
  { id: 'd3', name: 'علی کریمی', avatar: 'https://i.pravatar.cc/150?u=d3', vehicle: 'تریلی', rating: 4.7 },
  { id: 'd4', name: 'سارا محمدی', avatar: 'https://i.pravatar.cc/150?u=d4', vehicle: 'خاور', rating: 5.0 },
];

export const shipments: Shipment[] = [
  {
    id: 'shp1001',
    origin: 'تهران',
    destination: 'اصفهان',
    weight: 2000,
    volume: 15,
    date: '1403/05/10',
    description: 'مبلمان منزل، شکستنی',
    status: 'pending',
    bids: [
      { id: 'b1', driver: drivers[0], amount: 1200000, timestamp: '2 ساعت پیش' },
      { id: 'b2', driver: drivers[3], amount: 1350000, timestamp: '1 ساعت پیش' },
    ],
  },
  {
    id: 'shp1002',
    origin: 'شیراز',
    destination: 'تبریز',
    weight: 500,
    volume: 2,
    date: '1403/05/12',
    description: 'لوازم الکترونیکی',
    status: 'pending',
    bids: [
        { id: 'b3', driver: drivers[1], amount: 850000, timestamp: '۳۰ دقیقه پیش' },
    ]
  },
  {
    id: 'shp1003',
    origin: 'مشهد',
    destination: 'کرج',
    weight: 10000,
    volume: 30,
    date: '1403/05/11',
    description: 'مصالح ساختمانی',
    status: 'accepted',
    acceptedDriver: drivers[2],
  },
  {
    id: 'shp1004',
    origin: 'اهواز',
    destination: 'تهران',
    weight: 800,
    volume: 5,
    date: '1403/05/09',
    description: 'مواد غذایی',
    status: 'in_transit',
    acceptedDriver: drivers[0],
  },
    {
    id: 'shp1005',
    origin: 'اصفهان',
    destination: 'شیراز',
    weight: 1200,
    volume: 8,
    date: '1403/05/15',
    description: 'اثاثیه اداری',
    status: 'pending',
    bids: []
  },
  {
    id: 'shp1006',
    origin: 'یزد',
    destination: 'کرمان',
    weight: 300,
    volume: 1.5,
    date: '1403/05/13',
    description: 'بسته های کوچک پستی',
    status: 'delivered',
    acceptedDriver: drivers[1],
  },
];

export const getShipmentById = (id: string) => {
    return shipments.find(s => s.id === id);
}

export const getMyShipments = (role: 'shipper' | 'driver', type: 'all' | 'available' | 'accepted') => {
    if (role === 'shipper') {
        // Shippers see all their own shipments regardless of status
        return shipments;
    }
    
    // For drivers
    if (type === 'available') {
        // Drivers see pending shipments they haven't bid on yet. For this demo, we show all pending.
        return shipments.filter(s => s.status === 'pending');
    }

    if (type === 'accepted') {
        // Drivers see shipments they have accepted (or are in transit/delivered for them).
        // Hardcoded to driver d1 for demo
        return shipments.filter(s => s.acceptedDriver?.id === 'd1' || s.id === 'shp1003' || s.id === 'shp1006');
    }
    
    return [];
}
