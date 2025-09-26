
'use server';

import { generateAlertMessage } from '@/ai/flows/generate-alert-message-for-route-deviation';

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


export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`, {
        headers: {
            'User-Agent': 'BarbarIraniApp/1.0'
        }
    });

    if (!response.ok) {
      console.error('Nominatim API request failed with status:', response.status, await response.text());
      return null;
    }
    const data = await response.json();

    if (data && data.address) {
      const { road, suburb, city, state } = data.address;
      const addressParts = [road, suburb, city, state].filter(Boolean);
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    if (data && data.display_name) {
      return data.display_name.split(',').slice(0, 3).join(',');
    }

    return null;
    
  } catch (error) {
    console.error('Error fetching address from Nominatim:', error);
    return null;
  }
}

    
