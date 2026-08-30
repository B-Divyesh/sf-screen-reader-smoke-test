import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("release metadata", () => {
  it("@claim:mit-license ships the declared MIT license", async () => {
    const packageMetadata = JSON.parse(await readFile("package.json", "utf8")) as { license?: string };
    const license = await readFile("LICENSE", "utf8");
    expect(packageMetadata.license).toBe("MIT");
    expect(license).toContain("Permission is hereby granted, free of charge");
    expect(license).toContain("THE SOFTWARE IS PROVIDED \"AS IS\"");
  });
});
