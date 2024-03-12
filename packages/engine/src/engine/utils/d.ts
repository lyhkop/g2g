function Range(min: number, max: number) {
  return function (target: any, key: string) {
    let value = target[key];

    const getter = function () {
      return value;
    };

    const setter = function (newVal: number) {
      if (newVal < min) {
        value = min;
      } else if (newVal > max) {
        value = max;
      } else {
        value = newVal;
      }
    };

    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

export { Range };
