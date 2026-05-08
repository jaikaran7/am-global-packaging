export const quoteContent = {
  hero: {
    badge: "Request a Quote",
    heading: "Tell us about your",
    headingAccent: "paper requirements",
    description:
      "Fill in your details and paper specifications below. We'll respond with a custom quote within 24 hours.",
  },

  form: {
    sections: {
      contact: "Your Details",
      paper: "Paper Requirements",
      details: "Additional Details",
    },

    fields: {
      fullName: { label: "Full Name", placeholder: "Jane Smith", required: true },
      companyName: { label: "Company Name", placeholder: "Your Studio / Company", required: false },
      email: { label: "Email", placeholder: "jane@studio.com", required: true },
      phone: { label: "Phone", placeholder: "+61 4XX XXX XXX", required: false },
      productType: {
        label: "Product Type",
        placeholder: "Select paper type",
        required: true,
        options: [
          { value: "cotton", label: "Handmade Cotton Paper" },
          { value: "marble", label: "Marble Paper" },
          { value: "both", label: "Both Cotton & Marble" },
        ],
      },
      size: {
        label: "Size",
        placeholder: "Select size",
        required: true,
        options: [
          { value: "a4", label: "A4 (210 × 297 mm)" },
          { value: "a5", label: "A5 (148 × 210 mm)" },
          { value: "10x20", label: "10 × 20 cm (100 × 200 mm)" },
          { value: "22x30", label: "22 × 30 inch (558.8 × 762 mm)" },
          { value: "custom", label: "Custom Size" },
        ],
      },
      gsm: {
        label: "GSM",
        placeholder: "Select GSM",
        required: true,
        options: [
          { value: "100", label: "100 GSM — Light" },
          { value: "200", label: "200 GSM — Medium" },
          { value: "250", label: "250 GSM — Firm" },
          { value: "320", label: "320 GSM — Heavy" },
          { value: "350", label: "350 GSM — Extra Heavy" },
          { value: "mixed", label: "Mixed / Multiple GSM" },
        ],
      },
      quantity: {
        label: "Quantity (sheets)",
        placeholder: "e.g. 500",
        required: false,
      },
      requirements: {
        label: "Additional Requirements",
        placeholder:
          "Tell us about your project — intended use, custom dimensions, colour preferences for marble, any special finishing needs...",
        required: false,
      },
    },

    submit: "Submit Quote Request",
    submitting: "Submitting…",
    responseNote: "We respond to all enquiries within 24 hours during business days.",

    success: {
      heading: "Thank you for your quote request!",
      message: "Our team will review your paper requirements and contact you within 24 hours.",
      note: "For urgent enquiries, email enquiries@amglobalpackagingsolutions.com",
      button: "Submit Another Request",
    },

    errors: {
      required: "Please fill in required fields: Full Name, Email.",
      productTypeRequired: "Please select a product type.",
      sizeRequired: "Please select a size.",
      gsmRequired: "Please select a GSM option.",
      phone: "Please enter a valid Australian mobile number.",
      generic: "Something went wrong. Please try again.",
    },
  },
};
