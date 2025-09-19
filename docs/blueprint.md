# **App Name**: باربر ایرانی (Barbar Irani - Iranian Carrier)

## Core Features:

- Shipment Request (Shipper): Allow shippers to create shipment requests with details: origin, destination, weight, volume, preferred date (using Jalali calendar), and description.
- Request View (Driver): Drivers can view nearby shipment requests based on their current location and vehicle type. Displayed using Neshan/OpenStreetMap maps, if user location is available. If user location is not available, instead the requests are listed using the names of the origin and destination cities. Sorts requests by distance.
- Authentication: Secure user authentication using phone number verification with one-time password (OTP).
- Real-time Location Sharing: Drivers share their real-time location via websockets while en route for tracking by shippers. The system will check user location to prevent spoofing (the driver must be on the route they have accepted). The system will also use a tool to generate an alert message if a driver deviates significantly from their route; the alert message will propose some likely explanations (such as heavy traffic) and invite the user to either confirm, deny, or augment it with additional factors (such as mechanical breakdown)
- Bidding System: Drivers can bid on shipment requests. Shippers can view bids and accept one.
- Payment Gateway Integration: Integration with Iranian payment gateways (e.g., ZarinPal, Pay.ir) for secure online payments.
- Push Notifications: Support for push notifications via Iranian-friendly services for shipment updates and alerts.

## Style Guidelines:

- Primary color: Deep Saffron (#FF9933) to evoke trust and reliability, reflecting the traditional spice routes.
- Background color: Pale Sand (#F4EAD5), offering a neutral and warm backdrop.
- Accent color: Turquoise (#40E0D0) as an accent to suggest forward movement, in a style avoiding visual cliches.
- Font: 'PT Sans', a modern sans-serif with some warmth, for both headlines and body text.
- Right-to-Left (RTL) layout to ensure a native Persian user experience. All text, icons, and interface elements aligned for RTL reading.
- Use clear, modern icons that are culturally relevant to Iran, ensuring they are easily understandable for Persian-speaking users.
- Subtle animations to acknowledge user interactions, providing feedback in a gentle and non-intrusive manner.