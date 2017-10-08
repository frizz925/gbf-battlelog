import {isUndefined, isString} from "lodash";

export default function traverse(obj, keys, value) {
  var parent, lastKey;
  var result = obj;

  keys = isString(keys) ? keys.split(".") : keys;
  while (keys.length > 0 && result) {
    parent = result;
    lastKey = keys.shift();
    if (parent.hasOwnProperty(lastKey)) {
      result = parent[lastKey];
    } else {
      if (!isUndefined(value)) {
        result = parent[lastKey] = {};
      } else {
        result = null;
      }
    }
  }

  if (!isUndefined(value)) {
    result = parent[lastKey] = value;
  }
  return result;
}
