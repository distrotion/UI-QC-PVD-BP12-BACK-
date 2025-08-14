const express = require("express");
const router = express.Router();

router.use(require("./flow/001/sap"))
router.use(require("./flow/001/getmaster"))
router.use(require("./flow/001/upqcdata"))
router.use(require("./flow/001/1-APPPVD"))
router.use(require("./flow/001/2-GASHMVPVD001"))
router.use(require("./flow/001/3-GASHMVPVD002"))
router.use(require("./flow/001/4-GASHMVPVD003"))
router.use(require("./flow/001/5-SPLINESIZE001"))
router.use(require("./flow/001/6-PVDMCS001"))
router.use(require("./flow/001/7-CTCXTM001"))
router.use(require("./flow/001/8-PVDSCT001"))
router.use(require("./flow/001/9-CALO001"))
router.use(require("./flow/001/10-BLOCKGAUGE"))
router.use(require("./flow/001/11-MAXMIN"))
router.use(require("./flow/001/INSFINISH"))
router.use(require("./flow/001/cleardata"))
router.use(require("./flow/001/GRAPHMASTER"))
router.use(require("./flow/001/reportlist"))
router.use(require("./flow/001/TOBEREPORT"))
//reportlist
//INSFINISH
// router.use(require("./flow/004/flow004"))TOBEREPORT
// router.use(require("./flow/005/flow005"))
router.use(require("./flow/testflow/testflow"))

module.exports = router;

