opcua-kafka
===========

Example of an OPCUA compliant server, and an OPCUA compliant client subscribing to the server and publishing tag readings to Kafka 0.8

Example with an Apache Zookeeper instance running on localhost:2181:
```
node server/server.js
node client/client.js "ns=4;s=hook_weight"
```
