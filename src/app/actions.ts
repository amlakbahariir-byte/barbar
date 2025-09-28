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
      const cityOrTown = city || town || village;
      const addressParts = [road, suburb, cityOrTown, state].filter(Boolean);
      
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    // Fallback to display_name only if detailed parts are not available at all.
    if (data && data.display_name) {
      // Split and take the most relevant parts of the display name
      return data.display_name.split(',').slice(0, 4).join(',');
    }

    return "آدرس یافت نشد. لطفا کمی جابجا شوید.";
    
  } catch (error) {
    console.error('Error fetching address from Nominatim:', error);
    return "خطا در دریافت آدرس";
  }
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('https://console.melipayamak.com/api/send/otp/96059e3c6273414c9e6c6985b652d615', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('MeliPayamak API Response:', result);
      // Assuming a successful response has a specific structure.
      // Adjust this based on the actual API response.
      if (result.success) {
         return { success: true, message: 'کد تایید با موفقیت ارسال شد.' };
      } else {
         return { success: false, message: result.error || 'خطا در ارسال کد.' };
      }
    } else {
       const errorText = await response.text();
       console.error('MeliPayamak API Error:', errorText);
       return { success: false, message: `سرور پیامک با خطا مواجه شد: ${response.status}` };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, message: 'یک خطای شبکه رخ داد. لطفا دوباره تلاش کنید.' };
  }
}
