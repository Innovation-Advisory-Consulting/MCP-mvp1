"use client";

import * as React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser as useClerkUser } from "@clerk/clerk-react";
import { useAuth as useOidcAuth } from "react-oidc-context";

import { appConfig } from "@/config/app";
import { AuthStrategy } from "@/lib/auth-strategy";

import { useUser as useAzureAdUser } from "./azure-ad/auth-context";
import { useUser as useCustomUser } from "./custom/auth-context";
import { useUser as useSupabaseUser } from "./supabase/auth-context";

export function useUser() {
	// Auth0
	if (appConfig.authStrategy === AuthStrategy.AUTH0) {
		const { user, isLoading } = useAuth0();
		if (isLoading || !user) {
			return { name: "", email: "", avatar: null };
		}
		return {
			id: user.sub,
			name: user.name,
			email: user.email,
			avatar: user.picture,
		};
	}

	// Azure AD
	if (appConfig.authStrategy === AuthStrategy.AZURE_AD) {
		return useAzureAdUser();
	}

	// Clerk
	if (appConfig.authStrategy === AuthStrategy.CLERK) {
		const { user, isLoaded } = useClerkUser();
		if (!isLoaded || !user) {
			return { name: "", email: "", avatar: null };
		}
		return {
			id: user.id,
			name: user.fullName || user.username,
			email: user.primaryEmailAddress?.emailAddress,
			avatar: user.imageUrl,
		};
	}

	// Cognito (OIDC)
	if (appConfig.authStrategy === AuthStrategy.COGNITO) {
		const auth = useOidcAuth();
		if (!auth.user) {
			return { name: "", email: "", avatar: null };
		}
		return {
			id: auth.user.profile.sub,
			name: auth.user.profile.name || auth.user.profile.email,
			email: auth.user.profile.email,
			avatar: auth.user.profile.picture,
		};
	}

	// Custom Auth
	if (appConfig.authStrategy === AuthStrategy.CUSTOM) {
		return useCustomUser();
	}

	// Supabase
	if (appConfig.authStrategy === AuthStrategy.SUPABASE) {
		return useSupabaseUser();
	}

	// No auth strategy
	return { name: "", email: "", avatar: null };
}
