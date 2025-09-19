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
