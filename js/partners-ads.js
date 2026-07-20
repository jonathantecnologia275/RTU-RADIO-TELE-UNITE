(function(){
  const SUPABASE_URL = 'https://dznqpltxfhpuorxxwypb.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_GPyfox6GpwC1HK-fwchdEw_XdkKOhQ1';
  const sbx = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const T = {
    fr:{p_label:"NOS PARTENAIRES", p_title:"Ils nous font confiance", a_label:"ESPACE PARTENAIRE", a_title:"Publicité & Promotions", a_tag:"SPONSORISÉ", a_cta:"En savoir plus →"},
    ht:{p_label:"PATENÈ NOU YO", p_title:"Yo fè nou konfyans", a_label:"ESPAS PATENÈ", a_title:"Piblisite & Pwomosyon", a_tag:"SPONSORIZE", a_cta:"Aprann plis →"},
    en:{p_label:"OUR PARTNERS", p_title:"Trusted by", a_label:"PARTNER SPACE", a_title:"Advertising & Promotions", a_tag:"SPONSORED", a_cta:"Learn more →"},
    es:{p_label:"NUESTROS SOCIOS", p_title:"Confían en nosotros", a_label:"ESPACIO PUBLICITARIO", a_title:"Publicidad y Promociones", a_tag:"PATROCINADO", a_cta:"Saber más →"},
    pt:{p_label:"NOSSOS PARCEIROS", p_title:"Eles confiam em nós", a_label:"ESPAÇO PUBLICITÁRIO", a_title:"Publicidade e Promoções", a_tag:"PATROCINADO", a_cta:"Saiba mais →"}
  };
  function lang(){ return localStorage.getItem('rtu_lang') || 'fr'; }

  async function render(){
    const mount = document.getElementById('partners-ads-mount');
    if(!mount) return;
    const dict = T[lang()] || T.fr;

    const [pRes, aRes] = await Promise.all([
      sbx.from('partners').select('*').eq('active', true).order('display_order'),
      sbx.from('ads').select('*').eq('active', true).order('display_order')
    ]);
    const partners = pRes.data || [];
    const ads = aRes.data || [];

    let html = '';

    if(partners.length){
      const logos = partners.map(p => `<a href="${p.website_url||'#'}" target="_blank" rel="noopener"><img src="${p.logo_url}" alt="${p.name}" class="partner-logo" loading="lazy"></a>`).join('');
      html += `
      <section class="partners-section">
        <div class="wrap">
          <div class="sec-label"><span class="dot"></span>${dict.p_label}</div>
          <h2>${dict.p_title}</h2>
        </div>
        <div class="marquee-wrap"><div class="marquee-track">${logos}${logos}</div></div>
      </section>`;
    }

    if(ads.length){
      const cards = ads.map(a => `
        <a class="ad-card" href="${a.link_url||'#'}" target="_blank" rel="noopener">
          ${a.image_url ? `<img src="${a.image_url}" alt="${a.title||''}" loading="lazy">` : ''}
          <div class="body">
            <span class="tag">${dict.a_tag}</span>
            <h3>${a.title||''}</h3>
            <span class="cta">${dict.a_cta}</span>
          </div>
        </a>`).join('');
      html += `
      <section class="ads-section">
        <div class="wrap">
          <div class="sec-label"><span class="dot"></span>${dict.a_label}</div>
          <h2>${dict.a_title}</h2>
          <div class="ads-grid">${cards}</div>
        </div>
      </section>`;
    }

    mount.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', render);
})();
