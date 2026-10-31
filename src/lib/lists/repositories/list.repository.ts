/** @format */

import {
  putLocalRecord,
  allRecords,
  type BasketRecord,
} from "@/db/local-store";

export const listRepository = {
  async create(record: BasketRecord) {
    await putLocalRecord("lists", record);
    return record;
  },

  async findAll() {
    return allRecords("lists");
  },
};
