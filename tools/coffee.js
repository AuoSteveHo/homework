import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";
import { searchCoffee } from "../lib/qdrant.js";

async function search({ query, limit = 5 }) {
  return await searchCoffee(query, limit);
}

export const coffeeTool = defineTool({
  name: "search_coffee",
  description:
    "在 Coffee資料庫中以語意搜尋相關咖啡，可用於找成分、風味等",
  fn: search,
  parameters: z.object({
    query: z.string().describe("查詢內容，可以是成分、風味、類型或關鍵字"),
    limit: z.number().default(5).describe("回傳筆數上限，預設 5"),
  }),
});