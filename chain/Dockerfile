FROM ubuntu:16.04

RUN apt-get update \
  && apt install  -y net-tools iputils-ping software-properties-common  \
  && add-apt-repository -y ppa:ethereum/ethereum \
  && apt-get update \
  && apt-get install -y --allow-unauthenticated ethereum \
  && apt-get purge -y --auto-remove

EXPOSE 8545
EXPOSE 30303

WORKDIR /opt

COPY genesis.json /opt
RUN geth --datadir ./data init genesis.json

CMD ["geth", \
  "--datadir", "data", \
  "--networkid", "11", \
  "--http", \
  "--http.addr", "0.0.0.0", \
  "--http.corsdomain", "*", \
  "--http.api", "eth,web3,personal,net,miner,admin,debug,txpool", \
  "--ws", \
  "--ws.addr", "0.0.0.0", \
  "--ws.api", "eth,web3,personal,net,miner,admin,debug,txpool", \
  "--nodiscover", \
  "--allow-insecure-unlock", \
  "--dev", \
  "--dev.period", "1"]

# docker build -t eth-private-chain .
# docker run --rm -p 8545:8545 -d eth-private-chain

# miner.setEtherbase(eth.coinbase)