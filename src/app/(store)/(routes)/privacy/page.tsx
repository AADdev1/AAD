const PrivacyPolicy = () => {
  return (
    <div className="p-6 bg-muted-foreground/5 rounded-md">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>

        <p className="mb-4">
          This Privacy Policy explains how we collect, use, and protect your personal
          information when you visit or make a purchase on our website related to
          showcases, collectibles, and other Hot Wheels accessories (“Products”).
          By using our site, you agree to the terms outlined below.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <p className="mb-4">
          We may collect the following types of information when you interact with our
          website or make a purchase:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Personal details such as your name, email address, phone number, and shipping/billing address.</li>
          <li>Payment information (securely processed through third-party payment gateways; we do not store card details).</li>
          <li>Information automatically collected through cookies, analytics tools, and browser settings (e.g., IP address, device type, and browsing behavior).</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
        <p className="mb-4">
          The information we collect helps us provide a smooth and personalized experience.
          We use it for:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Processing and delivering your orders efficiently.</li>
          <li>Providing customer support and order-related communication.</li>
          <li>Improving website performance, design, and user experience.</li>
          <li>Sending you order updates, new collection alerts, or promotional emails (only if you opt-in).</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">3. Cookies and Tracking</h2>
        <p className="mb-4">
          We use cookies to remember your preferences, improve loading performance, and
          understand visitor traffic patterns. You can disable cookies in your browser
          settings, but some features of the site may not function properly as a result.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. Data Protection and Security</h2>
        <p className="mb-4">
          We take your privacy seriously. All transactions are processed via secure SSL
          encryption, and we only work with trusted third-party payment processors.
          We never sell or share your personal information with unrelated third parties
          for marketing purposes.
        </p>

        <h2 className="text-xl font-semibold mb-2">5. Third-Party Services</h2>
        <p className="mb-4">
          Our website may contain links to external websites or use third-party tools
          (such as analytics or payment gateways). These services have their own privacy
          policies, and we are not responsible for their content or practices.
        </p>

        <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
        <p className="mb-4">
          You have the right to request access to, correction of, or deletion of your
          personal information. You can also opt-out of promotional communications at any time.
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Updates to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy periodically to reflect changes in our
          business or legal requirements. Any updates will be posted on this page
          with the revised date.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
        <p className="mb-4">
          If you have any questions, concerns, or requests related to this Privacy Policy,
          please contact us at{" "}
          <a href="mailto:contact@yourstore.com" className="text-blue-600 hover:underline">
            contact@yourstore.com
          </a>.
        </p>

        <p className="text-sm text-muted-foreground">
          Last updated: October 2025
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
