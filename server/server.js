var opcua = require("node-opcua");

// Let's create an instance of OPCUAServer
var server = new opcua.OPCUAServer({port: 4334});
var siteName = 'site01';

var var1 = {nodeId: 'ns=4;s=hook_weight', browseName: 'hook_weight', dataType: 'Double'};
var var2 = {nodeId: 'ns=4;s=rpm', browseName: 'rpm', dataType: 'Double'};

function post_initialize(){
    console.log("server initialized");
    function construct_my_address_space(server) {
      server.engine.createFolder("RootFolder",{ browseName: siteName});
        // emulate variable1 changing every 500 ms
        var variable1 = 1;
        setInterval(function(){ variable1 += 1; }, 1000);

        var1.value = {
          get: function(){
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable1 });
          }
        };
        server.var1 = server.engine.addVariableInFolder(siteName, var1);

        var2.value = {
          get: function(){
            return new opcua.Variant({dataType: opcua.DataType.Double, value: 10});
          }
        };
        server.var2 = server.engine.addVariableInFolder(siteName, var2);
    }
    
    construct_my_address_space(server);
    
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        var endpointUrl = server.endpoints[0].endpointDescription().endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}
server.initialize(post_initialize);
