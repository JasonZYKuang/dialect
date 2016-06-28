angular.module('starter.controllers', [])

  .controller('DashCtrl', function ($scope, $ionicPopup, ServerData,TranslateService) {
    //$scope.lang = 'YANGJIANG';
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
      if ($scope.model.message.trim() == '') {
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
      })
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
      $scope.sltLang = function(model) {
    	$scope.model.lang = model.lang;
        $scope.modal.hide();
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

  .controller('YuyinCtrl', function ($scope, $ionicSideMenuDelegate, $state, $rootScope) {
    console.log("yuyin controll");
    $scope.goBack = function () {
      console.log("right");
      /* $scope.$on('$destroy',function(){
       $rootScope.hideTabs = '';
       });*/
      /* $scope.hideTabs = '';*/
      $rootScope.hideTabs = '';
      $state.go("tab.dash");
    };
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

