function loggerMiddleware(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next(); // Chama o próximo middleware ou rota
  }
  
  module.exports = loggerMiddleware;