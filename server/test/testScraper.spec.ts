import { testFuncs } from "../src/scraper/wiki";
import { assert, expect } from "chai";
import { describe } from "mocha";

describe("stripRelProto", () => {
  it("should return unchanged strings when arg doesn't have a relative protocol", () => {
    const result = testFuncs.stripRelProto("testurl.com");
    assert.equal(result, "testurl.com");
  });
});
