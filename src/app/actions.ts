
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
  try {
    const fetch = (await import('node-fetch')).default;
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
      return { success: true, message: 'کد تایید با موفقیت ارسال شد.' };
    } else {
       try {
         const errorResult = JSON.parse(responseBody);
         return { success: false, message: errorResult.message || `خطا: ${response.status}` };
       } catch (e) {
         return { success: false, message: responseBody || `سرور پیامک با خطا مواجه شد: ${response.status}` };
       }
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    if (error instanceof Error) {
        return { success: false, message: `خطای شبکه: ${error.message}` };
    }
    return { success: false, message: 'یک خطای شبکه رخ داد. لطفا دوباره تلاش کنید.' };
  }
}


export async function sendTestSms(): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.MELIPAYAMAK_API_KEY;
  const from = process.env.MELIPAYAMAK_SENDER_NUMBER;
  const to = '09125486083'; // Test number
  const text = 'پیامک آزمایشی از باربر ایرانی';

  if (!apiKey || !from) {
    return { success: false, message: 'پیکربندی سرویس پیامک کامل نیست.' };
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://console.melipayamak.com/api/send/simple/${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, text }),
    });

    const responseBodyText = await response.text();
    console.log('MeliPayamak Simple SMS API Response Text:', responseBodyText);
    
    if (response.ok) {
        try {
            const responseBody = JSON.parse(responseBodyText);
            if(responseBody.recId) {
                return { success: true, message: `پیامک آزمایشی با موفقیت ارسال شد. شناسه: ${responseBody.recId}` };
            } else {
                return { success: false, message: responseBody.status || 'ارسال موفق بود اما شناسه دریافت نشد.' };
            }
        } catch(e) {
            return { success: false, message: `پاسخ دریافتی از سرور معتبر نبود: ${responseBodyText}` };
        }
    } else {
       return { success: false, message: `ارسال پیامک آزمایشی ناموفق بود: ${responseBodyText}` };
    }
  } catch (error) {
    console.error('Error sending test SMS:', error);
     if (error instanceof Error) {
        return { success: false, message: `خطای شبکه: ${error.message}` };
    }
    return { success: false, message: 'خطای شبکه در ارسال پیامک آزمایشی.' };
  }
}
