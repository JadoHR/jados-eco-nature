"use client";

import { startTransition, type FormEvent } from "react";

/**
 * React 19 resets uncontrolled form fields after a form `action` completes, which would
 * wipe what the admin typed when validation fails. Submitting through onSubmit keeps values.
 */
export function keepValuesSubmit(action: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
}
