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

let NAME_INS = 'PVD-SCT-001'

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let GRAPH_TABLE = 'GRAPH_TABLE';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';
let UNIT = 'UNIT';

//----------------- dynamic

let finddbbuffer = [{}];

let PVDSCT001db = {
  "INS": NAME_INS,
  "PO": "",
  "CP": "",
  "MATCP": '',
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
  "GAPname": '',
  "GAPnameList": [],
  "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
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
  "INTERSEC_ERR": 0,
  //
  "PIC": "",
  //----------------------
  "USER": "",
  "USERID": "",
}



router.get('/CHECK-PVDSCT001', async (req, res) => {

  return res.json(PVDSCT001db['PO']);
});


router.post('/PVDSCT001db', async (req, res) => {
  //-------------------------------------
  // console.log('--PVDSCT001db--');
  // console.log(req.body);
  //-------------------------------------
  let finddb = [{}];
  try {

    finddb = PVDSCT001db;
    finddbbuffer = finddb;
  }
  catch (err) {
    finddb = finddbbuffer;
  }
  //-------------------------------------
  return res.json(finddb);
});

router.post('/GETINtoPVDSCT001', async (req, res) => {
  //-------------------------------------
  console.log('--GETINtoPVDSCT001--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  check = PVDSCT001db;
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



        PVDSCT001db = {
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
          "GAPname": '',
          "GAPnameList": [],
          "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
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
          "INTERSEC_ERR": 0,
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

router.post('/PVDSCT001-geteachITEM', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001-geteachITEM--');
  console.log(req.body);
  let inputB = req.body;

  let ITEMSS = '';
  let output = 'NOK';

  for (i = 0; i < PVDSCT001db['ItemPickcode'].length; i++) {
    if (PVDSCT001db['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
      ITEMSS = PVDSCT001db['ItemPickcode'][i]['key'];
    }
  }


  if (ITEMSS !== '') {

    //-------------------------------------
    PVDSCT001db['inspectionItem'] = ITEMSS;
    PVDSCT001db['inspectionItemNAME'] = inputB['ITEMs'];
    let input = { 'PO': PVDSCT001db["PO"], 'CP': PVDSCT001db["CP"], 'ITEMs': PVDSCT001db['inspectionItem'] };
    //-------------------------------------
    if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
      let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
      let UNITdata = await mongodb.find(master_FN, UNIT, {});
      let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": PVDSCT001db['inspectionItem'] });

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
            PVDSCT001db["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
            PVDSCT001db["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
            //------------------------------------

            let graph = await mongodb.find(PATTERN, GRAPH_TABLE, {});
            PVDSCT001db['GAPnameList'] = [];
            for (k = 0; k < graph.length; k++) {
              PVDSCT001db['GAPnameList'].push(graph[k]['NO']);
            }
          }

          for (j = 0; j < UNITdata.length; j++) {
            if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
              PVDSCT001db["UNIT"] = UNITdata[j]['UNIT'];
            }
          }

          console.log(findcp[0]['FINAL'][i]['POINT']);

          PVDSCT001db["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
          PVDSCT001db["PCS"] = findcp[0]['FINAL'][i]['PCS'];
          PVDSCT001db["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];

          PVDSCT001db["INTERSEC"] = masterITEMs[0]['INTERSECTION'];
          output = 'OK';
          let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
          if (findpo.length > 0) {
            request.post(
              'http://127.0.0.1:17270/PVDSCT001-feedback',
              { json: { "PO": PVDSCT001db['PO'], "ITEMs": PVDSCT001db['inspectionItem'] } },
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
    PVDSCT001db["POINTs"] = '',
      PVDSCT001db["PCS"] = '',
      PVDSCT001db["PCSleft"] = '',
      PVDSCT001db["UNIT"] = "",
      PVDSCT001db["INTERSEC"] = "",
      output = 'NOK';
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/PVDSCT001-geteachGRAPH', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001-geteachGRAPH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  try {
    let graph = await mongodb.find(PATTERN, GRAPH_TABLE, { "NO": input['GAPname'] });
    console.log(graph);
    PVDSCT001db['GAPnameListdata'] = graph[0];//confirmdata
    PVDSCT001db['GAP'] = PVDSCT001db['GAPnameListdata'][`GT${PVDSCT001db['confirmdata'].length + 1}`]
  }
  catch (err) {

  }
  //-------------------------------------
  return res.json('ok');
});

router.post('/PVDSCT001-preview', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001-preview--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  if (input.length > 0) {
    if (input[0]['V1'] !== undefined) {
      //-------------------------------------
      try {
        PVDSCT001db['preview'] = input;
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
    PVDSCT001db['preview'] = [];
    output = 'clear';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/PVDSCT001-confirmdata', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001-confirmdata--');
  console.log(req.body);
  // let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {
    let datapush = PVDSCT001db['preview'][0]

    if (PVDSCT001db['RESULTFORMAT'] === 'Graph') {
      let pushdata = PVDSCT001db['preview'][0]

      pushdata['V5'] = PVDSCT001db['GAP'];
      pushdata['V1'] = `${PVDSCT001db['confirmdata'].length + 1}:${pushdata['V1']}`;

      PVDSCT001db['confirmdata'].push(pushdata);
      PVDSCT001db['preview'] = [];
      output = 'OK';
      PVDSCT001db['GAP'] = PVDSCT001db['GAPnameListdata'][`GT${PVDSCT001db['confirmdata'].length + 1}`]

    } else if (PVDSCT001db['RESULTFORMAT'] === 'Number') {

      let pushdata = PVDSCT001db['preview'][0]

      pushdata['V5'] = PVDSCT001db['confirmdata'].length + 1
      pushdata['V1'] = `${PVDSCT001db['confirmdata'].length + 1}:${pushdata['V1']}`

      PVDSCT001db['confirmdata'].push(pushdata);
      PVDSCT001db['preview'] = [];
      output = 'OK';
    }
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/PVDSCT001-confirmdata-set', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001-confirmdata-set--');
  console.log(req.body);
  let input = req.body;
  PVDSCT001db['confirmdata'] = input;
  //-------------------------------------
  res.json('ok');
});

router.post('/PVDSCT001-feedback', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001-feedback--');
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

      for (i = 0; i < oblist.length; i++) {
        LISTbuffer.push(...ob[oblist[i]])
      }
      PVDSCT001db["PCSleft"] = `${parseInt(PVDSCT001db["PCS"]) - oblist.length}`;
      if (PVDSCT001db['RESULTFORMAT'] === 'Number' || PVDSCT001db['RESULTFORMAT'] === 'Text' || PVDSCT001db['RESULTFORMAT'] === 'Graph') {
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] === 'Mean') {
            ITEMleftVALUEout.push({ "V1": 'Mean', "V2": `${LISTbuffer[i]['PO3']}` })
          } else {
            ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO2']}`, "V2": `${LISTbuffer[i]['PO3']}` })
          }

        }



        PVDSCT001db["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        PVDSCT001db["ITEMleftVALUE"] = ITEMleftVALUEout;

      } else {

      }
      // output = 'OK';
      if ((parseInt(PVDSCT001db["PCS"]) - oblist.length) == 0) {
        //CHECKlist
        for (i = 0; i < feedback[0]['CHECKlist'].length; i++) {
          if (input["ITEMs"] === feedback[0]['CHECKlist'][i]['key']) {
            feedback[0]['CHECKlist'][i]['FINISH'] = 'OK';
            feedback[0]['CHECKlist'][i]['timestamp'] = `${Date.now()}`;
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

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Graph') {

            if (PVDSCT001db['GRAPHTYPE'] == 'CDE') {

              //
              let axis_data = [];
              for (i = 0; i < LISTbuffer.length; i++) {
                if (LISTbuffer[i]['PO1'] !== 'Mean') {
                  axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
                }
              }
              //-----------------core

              let core = 0;
              if (PVDSCT001db['INTERSEC'] !== '') {
                core = parseFloat(PVDSCT001db['INTERSEC'])
              } else {
                core = parseFloat(axis_data[axis_data.length - 1]['y'])
              }

              //-----------------core
              let RawPoint = [];
              for (i = 0; i < axis_data.length - 1; i++) {
                if (core <= axis_data[i].y && core >= axis_data[i + 1].y) {
                  RawPoint.push({ Point1: axis_data[i], Point2: axis_data[i + 1] });
                  break
                }
              }

              try {
                let pointvalue = RawPoint[0].Point2.x - RawPoint[0].Point1.x;
                let data2 = RawPoint[0].Point1.y - core;
                let data3 = RawPoint[0].Point1.y - RawPoint[0].Point2.y;

                let RawData = RawPoint[0].Point1.x + (data2 / data3 * pointvalue);
                let graph_ans_X = parseFloat(RawData.toFixed(2));

                feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
                feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": core };

                let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });
              }
              catch (err) {
                PVDSCT001db[`INTERSEC_ERR`] = 1;
              }

              //
            } else if (PVDSCT001db['GRAPHTYPE'] == 'CDE') {
              let axis_data = [];
              for (i = 0; i < LISTbuffer.length; i++) {
                if (LISTbuffer[i]['PO1'] !== 'Mean') {
                  axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
                }
              }

              let d = []
              for (i = 0; i < axis_data.length - 1; i++) {
                d.push((axis_data[i].y - axis_data[i + 1].y) / (axis_data[i + 1].x - axis_data[i].x));
              }

              let def = []

              for (i = 0; i < d.length - 1; i++) {
                if (d[i] > d[i + 1]) {
                  def[i] = (d[i] - d[i + 1])
                } else {
                  def[i] = (d[i + 1] - d[i])
                }

              }

              for (j = 0; j < def.length; j++) {
                if (def[j] === Math.max(...def)) {
                  pos = [j + 1, j + 2]
                }
              }

              let d1 = -d[pos[0] - 1]
              let d2 = -d[pos[1]]


              let c1 = (axis_data[pos[0]].y - d1 * axis_data[pos[0]].x);
              let c2 = (axis_data[pos[1]].y - d2 * axis_data[pos[1]].x);


              let Xans = 0;
              let Yans = 0;
              let x = (c[1] - c[0]) / (d1 - d2);


              if (x >= 0) {
                Xans = x
              } else {
                Xans = -x
              }

              y = d1 * Xans + c[0]
              Yans = y

              let graph_ans_X = parseFloat(Xans.toFixed(2));
              let graph_ans_Y = parseFloat(Yans.toFixed(2));

              feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
              feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": graph_ans_Y };

              let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


            } else {
              let dataCheck = await axios.post("http://localhost:17270/GRAPH-recal", {
                "PO": PVDSCT001db["PO"],
                "ITEMs": "ITEMs-5f19aaa2fe12be0020dbd3c2",
                "MODE": "CDE",
                "NAME_INS": "PVD-SCT-001",
                "INTERSEC": ""
              })
            }

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Picture') {
            //
          } else if (masterITEMs[0]['RESULTFORMAT'] === 'OCR') {
            //

          } else {

          }
        }

        let CHECKlistdataFINISH = [];

        for (i = 0; i < feedback[0]['CHECKlist'].length; i++) {
          if (feedback[0]['CHECKlist'][i]['FINISH'] !== undefined) {
            if (feedback[0]['CHECKlist'][i]['FINISH'] === 'OK') {
              CHECKlistdataFINISH.push(feedback[0]['CHECKlist'][i]['key'])
            } else {
            }
          }
        }

        if (CHECKlistdataFINISH.length === feedback[0]['CHECKlist'].length) {
          // feedback[0]['FINAL_ANS']["ALL_DONE"] = "DONE";
          // feedback[0]['FINAL_ANS']["PO_judgment"] ="pass";
          let dataCheck = await axios.post("http://localhost:17270/JUDEMENT", { "PO": PVDSCT001db["PO"], "CP": PVDSCT001db["CP"] })
          let resultdataCheck = 'pass'
          for (let i = 0; i < dataCheck.length; i++) {
            if (dataCheck[i]['result'] !== 'OK') {
              resultdataCheck = 'no pass';
              break;
            }
          }
          let feedbackupdateFINISH = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { "ALL_DONE": "DONE", "PO_judgment": resultdataCheck, } });
        }

      }
    } else {
      PVDSCT001db["ITEMleftUNIT"] = '';
      PVDSCT001db["ITEMleftVALUE"] = '';
    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/PVDSCT001-SETZERO', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    PVDSCT001db = {
      "INS": NAME_INS,
      "PO": "",
      "CP": "",
      "MATCP": '',
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
      "GAPname": '',
      "GAPnameList": [],
      "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
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
      "INTERSEC_ERR": 0,
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

router.post('/PVDSCT001-CLEAR', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    PVDSCT001db['preview'] = [];
    PVDSCT001db['confirmdata'] = [];

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/PVDSCT001-RESETVALUE', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    let all = PVDSCT001db['confirmdata'].length
    if (all > 0) {
      PVDSCT001db['confirmdata'].pop();
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


router.post('/PVDSCT001-FINISH', async (req, res) => {
  //-------------------------------------
  console.log('--PVDSCT001-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  if (PVDSCT001db['RESULTFORMAT'] === 'Number' || PVDSCT001db['RESULTFORMAT'] === 'Text') {

    PVDSCT001db["value"] = [];
    for (i = 0; i < PVDSCT001db['confirmdata'].length; i++) {
      PVDSCT001db["value"].push({
        "PO1": PVDSCT001db["inspectionItemNAME"],
        "PO2": PVDSCT001db['confirmdata'][i]['V1'],
        "PO3": PVDSCT001db['confirmdata'][i]['V2'],
        "PO4": PVDSCT001db['confirmdata'][i]['V3'],
        "PO5": PVDSCT001db['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": '-',
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (PVDSCT001db["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < PVDSCT001db["value"].length; i++) {
        mean01.push(parseFloat(PVDSCT001db["value"][i]["PO3"]));
        mean02.push(parseFloat(PVDSCT001db["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      PVDSCT001db["value"].push({
        "PO1": 'Mean',
        "PO2": PVDSCT001db['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": PVDSCT001db['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  } else if (PVDSCT001db['RESULTFORMAT'] === 'OCR' || PVDSCT001db['RESULTFORMAT'] === 'Picture') {

  } else if (PVDSCT001db['RESULTFORMAT'] === 'Graph') {

    PVDSCT001db["value"] = [];
    for (i = 0; i < PVDSCT001db['confirmdata'].length; i++) {
      PVDSCT001db["value"].push({
        "PO1": PVDSCT001db["inspectionItemNAME"],
        "PO2": PVDSCT001db['confirmdata'][i]['V1'],
        "PO3": PVDSCT001db['confirmdata'][i]['V2'],
        "PO4": PVDSCT001db['confirmdata'][i]['V3'],
        "PO5": PVDSCT001db['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": PVDSCT001db['confirmdata'][i]['V5'],
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (PVDSCT001db["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < PVDSCT001db["value"].length; i++) {
        mean01.push(parseFloat(PVDSCT001db["value"][i]["PO3"]));
        mean02.push(parseFloat(PVDSCT001db["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      PVDSCT001db["value"].push({
        "PO1": 'Mean',
        "PO2": PVDSCT001db['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": PVDSCT001db['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  }

  if (PVDSCT001db['RESULTFORMAT'] === 'Number' ||
    PVDSCT001db['RESULTFORMAT'] === 'Text' ||
    PVDSCT001db['RESULTFORMAT'] === 'OCR' ||
    PVDSCT001db['RESULTFORMAT'] === 'Picture' || PVDSCT001db['RESULTFORMAT'] === 'Graph') {
    request.post(
      'http://127.0.0.1:17270/FINISHtoDB',
      { json: PVDSCT001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          PVDSCT001db['confirmdata'] = [];
          PVDSCT001db["value"] = [];
          //------------------------------------------------------------------------------------

          request.post(
            'http://127.0.0.1:17270/PVDSCT001-feedback',
            { json: { "PO": PVDSCT001db['PO'], "ITEMs": PVDSCT001db['inspectionItem'] } },
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
  return res.json(PVDSCT001db);
});



module.exports = router;


