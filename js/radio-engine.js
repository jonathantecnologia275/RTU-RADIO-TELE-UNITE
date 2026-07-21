(function(){
  const SUPABASE_URL = 'https://dznqpltxfhpuorxxwypb.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_GPyfox6GpwC1HK-fwchdEw_XdkKOhQ1';
  const sbr = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let timeline = [];
  let totalDuration = 0;
  let epochSeconds = 0;
  let isPlaying = false;
  let syncTimer = null;
  let ready = false;

  const audioEl = new Audio();
  audioEl.preload = 'auto';

  function buildTimeline(tracks, jingles, spots, jingleIntervalSec, spotIntervalSec){
    const tl = [];
    let cursor = 0;
    let sinceJingle = 0;
    let sinceSpot = 0;
    let jIdx = 0, sIdx = 0;

    if(!tracks.length) return { tl, total: 0 };

    tracks.forEach(track => {
      const dur = track.duration_seconds || 180;
      tl.push({ type:'music', media: track, start: cursor, duration: dur });
      cursor += dur;
      sinceJingle += dur;
      sinceSpot += dur;

      if(spots.length && sinceSpot >= spotIntervalSec){
        const spot = spots[sIdx % spots.length];
        const sDur = spot.duration_seconds || 30;
        tl.push({ type:'spot', media: spot, start: cursor, duration: sDur });
        cursor += sDur;
        sinceSpot = 0;
        sIdx++;
      } else if(jingles.length && sinceJingle >= jingleIntervalSec){
        const jingle = jingles[jIdx % jingles.length];
        const jDur = jingle.duration_seconds || 15;
        tl.push({ type:'jingle', media: jingle, start: cursor, duration: jDur });
        cursor += jDur;
        sinceJingle = 0;
        jIdx++;
      }
    });

    return { tl, total: cursor };
  }

  function getCurrentItem(){
    if(!totalDuration || !timeline.length) return null;
    const nowSec = Date.now() / 1000;
    const position = ((nowSec - epochSeconds) % totalDuration + totalDuration) % totalDuration;
    for(const item of timeline){
      if(position >= item.start && position < item.start + item.duration){
        return { item, offset: position - item.start };
      }
    }
    return { item: timeline[0], offset: 0 };
  }

  function updateDisplay(current){
    const showEl = document.querySelector('.now-info .show');
    const hostEl = document.querySelector('.now-info .host');
    if(!current || !showEl || !hostEl) return;
    const { item } = current;
    if(item.type === 'music'){
      showEl.textContent = item.media.title;
      hostEl.textContent = item.media.artist || 'Radio RTU';
    } else if(item.type === 'jingle'){
      showEl.textContent = 'Jingle RTU';
      hostEl.textContent = 'Radio Télé Unité';
    } else if(item.type === 'spot'){
      showEl.textContent = item.media.title || 'Publicité';
      hostEl.textContent = 'Espace partenaire';
    }
  }

  function syncPlayback(){
    const current = getCurrentItem();
    if(!current) return;
    updateDisplay(current);

    if(!isPlaying) return;

    const { item, offset } = current;
    if(audioEl.src !== item.media.file_url){
      audioEl.src = item.media.file_url;
      audioEl.currentTime = offset;
      audioEl.play().catch(()=>{});
    } else if(Math.abs(audioEl.currentTime - offset) > 3){
      audioEl.currentTime = offset;
    }
  }

  audioEl.addEventListener('ended', syncPlayback);

  async function loadRadioData(){
    const { data: playlistRow } = await sbr.from('playlists').select('id').eq('is_station_default', true).eq('active', true).maybeSingle();
    let tracks = [];
    if(playlistRow){
      const { data: items } = await sbr.from('playlist_items')
        .select('display_order, media_files(id, title, artist, file_url, duration_seconds, file_type, active)')
        .eq('playlist_id', playlistRow.id)
        .order('display_order');
      tracks = (items || []).map(i => i.media_files).filter(m => m && m.active);
    }

    const { data: jingles } = await sbr.from('media_files').select('*').eq('file_type','jingle').eq('active', true);
    const { data: spots } = await sbr.from('media_files').select('*').eq('file_type','spot').eq('active', true);
    const { data: rules } = await sbr.from('radio_rules').select('*').eq('id', 1).maybeSingle();

    const jingleIntervalSec = (rules?.jingle_interval_minutes || 20) * 60;
    const spotIntervalSec = (rules?.spot_interval_minutes || 60) * 60;
    epochSeconds = rules?.station_epoch ? new Date(rules.station_epoch).getTime()/1000 : new Date('2026-01-01T00:00:00Z').getTime()/1000;

    const built = buildTimeline(tracks, jingles||[], spots||[], jingleIntervalSec, spotIntervalSec);
    timeline = built.tl;
    totalDuration = built.total;
    ready = timeline.length > 0;

    syncPlayback();
    if(!syncTimer){
      syncTimer = setInterval(syncPlayback, 5000);
    }
  }

  window.RTU_RADIO = {
    togglePlay(){
      if(!ready){ return false; }
      isPlaying = !isPlaying;
      if(isPlaying){
        syncPlayback();
      } else {
        audioEl.pause();
      }
      return isPlaying;
    },
    isReady(){ return ready; },
    isPlaying(){ return isPlaying; }
  };

  document.addEventListener('DOMContentLoaded', loadRadioData);
})();
