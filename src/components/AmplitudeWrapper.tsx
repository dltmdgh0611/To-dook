'use client';

import Script from 'next/script';

export default function AmplitudeWrapper() {
  return (
    <>
      <Script
        id="amplitude-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(){"use strict";!function(e,t){var r=e.amplitude||{_q:[],_iq:{}};if(r.invoked)e.console&&console.error&&console.error("Amplitude snippet has been loaded.");else{var n=function(e,t){e.prototype[t]=function(){return this._q.push({name:t,args:Array.prototype.slice.call(arguments,0)}),this}},s=function(e,t,r){return function(n){e._q.push({name:t,args:Array.prototype.slice.call(arguments,0),resolve:function(e){if(r)return new Promise((function(t,r){e._q.push({name:"then",args:[t,r]})}))}})}},o=function(e){for(var t=0;t<m.length;t++)n(e,m[t])},i=function(e){for(var t=0;t<g.length;t++)n(e,g[t])},a=function(e,t){i(e);for(var r=function(t){e[t]=s(e,t,v[t])},n=0;n<v.length;n++)r(v[n]);e.init=function(n){return new Promise((function(s,o){e.initPromise=s;var i={};i.apiKey=n;t&&(i.instanceName=t);var a=Array.prototype.slice.call(arguments,1);i.r=a;e._q.push({name:"init",args:[n].concat(a)})}))};return e},c=e.amplitude.getInstance("$default_instance");r.invoked=!0;var u=t.createElement("script");u.type="text/javascript";u.integrity="sha384-PPfHw98myKtJkA9OdPBMQ6n8yvUaYk0EyUQccFSIQGmB05K6aAMZwvv8z50a3xvC";u.crossOrigin="anonymous";u.async=!0;u.src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz";u.onload=function(){e.amplitude.runQueuedFunctions||console.log("[Amplitude] Error: could not load SDK")};var p=t.getElementsByTagName("script")[0];p.parentNode.insertBefore(u,p);var l=function(){return this._q=[],this},d=["add","append","clearAll","prepend","set","setOnce","unset","preInsert","postInsert","remove","getUserProperties"];o(l);var f=function(){this._q=[],this._instance=null};i(f);f.prototype.init=function(t,r,n){this._instance=e.amplitude.getInstance(t||"$default_instance").init(r,n)};var m=["getDeviceId","setDeviceId","getSessionId","setSessionId","getUserId","setUserId","setOptOut","setTransport","reset","extendSession"],g=["init","add","remove","track","logEvent","identify","groupIdentify","setGroup","revenue","flush"];a(r);r.createInstance=function(e){return r._iq[e]={_q:[]},a(r._iq[e],e)};var v={init:!0};e.amplitude=r}}(window,document)}();
            
            amplitude.init("c31690a7e5ae8f316bec9f63bb65588a", {
              autocapture: true,
              defaultTracking: {
                pageViews: true,
                sessions: true,
                formInteractions: true,
                fileDownloads: true
              }
            });
          `,
        }}
      />
      <Script
        id="amplitude-session-replay"
        strategy="afterInteractive"
        src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.6.22-min.js.gz"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).amplitude && (window as any).sessionReplay) {
            (window as any).amplitude.add((window as any).sessionReplay.plugin({ sampleRate: 1 }));
            console.log('Amplitude initialized successfully');
          }
        }}
      />
    </>
  );
}
