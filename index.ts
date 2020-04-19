import * as ssbClient from 'ssb-client'
import * as pull from 'pull-stream'
import * as WebSocket from 'ws'
 
const wss = new WebSocket.Server({ port: 48090 });
 
let userId
let messages = []
let handler

wss.on('connection', (ws) => {
  console.log('connected')
  ws.on('message', async (message) => {
    let msg = JSON.parse(message)
    // console.log(msg)
    let response = await handler(msg.type, msg)

    let m = JSON.stringify(
      Object.assign({ replyId: msg.id }, { response })
    )

    // console.log(m)
    ws.send(m)
  });
 
  // ws.send('something');
});

ssbClient((err, sbot) => {
  if (err) {
    throw err
  }

  handler = function (type, message) {
    return new Promise((resolve, reject) => {
      if (type === 'pull-messages') {
        pull(sbot.createUserStream({ id: userId }), pull.collect((err, msgs) => resolve(msgs.reverse())))
      } else if (type === 'whoami') {
        sbot.whoami((err, info) => resolve(info))
      } else {
        reject(`Unknown message '${type}'`)
      }
   })
  }
  
  sbot.whoami((err, info) => {
    console.log(info)
    userId = info.id

    // pull(
    //   sbot.createUserStream({ id: userId }),
    //   pull.collect((err, msgs) => {
    //     if (err) {
    //       throw err
    //     }

    //     messages = msgs
    //     // console.log(msgs.map(m => m.value && m.value.content))
    //   })
    // )
  })

  /*

  sbot.publish({
    type: 'post',
    text: 'Hello, world!'
  }, function (err, msg) {
    // 'msg' includes the hash-id and headers

    console.log(msg)
  })
  */
 
  // sbot is now ready. when done:
  // sbot.close()
})


