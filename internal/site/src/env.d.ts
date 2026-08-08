/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    Session?: {
      Username: string;
      IsAdmin: boolean;
      ExpiresAt: number;
    };
  }
}
