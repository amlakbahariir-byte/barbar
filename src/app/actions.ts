
'use server';

import { generateAlertMessage } from '@/ai/flows/generate-alert-message-for-route-deviation';
import { config } from 'dotenv';

config();

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
      const addressParts = [road, suburb, city || town || village, state].filter(Boolean);
      
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    // Fallback to display_name only if detailed parts are not available at all.
    if (data && data.display_name) {
      // Split and take the most relevant parts of the display name
      return data.display_name.split(',').slice(0, 4).join(',');
    }

    return "آدرس یافت نشد.";
    
  } catch (error) {
    console.error('Error fetching address from Nominatim:', error);
    return "خطا در دریافت آدرس";
  }
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = process.env.MELIPAYAMAK_API_KEY;
    if (!apiKey) {
      throw new Error('MeliPayamak API key is not configured.');
    }
    
    console.log(`Sending OTP to ${phone}...`);
    const response = await fetch(`https://console.melipayamak.com/api/send/otp/${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
      }),
    });

    const responseBody = await response.text();
    console.log('MeliPayamak API Response Status:', response.status);
    console.log('MeliPayamak API Response Body:', responseBody);

    if (response.ok) {
      // Assuming any 2xx response is a success for OTP sending request.
      // The actual delivery status might be available through webhooks or another API.
      return { success: true, message: 'کد تایید با موفقیت ارسال شد.' };
    } else {
       // Try to parse the error message if the response is JSON
       try {
         const errorResult = JSON.parse(responseBody);
         return { success: false, message: errorResult.message || `خطا: ${response.status}` };
       } catch (e) {
         // If response is not JSON, return the raw text
         return { success: false, message: responseBody || `سرور پیامک با خطا مواجه شد: ${response.status}` };
       }
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'یک خطای شبکه رخ داد. لطفا دوباره تلاش کنید.' };
  }
}
