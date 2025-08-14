const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mongodbINS = require('../../function/mongodbINS');
var mssql = require('../../function/mssql');
var request = require('request');
const axios = require("../../function/axios");

//----------------- date

const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
let day = d;

//----------------- SETUP

let NAME_INS = 'BLOCKGAUGE'

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';
let UNIT = 'UNIT';

//----------------- dynamic

let finddbbuffer = [{}];

let BLOCKGAUGEdb = {
  "INS": NAME_INS,
  "PO": "",
  "CP": "",
  "MATCP": "",
  "QTY": "",
  "PROCESS": "",
  "CUSLOT": "",
  "TPKLOT": "",
  "FG": "",
  "CUSTOMER": "",
  "PART": "",
  "PARTNAME": "",
  "MATERIAL": "",
  //---new
  "QUANTITY": '',
  // "PROCESS": '',
  "CUSLOTNO": '',
  "FG_CHARG": '',
  "PARTNAME_PO": '',
  "PART_PO": '',
  "CUSTNAME": '',
  //-------
  "ItemPick": [],
  "ItemPickcode": [],
  "POINTs": "",
  "PCS": "",
  "PCSleft": "",
  "UNIT": "",
  "INTERSEC": "",
  "RESULTFORMAT": "",
  "GRAPHTYPE": "",
  "GAP": "",
  //---------
  "preview": [],
  "confirmdata": [],
  "ITEMleftUNIT": [],
  "ITEMleftVALUE": [],
  //
  "MeasurmentFOR": "FINAL",
  "inspectionItem": "", //ITEMpice
  "inspectionItemNAME": "",
  "tool": NAME_INS,
  "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
  "dateupdatevalue": day,
  //
  "PIC": "",
  //----------------------
  "USER": "",
  "USERID": "",
}

router.get('/CHECK-BLOCKGAUGE', async (req, res) => {

  return res.json(BLOCKGAUGEdb['PO']);
});


router.post('/BLOCKGAUGEdb', async (req, res) => {
  //-------------------------------------
  // console.log('--BLOCKGAUGEdb--');
  // console.log(req.body);
  //-------------------------------------
  let finddb = [{}];
  try {

    finddb = BLOCKGAUGEdb;
    finddbbuffer = finddb;
  }
  catch (err) {
    finddb = finddbbuffer;
  }
  //-------------------------------------
  return res.json(finddb);
});

router.post('/GETINtoBLOCKGAUGE', async (req, res) => {
  //-------------------------------------
  console.log('--GETINtoBLOCKGAUGE--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  check = BLOCKGAUGEdb;
  if (input['PO'] !== undefined && input['CP'] !== undefined && check['PO'] === '') {
    // let dbsap = await mssql.qurey(`select * FROM [SAPData_HES_ISN].[dbo].[tblSAPDetail] where [PO] = ${input['PO']}`);
    let findPO = await mongodb.findSAP('mongodb://172.23.10.39:12016', "ORDER", "ORDER", {});

    let cuslot = '';

    if (findPO[0][`DATA`] != undefined && findPO[0][`DATA`].length > 0) {
      let dbsap = ''
      for (i = 0; i < findPO[0][`DATA`].length; i++) {
        if (findPO[0][`DATA`][i][`PO`] === input['PO']) {
          dbsap = findPO[0][`DATA`][i];
          // break;
          cuslot = cuslot + findPO[0][`DATA`][i][`CUSLOTNO`] + ','
        }
      }


      if (dbsap !== '') {

        let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
        let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
        let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

        let ItemPickout = [];
        let ItemPickcodeout = [];

        for (i = 0; i < findcp[0]['FINAL'].length; i++) {
          for (j = 0; j < masterITEMs.length; j++) {
            if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
              ItemPickout.push(masterITEMs[j]['ITEMs']);
              ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
            }
          }
        }

        let ItemPickoutP2 = []
        let ItemPickcodeoutP2 = [];
        for (i = 0; i < ItemPickcodeout.length; i++) {
          for (j = 0; j < MACHINEmaster.length; j++) {
            if (ItemPickcodeout[i]['METHOD'] === MACHINEmaster[j]['masterID']) {
              if (MACHINEmaster[j]['MACHINE'].includes(NAME_INS)) {
                ItemPickoutP2.push(ItemPickout[i]);
                ItemPickcodeoutP2.push(ItemPickcodeout[i]);
              }
            }
          }
        }
        var picS = "";
        // console.log(findcp[0]['Pimg'])
        if (findcp.length > 0) {
          if (findcp[0]['Pimg'] !== undefined) {
            picS = `${findcp[0]['Pimg'][`P1`]}`
          }

        }

        BLOCKGAUGEdb = {
          "INS": NAME_INS,
          "PO": input['PO'] || '',
          "CP": input['CP'] || '',
          "MATCP": input['CP'] || '',
          "QTY": dbsap['QUANTITY'] || '',
          "PROCESS": dbsap['PROCESS'] || '',
          // "CUSLOT": dbsap['CUSLOTNO'] || '',
          "CUSLOT": cuslot,
          "TPKLOT": dbsap['FG_CHARG'] || '',
          "FG": dbsap['FG'] || '',
          "CUSTOMER": dbsap['CUSTOMER'] || '',
          "PART": findcp[0]['PART'] || '',
          "PART_s": dbsap['PART'] || '',
          "PARTNAME_s": dbsap['PARTNAME'] || '',
          "PARTNAME": findcp[0]['PARTNAME'] || '',
          "MATERIAL": dbsap['MATERIAL'] || '',
          "MATERIAL_s": dbsap['MATERIAL'] || '',
          //---new
          "QUANTITY": dbsap['QUANTITY'] || '',
          // "PROCESS":dbsap ['PROCESS'] || '',
          // "CUSLOTNO": dbsap['CUSLOTNO'] || '',
          //CUST_FULLNM
          //findcp[0]['CUST_FULLNM'] || '',
          "CUSLOTNO": cuslot,
          "FG_CHARG": dbsap['FG_CHARG'] || '',
          "PARTNAME_PO": dbsap['PARTNAME_PO'] || '',
          "PART_PO": dbsap['PART_PO'] || '',
          "CUSTNAME_s": dbsap['CUST_FULLNM'] || '',
          "CUSTNAME": dbsap['CUST_FULLNM'] || '',
          "UNITSAP": dbsap['UNIT'] || '',
          //----------------------
          "ItemPick": ItemPickoutP2, //---->
          "ItemPickcode": ItemPickcodeoutP2, //---->
          "POINTs": "",
          "PCS": "",
          "PCSleft": "",
          "UNIT": "",
          "INTERSEC": "",
          "RESULTFORMAT": "",
          "GRAPHTYPE": "",
          "GAP": "",
          //----------------------
          "preview": [],
          "confirmdata": [],
          "ITEMleftUNIT": [],
          "ITEMleftVALUE": [],
          //
          "MeasurmentFOR": "FINAL",
          "inspectionItem": "", //ITEMpice
          "inspectionItemNAME": "",
          "tool": NAME_INS,
          "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
          "dateupdatevalue": day,
          //
          "PIC": picS,
          //----------------------
          "USER": input['USER'],
          "USERID": input['USERID'],
        }

        output = 'OK';


      } else {
        output = 'NOK';
      }

    } else {
      output = 'NOK';
    }

  } else {
    output = 'NOK';
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/BLOCKGAUGE-geteachITEM', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGE-geteachITEM--');
  console.log(req.body);
  let inputB = req.body;

  let ITEMSS = '';
  let output = 'NOK';

  for (i = 0; i < BLOCKGAUGEdb['ItemPickcode'].length; i++) {
    if (BLOCKGAUGEdb['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
      ITEMSS = BLOCKGAUGEdb['ItemPickcode'][i]['key'];
    }
  }


  if (ITEMSS !== '') {

    //-------------------------------------
    BLOCKGAUGEdb['inspectionItem'] = ITEMSS;
    BLOCKGAUGEdb['inspectionItemNAME'] = inputB['ITEMs'];
    let input = { 'PO': BLOCKGAUGEdb["PO"], 'CP': BLOCKGAUGEdb["CP"], 'ITEMs': BLOCKGAUGEdb['inspectionItem'] };
    //-------------------------------------
    if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
      let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
      let UNITdata = await mongodb.find(master_FN, UNIT, {});
      let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": BLOCKGAUGEdb['inspectionItem'] });

      for (i = 0; i < findcp[0]['FINAL'].length; i++) {
        if (findcp[0]['FINAL'][i]['ITEMs'] === input['ITEMs']) {

          // output = [{
          //   "RESULTFORMAT": findcp[0]['FINAL'][i]['RESULTFORMAT'],
          //   "GRAPHTYPE": findcp[0]['FINAL'][i]['GRAPHTYPE'],
          //   "INTERSECTION": findcp[0]['FINAL'][i]['INTERSECTION'],
          //   "DOCUMENT": findcp[0]['FINAL'][i]['DOCUMENT'],
          //   "SPECIFICATION": findcp[0]['FINAL'][i]['SPECIFICATION'],
          //   "POINTPCS": findcp[0]['FINAL'][i]['POINTPCS'],
          //   "POINT": findcp[0]['FINAL'][i]['POINT'],
          //   "PCS": findcp[0]['FINAL'][i]['PCS'],
          //   "FREQUENCY": findcp[0]['FINAL'][i]['FREQUENCY'],
          //   "MODE": findcp[0]['FINAL'][i]['MODE'],
          //   "REMARK": findcp[0]['FINAL'][i]['REMARK'],
          //   "LOAD": findcp[0]['FINAL'][i]['LOAD'],
          //   "CONVERSE": findcp[0]['FINAL'][i]['CONVERSE'],
          // }]

          if (masterITEMs.length > 0) {
            //
            BLOCKGAUGEdb["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
            BLOCKGAUGEdb["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
          }

          for (j = 0; j < UNITdata.length; j++) {
            if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
              BLOCKGAUGEdb["UNIT"] = UNITdata[j]['UNIT'];
            }
          }

          BLOCKGAUGEdb["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
          BLOCKGAUGEdb["PCS"] = findcp[0]['FINAL'][i]['PCS'];


          BLOCKGAUGEdb["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];



          BLOCKGAUGEdb["INTERSEC"] = "";
          output = 'OK';
          let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
          if (findpo.length > 0) {
            request.post(
              'http://127.0.0.1:17270/BLOCKGAUGE-feedback',
              { json: { "PO": BLOCKGAUGEdb['PO'], "ITEMs": BLOCKGAUGEdb['inspectionItem'] } },
              function (error, response, body2) {
                if (!error && response.statusCode == 200) {
                  // console.log(body2);
                  if (body2 === 'OK') {
                    // output = 'OK';
                  }
                }
              }
            );
          }
          break;
        }
      }
    }

  } else {
    BLOCKGAUGEdb["POINTs"] = '',
      BLOCKGAUGEdb["PCS"] = '',
      BLOCKGAUGEdb["PCSleft"] = '',
      BLOCKGAUGEdb["UNIT"] = "",
      BLOCKGAUGEdb["INTERSEC"] = "",
      output = 'NOK';
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/BLOCKGAUGE-preview', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGE-preview--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  if (input.length > 0) {
    if (input[0]['V1'] !== undefined) {
      //-------------------------------------
      try {
        BLOCKGAUGEdb['preview'] = input;
        output = 'OK';
      }
      catch (err) {
        output = 'NOK';
      }
      //-------------------------------------
    } else {
      output = 'NOK';
    }
  } else {
    BLOCKGAUGEdb['preview'] = [];
    output = 'clear';
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/BLOCKGAUGE-confirmdata', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGE-confirmdata--');
  console.log(req.body);
  // let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {
    let datapush = BLOCKGAUGEdb['preview'][0]

    if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Graph') {

    } else if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Number') {

      let pushdata = BLOCKGAUGEdb['preview'][0]

      pushdata['V5'] = BLOCKGAUGEdb['confirmdata'].length + 1
      pushdata['V1'] = `${BLOCKGAUGEdb['confirmdata'].length + 1}:${pushdata['V1']}`

      BLOCKGAUGEdb['confirmdata'].push(pushdata);
      BLOCKGAUGEdb['preview'] = [];
      output = 'OK';
    }
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});



router.post('/BLOCKGAUGE-feedback', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGE-feedback--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  //-------------------------------------
  if (input["PO"] !== undefined && input["ITEMs"] !== undefined) {
    let feedback = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
    if (feedback.length > 0 && feedback[0]['FINAL'] != undefined && feedback[0]['FINAL'][NAME_INS] != undefined && feedback[0]['FINAL'][NAME_INS][input["ITEMs"]] != undefined) {
      // console.log(Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]));
      let oblist = Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]);
      let ob = feedback[0]['FINAL'][NAME_INS][input["ITEMs"]];


      let LISTbuffer = [];
      let ITEMleftVALUEout = [];

      if (ob[0] !== undefined) {
        for (i = 0; i < oblist.length; i++) {
          LISTbuffer.push(...ob[oblist[i]])
        }
      } else {
        for (i = 0; i < oblist.length; i++) {
          LISTbuffer.push(ob[oblist[i]])
        }
      }


      BLOCKGAUGEdb["PCSleft"] = `${parseInt(BLOCKGAUGEdb["PCS"]) - oblist.length}`;
      if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Number') {
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] === 'Mean') {
            ITEMleftVALUEout.push({ "V1": 'Mean', "V2": `${LISTbuffer[i]['PO3']}` })
          } else {
            ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO2']}`, "V2": `${LISTbuffer[i]['PO3']}` })
          }

        }

        BLOCKGAUGEdb["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        BLOCKGAUGEdb["ITEMleftVALUE"] = ITEMleftVALUEout;

      } else if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Text') { //add

        for (i = 0; i < LISTbuffer.length; i++) {
          ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO1']}`, "V2": `${LISTbuffer[i]['PO2']}` })
        }

        BLOCKGAUGEdb["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        BLOCKGAUGEdb["ITEMleftVALUE"] = ITEMleftVALUEout;

      }
      // output = 'OK';
      if ((parseInt(BLOCKGAUGEdb["PCS"]) - oblist.length) == 0) {
        //CHECKlist
        for (i = 0; i < feedback[0]['CHECKlist'].length; i++) {
          if (input["ITEMs"] === feedback[0]['CHECKlist'][i]['key']) {
            feedback[0]['CHECKlist'][i]['FINISH'] = 'OK';
            // console.log(feedback[0]['CHECKlist']);
            let feedbackupdate = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'CHECKlist': feedback[0]['CHECKlist'] } });
            break;
          }
        }
        //input["ITEMs"] 
        let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": input["ITEMs"] });


        if (feedback[0]['FINAL_ANS'] === undefined) {
          feedback[0]['FINAL_ANS'] = {}
        }
        if (masterITEMs.length > 0) {
          let anslist = [];
          let anslist_con = [];


          if (masterITEMs[0]['RESULTFORMAT'] === 'Number') {
            for (i = 0; i < LISTbuffer.length; i++) {
              if (LISTbuffer[i]['PO1'] === 'Mean') {
                anslist.push(LISTbuffer[i]['PO3'])
                anslist_con.push(LISTbuffer[i]['PO5'])
              }
            }

            let sum1 = anslist.reduce((a, b) => a + b, 0);
            let avg1 = (sum1 / anslist.length) || 0;
            let sum2 = anslist_con.reduce((a, b) => a + b, 0);
            let avg2 = (sum2 / anslist_con.length) || 0;

            feedback[0]['FINAL_ANS'][input["ITEMs"]] = avg1;
            feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_c`] = avg2;

            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Text') {

            feedback[0]['FINAL_ANS'][input["ITEMs"]] = LISTbuffer[0]['PO2'];
            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Graph') {

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Picture') {

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'OCR') {

          } else {

          }
        }

      }
    } else {
      BLOCKGAUGEdb["ITEMleftUNIT"] = '';
      BLOCKGAUGEdb["ITEMleftVALUE"] = '';
    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/BLOCKGAUGE-SETZERO', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGEfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    BLOCKGAUGEdb = {
      "INS": NAME_INS,
      "PO": "",
      "CP": "",
      "MATCP": "",
      "QTY": "",
      "PROCESS": "",
      "CUSLOT": "",
      "TPKLOT": "",
      "FG": "",
      "CUSTOMER": "",
      "POINTs": "",
      "PART": "",
      "PARTNAME": "",
      "MATERIAL": "",
      //---new
      "QUANTITY": '',
      // "PROCESS": '',
      "CUSLOTNO": '',
      "FG_CHARG": '',
      "PARTNAME_PO": '',
      "PART_PO": '',
      "CUSTNAME": '',
      //-----
      "ItemPick": [],
      "ItemPickcode": [],
      "PCS": "",
      "PCSleft": "",
      "UNIT": "",
      "INTERSEC": "",
      "RESULTFORMAT": "",
      "GRAPHTYPE": "",
      "GAP": "",
      //---------
      "preview": [],
      "confirmdata": [],
      "ITEMleftUNIT": [],
      "ITEMleftVALUE": [],
      //
      "MeasurmentFOR": "FINAL",
      "inspectionItem": "", //ITEMpice
      "inspectionItemNAME": "",
      "tool": NAME_INS,
      "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
      "dateupdatevalue": day,
      //
      "PIC": "",
      //----------------------
      "USER": "",
      "USERID": "",
    }
    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/BLOCKGAUGE-CLEAR', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGEfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    BLOCKGAUGEdb['preview'] = [];
    BLOCKGAUGEdb['confirmdata'] = [];

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/BLOCKGAUGE-RESETVALUE', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGEfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    let all = BLOCKGAUGEdb['confirmdata'].length
    if (all > 0) {
      BLOCKGAUGEdb['confirmdata'].pop();
    }

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

//"value":[],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN


router.post('/BLOCKGAUGE-FINISH', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGE-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Number' || BLOCKGAUGEdb['RESULTFORMAT'] === 'Text') {

    BLOCKGAUGEdb["value"] = [];
    for (i = 0; i < BLOCKGAUGEdb['confirmdata'].length; i++) {
      BLOCKGAUGEdb["value"].push({
        "PO1": BLOCKGAUGEdb["inspectionItemNAME"],
        "PO2": BLOCKGAUGEdb['confirmdata'][i]['V1'],
        "PO3": BLOCKGAUGEdb['confirmdata'][i]['V2'],
        "PO4": BLOCKGAUGEdb['confirmdata'][i]['V3'],
        "PO5": BLOCKGAUGEdb['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": "-",
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (BLOCKGAUGEdb["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < BLOCKGAUGEdb["value"].length; i++) {
        mean01.push(parseFloat(BLOCKGAUGEdb["value"][i]["PO3"]));
        mean02.push(parseFloat(BLOCKGAUGEdb["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      BLOCKGAUGEdb["value"].push({
        "PO1": 'Mean',
        "PO2": BLOCKGAUGEdb['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": BLOCKGAUGEdb['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  } else if (BLOCKGAUGEdb['RESULTFORMAT'] === 'OCR' || BLOCKGAUGEdb['RESULTFORMAT'] === 'Picture') {

  } else if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Graph') {

  }

  if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Number' ||
    BLOCKGAUGEdb['RESULTFORMAT'] === 'Text' ||
    BLOCKGAUGEdb['RESULTFORMAT'] === 'OCR' ||
    BLOCKGAUGEdb['RESULTFORMAT'] === 'Picture') {
    request.post(
      'http://127.0.0.1:17270/FINISHtoDB',
      { json: BLOCKGAUGEdb },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          BLOCKGAUGEdb['confirmdata'] = [];
          BLOCKGAUGEdb["value"] = [];
          //------------------------------------------------------------------------------------

          request.post(
            'http://127.0.0.1:17270/BLOCKGAUGE-feedback',
            { json: { "PO": BLOCKGAUGEdb['PO'], "ITEMs": BLOCKGAUGEdb['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );

          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }

  //-------------------------------------
  return res.json(BLOCKGAUGEdb);
});


router.post('/BLOCKGAUGE-FINISH-APR', async (req, res) => {
  //-------------------------------------
  console.log('--BLOCKGAUGE-FINISH-APR--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(BLOCKGAUGEdb['PCS']); i++) {

  if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Text' && input["APRitem"] !== undefined && input["APRre"] !== undefined) {

    BLOCKGAUGEdb["value"] = {
      "PO1": input["APRitem"],
      "PO2": input["APRre"],
      "PO3": "-",
      "PO4": "-",
      "PO5": "-",
      "PO6": "-",
      "PO7": "-",
      "PO8": "-",
      "PO9": 1,
      "PO10": "AUTO",
    };


  }

  if (BLOCKGAUGEdb['RESULTFORMAT'] === 'Text') {
    request.post(
      'http://127.0.0.1:17270/FINISHtoDB-apr',
      { json: BLOCKGAUGEdb },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          BLOCKGAUGEdb['confirmdata'] = [];
          BLOCKGAUGEdb["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:17270/BLOCKGAUGE-feedback',
            { json: { "PO": BLOCKGAUGEdb['PO'], "ITEMs": BLOCKGAUGEdb['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );
          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }
  // }


  //-------------------------------------
  return res.json(output);
});


module.exports = router;


