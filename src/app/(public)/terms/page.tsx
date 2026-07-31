import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FFFCEB] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-serif text-slate-900 font-bold tracking-tight mb-8">
          Terms of Service
        </h1>
        <div className="prose prose-amber prose-lg text-slate-800 max-w-none">
          <p className="text-sm text-slate-500 mb-8">Last Updated: July 2026</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Joebrown Palace Hotel and Suites website and services, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Reservations and Bookings</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>All reservations are subject to availability and confirmation.</li>
            <li>Valid identification and payment method must be presented upon check-in.</li>
            <li>Check-in time is 2:00 PM and check-out time is 12:00 PM (Noon).</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Food and Beverage Orders</h2>
          <p>
            Orders placed through our online menu platform are subject to availability. Prices are subject to change without notice. We strive to accurately display the colors, features, specifications, and details of the products available on the site, however, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.
          </p>
          <p>
            Payments for food and beverage orders must be completed before the order is dispatched or served, unless alternative arrangements have been approved by management.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Cancellations and Refunds</h2>
          <p>
            Cancellation policies vary by the type of reservation. Please refer to your booking confirmation for specific cancellation details. Refunds, where applicable, will be processed to the original method of payment.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. User Conduct</h2>
          <p>
            Guests are expected to conduct themselves in a respectable manner and will not cause any nuisance or annoyance within the hotel premises. Management reserves the right to refuse service or require a guest to leave if they are causing a disturbance.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            Joebrown Palace Hotel and Suites shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the materials on this site or the performance of the products, even if Joebrown Palace Hotel and Suites has been advised of the possibility of such damages.
          </p>
        </div>
      </div>
    </div>
  );
}
