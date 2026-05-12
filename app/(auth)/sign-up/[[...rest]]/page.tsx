"use client";
import { SignUp } from "@clerk/nextjs";
import "/app/css/Clerk.css"

export default function SignUpPage() {
  return (
    <div>
      <div className="sign-in-container">
        <div className="left-container"></div>
        <SignUp
          appearance={{
            layout: {
              unsafe_disableDevelopmentModeWarnings: true,
              socialButtonsPlacement: "bottom",
            },
          }}
        />
      </div>
    </div>
  );
} 