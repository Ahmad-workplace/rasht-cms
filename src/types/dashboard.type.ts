// types/api.ts

import { Attachment } from "./api";

export interface MainAppAboutUs2 {
  id: string;
  attachment: Attachment[];
  translations: Translation1;
}

interface Translation1 {
  id: string;
  title: string;
  description: string;
  language_code: string;
}

/**
 * MainAppAboutUs represents the response structure for the "About Us" page.
 */
export interface MainAppAboutUs {
  title: string;
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * AboutUs represents the structure for updating or retrieving "About Us" data.
 */
export interface AboutUs {
  id: string; // UUID
  title: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Translation2 {
  title: string;
  description: string;
  language_code: string;
}

export interface AboutUsPut {
  translations: Translation2[];
  attachment: string[]; // Array of UUID strings
}

/**
 * ContactUs represents the structure for updating or retrieving "Contact Us" data.
 */
export interface ContactUs {
  number: string;
  social_media: string | null;
  website: string;
}

/**
 * Device represents the structure for a device in the system.
 */
export interface Device {
  id: string; // UUID
  name: string;
  type: string; // e.g., "sensor", "actuator"
  status: "active" | "inactive" | "maintenance";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * PartialDevice represents a subset of Device fields for partial updates.
 */
export type PartialDevice = Partial<Device>;
