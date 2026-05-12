import Link from 'next/link';
import {
    SignInButton,
    SignOutButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'
import { ClerkProvider } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Site branding */}
          <div className="flex-1">
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">

            {/* Desktop menu links */}
            <ul className="flex grow justify-center flex-wrap items-center">
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/"
                >
                  Customers
                </Link>
              </li>
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/"
                >
                  Changelog
                </Link>
              </li>
            </ul>

          </nav>

          
                <div>
                <SignedIn>

                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Create organization"
                      labelIcon={<img / >}
                      href="/create-organization"
                    />
                  </UserButton.MenuItems>
                </UserButton>
                </SignedIn>
                  <SignedOut>
                      <div className="flex items-center gap-4">
                          <Link
                              href="/sign-in"
                              className="font-medium text-sm text-slate-300 hover:text-white transition duration-150 ease-in-out"
                          >
                              登录
                          </Link>
                          <Link
                              href="/sign-up"
                              className="font-medium text-sm text-slate-300 hover:text-white transition duration-150 ease-in-out"
                          >
                              注册
                          </Link>
                      </div>
                  </SignedOut>
                </div>

        </div>
      </div>
    </header>
  )
}