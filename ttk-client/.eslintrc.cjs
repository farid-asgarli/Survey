module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["react-app"],
  rules: {
    "react-hooks/exhaustive-deps": 0,
    "import/no-anonymous-default-export": 0,
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
    },
  ],
};
