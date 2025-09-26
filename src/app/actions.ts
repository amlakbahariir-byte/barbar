
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
      return "خطا در ارتباط با سرویس نقشه";
    }
    const data = await response.json();

    if (data && data.address) {
      const { road, suburb, city, state, town, village } = data.address;
      // Prioritize more specific location types
      const cityOrTown = city || town || village;
      const addressParts = [road, suburb, cityOrTown, state].filter(Boolean);
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    // Fallback to display_name if detailed parts are not enough
    if (data && data.display_name) {
      return data.display_name.split(',').slice(0, 4).join(',');
    }

    return "آدرس یافت نشد. لطفا کمی جابجا شوید.";
    
  } catch (error) {
    console.error('Error fetching address from Nominatim:', error);
    return "خطا در دریافت آدرس";
  }
}
