angular.module('starter.controllers', [])

  .controller('DashCtrl', function ($scope, $ionicPopup, ServerData,TranslateService,OfflineData,lang) {
    //$scope.lang = lang;
    $scope.model = {message: "",lang:"YANGJIA",value:"阳江话"};
    $scope.translate = {message: "",result:[]};
    $scope.hideLogo = function () {
      $scope.logoHide = true;
      $scope.hasTranslate = false;
    };
    $scope.showLogo = function () {
      $scope.logoHide = false;
    };
    $scope.close = function () {
      $scope.model.message = "";
      $scope.logoHide = false;
      $scope.hasTranslate = false;
    };
    $scope.loadMore = function () {
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    $scope.clear = function () {
      $scope.model.message = "";
      $scope.hasTranslate = false;
      $scope.logoHide = false;
      ///$scope.close();
    };
    $scope.translate = function () {
      $scope.translate.result = [];
      if(!TranslateService.hasLang($scope.lang.id)){
    		ServerData.alert('请前往设置窗口下载数据包:&nbsp;'+$scope.lang.name);
      }else if ($scope.model.message.trim() == '') {
        ServerData.alert('翻译内容不能为空。');
      } else {
        $scope.translate.message = $scope.model.message;
        //$scope.model.message = "";
        $scope.hasTranslate = true;
        //$scope.logoHide = false;
        this.addData();
        var promise = TranslateService.translate($scope.translate.message);
        promise.then(function(data){
          var test = "["+data+"]";
          console.log("test="+test);
          $scope.translate.result = JSON.parse(test);
        });
      }
      ;

    };
    $scope.resub = function () {
      $scope.hasTranslate = false;
    };
    $scope.reTranslate = function(index){
      $scope.model.message = $scope.storedData[index];
      this.translate();
    };

    $scope.$on('$ionicView.enter', function() {
      localforage.getItem('storedDataForage', function(err, value){
        if (err){
          $scope.storedData = [];
        } else if (value == null){
          localforage.setItem('storedDataForage', []);
          $scope.storedData = [];
        } else {
          $scope.storedData = value;
        }
      });
      /* localforage.getItem('lang', function(err, value){
          if (err){
        	  //$scope.lang = {id:"YANGJIANG",name:"阳江话"};
          } else if (value == null){
            localforage.setItem('lang', {id:lang.id,name:lang.name});
            //$scope.lang = {id:"YANGJIANG",name:"阳江话"};
          } else {
        	lang = value;
            $scope.lang = lang;
          }
          //console.log('$scope.lang.id='+$scope.lang.id);
          if(TranslateService.hasLang($scope.lang.id)){
        	  //console.log("true");
          }else{
        	  //console.log("false");
        	  ServerData.alert('请前往设置窗口下载数据包:&nbsp;'+$scope.lang.name);
          }
        });*/
        
    });
    //Add data to localForage
    $scope.addData = function() {
        if($scope.storedData.length >= 10){
          this.removeData(0);
        }
        $scope.storedData.push($scope.translate.message);
        localforage.setItem('storedDataForage', $scope.storedData).then(function(value) {
          console.log($scope.translate.message + ' was added!');
        }, function(error) {
          console.error(error);
        });
    };

    //Remove data to localForage
    $scope.removeData = function(index) {
      $scope.storedData.splice(index, 1);
      localforage.setItem('storedDataForage', $scope.storedData);
    };
    $scope.clearData = function() {
      console.log("clear history");
      $scope.storedData = [];
      localforage.setItem('storedDataForage', $scope.storedData);
    };
    
    //Modal................................................................
    $ionicModal.fromTemplateUrl('templates/lang.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      }) 
      $scope.openModal = function() {
        $scope.modal.show();
      }
      $scope.sltLang = function() {
    	lang.name = TranslateService.getNamebyId(lang.id);
    	$scope.lang = lang;
    	localforage.setItem('lang', {id:lang.id,name:lang.name});
        $scope.modal.hide();
        if(TranslateService.hasLang(lang.id)){
      	  //console.log("sltLang - true");
        }else{
      	  //console.log("sltLang - false");
      	  ServerData.alert('请前往设置窗口下载数据包:&nbsp;'+lang.name);
        }
      };
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
  })

  .controller('ChatsCtrl', function ($scope, chatService) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = chatService.all();
    $scope.remove = function (chat) {
      chatService.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, chatService) {
    $scope.chat = chatService.get($stateParams.chatId);
  })

  .controller('DialoguesCtrl', function ($http, $scope, DialogueService) {
    DialogueService.all().success(function (response) {
      DialogueService.setDia(response.results);
      $scope.dialogues = response.results;
    }).error(function () {

    });
  })

  .controller('DialogueDetailCtrl', function ($scope, $stateParams, DialogueService, $timeout) {
    $scope.dialogue = DialogueService.get($stateParams.dialogueId);
    $scope.details = $scope.dialogue.subList;

    var audio = document.getElementById('fr').contentWindow.document.getElementById('audio');
    audio.addEventListener('play', function () {
      $scope.$apply(function () {
        $scope.details[$scope.detail_subid].playing = true;
      })
    }, false);
    audio.addEventListener('ended', function () {
      $scope.$apply(function () {
        $scope.details[$scope.detail_subid].playing = false;
      })
    }, false);
    $scope.playfor = function (id, subAudio) {
      $scope.detail_subid = id;
      audio.src = subAudio;
      audio.play();
    };
    $scope.speedUp = function () {

    };
    $scope.speedDown = function () {

    };


  })

  .controller('YuyinCtrl', function ($scope, $ionicSideMenuDelegate, $state, $rootScope,$ionicModal,TranslateService,ServerData,Luyin) {
    console.log("yuyin controll");
    $scope.goBack = function () {
      //console.log("right");
      /* $scope.$on('$destroy',function(){
       $rootScope.hideTabs = '';
       });*/
      /* $scope.hideTabs = '';*/
      $rootScope.hideTabs = '';
      $state.go("tab.dash");
    };
    
    $scope.$on('$ionicView.enter', function() {
        /*localforage.getItem('yuyin_lang', function(err, value){
            if (err){
            	console.log("yuyin enter err");
          	  //$scope.yuyin_lang = {id:"YANGJIANG",name:"阳江话"};
            	$scope.Luyin = Luyin;
            } else if (value == null){
            	console.log("yuyin enter null");
            	$scope.Luyin = Luyin;
              localforage.setItem('yuyin_lang', {id:Luyin.id,name:Luyin.name});
              //$scope.yuyin_lang = {id:"YANGJIANG",name:"阳江话"};
              
            } else {
            	console.log("yuyin enter");
              Luyin = value;
              $scope.Luyin = Luyin;
            }
            if(TranslateService.hasLang(Luyin.id)){
          	  //console.log("true");
            }else{
          	  //console.log("false");
          	  ServerData.alert('请前往设置窗口下载数据包:&nbsp;'+Luyin.name);
            }
          });*/
        
        if(TranslateService.hasLang(Luyin.id)){
        	  //console.log("true");
          }else{
        	  //console.log("false");
        	  ServerData.alert('请前往设置窗口下载数据包:&nbsp;'+Luyin.name);
          }
        
      });
  })

  .controller('SpeakCtrl', function ($scope, $ionicSideMenuDelegate) {
    /*$scope.toggleLeft = function() {
     $ionicSideMenuDelegate.toggleLeft();
     };*/

    console.log("SpeakCtrl");
  })

  .controller('SettingCtrl', function ($scope) {
  })
  
  .controller('DownloadCtrl', function ($scope,$ionicSlideBoxDelegate) {
	  $scope.slideIndex = 0;
	  $scope.lockSlide = function () {
	       $ionicSlideBoxDelegate.enableSlide( false );
	    }
      // Called each time the slide changes
  $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
      console.log("slide Change");

      if ($scope.slideIndex == 0){
          console.log("slide 1");
      }

      else if ($scope.slideIndex == 1){
          console.log("slide 2");
      }

      else if ($scope.slideIndex == 2){
          console.log("slide 3");
      }

  };

  $scope.activeSlide = function (index) {
      $ionicSlideBoxDelegate.slide(index);
      
  };
	  
  })

  .controller('actionsheetCtl', function ($scope, $ionicActionSheet, $timeout,ServerData,$ionicPopup) {
    $scope.show = function () {

      var hideSheet = $ionicActionSheet.show({
        /*buttons: [
         { text: 'Move' }
         ],*/
        destructiveText: '<b>确定清除历史记录</b>',
        /*titleText: 'Modify your album',*/
        cancelText: '<b>取消</b>',
        cancel: function () {
          // add cancel code..
        },
        destructiveButtonClicked: function () {
          //console.log("delete historys.");
          //return true;
          $scope.storedData = [];
          localforage.setItem('storedDataForage', $scope.storedData);
          ServerData.alert('清除成功！');
          return true;

        },
        buttonClicked: function (index) {
          return true;
        }
      });

      /*$timeout(function() {
       hideSheet();
       }, 2000);*/

    };
  });

