(function(){
  window.RTU_RADIO = {
    isReady(){ return true; },
    isPlaying(){ return false; },
    waitUntilReady(){ return Promise.resolve(); },
    async togglePlay(){
      alert("Radio RTU ap reveni talè — nou ap konfigire yon nouvo sistèm pi pwofesyonèl. Mèsi pou pasyans ou! / Radio RTU is coming back soon — we are setting up a new, more professional system. Thank you for your patience!");
      return false;
    }
  };
})();
