(function(){
  const SUPABASE_URL = 'https://dznqpltxfhpuorxxwypb.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_GPyfox6GpwC1HK-fwchdEw_XdkKOhQ1';
  const sbr = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const STREAM_URL = 'https://streams.radio.co/s2f8c7b630/listen';
  let isPlaying = false;
  let listeningDbId = null;
  let heartbeatTimer = null;
  const audioEl = new Audio(STREAM_URL);
  audioEl.preload = 'none';
  function generateSessionId(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      const r = Math.random()*16|0;
      const v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
  async function startListeningSession(){
    const sessionId = generateSessionId();
    const { data } = await sbr.from('listening_sessions').insert({ session_id: sessionId, total_seconds: 0 }).select('id').maybeSingle();
    if(data) listeningDbId = data.id;
    if(heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(sendHeartbeat, 20000);
  }
  async function sendHeartbeat(){
    if(!listeningDbId) return;
    try {
      await sbr.rpc('increment_listening_seconds', { p_id: listeningDbId, p_seconds: 20 });
    } catch(e) {}
  }
  function stopListeningSession(){
    if(heartbeatTimer){ clearInterval(heartbeatTimer); heartbeatTimer = null; }
    listeningDbId = null;
  }
  window.addEventListener('beforeunload', ()=>{
    if(listeningDbId){
      const url = SUPABASE_URL + '/rest/v1/rpc/increment_listening_seconds?apikey=' + SUPABASE_ANON_KEY;
      const payload = JSON.stringify({ p_id: listeningDbId, p_seconds: 20 });
      navigator.sendBeacon(url, new Blob([payload], { type:'application/json' }));
    }
  });
  window.RTU_RADIO = {
    isReady(){ return true; },
    isPlaying(){ return isPlaying; },
    waitUntilReady(){ return Promise.resolve(); },
    async togglePlay(){
      isPlaying = !isPlaying;
      if(isPlaying){
        audioEl.play().catch(()=>{});
        startListeningSession();
      } else {
        audioEl.pause();
        stopListeningSession();
      }
      return isPlaying;
    }
  };
})();
