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
        label: "Product",
        placeholder: "Select paper product",
        required: true,
        /** Legacy static options unused — catalogue loaded from `/api/papers/products`. */
        options: [] as { value: string; label: string }[],
      },
      size: {
        label: "Size",
        placeholder: "Select size",
        customPlaceholder: "Enter your desired size (e.g. dimensions or sheet format)",
        customOptionLabel: "Custom size…",
        required: true,
        options: [] as { value: string; label: string }[],
      },
      gsm: {
        label: "GSM",
        placeholder: "Select GSM",
        customPlaceholder: "Describe desired GSM or range (e.g. 180 GSM, 200–250 GSM)",
        customOptionLabel: "Custom GSM…",
        required: true,
        options: [] as { value: string; label: string }[],
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
      productTypeRequired: "Please select a paper product.",
      sizeRequired: "Please select or enter a size.",
      gsmRequired: "Please select or enter a GSM.",
      customSizeRequired: "Please enter your desired size.",
      customGsmRequired: "Please enter your desired GSM.",
      phone: "Please enter a valid Australian mobile number.",
      generic: "Something went wrong. Please try again.",
    },
  },
};
