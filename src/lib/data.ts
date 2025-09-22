
import { collection, getDocs, doc, getDoc, addDoc, query, where } from "firebase/firestore"; 
import { db } from "./firebase/config";

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


const drivers: Driver[] = [
  { id: 'd1', name: 'رضا احمدی', avatar: 'https://i.pravatar.cc/150?u=d1', vehicle: 'کامیون تک', rating: 4.8 },
  { id: 'd2', name: 'مریم حسینی', avatar: 'https://i.pravatar.cc/150?u=d2', vehicle: 'وانت نیسان', rating: 4.9 },
  { id: 'd3', name: 'علی کریمی', avatar: 'https://i.pravatar.cc/150?u=d3', vehicle: 'تریلی', rating: 4.7 },
  { id: 'd4', name: 'سارا محمدی', avatar: 'https://i.pravatar.cc/150?u=d4', vehicle: 'خاور', rating: 5.0 },
];

export const getTransactions = async (): Promise<Transaction[]> => {
    const transactionsCol = collection(db, 'transactions');
    const transactionSnapshot = await getDocs(transactionsCol);
    const transactionList = transactionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    return transactionList;
};


export const getShipmentById = async (id: string): Promise<Shipment | null> => {
    const docRef = doc(db, "shipments", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Shipment;
    } else {
        console.log("No such document!");
        return null;
    }
}

export const addShipment = async (shipment: Omit<Shipment, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, "shipments"), shipment);
        console.log("Document written with ID: ", docRef.id);
        return { ...shipment, id: docRef.id }
    } catch (e) {
        console.error("Error adding document: ", e);
        return null;
    }
}

export const getMyShipments = async (role: 'shipper' | 'driver', type: 'all' | 'available' | 'accepted'): Promise<Shipment[]> => {
    const shipmentsCol = collection(db, 'shipments');
    let q;

    if (role === 'shipper') {
        if (type === 'all') {
            q = query(shipmentsCol);
        } else {
            // Placeholder for shipper-specific filters like 'pending', 'in_transit'
            // For now, returning all as an example
            q = query(shipmentsCol);
        }
    } else { // role === 'driver'
        if (type === 'available') {
            q = query(shipmentsCol, where("status", "==", "pending"));
        } else if (type === 'accepted') {
            // This needs a proper user ID check in a real app
            q = query(shipmentsCol, where("status", "in", ["accepted", "in_transit"]));
        } else {
             q = query(shipmentsCol);
        }
    }

    const shipmentSnapshot = await getDocs(q);
    const shipmentList = shipmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment));
    return shipmentList;
}
