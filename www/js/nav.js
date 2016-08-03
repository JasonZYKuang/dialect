angular.module('starter.nav', ['ngCordova','ab-base64'])

  .controller('NavController', function ($scope, $ionicSideMenuDelegate, $ionicLoading, VoiceRecorderService,
                                         FileService,RecognitionService, DeviceStatus,YuyinLang,base64,
                                         NewMedia,$ionicModal,TranslateService,ServerData) {
    $scope.YuyinLang = YuyinLang;


    $scope.toggleLeft = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
    /*var server_url = "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=aDMbGya9mZU9CFHrP56S4MLf&client_secret=5cdeca5413ea8652098be1c8b6d1d522";
     var access_token = "";
     $http.get(server_url).success(function (resp) {
     console.log("get keyg:"+resp.access_token);
     access_token = resp.access_token;
     }).error(function (reason) {
     console.log("get keyg: error "+reason);
     });*/
    /*************************************************************************/
    console.log("NavController");
    var vm = this;
    vm.history = [];
    vm.showHint = false;
    vm.buttonText = "按下 说话";
    vm.canRecord = function () {
      //console.log("canRecord: "+ (DeviceStatus.ready && !DeviceStatus.offline));
      //return DeviceStatus.ready && !DeviceStatus.offline;
      return true;
    };

    vm.startRecord = function () {
      console.log("start record");
      vm.showHint = true;
      vm.buttonText = "松开 结束";
      vm.hintText = "向上滑动 取消识别";

      VoiceRecorderService.startRecord(55)
        .then(FileService.readAsArrayBuffer)
        .then(RecognitionService.recognise)
        .then(RecogniseSuccessCallback);
    };
    vm.stopRecord = function () {
      vm.showHint = false;
      vm.buttonText = "按下 说话";
      VoiceRecorderService.stopRecord();
    };

    vm.cancelRecord = function () {
      vm.hintText = vm.buttonText = "松开手指 取消识别";
      VoiceRecorderService.cancelRecord();
    };

    function RecogniseSuccessCallback (resp) {
      console.log("call back:"+resp.err_msg);
      console.log("call back:"+resp.err_no);
      vm.history.push(resp);
    }

    /*Modal                        ************************************************************************/
    $ionicModal.fromTemplateUrl('templates/lang-yuyin.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      }) ;

      $scope.openModal = function() {
        $scope.modal.show();
      }
      $scope.sltLang = function() {
    	  YuyinLang.name = TranslateService.getNamebyId(YuyinLang.id);
    	  $scope.YuyinLang = YuyinLang;
    	localforage.setItem('lang_yuyin', {id:YuyinLang.id,name:YuyinLang.name});
        $scope.modal.hide();
        if(TranslateService.hasLang(YuyinLang.id)){
      	  //console.log("sltLang - true");
        }else{
      	  //console.log("sltLang - false");
      	  ServerData.alert('请前往设置窗口下载数据包:&nbsp;'+YuyinLang.name);
        }
      };
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
    /*Modal                        ************************************************************************/









    /*************************************************************************/
    /*      Luyin.postMedia().success(function(response) {
     console.log(response.results);
     }).error(function(){

     });*/


    //$scope.file0 = "../data/audio/nihao.wav";
    /*      $scope.postMedia = function($scope){
     var reader = new FileReader();
     reader.onload = function(e){
     console.log("about to encode");
     $scope.encoded_file = btoa(e.target.result.toString());
     };
     reader.readAsBinaryString($scope.file0);
     };*/

    /*  var mediaSource = new Media(mediaSrc, function () {

     }, function () {

     }, function () {

     });*/

    /*var name = null, mediaSrc = null;*/
    /*if ($cordovaDevice.getPlatform() == "Android") {
     console.log("android media， amr");
     name = "amr";
     mediaSrc = cordova.file.externalDataDirectory + "test." + name;
     }
     else {
     name = "wav";
     mediaSrc = "test." + name;
     //mediaSrc = mediaSrc.fullPath.indexOf('file://') > -1 ? mediaSrc.fullPath : "file://" + mediaSrc.fullPath;
     }*/
    /*var mediaSource = $cordovaMedia.newMedia(mediaSrc);*/
    /*    // success callback
     function() {
     console.log("recordAudio():Audio Success");
     },
     function(err) {
     console.log("recordAudio():Audio Error: "+ err.code);
     });*/

    /* $scope.beginCaptureAudio = function () {
     // Record audio
     // $ionicLoading.show({ scope:$scope, template: ''<i class="ion-loading-c"></i><button class="button button-clear icon-left ion-close-circled" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="cancelSearch()" ></button>'+toastStr});
     console.log("begin capture");
     $ionicLoading.show({
     scope: $scope,
     // The text to display in the loading indicator
     template: '<i class="ion-loading-c"></i> <br><h1>请说出你要搜索的内容</h1><br><button ng-click="stopCaptureAudio()" class="button button-block">确定</button>',
     animation: 'fade-in',
     showBackdrop: true,
     maxWidth: 100,
     showDelay: 0
     });
     mediaSource.startRecord();
     };*/

    /*$scope.stopCaptureAudio = function () {

     $ionicLoading.hide();
     mediaSource.stopRecord();
     //
     //var myfile;
     if ($cordovaDevice.getPlatform() != "Android")
     mediaSrc = cordova.file.tempDirectory + "test.wav";

     window.resolveLocalFileSystemURL(mediaSrc, function (fileEntry) {

     fileEntry.file(function (file) {

     var reader = new FileReader();

     reader.onloadend = function (e) {
     var temp = this.result.substring(this.result.indexOf(',') + 1);
     var uuid = $cordovaDevice.getUUID();
     var data = null;

     data = {
     format: name,
     rate: 8000,
     channel: 1,
     cuid: uuid,
     token: access_token,
     speech: temp,
     len: file.size
     }

     $ionicLoading.show();


     $http.post("http://vop.baidu.com/server_api", data).success(function (data) {
     //
     // this callback will be called asynchronously
     // when the response is available
     if (data.err_no == 0) {
     // $scope.data.search_string = data.result;
     var s = new String(data.result);
     $scope.data.search_string  = s.slice(0,-1);
     $scope.search();
     }
     else
     $ionicPopup.alert({
     title: '错误',
     template: '语音识别错误,错误原因为:' + data.err_msg
     });
     }).error(function (reason) {
     $ionicPopup.alert({
     title: '错误',
     template: '服务器错误' + reason
     });
     }).finally(function () {
     $ionicLoading.hide();
     });
     }
     reader.readAsDataURL(file);
     });

     }, function (e) {

     });
     };*/

  })

;
