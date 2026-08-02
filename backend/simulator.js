/*

  Dummy ESP32 Simulator

  ----------------------

  Pretends to be the physical pill dispenser. Polls Firestore the same

  way the real ESP32 firmware will, so you can test the full web app

  flow (Dispense Now -> "hardware" responds -> status + reports update)

  without having built the hardware yet.

  When the real hardware is ready, stop this script and flash the

  ESP32 firmware instead — the website needs zero changes, because

  both talk to the same Firestore documents the same way.

  Run from inside /backend:

    node simulator.js

*/

require('dotenv').config();

const { db } = require('./config/firebase');

// ⚠️ Paste your Firebase UID here (Firebase Console > Authentication > Users)

const OWNER_UID = 'zY8m87kwQnh0UCYfIKywztQRPdX2';

const POLL_INTERVAL_MS = 5000;   // how often the "device" checks for commands

const DISPENSE_DELAY_MS = 2500;  // simulates the motor actually turning

let pillCount = 30; // starting count — change to whatever you want to test with

const deviceRef = db.collection('devices').doc(OWNER_UID);

const historyRef = db.collection('history');

async function tick() {

  try {

    const doc = await deviceRef.get();

    const data = doc.exists ? doc.data() : {};

    if (data.pendingCommand === 'dispense') {

      console.log('📦 Dispense command received — simulating motor turning...');

      await sleep(DISPENSE_DELAY_MS);

      pillCount = Math.max(0, pillCount - 1);

      // Mark the matching history record as "taken" so Reports shows it correctly

      if (data.pendingHistoryId) {

        await historyRef.doc(data.pendingHistoryId).update({ status: 'taken' });

      }

      await deviceRef.set(

        {

          status: 'online',

          pillCount,

          lastSeen: new Date().toISOString(),

          pendingCommand: '',

          pendingHistoryId: '',

        },

        { merge: true }

      );

      console.log(`✅ Pill dispensed. Remaining: ${pillCount}`);

    } else {

      // Heartbeat — just prove the "device" is online and in sync

      await deviceRef.set(

        {

          status: 'online',

          pillCount,

          lastSeen: new Date().toISOString(),

        },

        { merge: true }

      );

      console.log(`💓 Heartbeat — online, ${pillCount} pills left`);

    }

  } catch (err) {

    console.error('Simulator error:', err.message);

  }

}

function sleep(ms) {

  return new Promise((resolve) => setTimeout(resolve, ms));

}

console.log('🤖 Dummy ESP32 simulator started. Watching for dispense commands...');

console.log(`   Owner UID: ${OWNER_UID}`);

setInterval(tick, POLL_INTERVAL_MS);

tick(); // run once immediately instead of waiting for the first interval
