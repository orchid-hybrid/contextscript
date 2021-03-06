var injectContextScript = function(config, options){
//If ctxscript was previously closed, just reopen the old instance.
var container = document.querySelector('.ctxscript-copilot');
if(container) {
  if(container.style.display === "none") {
    container.style.display = "";
    container.querySelector('#ctxscript-q').focus();
  } else {
    container.style.display = "none";
  }
  return;
}
//Set defaults
if(!options) options = {};
if(options.init) options.init();
if(!options.container) {
  options.container = document.createElement('div');
  options.container.className = "ctxscript-copilot";
}
options.container.classList.add("ctxscript-container");
var link = document.createElement("link");
link.rel="stylesheet";
link.href = config.url + "/ctxscript.css";

options.container.innerHTML = '<div id="ctxscript-out"></div>' +
  '<div class="ctxscript-box" style="margin-bottom: 200px;">' +
    '<input id="ctxscript-q"></input>' +
    '<button class="ctxscript-btn ctxscript-invoke" disabled=disabled>&gt;</button>' +
    '<button class="ctxscript-btn ctxscript-settings-btn" disabled=disabled>≡</button>' +
    '<div class="ctxscript-settings" style="display:none;">' +
      '<p class="ctxscript-about">About</p>' +
      '<p class="ctxscript-close">Close</p>' +
    '</div>' +
  '</div>';
document.body.appendChild(options.container);
//Wait for the the injected css to start styling.
var qBox = options.container.querySelector('#ctxscript-q');
function waitForStyles(){
  window.setTimeout(function(){
    if(qBox.offsetTop < 10) {
      qBox.focus();
    } else {
      waitForStyles();
    }
  }, 900);
}
waitForStyles();

document.body.appendChild(link);

var loadScript = function(path, callback) {
  var s = document.createElement("script");
  s.addEventListener("load", function(evt){
    callback(evt);
  }, false);
  s.src = path;
  document.body.appendChild(s);
};
var afterAll = function(funcs, callback){
  var results = funcs.map(function(){
    return false;
  });
  var resultVals = [];
  funcs.forEach(function(func, idx){
    func(function(result){
      results[idx] = true;
      resultVals[idx] = result;
      if(results.every(function(hasResult){
        return hasResult === true;
      })) {
        return callback(resultVals);
      }
    });
  });
};
var initScriptsLoaded = false;
window.setTimeout(function(){
  if(!initScriptsLoaded) {
    alert(
      "The Context Script bookmarklet is taking a long time load required remote scripts. " +
      "These are the most likely reasons:\n" +
      " * This website has a CSP policy that blocks remote scripts. If this is the case, you should see error messages in your browser's console.\n" +
      " * There is a problem with the Context Script server or the jspm CDN it relies on.\n" +
      " * You have a slow internet connection. The scripts may yet load when you close this alert.\n"
    );
  }
}, 4000);
afterAll([
  config.url + "/main.js",
  "https://github.jspm.io/jmcriffey/bower-traceur@0.0.79/traceur.js"
].map(function(scriptURL){
  return function(callback){
    loadScript(scriptURL, callback);
  };
}), function(){
  initScriptsLoaded = true;
  loadScript("https://github.jspm.io/ModuleLoader/es6-module-loader@0.10.0/dist/es6-module-loader.js",
  function(){
    loadScript("https://jspm.io/system@0.9.js",
    function(){
      config.version = "0.0.0";
      window.initializeCtxScript(config, options);
    });
  });
});
};
