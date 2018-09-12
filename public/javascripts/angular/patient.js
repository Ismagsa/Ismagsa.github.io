angular.module('appPatient', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('centros', {
                url: '/centros',
                templateUrl: 'views/paciente/centros.html',
                controller: 'ctrlCentros'
            })
            .state('datos', {
                url: '/datos',
                templateUrl: 'views/paciente/datos.html',
                controller: 'ctrlDatos'
            })
            .state('examenes', {
                url: '/examenes',
                templateUrl: 'views/paciente/examenes.html',
                controller: 'ctrlExamenes'
            })
            .state('modal', {
                url: '/modal',
                templateUrl: 'views/paciente/modal.html',
                controller: 'ctrlModal'
            });

        $urlRouterProvider.otherwise('datos');
    })
    .controller('ctrlDatos', function($scope, $state, $http) {
        var password = document.getElementById("password")
        var confirm_password = document.getElementById("confirm_password");
        var data;

            $http.get("/users")
            .then(function (response) {
                data = response.data;
            });

        $scope.validatePassword = function (){
          if(password.value != confirm_password.value) {
            confirm_password.setCustomValidity("Passwords Don't Match");
          } else {
            confirm_password.setCustomValidity('');
          }
            password.onchange = validatePassword;
            confirm_password.onkeyup = validatePassword;
        }

        $scope.putPaciente = function(){
            $scope.paciente.local.password = document.getElementById('password').value;
            var pass = document.getElementById('confirm_password').value;
            if ($scope.paciente.local.password=="" || $scope.paciente.local.password != pass){
                return;
            }

            for(var i=0;i<data.length;i++){
                if($scope.paciente.local.email==data[i].local.email){
                    console.log("here")
                    $scope.paciente._id = data[i]._id;
                    break;
                }
            }
            if(i==data.length){return;}

            $http.put("/users/" + $scope.paciente._id, { 
                name    : $scope.paciente.name,
                last    : $scope.paciente.last,
                email   : $scope.paciente.local.email,
                ci      : $scope.paciente.info.ci,
                address : $scope.paciente.info.address,
                phone   : $scope.paciente.info.phone,
                password   : $scope.paciente.local.password,
            }
            ).success(function (response) {
                console.log("I guess this madness worked")
                $state.reload();
                Materialize.toast('Se ha actualizado ;)', 5000,'')
            }, function (error) {
            });
        }
    })
    .controller('ctrlExamenes', function($scope, $state, $http, $compile) {
        $scope.samples = {};
        $scope.user = {};

        $http.get("/myid")
            .then(function (response) {
            $scope.user = response.data;
        })
        
        $http.get("/samples")
            .then(function (response) {
            $scope.samples = response.data;
        });

        $scope.revisar = function(){
            var $header = $('<h5>'+$scope.user.name+" "+$scope.user.last+" ("+$scope.user.local.email+')</h5>').appendTo('#user');
            for(var i=0;i<$scope.samples.length;i++){
                if($scope.samples[i]._user._id==$scope.user._id){
                    if($scope.samples[i].meta!="En Proceso"){
                        for(var j=0;j<$scope.samples[i].results.length;j++){
                            var $el = $('<tr>' +
                            '<td>' + $scope.samples[i].results[j].parameter                           + '</td>' +
                            '<td>' + $scope.samples[i].results[j].unit                            + '</td>' +
                            '<td>' + (i+1) +" "+$scope.samples[i].results[j].type+ " ("
                                   + $scope.samples[i].type + ") " + '</td>' +
                            '<td>' + $scope.samples[i].results[j].result                            + '</td>' +
                            '<td>' + $scope.samples[i].results[j].ref                           + '</td>' +
                            '</tr>').appendTo('#mytable tbody');
                            $compile($el)($scope);
                        }
                    }else{
                        var $proceso = $('<h6>'+"Su Muestra de "+$scope.samples[i].type+" esta siendo procesada"+'</h6>').appendTo('#user');
                    }
                }
            }
            var table = $('#mytable').DataTable({
                "columnDefs": [
                    { "visible": false, "targets": 2 }
                ],
                "order": [[ 2, 'asc' ]],
                "displayLength": 25,
                "drawCallback": function ( settings ) {
                    var api = this.api();
                    var rows = api.rows( {page:'current'} ).nodes();
                    var last=null;
         
                    api.column(2, {page:'current'} ).data().each( function ( group, i ) {
                        if ( last !== group ) {
                            $(rows).eq( i ).before(
                                '<tr class="group"><td style="background-color:gray;color:white" colspan="6">'+group+'</td></tr>'
                            );
         
                            last = group;
                        }
                    } );
                }
            });
         
            // Order by the grouping
            $('#mytable').on( 'click', 'tr.group', function () {
                var currentOrder = table.order()[0];
                if ( currentOrder[0] === 2 && currentOrder[1] === 'asc' ) {
                    table.order( [ 2, 'desc' ] ).draw();
                }
                else {
                    table.order( [ 2, 'asc' ] ).draw();
                }
            } );
            $('#toprint').removeAttr('style');
            $('#open').attr('style',"display:none");
        }

        $scope.generatePdf = function(){
            function demoFromHTML() {
            var doc = new jsPDF('p', 'in', 'letter');
            var source = $('#pdf').first();
            var specialElementHandlers = {
            '#bypassme': function(element, renderer) {
            return true;
            }
            };
             
            doc.fromHTML(
            $('#pdf').get(0),
            0.5, // x coord
            0.5, // y coord
            {
            'width': 7.5, // max width of content on PDF
            'elementHandlers': specialElementHandlers
            });
             
            doc.output('dataurl');
            }
        }

        $('#open')
        .mouseenter(function() {
          Materialize.toast('Carga tus datos!', 500,'')
        });
        $('#print')
        .mouseenter(function() {
          Materialize.toast('Imprime tus datos!', 500,'')
        });

    })
    .controller('ctrlCentros', function($scope, $state, $http) {

    })
    .controller('ctrlModal', function($scope, $state, $http) {
        
    })

