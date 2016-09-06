angular.module('starter.controllers', [])

  .controller('DashCtrl', function ($scope, $timeout,$ionicPopup, ServerData, TranslateService,
                                    lang, $ionicModal,$ionicListDelegate,$ionicLoading) {
    $scope.lang = lang;
    $scope.model = {message: ""};
    $scope.translate = {message: "", result: []};
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
      if (!TranslateService.hasLang($scope.lang.id)) {
        ServerData.alert('请前往设置窗口下载数据包:&nbsp;' + $scope.lang.name);
      } else if ($scope.model.message.trim() == '') {
        ServerData.alert('翻译内容不能为空。');
      } else {
        $scope.translate.message = $scope.model.message;
        //$scope.model.message = "";
        //$scope.logoHide = false;
        this.addData();
        $ionicLoading.show();
        var promise = TranslateService.translate($scope.translate.message, $scope.lang.id);
        promise.then(function (data) {
          var test = [];
          for(var i in data){
            if(data[i] !=null){
              test.push(data[i])
            }else{
              //test.push("null");
            }
          }
          test = "[" + test + "]";
          console.log("test=" + test);
          $timeout(function(){
            $scope.hasTranslate = true;
            $scope.translate.result = JSON.parse(test);
            $ionicLoading.hide();
          },500);
        });
      }
      ;

    };
    $scope.resub = function () {
      $scope.hasTranslate = false;
    };
    $scope.reTranslate = function (index) {
      var idx = $scope.storedData.length - index - 1;
      $scope.model.message = $scope.storedData[idx];
      this.translate();
    };

    var audio = document.getElementById('fr').contentWindow.document.getElementById('audio');
    var timer;
    $scope.playAudio =  function(){
      var medias = $scope.translate.result;
      $scope.audioLength = medias.length;
      if(medias.length >0){
        audio.src = medias[0].audio;
        audio.play();
        var j = 0;
        audio.addEventListener('ended',function(){
          $scope.$apply(function(){
            j++;
            if(j < $scope.audioLength){
              audio.src = medias[j].audio;
              audio.playbackRate = 1;
              audio.play();
            }

          });
        },false);
      }

    };

    $scope.$on('$ionicView.enter', function () {
      console.log("dash enter");
      localforage.getItem('storedDataForage', function (err, value) {
        if (err) {
          $scope.storedData = [];
        } else if (value == null) {
          localforage.setItem('storedDataForage', []);
          $scope.storedData = [];
        } else {
          $scope.storedData = value;
        }
      });
    });
    //Add data to localForage
    $scope.addData = function () {
      if ($scope.storedData.length >= 10) {
        this.removeData(9);
      }
      $scope.storedData.push($scope.translate.message);
      localforage.setItem('storedDataForage', $scope.storedData).then(function (value) {
        //console.log($scope.translate.message + ' was added!');
      }, function (error) {
        console.error(error);
      });
    };

    //Remove data to localForage
    $scope.removeData = function (index) {
      var idx = $scope.storedData.length - index -1;
      console.log("index="+index+",idx="+idx);
      $scope.storedData.splice(idx, 1);
      $ionicListDelegate.closeOptionButtons();
      localforage.setItem('storedDataForage', $scope.storedData);
    };
    $scope.clearData = function () {
      console.log("clear history");
      $scope.storedData = [];
      localforage.setItem('storedDataForage', $scope.storedData);
    };

    //Modal................................................................
    $ionicModal.fromTemplateUrl('templates/lang.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    })
    $scope.openModal = function () {
      $scope.modal.show();
    }
    $scope.sltLang = function () {
      lang.name = TranslateService.getNamebyId(lang.id);
      $scope.lang = lang;
      localforage.setItem('lang', {id: lang.id, name: lang.name});
      $scope.modal.hide();
      if (TranslateService.hasLang(lang.id)) {
      } else {
        ServerData.alert('请前往设置窗口下载数据包:&nbsp;' + lang.name);
      }
    };
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });
  })

  .controller('DialoguesCtrl', function ($http, $scope,$state,$ionicModal,ServerData,
                                         TranslateService,DialogueService,DialogueLang) {
    $scope.DialogueLang = DialogueLang;

    $scope.$on('$ionicView.enter', function () {
      if (TranslateService.hasDialogues(DialogueLang.id)) {
        //console.log("true");
      } else {
        //console.log("false");
        $scope.dialogues = "";
        ServerData.alert('请前往设置窗口下载情景对话数据包:&nbsp;' + DialogueLang.name);
      }

    });

    DialogueService.all(DialogueLang.id).success(function (response) {
      DialogueService.setDia(response.results);
      $scope.dialogues = response.results;
    }).error(function () {

    });

    $scope.gotoDetail = function(dialogueId){
      if (TranslateService.hasDialogues(DialogueLang.id)) {
        $state.go("tab.dialogue-detail",{dialogueId:dialogueId});
      } else {
        ServerData.alert('请前往设置窗口下载情景对话数据包:&nbsp;' + DialogueLang.name);
      }
    };

    /*Modal                        ************************************************************************/
    $ionicModal.fromTemplateUrl('templates/lang-dialogue.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    }) ;

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.sltLang = function() {
      DialogueLang.name = TranslateService.getNamebyId(DialogueLang.id);
      $scope.DialogueLang = DialogueLang;
      localforage.setItem('lang_dia', {id:DialogueLang.id,name:DialogueLang.name});
      $scope.modal.hide();
      if(TranslateService.hasDialogues(DialogueLang.id)){
        DialogueService.all(DialogueLang.id).success(function (response) {
          DialogueService.setDia(response.results);
          $scope.dialogues = response.results;
        }).error(function () {

        });
      }else{
        //console.log("sltLang - false");
        ServerData.alert('请前往设置窗口下载情景对话数据包:&nbsp;'+DialogueLang.name);
      }
    };
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    /*Modal                        ************************************************************************/

  })

  .controller('DialogueDetailCtrl', function (DialogueLang,$scope, $stateParams, DialogueService, $timeout,Speed) {
    $scope.dialogue = DialogueService.get($stateParams.dialogueId);
    $scope.details = $scope.dialogue.subList;
    $scope.DialogueLang = DialogueLang;

    //$scope.details = DialogueService.get($stateParams.dialogueId).subList;

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

      var testAudio = new Audio(cordova.file.externalApplicationStorageDirectory+"dialogues/"+subAudio);
      testAudio.playbackRate = Speed.value;
      console.log('testAudio.playbackRate = '+testAudio.playbackRate);
      testAudio.play();

      /*audio.src = subAudio;
      audio.playbackRate = Speed.value;
      audio.play();*/
    };

  })

  .controller('YuyinCtrl', function ($scope, $ionicSideMenuDelegate, $state,
                                     $rootScope ,$ionicModal, TranslateService, ServerData, YuyinLang) {
    $scope.goBack = function () {
      //console.log("right");
      /* $scope.$on('$destroy',function(){
       $rootScope.hideTabs = '';
       });*/
      /* $scope.hideTabs = '';*/
      $rootScope.hideTabs = '';
      $state.go("tab.dash");
    };

    $scope.$on('$ionicView.enter', function () {
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

      if (TranslateService.hasLang(YuyinLang.id)) {
        //console.log("true");
      } else {
        //console.log("false");
        ServerData.alert('请前往设置窗口下载数据包:&nbsp;' + YuyinLang.name);
      }

    });
  })

  .controller('SpeakCtrl', function ($scope, $ionicSideMenuDelegate) {
    /*$scope.toggleLeft = function() {
     $ionicSideMenuDelegate.toggleLeft();
     };*/

    console.log("SpeakCtrl");
  })

  .controller('SettingCtrl', function ($scope,Speed) {
    $scope.speedRate = Speed.value;

    $scope.speedChange = function (rate) {
      $scope.speedRate = rate;
      Speed.value = $scope.speedRate;
      console.log("rate="+rate+",speedRate="+$scope.speedRate);
    };
  })

  .controller('DownloadCtrl', function ($scope, $ionicSlideBoxDelegate,$ionicPopup,$interval,$state,
                                        $timeout,$ionicActionSheet,$cordovaFileTransfer,ServerData,
                                        $cordovaZip,$cordovaFile,langlist,lang_dialogues) {
    $scope.langlist = langlist;
    $scope.lang_dialogues = lang_dialogues;
    $scope.slideIndex = 0;
    $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
    // Called each time the slide changes
    $scope.slideChanged = function (index) {
      $scope.slideIndex = index;
      console.log("slide Change");
      if ($scope.slideIndex == 0) {
        console.log("slide 1");
      }

      else if ($scope.slideIndex == 1) {
        console.log("slide 2");
      }

      else if ($scope.slideIndex == 2) {
        console.log("slide 3");
      }

    };

    $scope.activeSlide = function (index) {
      $ionicSlideBoxDelegate.slide(index);

    };

    $scope.downloadStatus = function (items,comparedvalue) {
      var result = {};
      angular.forEach(items,function(value, key){
        if(value.dwnstatus == comparedvalue){
          result[key] = value;
        }
      });
      return result;
    };

    $scope.filterDowning = function(items){
      var result = {};
      angular.forEach(items,function(value, key){
        if(value.dwnstatus !='success' && value.dwnstatus !='download'){
          result[key] = value;
        }
      });
      return result;
    };

    $scope.downloadSize = 0;
    $scope.dialogueSize = 0;

    $scope.download = function (langId) {
      if(langlist[langId].dwnstatus == 'download'){
        this.startDownload(langId);
      }else if(langlist[langId].dwnstatus == 'success'){
        ServerData.showPopup('该语音包已经完成下载');
      }else if(langlist[langId].dwnstatus == 'downing'){
        ServerData.showPopup('该语音包正在下载');
      }else if(langlist[langId].dwnstatus == 'waiting'){
        ServerData.showPopup('该语音包等待下载中');
      }else if(langlist[langId].dwnstatus == 'pause'){
        ServerData.showPopup('该语音包已经暂停下载');
      }
    };

    var url = "http://120.24.158.176:8080/demo/";
    var filePath = cordova.file.externalApplicationStorageDirectory;
    var fileName = "";
    var targetPath = "";
    var trustHosts = true;
    var options = {};
    $scope.startDownload = function(langId){
      var uri = encodeURI(url+ "trans_"+langId+".zip");
      fileName = filePath + "trans_"+langId+".zip";
      targetPath = filePath + "translate/"+langId;
      langlist[langId].dwnstatus = 'downing';
      ServerData.showPopup('你选择的语音包已经加入到下载队列');
      $cordovaFileTransfer.download(uri,fileName,options,trustHosts).then(function(result){
        unzipFile(fileName,targetPath);
      },function(err){
        $interval.cancel(langlist[langId].stopinterval);
        langlist[langId].dwnstatus = 'download';
        ServerData.alert('下载失败！');
        return;
      },function(progress){
        $timeout(function(){
          var downloadProgress = (progress.loaded / progress.total) * 100;
          langlist[langId].progressval = Math.floor(downloadProgress);
          if(langlist[langId].progressval > 99){
            $interval.cancel(langlist[langId].stopinterval);
            langlist[langId].dwnstatus = 'success';
            langlist[langId].stopinterval = true;
            $scope.langlist = langlist;
            $state.go("tab.download");
            return;
          }
        });
      });

    };

    $scope.downloadDialogues = function (langId) {
      if(lang_dialogues[langId].dwnstatus == 'download'){
        this.startDownloadDialogues(langId);
      }else if(lang_dialogues[langId].dwnstatus == 'success'){
        ServerData.showPopup('该语音包已经完成下载');
      }else if(lang_dialogues[langId].dwnstatus == 'downing'){
        ServerData.showPopup('该语音包正在下载');
      }else if(lang_dialogues[langId].dwnstatus == 'waiting'){
        ServerData.showPopup('该语音包等待下载中');
      }else if(lang_dialogues[langId].dwnstatus == 'pause'){
        ServerData.showPopup('该语音包已经暂停下载');
      }
    };

    $scope.startDownloadDialogues = function(langId){
      var uri = encodeURI(url+"dialogue_"+langId+".zip");
      fileName = filePath + "dialogue_"+langId+".zip";
      targetPath = filePath + "dialogues/"+langId;
      $cordovaFileTransfer.download(uri,fileName,options,trustHosts).then(function(result){
        unzipFile(fileName,targetPath);
      },function(err){
        $interval.cancel(lang_dialogues[langId].stopinterval);
        lang_dialogues[langId].dwnstatus = 'download';
        ServerData.alert('下载失败！');
        return;
      },function(progress){
        lang_dialogues[langId].dwnstatus = 'downing';
        ServerData.showPopup('你选择的语音包已经加入到下载队列');
        $timeout(function(){
          var downloadProgress = (progress.loaded / progress.total) * 100;
          lang_dialogues[langId].progressval = Math.floor(downloadProgress);
          if(lang_dialogues[langId].progressval > 99){
            $interval.cancel(lang_dialogues[langId].stopinterval);
            lang_dialogues[langId].dwnstatus = 'success';
            lang_dialogues[langId].stopinterval = true;
            $scope.lang_dialogues = lang_dialogues;
            $state.go("tab.download");
            return;
          }
        });
      });


      /*if(lang_dialogues[langId].stopinterval){
        $interval.cancel(lang_dialogues[langId].stopinterval);
      };*/

      //lang_dialogues[langId].stopinterval = $interval(function(){
        /*lang_dialogues[langId].progressval = lang_dialogues[langId].progressval + 1;
         if(lang_dialogues[langId].progressval >=100){
         $interval.cancel(lang_dialogues[langId].stopinterval);
         lang_dialogues[langId].dwnstatus = 'success';
         lang_dialogues[langId].stopinterval = true;
         $scope.lang_dialogues = lang_dialogues;
         $state.go("tab.download");
         return;
         }*/
        /*$cordovaFileTransfer.download(uri,fileName,options,trustHosts).then(function(result){
          /!*$cordovaZip.unzip(fileName,cordova.file.externalApplicationStorageDirectory+"dialogues/"+langId).then(function(resp){
            console.log("unzip success.");
          },function(err){
            console.log("unzip error.");
          },function(progressEvent){
            console.log("unzip progress: "+progressEvent);
          });*!/
          unzipFile(fileName,targetPath);
        },function(err){
          $interval.cancel(lang_dialogues[langId].stopinterval);
          lang_dialogues[langId].dwnstatus = 'download';
          ServerData.alert('下载失败！');
          return;
        },function(progress){
          var downloadProgress = (progress.loaded / progress.total) * 100;
          lang_dialogues[langId].progressval = Math.floor(downloadProgress);
          if(lang_dialogues[langId].progressval > 99){
            $interval.cancel(lang_dialogues[langId].stopinterval);
            lang_dialogues[langId].dwnstatus = 'success';
            lang_dialogues[langId].stopinterval = true;
            $scope.lang_dialogues = lang_dialogues;
            $state.go("tab.download");
            return;
          }
        });*/
      //},100);

    };

    function unzipFile(fileName, directory) {
      $cordovaZip.unzip(fileName, directory)
        .then(function() {
          console.log("Files unzipped");
          deleteFile(filePath,fileName.substr(fileName.lastIndexOf("/")+1,fileName.length));
        }, function() {
          console.log("Failed to unzip");
        }, function(progressEvent) {
          console.log(progressEvent);
        });
    };

    function deleteFile(filePath,fileName) {
      console.log("delete file name = "+fileName);
      console.log("delete file path = "+filePath);
      $cordovaFile.removeFile(filePath, fileName)
        .then(function(success) {
          console.log("File deleted");
        }, function (error) {
          console.log("File failed to delete");
        });
    };

    /*$scope.showPopup = function (value){
      var myPopup = $ionicPopup.show({
        cssClass:'er-popup',
        content: value
      });

      $timeout(function(){
        myPopup.close();
      },1000);
    };*/

    $scope.showTranslateAction = function (langId) {
      var txt = "";
      if(langlist[langId].dwnstatus == 'downing'){
        txt = "<i class=\"icon ion-ios-pause balanced\"></i><b class='balanced'>暂停下载</b>";
      }else if(langlist[langId].dwnstatus == 'success') {
        txt = "<i class=\"icon ion-ios-reload royal\"></i><b class='royal'>下载更新</b>";
      }else {
        txt = "<i class=\"icon ion-ios-download\"></i><b>开始下载</b>";
      };

      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: txt }
        ],
        destructiveText: '<i class=\"icon ion-trash-a assertive\"></i><b>删除</b>',
        cancelText: '<b>取消</b>',
        cancel: function () {
          //add cancel code..
        },
        destructiveButtonClicked: function () {
          $cordovaFile.removeDir(filePath+"translate/",langId).then(function (success) {
            console.log("removed folder :"+ langId);
          }, function (error) {
            console.log("error removing folder");
          });
          lang_dialogues[langId].dwnstatus = 'download';
          lang_dialogues[langId].progressval = 0;
          $scope.lang_dialogues = lang_dialogues;
          ServerData.alert('删除成功！');
          return true;
        },
        buttonClicked: function (index) {
            console.log("index="+index);
          if(langlist[langId].dwnstatus == 'downing'){
              console.log("pause action");
          }else if(langlist[langId].dwnstatus == 'success') {
              console.log("upgrade action");
          }else {
              console.log("download action");
          };
          return true;
        }
      });
    };

    $scope.showDialogueAction = function (langId) {
      var txt = "";
      if(lang_dialogues[langId].dwnstatus == 'downing'){
        txt = "<i class=\"icon ion-ios-pause balanced\"></i><b class='balanced'>暂停下载</b>";
      }else if(lang_dialogues[langId].dwnstatus == 'success') {
        txt = "<i class=\"icon ion-ios-reload royal\"></i><b class='royal'>下载更新</b>";
      }else {
        txt = "<i class=\"icon ion-ios-download\"></i><b>开始下载</b>";
      };

      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: txt }
        ],
        destructiveText: '<i class=\"icon ion-trash-a assertive\"></i><b>删除</b>',
        cancelText: '<b>取消</b>',
        cancel: function () {
          //add cancel code..
        },
        destructiveButtonClicked: function () {
          console.log("path:"+filePath+"dialogues/");
          console.log("folder name "+langId);
          $cordovaFile.removeDir(filePath+"dialogues",langId).then(function (success) {
            console.log("removed folder :"+ langId);
          }, function (error) {
            console.log("error removing folder"+JSON.stringify(error));
          });

          lang_dialogues[langId].dwnstatus = 'download';
          lang_dialogues[langId].progressval = 0;
          $scope.lang_dialogues = lang_dialogues;

          ServerData.alert('删除成功！');

          return true;
        },
        buttonClicked: function (index) {
          console.log("index="+index);
          if(lang_dialogues[langId].dwnstatus == 'downing'){
            console.log("pause action");
          }else if(lang_dialogues[langId].dwnstatus == 'success') {
            console.log("upgrade action");
          }else {
            console.log("download action");
          };
          return true;
        }
      });
    };



  })

  .controller('actionsheetCtl', function ($scope, $ionicActionSheet, $timeout, ServerData, $ionicPopup) {
    $scope.show = function () {

      var hideSheet = $ionicActionSheet.show({
        /*buttons: [
         { text: 'Move' }
         ],*/
        destructiveText: '<i class=\"icon ion-trash-a assertive\"></i><b>确定清除历史记录</b>',
        /*titleText: 'Modify your album',*/
        cancelText: '<b>取消</b>',
        cancel: function () {
          // add cancel code..
        },
        destructiveButtonClicked: function () {
          //console.log("delete historys.");
          //return true;
          $scope.storedData = [];
          localforage.setItem('storedDataForage', []);
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

