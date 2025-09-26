
import shipmentsData from '@/lib/db/shipments.json';
import transactionsData from '@/lib/db/transactions.json';

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
  cargoType: string;
  date: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered';
  bids?: Bid[];
  acceptedDriver?: Driver;
};

export type Transaction = {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
};


// In-memory representation of the database for simulation purposes.
let localShipments: Shipment[] = shipmentsData.shipments as Shipment[];
const localTransactions: Transaction[] = transactionsData.transactions as Transaction[];


export const getTransactions = async (): Promise<Transaction[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return Promise.resolve(localTransactions);
};


export const getShipmentById = async (id: string): Promise<Shipment | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const shipment = localShipments.find(s => s.id === id) || null;
    return Promise.resolve(shipment);
}

export const addShipment = async (shipment: Omit<Shipment, 'id'>) => {
    // Simulate network delay and adding to the database
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newShipment: Shipment = {
        ...shipment,
        id: `shp${Math.floor(Math.random() * 1000) + 1007}`,
    };
    
    // Note: This only adds to the in-memory array for the current session.
    // It does not persist to the shipments.json file.
    localShipments.unshift(newShipment);
    
    console.log("Shipment added to in-memory store: ", newShipment.id);
    return Promise.resolve(newShipment);
}

export const getMyShipments = async (role: 'shipper' | 'driver', type: 'all' | 'available' | 'accepted'): Promise<Shipment[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let results: Shipment[] = [];

    if (role === 'shipper') {
        // For shippers, return all shipments as they 'own' them all in this simulation
         results = localShipments;
    } else { // role === 'driver'
        if (type === 'available') {
            results = localShipments.filter(s => s.status === 'pending');
        } else if (type === 'accepted') {
            // In a real app, you'd filter by driverId. Here, we simulate by grabbing
            // shipments that are accepted or in transit and assigning them to the current driver.
            results = localShipments.filter(s => ["accepted", "in_transit"].includes(s.status));
        } else {
             results = localShipments;
        }
    }
    
    // Return a copy to prevent mutation of the original data
    return Promise.resolve([...results]);
}
