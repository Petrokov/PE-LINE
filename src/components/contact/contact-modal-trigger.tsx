"use client";

import { Button } from "@/components/ui/button";
import { useContactModal } from "./contact-modal-context";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

export function ContactModalTrigger(props: ButtonProps) {
  const { open } = useContactModal();
  return <Button {...props} onClick={open} />;
}
