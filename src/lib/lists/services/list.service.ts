/** @format */

import { listRepository } from "../repositories/list.repository";

export const listService = {
  async create(input: { name: string; description?: string }) {
    const now = new Date().toISOString();

    const record = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      description: input.description ?? "",
      createdAt: now,
      updatedAt: now,
      syncStatus: "pending" as const,
    };

    if (!record.name) {
      throw new Error("List name is required.");
    }

    return listRepository.create(record);
  },

  async getAll() {
    return listRepository.findAll();
  },
};
