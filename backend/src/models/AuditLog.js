const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    actorRole: { type: String, enum: ["ADMIN", "BARBER"], required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId },
    action: String,
    entity: String,
    entityId: mongoose.Schema.Types.ObjectId,
    metadata: Object,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);