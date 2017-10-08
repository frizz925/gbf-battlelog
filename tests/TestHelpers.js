import "babel-polyfill";
import traverse from "~/helpers/traverse";
import assert from "assert";

describe("Test helpers", function() {
  describe("Traverse", function() {
    const obj = {a: {b: {c: false}}};

    it("should return false", function() {
      assert(traverse(obj, "a.b.c") === false);
    });

    it("should set and return true", function() {
      assert(traverse(obj, "d.e.f", true) === true);
    });

    it("should be null", function() {
      assert(traverse(obj, "x.y.z") === null);
    });
  });
});
