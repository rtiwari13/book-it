"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const experience_service_1 = require("../services/experience.service");
const router = (0, express_1.Router)();
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const experience = await (0, experience_service_1.getExperienceWithSlots)(id);
        res.json(experience);
    }
    catch (error) {
        res.status(404).json({ error: 'Experience not found' });
    }
});
exports.default = router;
//# sourceMappingURL=experience.routes.js.map