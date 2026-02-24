import { AuthStrategy } from "@/lib/auth-strategy";
import { LogLevel } from "@/lib/logger";

export const appConfig = {
	name: "Mule CRM",
	description: "Government Solutions Platform - Empowering agencies with comprehensive citizen services, back-office management, and mobile field operations",
	direction: "ltr",
	language: "en",
	theme: "light",
	themeColor: "#090a0b",
	primaryColor: "chateauGreen",
	logLevel: import.meta.env.VITE_LOG_LEVEL || LogLevel.ALL,
	authStrategy: import.meta.env.VITE_AUTH_STRATEGY || AuthStrategy.NONE,
};
