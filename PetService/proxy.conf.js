var defaultTarget = "http://localhost:3300";
module.exports = [
  {
    context: ["/api/**"],
    target: defaultTarget,
    secure: false,
  },
];
