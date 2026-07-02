"use client";

import { Client, Account, Databases, Storage } from "appwrite";
import { appwriteConfig } from "./config";

let _client: Client | null = null;

export function getClient(): Client {
  if (_client) return _client;
  _client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);
  return _client;
}

export const account = () => new Account(getClient());
export const databases = () => new Databases(getClient());
export const storage = () => new Storage(getClient());
