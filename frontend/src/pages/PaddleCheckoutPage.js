import React, { useEffect } from 'react';

export default function PaddleCheckoutPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      // Correct order: set environment first
      window.Paddle.Environment.set('production');


      window.Paddle.Initialize({
        token: 'live_dcf6d3e20a0df8006f9462d419f'  // Your Paddle Sandbox client token
      });

      const urlParams = new URLSearchParams(window.location.search);
      const txn = urlParams.get('_ptxn');

      if (txn) {
        window.Paddle.Checkout.open({
          transactionId: txn,
          settings: {
            successUrl: 'https://thehustlerbot.com/chat'  // Redirect to chat after successful payment
          }
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Secure Checkout</h1>
      <p>Please wait while we prepare your checkout...</p>
    </div>
  );
}