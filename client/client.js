var opcua = require("node-opcua");
var async = require("async");

var kafka = require('kafka-node');
var Producer = kafka.Producer;
var client = new kafka.Client('localhost:2181');
var producer = new Producer(client);

producer.on('ready', function(){console.log('Connected to Kafka!');});
  
var client = new opcua.OPCUAClient();
var endpointUrl = "opc.tcp://" + require("os").hostname().toLowerCase() + ":4334/UA/SampleServer";

var session, subscription;
var tag = process.argv[2];

async.series([
    // step 1 : connect to
    function(callback)  {
      client.connect(endpointUrl,function (err) {
          if(err) { console.log(" cannot connect to endpoint :" , endpointUrl ); }
          else { console.log("connected !"); }
          callback(err);
      });
    },

    // step 2 : createSession
    function(callback) {
      client.createSession( function(err, _session) {
          if(!err) { session = _session; }
          callback(err);
      });
    },

    // step 5: install a subscription and install a monitored item for 10 seconds
    function(callback) {
      subscription=new opcua.ClientSubscription(session,{
          requestedPublishingInterval: 1000,
          requestedLifetimeCount: 10,
          requestedMaxKeepAliveCount: 2,
          maxNotificationsPerPublish: 10,
          publishingEnabled: true,
          priority: 10
      });

      subscription.on("started",function(){
        console.log("subscriptionId=", subscription.subscriptionId);
      }).on("keepalive",function(){ console.log(); })
      .on("terminated",function(){ callback(); });

      // install monitored item
      var monitoredItem  = subscription.monitor(
        {nodeId: opcua.resolveNodeId(tag), attributeId: 13},
        {samplingInterval: 100, discardOldest: true, queueSize: 10}
      );
      console.log("-------------------------------------");

      monitoredItem.on("changed",function(dataValue){
         console.log("ChangedVal:", JSON.stringify(dataValue));
         producer.send([
         {topic: 'test',
          messages:[JSON.stringify(dataValue)]
         }], function(err, data){
           if (err){ console.log('Error sending: ', err); }
           else{ console.log('Successfully published: ' + new Date() + ', ' + data) }
         });
      });
    }
],
function(err) {
  if (err) { console.log(" failure ",err); }
  else { console.log('done!'); }
  client.disconnect(function(){});
});


