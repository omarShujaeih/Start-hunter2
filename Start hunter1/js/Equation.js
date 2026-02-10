"use strict";

const Equation = {
  level: 1, 

  generate() {
    return this.level === 1 ? this.addSub() : this.mulDiv();
  },

  addSub() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;

    if (Math.random() < 0.5) {
      // ? + b = c
      const answer = a;
      const c = a + b;
      return { text: `? + ${b} = ${c}`, answer };
    } else {
      // a - ? = c  (ensure non-negative)
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      const answer = small;
      const c = big - small;
      return { text: `${big} - ? = ${c}`, answer };
    }
  },

  mulDiv() {
    const a = Math.floor(Math.random() * 5) + 2; 
    const b = Math.floor(Math.random() * 5) + 2; 

    if (Math.random() < 0.5) {
      const answer = a;
      const c = a * b;
      return { text: `? × ${b} = ${c}`, answer };
    } else {
      const answer = a;
      const c = a * b;
      return { text: `${c} ÷ ? = ${b}`, answer };
    }
  }
};
