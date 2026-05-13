"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { BoxesCheckoutCustomerInput } from "@/lib/checkout/schemas/boxes-checkout";
import { CheckoutFloatInput } from "@/components/checkout/boxes/CheckoutFloatInput";
import { CheckoutFloatSelect } from "@/components/checkout/boxes/CheckoutFloatSelect";
import { CheckoutTextarea } from "@/components/checkout/shared/CheckoutTextarea";
import { CHECKOUT_COUNTRIES } from "@/components/checkout/boxes/countries";

const FIELD_GRID = "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5";

/** Personal / company identity. */
export function CustomerInfoFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BoxesCheckoutCustomerInput>();

  return (
    <div className={FIELD_GRID}>
      <CheckoutFloatInput
        id="full_name"
        label="Full name"
        autoComplete="name"
        {...register("full_name")}
        error={errors.full_name?.message}
      />
      <CheckoutFloatInput
        id="company_name"
        label="Company name"
        autoComplete="organization"
        {...register("company_name")}
        error={errors.company_name?.message}
      />
      <CheckoutFloatInput
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <CheckoutFloatInput
        id="phone"
        label="Phone number"
        type="tel"
        autoComplete="tel"
        {...register("phone")}
        error={errors.phone?.message}
      />
    </div>
  );
}

/** Delivery address block. Country + postal stacked on small, address spans full width on md+. */
export function DeliveryAddressFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BoxesCheckoutCustomerInput>();

  return (
    <div className={FIELD_GRID}>
      <Controller
        control={control}
        name="country"
        render={({ field }) => (
          <CheckoutFloatSelect
            id="country"
            label="Country / region"
            {...field}
            error={errors.country?.message}
          >
            {CHECKOUT_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </CheckoutFloatSelect>
        )}
      />
      <CheckoutFloatInput
        id="postal_code"
        label="Postal code"
        autoComplete="postal-code"
        {...register("postal_code")}
        error={errors.postal_code?.message}
      />
      <div className="md:col-span-2">
        <CheckoutFloatInput
          id="delivery_address"
          label="Street address"
          autoComplete="street-address"
          {...register("delivery_address")}
          error={errors.delivery_address?.message}
        />
      </div>
      <CheckoutFloatInput
        id="city"
        label="City / suburb"
        autoComplete="address-level2"
        {...register("city")}
        error={errors.city?.message}
      />
      <CheckoutFloatInput
        id="state_region"
        label="State / region"
        autoComplete="address-level1"
        {...register("state_region")}
        error={errors.state_region?.message}
      />
    </div>
  );
}

/** Tax id + preferred contact + quantity confirmation. */
export function CheckoutCommercialFields({ moq }: { moq: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BoxesCheckoutCustomerInput>();

  return (
    <div className={FIELD_GRID}>
      <CheckoutFloatInput
        id="quantity_requirement"
        label="Quantity requirement (units)"
        type="number"
        min={moq}
        {...register("quantity_requirement", { valueAsNumber: true })}
        error={errors.quantity_requirement?.message}
      />
      <CheckoutFloatInput
        id="tax_id"
        label="GST / VAT / ABN (optional)"
        {...register("tax_id")}
        error={errors.tax_id?.message}
      />
      <div className="md:col-span-2">
        <Controller
          control={control}
          name="preferred_contact_method"
          render={({ field }) => (
            <CheckoutFloatSelect
              id="preferred_contact_method"
              label="Preferred contact"
              {...field}
              error={errors.preferred_contact_method?.message}
            >
              <option value="either">No preference</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </CheckoutFloatSelect>
          )}
        />
      </div>
    </div>
  );
}

/** Order notes textarea. */
export function OrderNotesField({
  id = "custom_notes",
  placeholder = "Finishing, print colours, delivery windows, references…",
}: {
  id?: string;
  placeholder?: string;
}) {
  const { register } = useFormContext<BoxesCheckoutCustomerInput>();
  return (
    <CheckoutTextarea
      id={id}
      label="Order notes & instructions"
      placeholder={placeholder}
      rows={4}
      hint="Anything our team should know — branded packaging, freight constraints, deadlines."
      {...register("custom_notes")}
    />
  );
}
