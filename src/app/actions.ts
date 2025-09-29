
'use server';

import { generateAlertMessage } from '@/ai/flows/generate-alert-message-for-route-deviation';
import { config } from 'dotenv';

import type { Shipment, Transaction } from '@/lib/data';
import shipmentsData from '@/lib/db/shipments.json';
import transactionsData from '@/lib/db/transactions.json';
import fs from 'fs/promises';
import path from 'path';

config();

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

export const addShipment = async (shipment: Omit<Shipment, 'id'>): Promise<Shipment> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newShipment: Shipment = {
        ...shipment,
        id: `shp${Math.floor(Math.random() * 1000) + 1007}`,
    };
    
    // Add to the in-memory array
    localShipments.unshift(newShipment);
    
    // Persist to the file
    try {
        const filePath = path.join(process.cwd(), 'src', 'lib', 'db', 'shipments.json');
        const updatedData = JSON.stringify({ shipments: localShipments }, null, 2);
        await fs.writeFile(filePath, updatedData, 'utf-8');
        console.log("Shipment added and persisted to shipments.json");
    } catch (error) {
        console.error("Failed to write to shipments.json", error);
    }
    
    return Promise.resolve(newShipment);
}

export const getMyShipments = async (role: 'shipper' | 'driver', type: 'all' | 'available' | 'accepted'): Promise<Shipment[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let results: Shipment[] = [];

    if (role === 'shipper') {
        results = localShipments;
    } else { // role === 'driver'
        if (type === 'available') {
            results = localShipments.filter(s => s.status === 'pending');
        } else if (type === 'accepted') {
            results = localShipments.filter(s => ["accepted", "in_transit"].includes(s.status));
        } else {
             results = localShipments;
        }
    }
    
    return Promise.resolve([...results]);
}

export async function handleDeviationAlert(driverId: string, shipmentId: string) {
  try {
    const result = await generateAlertMessage({
      driverId,
      shipmentId,
      deviationDistance: 500, // Simulated distance
      likelyExplanations: ['ترافیک سنگین', 'بسته بودن راه', 'تصادف'],
    });
    return result.alertMessage;
  } catch (error) {
    console.error('Error generating deviation alert:', error);
    return 'خطا در تولید پیام. لطفا وضعیت خود را به پشتیبانی اطلاع دهید.';
  }
}

export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`, {
        headers: {
            'User-Agent': 'BarbarIraniApp/1.0'
        }
    });

    if (!response.ok) {
      console.error('Nominatim API request failed with status:', response.status, await response.text());
      return "خطا در ارتباط با سرویس نقشه";
    }
    const data = await response.json();
    
    if (data && data.address) {
      const { road, suburb, city, state, town, village } = data.address;
      const addressParts = [road, suburb, city, town, village, state].filter(Boolean);
      
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    if (data && data.display_name) {
      return data.display_name.split(',').slice(0, 3).join(',');
    }

    return "آدرس یافت نشد.";
    
  } catch (error) {
    console.error('Error fetching address from Nominatim:', error);
    return "خطا در دریافت آدرس";
  }
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const username = process.env.MELIPAYAMAK_USERNAME;
  const password = process.env.MELIPAYAMAK_PASSWORD;
  const bodyId = process.env.MELIPAYAMAK_BODY_ID;

  if (!username || !password || !bodyId) {
    const errorMessage = 'پیکربندی سرویس پیامک کامل نیست. نام کاربری، رمز عبور یا کد قالب وجود ندارد.';
    console.error(errorMessage);
    return { success: false, message: errorMessage };
  }
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generated OTP for ${phone} is: ${code}. (For testing purposes)`);

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.payamak-panel.com/post/send.asmx/SendByBaseNumber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        text: code,
        to: phone,
        bodyId: parseInt(bodyId, 10),
      }),
    });
    
    const responseBodyText = await response.text();
    console.log('MeliPayamak API Response Status:', response.status);
    console.log('MeliPayamak API Response Body:', responseBodyText);

    if (response.ok) {
       try {
        const responseBody = JSON.parse(responseBodyText);
        // According to the PDF, a successful response has a "Value" field with a positive number (retStr)
        if (responseBody.Value && responseBody.Value.length > 10) {
             console.log(`Successfully sent OTP to ${phone}. Response Value: ${responseBody.Value}`);
             return { success: true, message: 'کد تایید با موفقیت ارسال شد.' };
        } else {
             const errorMessage = responseBody.Value || 'ارسال موفق بود اما شناسه معتبر دریافت نشد.';
             console.error('MeliPayamak Error:', errorMessage);
             return { success: false, message: `ارسال پیامک ناموفق بود: ${errorMessage}` };
        }
       } catch (e) {
          console.error('Failed to parse MeliPayamak JSON response:', e);
          return { success: false, message: `پاسخ دریافتی از سرور پیامک معتبر نبود: ${responseBodyText}` };
       }
    } else {
       return { success: false, message: `ارسال پیامک ناموفق بود: ${responseBodyText}` };
    }
  } catch (error) {
    console.error('Error sending OTP via MeliPayamak:', error);
    if (error instanceof Error) {
        return { success: false, message: `خطای شبکه: ${error.message}` };
    }
    return { success: false, message: 'یک خطای ناشناخته در ارسال پیامک رخ داد.' };
  }
}
