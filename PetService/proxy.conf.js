var defaultTarget = "http://localhost:3301";
module.exports = [
  {
    context: ["/api"],
    target: defaultTarget,
    secure: false,
  },
];
