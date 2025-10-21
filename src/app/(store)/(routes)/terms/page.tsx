const TermsAndConditions = () => {
  return (
    <div className="p-6 bg-muted-foreground/5 rounded-md">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-semibold mb-4">Terms and Conditions</h1>

        <p className="mb-4">
          Welcome to our online store. These Terms and Conditions govern your use of our
          website and all purchases made for showcases, collectibles, and other Hot Wheels
          accessories (“Products”). By accessing or making a purchase through this site,
          you agree to be bound by these terms.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. General Terms</h2>
        <p className="mb-4">
          Our products are designed for collectors and display enthusiasts. By purchasing,
          you acknowledge that the items are primarily intended for decorative or
          collectible use and may include handcrafted or custom elements.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. Product Information</h2>
        <p className="mb-4">
          We make every effort to display product details accurately, including colors,
          dimensions, and images. Minor variations may occur due to screen settings or
          manual craftsmanship. Such differences do not qualify for refund or replacement.
        </p>

        <h2 className="text-xl font-semibold mb-2">3. Pricing and Payments</h2>
        <p className="mb-4">
          All prices listed on our website are in Indian Rupees (₹) and inclusive of
          applicable taxes unless stated otherwise. Payments are processed securely through
          verified third-party payment gateways. Your order will only be confirmed after
          successful payment completion.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. Order Confirmation</h2>
        <p className="mb-4">
          Upon successful payment, you will receive an order confirmation email. This
          confirmation serves as acknowledgment that your order has been received and is
          being processed. Please verify all order details carefully before payment.
        </p>

        <h2 className="text-xl font-semibold mb-2">5. Address Change Policy</h2>
        <p className="mb-4">
          <strong>Important:</strong> Once an order has been confirmed and payment has been
          successfully processed, <u>address change requests will not be accepted</u>.
          Please double-check your shipping address before completing the payment.
        </p>

        <h2 className="text-xl font-semibold mb-2">6. Order Cancellation Policy</h2>
        <p className="mb-4">
          <strong>Strict Policy:</strong> After successful payment and order confirmation,
          <u>cancellations will not be accepted</u>. Each order is custom-packed and
          prepared specifically for you, so once the process begins, it cannot be reversed.
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Shipping and Delivery</h2>
        <p className="mb-4">
          Orders are shipped through trusted courier partners. Delivery timelines vary
          based on your location. While we aim to deliver on time, delays caused by
          courier services or external factors (weather, strikes, etc.) are beyond our
          control.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Returns and Damaged Items</h2>
        <p className="mb-4">
          We do not accept returns or exchanges for reasons such as change of mind.
          However, if you receive a damaged or defective product, please contact us
          within 48 hours of delivery with images and your order details. After
          verification, we may offer a replacement at our discretion.
        </p>

        <h2 className="text-xl font-semibold mb-2">9. Intellectual Property</h2>
        <p className="mb-4">
          All content on this website — including text, images, product designs, and
          layouts — are the intellectual property of our brand. Unauthorized copying,
          redistribution, or commercial use is strictly prohibited.
        </p>

        <h2 className="text-xl font-semibold mb-2">10. Limitation of Liability</h2>
        <p className="mb-4">
          We are not responsible for any loss, delay, or damage resulting from courier
          handling, incorrect addresses provided by the customer, or unforeseen
          circumstances. Our total liability is limited to the total value of your
          purchase.
        </p>

        <h2 className="text-xl font-semibold mb-2">11. Updates to Terms and Conditions</h2>
        <p className="mb-4">
          We may update these Terms and Conditions periodically to reflect business or
          policy changes. The latest version will always be available on this page.
          Continued use of the website indicates your acceptance of the updated terms.
        </p>

        <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
        <p className="mb-4">
          For any questions or concerns related to these Terms and Conditions, please
          contact us at{" "}
          <a href="mailto:contact@yourstore.com" className="text-blue-600 hover:underline">
            contact@yourstore.com
          </a>.
        </p>

        <p className="text-sm text-muted-foreground">
          Last updated: October 2025
        </p>

        <p className="text-sm mt-4">
          Please also review our{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>{" "}
          to understand how we collect and use your information.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;