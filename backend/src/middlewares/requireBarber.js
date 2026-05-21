module.exports = (req, res, next) => {
    if (!req.user || req.user.role !== "BARBER") {
        return res.status(403).json({ message: "Barber access only" });
    }
    next();
};