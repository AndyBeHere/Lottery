/* globals artifacts */
web3GetClient = function () {
    return new Promise((resolve, reject) => {
      web3.eth.getNodeInfo((err, res) => {
        if (err !== null) return reject(err);
        return resolve(res);
      });
    });
  }

  module.exports.forwardTime = async function (seconds) {
    const client = await web3GetClient();
    const p = new Promise((resolve, reject) => {
 
        // console.log(`Forwarding time with ${seconds}s ...`);
        web3.currentProvider.send(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [seconds],
            id: 0
          },
          err => {
            if (err) {
              return reject(err);
            }
            return web3.currentProvider.send(
              {
                jsonrpc: "2.0",
                method: "evm_mine",
                params: [],
                id: 0
              },
              (err2, res) => {
                if (err2) {
                  return reject(err2);
                }
                return resolve(res);
              }
            );
          }
        );
      
    });
    return p;
  }