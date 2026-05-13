"use client";

import type { ReactNode } from "react";

type AddressFormProps = {
  children: ReactNode;
};

export default function AddressForm({ children }: Readonly<AddressFormProps>) {
  return <div className="grid md:grid-cols-2 gap-4 md:gap-5">{children}</div>;
}
