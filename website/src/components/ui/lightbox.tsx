"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const VisuallyHidden = {
  Root: ({ children }: { children: React.ReactNode }) => (
    <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>{children}</span>
  ),
}

const ImageLightbox = DialogPrimitive.Root
const ImageLightboxTrigger = DialogPrimitive.Trigger
const ImageLightboxPortal = DialogPrimitive.Portal

const ImageLightboxOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fade-in-0",
      className
    )}
    {...props}
  />
))
ImageLightboxOverlay.displayName = DialogPrimitive.Overlay.displayName

const ImageLightboxContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ImageLightboxPortal>
    <ImageLightboxOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] animate-in max-w-[90vw] max-h-[90vh] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fade-in-0 data-[state=closed]:zoom-out-95 zoom-in-95",
        className
      )}
      {...props}
    >
      <VisuallyHidden.Root>
        <DialogPrimitive.Title>Image preview</DialogPrimitive.Title>
        <DialogPrimitive.Description>Image preview</DialogPrimitive.Description>
      </VisuallyHidden.Root>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 opacity-70 ring-offset-background transition-all duration-200 ease-out hover:opacity-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:pointer-events-none bg-black/50">
        <X className="h-4 w-4 text-white" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ImageLightboxPortal>
))
ImageLightboxContent.displayName = DialogPrimitive.Content.displayName

export { ImageLightbox, ImageLightboxTrigger, ImageLightboxContent }