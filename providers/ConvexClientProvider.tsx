"use client";
import React from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { AuthLoading, ConvexReactClient } from "convex/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import LoadingLogo from "@/components/shared/LoadingLogo";

type Props = {
  children: React.ReactNode;
};

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const ConvexClientProvider = ({ children }: Props) => {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthLoading>
          <LoadingLogo />
        </AuthLoading>
        <Authenticated>
          {/* <UserButton /> */}
          {children}
        </Authenticated>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};

export default ConvexClientProvider;
