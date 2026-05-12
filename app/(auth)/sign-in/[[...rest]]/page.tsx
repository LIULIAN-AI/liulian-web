"use client";
import { SignIn } from "@clerk/nextjs";
import "/app/css/Clerk.css"

export default function SignInPage() {
  return <SignIn
    appearance={{
      layout: {
        unsafe_disableDevelopmentModeWarnings: true,
        socialButtonsPlacement: "bottom",
      },
      elements: {},
    }}
  />;
} 