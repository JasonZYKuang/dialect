angular.module('starter.services', ['ab-base64', 'LocalForageModule'])
  /***
   * dwnstatus:
   *            success: 已下载
   *            downing: 下载中
   *            waiting: 等待下载
   *            pause: 暂停下载
   *            download: 下载
   */
  .value("langlist", {
    YANGJIANG: {id: 'YANGJIANG', name: '阳江话',size:"30M", dwnstatus: 'success'},
    KEJIA: {id: 'KEJIA', name: '客家话', size:"20M",dwnstatus: 'waiting'},
    CHAOSHAN: {id: 'CHAOSHAN', name: '潮汕话', size:"20M",dwnstatus: 'pause'},
    SHANGHAI: {id: 'SHANGHAI', name: '上海话', size:"20M",dwnstatus: 'download'},
    YUEYU: {id: 'YUEYU', name: '粤语', size:"20M",dwnstatus: 'downing'}
  })

  .value("lang_dialogues", {
    YANGJIANG: {id: 'YANGJIANG', name: '阳江话',size:"10M", dwnstatus: 'success'},
    KEJIA: {id: 'KEJIA', name: '客家话',size:"5M", dwnstatus: 'waiting'},
    CHAOSHAN: {id: 'CHAOSHAN', name: '潮汕话', size:"20M",dwnstatus: 'pause'},
    SHANGHAI: {id: 'SHANGHAI', name: '上海话', size:"20M",dwnstatus: 'download'},
    YUEYU: {id: 'YUEYU', name: '粤语', size:"20M",dwnstatus: 'downing'}
  })


  .factory('localStorageService', [function () {
    return {
      get: function localStorageServiceGet(key, defaultValue) {
        var stored = localStorage.getItem(key);
        try {
          stored = angular.fromJson(stored);
        } catch (error) {
          stored = null;
        }
        if (defaultValue && stored === null) {
          stored = defaultValue;
        }
        return stored;
      },
      update: function localStorageServiceUpdate(key, value) {
        if (value) {
          localStorage.setItem(key, angular.fromJson(value));
        }
      },
      clear: function localStorageServiceClear(key) {
        localStorage.removeItem(key);
      }
    };
  }])

  .factory('$localstorage', ['$window', function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        console.log('key ' + $window.localStorage[key]);
        return JSON.parse($window.localStorage[key] || null);
      }
    }
  }])


  .factory('ServerData', function ($ionicPopup) {
    return {
      //弹出信息框
      alert: function (msg) {
        $ionicPopup.alert({
          template: msg,
          title: '提示信息'
        });
      },
      alertBy: function (tle, msg) {
        $ionicPopup.alert({
          template: msg,
          title: tle
        });
      }
    };
  })

  .factory('RecognitionService', function ($http, $q, $cordovaDevice, base64) {
    return {
      recognise: function (data) {
        console.log(data.length);
        var uuid = $cordovaDevice.getUUID();
        var temp = data.substring(data.indexOf(',') + 1);
        console.log(temp);
        console.log(temp.length);
        console.log("uuid=" + uuid);
        var defer = $q.defer();
        $http({
          method: 'POST',
          url: 'http://vop.baidu.com/server_api/',
          data: temp,
          headers: {
            'Content-Type': 'audio/wav; rate=8000'
          },
          params: {
            lan: 'zh',
            token: '24.56f8887326d09d451b25ed1cf6635e85.2592000.1466869691.282335-8114838',
            cuid: uuid
          },
          transformRequest: []
        }).success(function (data) {
          defer.resolve(data);
        }).error(function (data, status, headers, config) {
          defer.reject(data);
        });
        return defer.promise;
      }
    };
  })

  .factory('FileService', function ($q, $window) {
    return {
      readAsArrayBuffer: function (file) {
        console.log("file=" + file);
        var defer = $q.defer();
        $window.resolveLocalFileSystemURL(file, function (entry) {
          var reader = new $window.FileReader();
          reader.onload = function (evt) {
            defer.resolve(evt.target.result);
            console.log("evt target=" + evt.target.result);
          }
          reader.onerror = function (evt) {
            defer.reject();
          };
          entry.file(function (s) {
            console.log("s.size=" + s.size);
            Luyin.size = s.size;
            //reader.readAsArrayBuffer(s);
            reader.readAsDataURL(s);
          });
        });
        return defer.promise;
      }
    };
  })

  .factory('VoiceRecorderService', function ($http, $ionicPopup, $q, $window, $timeout, $rootScope) {
    console.log("voice reord service");
    var recording, record,
      recordCanceled, maxLengthCheckTimeout;

    /*var mediaSrc = window.cordova.file.externalDataDirectory + "dialect.wav";
     var mediaSource = new NewMedia(mediaSrc, function () {
     }, function () {
     }, function () {
     });*/

    return {
      //弹出信息框
      startRecord: function (maxLength) {
        var recordSettings = {
          "SampleRate": 8000,
          "NumberOfChannels": 1,
          "LinearPCMBitDepth": 16
        };
        var defer = $q.defer();
        var file = $window.cordova.file.externalDataDirectory + "fy.wav";
        //var file = $window.cordova.file.dataDirectory + "fy.wav";
        console.log("startRecord=" + file);
        this.resetState();
        record = new Media(file,
          function () {
            if (recordCanceled) {
              defer.reject({reason: "canceled"});
            }
            else {
              defer.resolve(file);
            }
          },
          function (error) {
            defer.reject({reason: "failed"});
            console("record failed.");
          }
        );
        //record.startRecordWithSettings(recordSettings);
        //record.startRecordWithCompression(recordSettings);

        record.startRecord();
        /*setTimeout(function() {
         record.stopRecord();
         }, 55000);*/

        if (angular.isDefined(maxLength)) {
          maxLengthCheckTimeout = $timeout(function exceedMaxLengthCallback() {
            record.stopRecord();
          }, maxLength * 1000);
        }
        ;
        return defer.promise;
      },
      stopRecord: function () {
        $timeout.cancel(maxLengthCheckTimeout);
        record.stopRecord();
        //record.stopRecordWithSettings();
      },
      cancelRecord: function () {
        $timeout.cancel(maxLengthCheckTimeout);
        recordCanceled = true;
        record.stopRecord();
        //record.stopRecordWithSettings();
        // TODO: 删除文件
      },
      resetState: function () {
        recording = false;
        record = null;
        recordCanceled = false;
        maxLengthCheckTimeout = null;
      }

    };

    /*var data = [];
     var params = null;
     var file = "../data/audio/nihao.wav";
     var reader = new FileReader();


     params = {
     "headers": {
     'Content-Type': 'audio/amr; rate=8000'
     },
     "format": "wav",
     "rate": 8000,
     "channel": 1,
     cuid: "com.test.myapp",
     token: "24.cac3afd6cb4710204df36be96702458c.2592000.1465613998.282335-8114838",
     //speech: temp,
     len: file.size,
     lan: "ct"
     };
     return{
     postMedia: function() {
     data = $http.post("http://vop.baidu.com/server_api", params);
     console.log("data="+data);
     return data;
     }
     };*/
  })


  .factory('DialogueService', function ($http, $q) {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var dialogues = [];
    /*var dialogues =
     $http.get("data/json/dialogues.json").success(function(response){
     //dialogues = response.data.results;
     });*/

    return {
      setDia: function (data) {
        dialogues = data;
      },
      getDia: function () {
        return dialogues;
      },
      init: function () {
        var defer = $q.defer();
        $http.get('data/json/dialogues.json', {
          catch: true
        }).success(function (data) {
          defer.resolve(data);
        }).error(function (err) {
          defer.reject(err);
        });
      },
      all: function () {
        dialogues = $http.get("data/json/dialogues.json", {cache: true});
        return dialogues;
      },
      get: function (dialogueId) {
        // Simple index lookup
        return dialogues[dialogueId];
      }
    };
  })

  .factory('TranslateService', function ($http, $q, $localForage, langlist) {

    return {
      getNamebyId: function (langId) {
        return langlist[langId].name;
        /*for (var i = 0; i < langlist.length; i++) {
          if (langlist[i].id === langId) {
            return langlist[i].name;
          }
        }
        return null;*/
      },
      hasLang: function (langId) {
        if(langlist[langId].dwnstatus == 'success')
        return true;
        else return false;
        /*for (var i = 0; i < OfflineData.lang.length; i++) {
          if (OfflineData.lang[i] === langId) {
            return true;
          }
        }
        return false;*/
      },
      load: function (lang) {
        $http.get('data/json/trans_' + lang + '.json', {catch: true})
          .success(function (data) {
            for (var i in data) {
              $localForage.setItem('trans_' + lang + '_' + data[i].name, JSON.stringify(data[i].value), function (result) {
                //console.log(result);
              });
            }
            //OfflineData.lang.push(lang);
          }).error(function (err) {

        });
      },
      translate: function (data, lang) {
        var defer = $q.defer();
        var result = new Array();
        var src = data.split(" ");
        for (var s in src) {
          (function (s) {
            var cnChar = src[s].match(/[^\x00-\x80]/g);
            if (cnChar != null) {
              for (var c in cnChar) {
                (function (c) {
                  /*$localForage.getItem('trans_'+lang+'_'+cnChar[c]).then(function(resp) {
                   //console.log(resp);
                   if (resp != null) {
                   result.push(resp);
                   defer.resolve(result);
                   }
                   });*/
                  var val = $localForage.getItem('trans_' + lang + '_' + cnChar[c]);
                  result.push(val);
                })(c)
              }
            } else {
            }
          })(s)

        }
        $q.all(result).then(function (resp) {
          defer.resolve(resp);
        });
        return defer.promise;
      }
    };
  })

  /*.factory('HistoryService', function ($localForage) {
   return {
   addData: function () {
   if($scope.storedData.length >= 10){
   this.removeData(0);
   }
   $scope.storedData.push($scope.translate.message);
   localforage.setItem('storedDataForage', $scope.storedData).then(function(value) {
   console.log($scope.translate.message + ' was added!');
   }, function(error) {
   console.error(error);
   });
   },
   removeData: function (index) {
   $scope.storedData.splice(index, 1);
   localforage.setItem('storedDataForage', $scope.storedData);
   },
   clearData: function(){
   console.log("clear history");
   $scope.storedData = [];
   localforage.setItem('storedDataForage', $scope.storedData);
   }
   };
   })*/

;
