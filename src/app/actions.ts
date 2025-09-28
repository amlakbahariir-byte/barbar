
'use server';

import { generateAlertMessage } from '@/ai/flows/generate-alert-message-for-route-deviation';
import { config } from 'dotenv';

export async function handleDeviationAlert(driverId: string, shipmentId: string) {
  config();
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
  config();
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
      // Build the address with available parts, prioritizing more specific details.
      const addressParts = [road, suburb, city, town, village, state].filter(Boolean);
      
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    // Fallback to display_name if no detailed address parts are found
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
  config();
  const apiKey = process.env.MELIPAYAMAK_API_KEY;

  if (!apiKey) {
    const errorMessage = 'پیکربندی سرویس پیامک کامل نیست. کلید API وجود ندارد.';
    console.error(errorMessage);
    return { success: false, message: errorMessage };
  }
  
  console.log(`Sending OTP to ${phone} via send/otp API`);

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://console.melipayamak.com/api/send/otp/${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
      }),
    });

    const responseBodyText = await response.text();
    console.log('MeliPayamak API Response Status:', response.status);
    console.log('MeliPayamak API Response Body:', responseBodyText);

    if (response.ok) {
       try {
        const responseBody = JSON.parse(responseBodyText);
        // The OTP endpoint returns a `code` field which we should store and verify later.
        // It also might return a `status` field on error.
        if (responseBody.code) {
            console.log(`OTP for ${phone} is ${responseBody.code}. Store this for verification.`);
            return { success: true, message: 'کد تایید با موفقیت ارسال شد.' };
        } else {
             // If there's no 'code', there's likely an error status message.
             const errorMessage = responseBody.status || 'ارسال موفق بود اما کد دریافت نشد.';
             return { success: false, message: errorMessage };
        }
       } catch (e) {
          return { success: false, message: `پاسخ دریافتی از سرور پیامک معتبر نبود: ${responseBodyText}` };
       }
    } else {
       // Attempt to parse error from non-2xx response
       try {
         const errorBody = JSON.parse(responseBodyText);
         return { success: false, message: errorBody.status || `ارسال پیامک ناموفق بود: ${responseBodyText}` };
       } catch (e) {
         return { success: false, message: `ارسال پیامک ناموفق بود: ${responseBodyText}` };
       }
    }
  } catch (error) {
    console.error('Error sending OTP via MeliPayamak:', error);
    if (error instanceof Error) {
        return { success: false, message: `خطای شبکه: ${error.message}` };
    }
    return { success: false, message: 'یک خطای ناشناخته در ارسال پیامک رخ داد.' };
  }
}
