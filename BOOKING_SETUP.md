# Booking System Setup

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Resend API Key for email notifications
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# Your email address where booking notifications will be sent
BOOKING_EMAIL=your-email@example.com
```

## Resend Setup

1. Go to [Resend.com](https://resend.com) and create an account
2. Verify your domain or use their sandbox domain for testing
3. Get your API key from the dashboard
4. Add the API key to your `.env.local` file

## Features

- ✅ Complete booking form with validation
- ✅ Date picker with minimum date validation
- ✅ Real-time price calculation
- ✅ Email notifications to business owner
- ✅ Confirmation email to customer
- ✅ Responsive design
- ✅ Form validation with error messages
- ✅ Loading states and success feedback

## Form Fields

- Full Name (required)
- Email Address (required)
- Phone Number (required)
- Pickup Date (required)
- Return Date (required)
- Pickup Location (required)
- Return Location (required)
- Driver Age (required)
- License Number (required)
- Special Requests (optional)

## Email Templates

The system sends two emails:
1. **Business Notification**: Detailed booking information sent to your email
2. **Customer Confirmation**: Confirmation message sent to the customer

Both emails are professionally designed with your branding.
