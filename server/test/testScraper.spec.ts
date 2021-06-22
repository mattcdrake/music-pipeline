import { testFuncs } from "../src/scraper/wiki";
import { assert } from "chai";
import { describe } from "mocha";

describe("stripRelProto", () => {
  it("should return unchanged strings when arg doesn't have a relative protocol", () => {
    const result = testFuncs.stripRelProto("testurl.com");
    assert.equal("testurl.com", result);
  });

  it("should return the same string when its length is less than 2", () => {
    const tc = "/";
    assert.equal("/", testFuncs.stripRelProto(tc));
  });

  it("should return the same string when its length is less than 2", () => {
    const tc = "";
    assert.equal("", testFuncs.stripRelProto(tc));
  });

  it("should remove relative protocol slashes from strings", () => {
    const tc = "//";
    assert.equal("", testFuncs.stripRelProto(tc));
  });

  it("should remove relative protocol slashes from strings", () => {
    const tc = "//wiki.org";
    assert.equal("wiki.org", testFuncs.stripRelProto(tc));
  });

  it("should only remove relative protocol slashes from the first two positions", () => {
    const tc = "test//wiki.org";
    assert.equal(tc, testFuncs.stripRelProto(tc));
  });
});
